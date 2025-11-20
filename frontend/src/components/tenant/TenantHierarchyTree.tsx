'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Building2, Users } from 'lucide-react';
import { Tenant } from '@/types';
import { TenantHierarchyService } from '@/services/tenant_hierarchy_service';
import { Badge } from '@/components/ui/badge';

interface TenantNode extends Tenant {
  children?: TenantNode[];
}

interface Props {
  rootTenantId?: string;
  onTenantSelect?: (tenant: Tenant) => void;
  selectedTenantId?: string;
}

export function TenantHierarchyTree({ rootTenantId, onTenantSelect, selectedTenantId }: Props) {
  const [hierarchy, setHierarchy] = useState<TenantNode[] | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHierarchy();
  }, [rootTenantId]);

  const loadHierarchy = async () => {
    try {
      setLoading(true);
      const data = await TenantHierarchyService.getTenantHierarchy(
        rootTenantId || null
      );
      
      // Handle both single object and array responses
      const hierarchyData = Array.isArray(data) ? data : (data ? [data] : []);
      setHierarchy(hierarchyData);
      
      // Auto-expand first level
      if (hierarchyData && hierarchyData.length > 0) {
        const rootIds = hierarchyData.map(node => node.id);
        setExpandedNodes(new Set(rootIds));
      }
    } catch (error) {
      console.error('Error loading hierarchy:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const renderNode = (node: TenantNode, level: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedTenantId === node.id;

    return (
      <div key={node.id} className="select-none">
        <div
          className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
            isSelected 
              ? 'bg-blue-50 border border-blue-200' 
              : 'hover:bg-gray-50'
          }`}
          style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
          onClick={() => {
            if (hasChildren) toggleNode(node.id);
            if (onTenantSelect) onTenantSelect(node);
          }}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500 flex-shrink-0" />
            )
          ) : (
            <div className="w-4 flex-shrink-0" />
          )}
          
          <Building2 className={`h-4 w-4 flex-shrink-0 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
          
          <span className={`font-medium flex-1 ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
            {node.name}
          </span>
          
          <Badge variant="outline" className="text-xs flex-shrink-0">
            {TenantHierarchyService.getTierName(node.tenant_tier)}
          </Badge>
          
          {node.current_child_count > 0 && (
            <Badge variant="secondary" className="text-xs flex-shrink-0">
              <Users className="h-3 w-3 mr-1" />
              {node.current_child_count}
            </Badge>
          )}
          
          {!node.is_active && (
            <Badge variant="destructive" className="text-xs flex-shrink-0">
              Inactive
            </Badge>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div>
            {node.children!.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hierarchy || hierarchy.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        No hierarchy data available
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 bg-white">
      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
        <Building2 className="h-5 w-5 text-blue-600" />
        Tenant Hierarchy
      </h3>
      <div className="max-h-96 overflow-y-auto">
        {hierarchy.map(rootNode => renderNode(rootNode))}
      </div>
    </div>
  );
}

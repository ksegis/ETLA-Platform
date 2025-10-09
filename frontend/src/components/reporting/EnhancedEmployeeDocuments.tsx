/**
 * Enhanced Employee Documents Component
 * Features: Advanced RBAC, document preview, bulk operations, and audit trail
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { supabase } from '@/lib/supabase';
import { exportUtils } from '@/utils/exportUtils';
import { 
  FileText, 
  Download, 
  Eye, 
  Search, 
  Filter, 
  Calendar,
  User,
  Shield,
  AlertCircle,
  File,
  Image,
  FileImage,
  Upload,
  Trash2,
  Edit,
  Share2,
  Lock,
  Unlock,
  Clock,
  CheckCircle,
  XCircle,
  Archive,
  RefreshCw,
  MoreHorizontal,
  Tag,
  History,
  AlertTriangle
} from 'lucide-react';

interface EmployeeDocument {
  id: string;
  employee_id: string;
  employee_name: string;
  document_name: string;
  document_type: 'resume' | 'contract' | 'id_document' | 'tax_form' | 'certification' | 'performance_review' | 'training_record' | 'other';
  file_url: string;
  file_size: number;
  mime_type: string;
  upload_date: string;
  uploaded_by: string;
  uploaded_by_name?: string;
  status: 'active' | 'archived' | 'expired' | 'pending_review';
  expiration_date?: string;
  notes?: string;
  is_confidential: boolean;
  tenant_id: string;
  version: number;
  tags?: string[];
  last_accessed?: string;
  access_count: number;
  department?: string;
}

interface DocumentAuditLog {
  id: string;
  document_id: string;
  action: 'view' | 'download' | 'upload' | 'update' | 'delete' | 'share';
  user_id: string;
  user_name: string;
  timestamp: string;
  ip_address?: string;
  details?: string;
}

interface EnhancedEmployeeDocumentsProps {
  employeeId?: string;
  employeeName?: string;
  tenantId: string;
  userRole: string;
  userPermissions: string[];
  onPreviewDocument?: (document: EmployeeDocument) => void;
  onUploadDocument?: () => void;
  showBulkActions?: boolean;
  showAuditTrail?: boolean;
  viewMode?: 'grid' | 'list';
}

const DOCUMENT_TYPE_LABELS = {
  resume: 'Resume',
  contract: 'Contract',
  id_document: 'ID Document',
  tax_form: 'Tax Form',
  certification: 'Certification',
  performance_review: 'Performance Review',
  training_record: 'Training Record',
  other: 'Other'
};

const DOCUMENT_TYPE_COLORS = {
  resume: 'bg-blue-100 text-blue-800',
  contract: 'bg-green-100 text-green-800',
  id_document: 'bg-yellow-100 text-yellow-800',
  tax_form: 'bg-red-100 text-red-800',
  certification: 'bg-purple-100 text-purple-800',
  performance_review: 'bg-indigo-100 text-indigo-800',
  training_record: 'bg-pink-100 text-pink-800',
  other: 'bg-gray-100 text-gray-800'
};

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-800',
  archived: 'bg-gray-100 text-gray-800',
  expired: 'bg-red-100 text-red-800',
  pending_review: 'bg-yellow-100 text-yellow-800'
};

export default function EnhancedEmployeeDocuments({
  employeeId,
  employeeName,
  tenantId,
  userRole,
  userPermissions,
  onPreviewDocument,
  onUploadDocument,
  showBulkActions = true,
  showAuditTrail = true,
  viewMode = 'list'
}: EnhancedEmployeeDocumentsProps) {
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [auditLogs, setAuditLogs] = useState<DocumentAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [previewDocument, setPreviewDocument] = useState<EmployeeDocument | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'document_name' | 'upload_date' | 'document_type' | 'file_size'>('upload_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentViewMode, setCurrentViewMode] = useState(viewMode);

  // RBAC permissions check
  const permissions = useMemo(() => {
    return {
      canViewDocuments: userPermissions.includes('VIEW_EMPLOYEE_DOCUMENTS') || 
                       userRole === 'hr_admin' || 
                       userRole === 'host_admin',
      canViewConfidential: userPermissions.includes('VIEW_CONFIDENTIAL_DOCUMENTS') || 
                          userRole === 'hr_admin' || 
                          userRole === 'host_admin',
      canDownloadDocuments: userPermissions.includes('DOWNLOAD_DOCUMENTS') || 
                           userRole === 'hr_admin' || 
                           userRole === 'host_admin',
      canUploadDocuments: userPermissions.includes('UPLOAD_DOCUMENTS') || 
                         userRole === 'hr_admin' || 
                         userRole === 'host_admin',
      canDeleteDocuments: userPermissions.includes('DELETE_DOCUMENTS') || 
                         userRole === 'hr_admin' || 
                         userRole === 'host_admin',
      canViewAuditTrail: userPermissions.includes('VIEW_AUDIT_TRAIL') || 
                        userRole === 'hr_admin' || 
                        userRole === 'host_admin'
    };
  }, [userPermissions, userRole]);

  // Get unique values for filters
  const filterOptions = useMemo(() => {
    const departments = Array.from(new Set(documents.map(doc => doc.department).filter(Boolean))).sort();
    const types = Array.from(new Set(documents.map(doc => doc.document_type))).sort();
    return { departments, types };
  }, [documents]);

  // Filter and sort documents
  const filteredAndSortedDocuments = useMemo(() => {
    let filtered = documents.filter(doc => {
      // RBAC filtering
      if (!permissions.canViewDocuments) return false;
      if (doc.is_confidential && !permissions.canViewConfidential) return false;
      
      // Employee filter
      if (employeeId && doc.employee_id !== employeeId) return false;
      
      // Search filter
      const matchesSearch = searchTerm === '' || 
        doc.document_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Type filter
      const matchesType = selectedType === 'all' || doc.document_type === selectedType;
      
      // Status filter
      const matchesStatus = selectedStatus === 'all' || doc.status === selectedStatus;
      
      // Department filter
      const matchesDepartment = selectedDepartment === 'all' || doc.department === selectedDepartment;
      
      return matchesSearch && matchesType && matchesStatus && matchesDepartment;
    });

    // Sort documents
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      switch (sortBy) {
        case 'document_name':
          aValue = a.document_name.toLowerCase();
          bValue = b.document_name.toLowerCase();
          break;
        case 'upload_date':
          aValue = new Date(a.upload_date);
          bValue = new Date(b.upload_date);
          break;
        case 'document_type':
          aValue = a.document_type;
          bValue = b.document_type;
          break;
        case 'file_size':
          aValue = a.file_size;
          bValue = b.file_size;
          break;
        default:
          aValue = a.upload_date;
          bValue = b.upload_date;
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [documents, searchTerm, selectedType, selectedStatus, selectedDepartment, sortBy, sortDirection, permissions, employeeId]);

  // Calculate document statistics
  const documentStats = useMemo(() => {
    const employeeSet = new Set<string>();
    const typeBreakdown: Record<string, number> = {};
    let totalDocuments = 0;
    let totalSize = 0;
    let confidentialCount = 0;
    let expiredCount = 0;
    let pendingCount = 0;

    filteredAndSortedDocuments.forEach(doc => {
      totalDocuments += 1;
      totalSize += doc.file_size;
      if (doc.is_confidential) confidentialCount += 1;
      if (doc.status === 'expired') expiredCount += 1;
      if (doc.status === 'pending_review') pendingCount += 1;
      employeeSet.add(doc.employee_id);
      typeBreakdown[doc.document_type] = (typeBreakdown[doc.document_type] || 0) + 1;
    });

    const stats = {
      totalDocuments,
      totalSize,
      confidentialCount,
      expiredCount,
      pendingCount,
      employeeCount: employeeSet.size,
      typeBreakdown
    };
    
    return {
      ...stats,
      averageSizePerDocument: stats.totalDocuments > 0 ? stats.totalSize / stats.totalDocuments : 0
    };
  }, [filteredAndSortedDocuments]);

  // Load documents
  useEffect(() => {
    const loadDocuments = async () => {
      if (!permissions.canViewDocuments) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Mock data for demonstration
        const mockDocuments: EmployeeDocument[] = [
          {
            id: '1',
            employee_id: 'emp_001',
            employee_name: 'John Doe',
            document_name: 'Resume_John_Doe_2024.pdf',
            document_type: 'resume',
            file_url: '/documents/resume_john_doe.pdf',
            file_size: 245760,
            mime_type: 'application/pdf',
            upload_date: '2024-01-15T10:30:00Z',
            uploaded_by: 'hr_001',
            uploaded_by_name: 'HR Admin',
            status: 'active',
            is_confidential: false,
            tenant_id: tenantId,
            version: 1,
            tags: ['current', 'verified'],
            access_count: 12,
            department: 'Engineering'
          },
          {
            id: '2',
            employee_id: 'emp_001',
            employee_name: 'John Doe',
            document_name: 'Employment_Contract_2024.pdf',
            document_type: 'contract',
            file_url: '/documents/contract_john_doe.pdf',
            file_size: 512000,
            mime_type: 'application/pdf',
            upload_date: '2024-01-10T14:20:00Z',
            uploaded_by: 'hr_001',
            uploaded_by_name: 'HR Admin',
            status: 'active',
            expiration_date: '2025-01-10',
            is_confidential: true,
            tenant_id: tenantId,
            version: 2,
            tags: ['contract', 'confidential'],
            access_count: 5,
            department: 'Engineering'
          },
          {
            id: '3',
            employee_id: 'emp_002',
            employee_name: 'Jane Smith',
            document_name: 'W4_Form_2024.pdf',
            document_type: 'tax_form',
            file_url: '/documents/w4_jane_smith.pdf',
            file_size: 128000,
            mime_type: 'application/pdf',
            upload_date: '2024-01-08T09:15:00Z',
            uploaded_by: 'payroll_001',
            uploaded_by_name: 'Payroll Admin',
            status: 'active',
            is_confidential: true,
            tenant_id: tenantId,
            version: 1,
            tags: ['tax', 'required'],
            access_count: 3,
            department: 'Marketing'
          }
        ];

        setDocuments(mockDocuments);
      } catch (error) {
        console.error('Error loading documents:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, [tenantId, permissions.canViewDocuments]);

  // Handle document selection
  const handleSelectDocument = (documentId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(documentId) 
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedDocuments.length === filteredAndSortedDocuments.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(filteredAndSortedDocuments.map(doc => doc.id));
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action: string) => {
    if (selectedDocuments.length === 0) return;
    
    try {
      switch (action) {
        case 'download':
          // Implement bulk download
          break;
        case 'archive':
          // Implement bulk archive
          break;
        case 'delete':
          if (permissions.canDeleteDocuments) {
            // Implement bulk delete
          }
          break;
      }
      setSelectedDocuments([]);
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  };

  // Handle document preview
  const handlePreviewDocument = (document: EmployeeDocument) => {
    setPreviewDocument(document);
    if (onPreviewDocument) {
      onPreviewDocument(document);
    }
    
    // Log access
    logDocumentAccess(document.id, 'view');
  };

  // Handle document download
  const handleDownloadDocument = async (document: EmployeeDocument) => {
    if (!permissions.canDownloadDocuments) return;
    
    try {
      // Implement download logic
      logDocumentAccess(document.id, 'download');
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  // Log document access
  const logDocumentAccess = async (documentId: string, action: string) => {
    if (!permissions.canViewAuditTrail) return;
    
    try {
      // Implement audit logging
      const logEntry: DocumentAuditLog = {
        id: `log_${Date.now()}`,
        document_id: documentId,
        action: action as any,
        user_id: 'current_user',
        user_name: 'Current User',
        timestamp: new Date().toISOString(),
        details: `Document ${action} by user`
      };
      
      setAuditLogs(prev => [logEntry, ...prev]);
    } catch (error) {
      console.error('Audit logging failed:', error);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get document icon
  const getDocumentIcon = (mimeType: string, documentType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="h-5 w-5" />;
    if (mimeType === 'application/pdf') return <FileText className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  if (!permissions.canViewDocuments) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">You don't have permission to view employee documents.</p>
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded"></div>
            ))}
          </div>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Document Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Total Documents</div>
              <div className="text-2xl font-bold text-gray-900">{documentStats.totalDocuments}</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <User className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Employees</div>
              <div className="text-2xl font-bold text-gray-900">{documentStats.employeeCount}</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Lock className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Confidential</div>
              <div className="text-2xl font-bold text-gray-900">{documentStats.confidentialCount}</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Expired</div>
              <div className="text-2xl font-bold text-gray-900">{documentStats.expiredCount}</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Pending</div>
              <div className="text-2xl font-bold text-gray-900">{documentStats.pendingCount}</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Archive className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-600">Total Size</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatFileSize(documentStats.totalSize)}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Controls */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents, employees, tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </div>

            {/* Filters */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              {filterOptions.types.map(type => (
                <option key={type} value={type}>{DOCUMENT_TYPE_LABELS[type]}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="expired">Expired</option>
              <option value="pending_review">Pending Review</option>
            </select>

            {!employeeId && (
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Departments</option>
                {filterOptions.departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Bulk Actions */}
            {showBulkActions && selectedDocuments.length > 0 && (
              <div className="flex items-center gap-2 mr-4">
                <span className="text-sm text-gray-600">{selectedDocuments.length} selected</span>
                {permissions.canDownloadDocuments && (
                  <Button
                    variant="outline"
                   
                    onClick={() => handleBulkAction('download')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                )}
                <Button
                  variant="outline"
                 
                  onClick={() => handleBulkAction('archive')}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </Button>
              </div>
            )}

            {/* Upload */}
            {permissions.canUploadDocuments && onUploadDocument && (
              <Button
                variant="outline"
               
                onClick={onUploadDocument}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload
              </Button>
            )}

            {/* View Mode Toggle */}
            <div className="flex items-center border border-gray-300 rounded-md">
              <Button
                variant={currentViewMode === 'list' ? 'default' : 'ghost'}
               
                onClick={() => setCurrentViewMode('list')}
                className="rounded-r-none"
              >
                List
              </Button>
              <Button
                variant={currentViewMode === 'grid' ? 'default' : 'ghost'}
               
                onClick={() => setCurrentViewMode('grid')}
                className="rounded-l-none"
              >
                Grid
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Documents Display */}
      <Card className="p-6">
        {currentViewMode === 'list' ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  {showBulkActions && (
                    <th className="text-left py-3 px-4 w-12">
                      <input
                        type="checkbox"
                        checked={selectedDocuments.length === filteredAndSortedDocuments.length && filteredAndSortedDocuments.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300"
                      />
                    </th>
                  )}
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Document</th>
                  {!employeeId && (
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Employee</th>
                  )}
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Size</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Upload Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedDocuments.map((document) => (
                  <tr key={document.id} className="border-b border-gray-100 hover:bg-gray-50">
                    {showBulkActions && (
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedDocuments.includes(document.id)}
                          onChange={() => handleSelectDocument(document.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                    )}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {getDocumentIcon(document.mime_type, document.document_type)}
                        <div>
                          <div className="font-medium text-gray-900 flex items-center gap-2">
                            {document.document_name}
                            {document.is_confidential && (
                              <Lock className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                          {document.tags && document.tags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {document.tags.map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    {!employeeId && (
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{document.employee_name}</div>
                          {document.department && (
                            <div className="text-sm text-gray-500">{document.department}</div>
                          )}
                        </div>
                      </td>
                    )}
                    <td className="py-3 px-4">
                      <Badge className={DOCUMENT_TYPE_COLORS[document.document_type]}>
                        {DOCUMENT_TYPE_LABELS[document.document_type]}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={STATUS_COLORS[document.status]}>
                        {document.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatFileSize(document.file_size)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(document.upload_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                         
                          onClick={() => handlePreviewDocument(document)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {permissions.canDownloadDocuments && (
                          <Button
                            variant="ghost"
                           
                            onClick={() => handleDownloadDocument(document)}
                            className="h-8 w-8 p-0"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                         
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAndSortedDocuments.map((document) => (
              <Card key={document.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getDocumentIcon(document.mime_type, document.document_type)}
                    {document.is_confidential && (
                      <Lock className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  {showBulkActions && (
                    <input
                      type="checkbox"
                      checked={selectedDocuments.includes(document.id)}
                      onChange={() => handleSelectDocument(document.id)}
                      className="rounded border-gray-300"
                    />
                  )}
                </div>
                
                <div className="mb-3">
                  <h4 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                    {document.document_name}
                  </h4>
                  {!employeeId && (
                    <p className="text-xs text-gray-600">{document.employee_name}</p>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge className={DOCUMENT_TYPE_COLORS[document.document_type]}>
                    {DOCUMENT_TYPE_LABELS[document.document_type]}
                  </Badge>
                  <Badge className={STATUS_COLORS[document.status]}>
                    {document.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                <div className="text-xs text-gray-500 mb-3">
                  <div>{formatFileSize(document.file_size)}</div>
                  <div>{new Date(document.upload_date).toLocaleDateString()}</div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                   
                    onClick={() => handlePreviewDocument(document)}
                    className="flex-1"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  {permissions.canDownloadDocuments && (
                    <Button
                      variant="outline"
                     
                      onClick={() => handleDownloadDocument(document)}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {filteredAndSortedDocuments.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No documents found</p>
            <p className="text-sm">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </Card>
    </div>
  );
}

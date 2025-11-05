'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Save, Trash2, Star, Edit2, Check } from 'lucide-react';
import { SavedFilter, FilterState } from '@/types/savedFilters';
import {
  getSavedFilters,
  createSavedFilter,
  updateSavedFilter,
  deleteSavedFilter,
  setDefaultFilter,
} from '@/services/savedFiltersService';

interface SavedFiltersManagerProps {
  currentFilters: FilterState;
  onLoadFilter: (filters: FilterState) => void;
  userId: string;
  tenantId: string;
}

export function SavedFiltersManager({
  currentFilters,
  onLoadFilter,
  userId,
  tenantId,
}: SavedFiltersManagerProps) {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [selectedFilterId, setSelectedFilterId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Save dialog state
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [filterDescription, setFilterDescription] = useState('');
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  
  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [filterToDelete, setFilterToDelete] = useState<SavedFilter | null>(null);

  // Load saved filters on mount
  useEffect(() => {
    loadSavedFilters();
  }, [userId, tenantId]);

  const loadSavedFilters = async () => {
    setIsLoading(true);
    try {
      const filters = await getSavedFilters(userId, tenantId);
      setSavedFilters(filters);
    } catch (error) {
      console.error('Failed to load saved filters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveFilter = async () => {
    if (!filterName.trim()) {
      alert('Please enter a filter name');
      return;
    }

    setIsLoading(true);
    try {
      const newFilter = await createSavedFilter(userId, tenantId, {
        name: filterName.trim(),
        description: filterDescription.trim() || undefined,
        filters: currentFilters,
        is_default: saveAsDefault,
      });

      if (newFilter) {
        await loadSavedFilters();
        setIsSaveDialogOpen(false);
        setFilterName('');
        setFilterDescription('');
        setSaveAsDefault(false);
        alert('Filter saved successfully!');
      } else {
        alert('Failed to save filter. Please try again.');
      }
    } catch (error) {
      console.error('Error saving filter:', error);
      alert('An error occurred while saving the filter.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadFilter = (filterId: string) => {
    const filter = savedFilters.find(f => f.id === filterId);
    if (filter) {
      onLoadFilter(filter.filters);
      setSelectedFilterId(filterId);
    }
  };

  const handleDeleteFilter = async () => {
    if (!filterToDelete) return;

    setIsLoading(true);
    try {
      const success = await deleteSavedFilter(filterToDelete.id, userId, tenantId);
      if (success) {
        await loadSavedFilters();
        if (selectedFilterId === filterToDelete.id) {
          setSelectedFilterId('');
        }
        setIsDeleteDialogOpen(false);
        setFilterToDelete(null);
        alert('Filter deleted successfully!');
      } else {
        alert('Failed to delete filter. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting filter:', error);
      alert('An error occurred while deleting the filter.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefault = async (filterId: string) => {
    setIsLoading(true);
    try {
      const success = await setDefaultFilter(filterId, userId, tenantId);
      if (success) {
        await loadSavedFilters();
        alert('Default filter updated successfully!');
      } else {
        alert('Failed to set default filter. Please try again.');
      }
    } catch (error) {
      console.error('Error setting default filter:', error);
      alert('An error occurred while setting the default filter.');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = (filter: SavedFilter) => {
    setFilterToDelete(filter);
    setIsDeleteDialogOpen(true);
  };

  const getFilterSummary = (filters: FilterState): string => {
    const parts: string[] = [];
    
    if (filters.searchTerm) parts.push(`Search: "${filters.searchTerm}"`);
    if (filters.locations.length > 0) parts.push(`${filters.locations.length} location(s)`);
    if (filters.jobTitles.length > 0) parts.push(`${filters.jobTitles.length} job title(s)`);
    if (filters.requisitionIds.length > 0) parts.push(`${filters.requisitionIds.length} req ID(s)`);
    if (filters.skills.length > 0) parts.push(`${filters.skills.length} skill(s)`);
    if (filters.status !== 'all') parts.push(`Status: ${filters.status}`);
    
    return parts.length > 0 ? parts.join(', ') : 'No filters applied';
  };

  return (
    <div className="space-y-4">
      {/* Saved Filters Selector and Actions */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Select value={selectedFilterId} onValueChange={handleLoadFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Load saved filter..." />
            </SelectTrigger>
            <SelectContent>
              {savedFilters.length === 0 ? (
                <div className="px-2 py-6 text-center text-sm text-gray-500">
                  No saved filters yet
                </div>
              ) : (
                savedFilters.map((filter) => (
                  <SelectItem key={filter.id} value={filter.id}>
                    <div className="flex items-center gap-2">
                      {filter.is_default && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />}
                      <span>{filter.name}</span>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        
        <Button
          variant="default"
          size="sm"
          onClick={() => setIsSaveDialogOpen(true)}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Current Filter
        </Button>
      </div>

      {/* Selected Filter Details */}
      {selectedFilterId && savedFilters.find(f => f.id === selectedFilterId) && (
        <div className="p-4 border rounded-md bg-blue-50">
          {(() => {
            const filter = savedFilters.find(f => f.id === selectedFilterId)!;
            return (
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm">{filter.name}</h4>
                      {filter.is_default && (
                        <Badge variant="secondary" className="text-xs">
                          <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                          Default
                        </Badge>
                      )}
                    </div>
                    {filter.description && (
                      <p className="text-xs text-gray-600 mt-1">{filter.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {getFilterSummary(filter.filters)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {!filter.is_default && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetDefault(filter.id)}
                        title="Set as default"
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => confirmDelete(filter)}
                      title="Delete filter"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Saved Filters List */}
      {savedFilters.length > 0 && (
        <div className="border rounded-md p-4">
          <h4 className="font-semibold text-sm mb-3">Your Saved Filters</h4>
          <div className="space-y-2">
            {savedFilters.map((filter) => (
              <div
                key={filter.id}
                className={`p-3 rounded-md border cursor-pointer transition-colors ${
                  selectedFilterId === filter.id
                    ? 'bg-blue-50 border-blue-300'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleLoadFilter(filter.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {selectedFilterId === filter.id && (
                        <Check className="h-4 w-4 text-blue-600" />
                      )}
                      <span className="font-medium text-sm">{filter.name}</span>
                      {filter.is_default && (
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      )}
                    </div>
                    {filter.description && (
                      <p className="text-xs text-gray-600 mt-1 ml-6">{filter.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1 ml-6">
                      {getFilterSummary(filter.filters)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {!filter.is_default && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetDefault(filter.id);
                        }}
                        title="Set as default"
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmDelete(filter);
                      }}
                      title="Delete filter"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save Filter Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Current Filter</DialogTitle>
            <DialogDescription>
              Give your filter a name and description to easily find it later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="filter-name">Filter Name *</Label>
              <Input
                id="filter-name"
                placeholder="e.g., Florida Filter"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filter-description">Description (Optional)</Label>
              <Textarea
                id="filter-description"
                placeholder="e.g., Shows all candidates in Tampa and Miami"
                value={filterDescription}
                onChange={(e) => setFilterDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="save-as-default"
                checked={saveAsDefault}
                onChange={(e) => setSaveAsDefault(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="save-as-default" className="cursor-pointer">
                Set as default filter
              </Label>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-xs text-gray-600 font-medium mb-1">Current Filter:</p>
              <p className="text-xs text-gray-500">{getFilterSummary(currentFilters)}</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsSaveDialogOpen(false);
                setFilterName('');
                setFilterDescription('');
                setSaveAsDefault(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveFilter} disabled={isLoading || !filterName.trim()}>
              {isLoading ? 'Saving...' : 'Save Filter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Saved Filter?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the filter "{filterToDelete?.name}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIsDeleteDialogOpen(false);
              setFilterToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFilter}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

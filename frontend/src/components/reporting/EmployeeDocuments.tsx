/**
 * Employee Documents Component
 * Displays employee documents with filtering, preview, and RBAC enforcement
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
  FileImage
} from 'lucide-react';

interface EmployeeDocument {
  id: string;
  employee_id: string;
  document_name: string;
  document_type: 'resume' | 'contract' | 'id_document' | 'tax_form' | 'certification' | 'other';
  file_url: string;
  file_size: number;
  mime_type: string;
  upload_date: string;
  uploaded_by: string;
  uploaded_by_name?: string;
  status: 'active' | 'archived' | 'expired';
  expiration_date?: string;
  notes?: string;
  is_confidential: boolean;
  tenant_id: string;
}

interface EmployeeDocumentsProps {
  employeeId: string;
  employeeName: string;
  tenantId: string;
  userRole: string;
  userPermissions: string[];
  onPreviewDocument?: (document: EmployeeDocument) => void;
}

const DOCUMENT_TYPE_LABELS = {
  resume: 'Resume',
  contract: 'Contract',
  id_document: 'ID Document',
  tax_form: 'Tax Form',
  certification: 'Certification',
  other: 'Other'
};

const DOCUMENT_TYPE_COLORS = {
  resume: 'bg-blue-100 text-blue-800',
  contract: 'bg-green-100 text-green-800',
  id_document: 'bg-yellow-100 text-yellow-800',
  tax_form: 'bg-red-100 text-red-800',
  certification: 'bg-purple-100 text-purple-800',
  other: 'bg-gray-100 text-gray-800'
};

export default function EmployeeDocuments({
  employeeId,
  employeeName,
  tenantId,
  userRole,
  userPermissions,
  onPreviewDocument
}: EmployeeDocumentsProps) {
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [previewDocument, setPreviewDocument] = useState<EmployeeDocument | null>(null);

  // RBAC permissions check
  const canViewDocuments = useMemo(() => {
    return userPermissions.includes('VIEW_EMPLOYEE_DOCUMENTS') || 
           userRole === 'hr_admin' || 
           userRole === 'host_admin';
  }, [userPermissions, userRole]);

  const canViewConfidential = useMemo(() => {
    return userPermissions.includes('VIEW_CONFIDENTIAL_DOCUMENTS') || 
           userRole === 'hr_admin' || 
           userRole === 'host_admin';
  }, [userPermissions, userRole]);

  const canDownloadDocuments = useMemo(() => {
    return userPermissions.includes('DOWNLOAD_EMPLOYEE_DOCUMENTS') || 
           userRole === 'hr_admin' || 
           userRole === 'host_admin';
  }, [userPermissions, userRole]);

  // Load documents
  useEffect(() => {
    if (!canViewDocuments) {
      setLoading(false);
      return;
    }

    loadDocuments();
  }, [employeeId, tenantId, canViewDocuments]);

  const loadDocuments = async () => {
    try {
      setLoading(true);

      // Build query with RBAC filtering
      let query = supabase
        .from('employee_documents')
        .select(`
          *,
          uploaded_by_profile:profiles!employee_documents_uploaded_by_fkey(full_name)
        `)
        .eq('employee_id', employeeId)
        .eq('tenant_id', tenantId);

      // Filter confidential documents based on permissions
      if (!canViewConfidential) {
        query = query.eq('is_confidential', false);
      }

      const { data, error } = await query.order('upload_date', { ascending: false });

      if (error) {
        console.error('Error loading documents:', error);
        return;
      }

      // Transform data to include uploaded_by_name
      const transformedData = data?.map(doc => ({
        ...doc,
        uploaded_by_name: doc.uploaded_by_profile?.full_name || 'Unknown'
      })) || [];

      setDocuments(transformedData);
    } catch (error) {
      console.error('Error in loadDocuments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter documents
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = doc.document_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || doc.document_type === selectedType;
      const matchesStatus = selectedStatus === 'all' || doc.status === selectedStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [documents, searchTerm, selectedType, selectedStatus]);

  // Get document icon
  const getDocumentIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <FileImage className="h-5 w-5 text-green-500" />;
    } else if (mimeType.includes('pdf')) {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else {
      return <File className="h-5 w-5 text-gray-500" />;
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

  // Handle document download
  const handleDownload = async (document: EmployeeDocument) => {
    if (!canDownloadDocuments) {
      alert('You do not have permission to download documents.');
      return;
    }

    try {
      // Get signed URL for download
      const { data, error } = await supabase.storage
        .from('employee-documents')
        .createSignedUrl(document.file_url, 60); // 1 minute expiry

      if (error) {
        console.error('Error creating signed URL:', error);
        alert('Failed to download document.');
        return;
      }

      // Trigger download
      const link = document.createElement('a');
      link.href = data.signedUrl;
      link.download = document.document_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document.');
    }
  };

  // Handle document preview
  const handlePreview = (document: EmployeeDocument) => {
    if (onPreviewDocument) {
      onPreviewDocument(document);
    } else {
      setPreviewDocument(document);
    }
  };

  // Handle export
  const handleExport = () => {
    const exportData = filteredDocuments.map(doc => ({
      documentName: doc.document_name,
      documentType: DOCUMENT_TYPE_LABELS[doc.document_type],
      uploadDate: new Date(doc.upload_date).toLocaleDateString(),
      fileSize: formatFileSize(doc.file_size),
      uploadedBy: doc.uploaded_by_name,
      status: doc.status,
      isConfidential: doc.is_confidential ? 'Yes' : 'No',
      expirationDate: doc.expiration_date ? new Date(doc.expiration_date).toLocaleDateString() : 'N/A'
    }));

    exportUtils.exportEmployeeDocuments(
      exportData,
      { name: employeeName, id: employeeId },
      {
        filename: exportUtils.generateFilename(`employee_documents_${employeeName.replace(/\s+/g, '_')}`),
        includeTimestamp: true
      }
    );
  };

  // Check if document is expired
  const isDocumentExpired = (document: EmployeeDocument): boolean => {
    if (!document.expiration_date) return false;
    return new Date(document.expiration_date) < new Date();
  };

  if (!canViewDocuments) {
    return (
      <Card className="p-8">
        <div className="text-center text-gray-500">
          <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">Access Restricted</p>
          <p>You do not have permission to view employee documents.</p>
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Employee Documents</h3>
            <p className="text-sm text-gray-600">
              Documents for {employeeName} ({documents.length} total)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={filteredDocuments.length === 0}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export List
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
            <option value="expired">Expired</option>
          </select>

          <div className="text-sm text-gray-600 flex items-center">
            <Filter className="h-4 w-4 mr-1" />
            {filteredDocuments.length} of {documents.length} documents
          </div>
        </div>
      </Card>

      {/* Documents List */}
      <div className="space-y-3">
        {filteredDocuments.map((document) => {
          const isExpired = isDocumentExpired(document);
          
          return (
            <Card key={document.id} className={`p-4 ${isExpired ? 'border-red-200 bg-red-50' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {getDocumentIcon(document.mime_type)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900 truncate">
                        {document.document_name}
                      </h4>
                      <Badge className={DOCUMENT_TYPE_COLORS[document.document_type]}>
                        {DOCUMENT_TYPE_LABELS[document.document_type]}
                      </Badge>
                      {document.is_confidential && (
                        <Badge variant="secondary" className="bg-red-100 text-red-800">
                          <Shield className="h-3 w-3 mr-1" />
                          Confidential
                        </Badge>
                      )}
                      {isExpired && (
                        <Badge variant="destructive">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Expired
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(document.upload_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {document.uploaded_by_name}
                      </div>
                      <span>{formatFileSize(document.file_size)}</span>
                      {document.expiration_date && (
                        <span className={isExpired ? 'text-red-600 font-medium' : ''}>
                          Expires: {new Date(document.expiration_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    
                    {document.notes && (
                      <p className="text-sm text-gray-600 mt-1 truncate">
                        {document.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreview(document)}
                    className="flex items-center gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </Button>
                  
                  {canDownloadDocuments && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(document)}
                      className="flex items-center gap-1"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}

        {filteredDocuments.length === 0 && (
          <Card className="p-8">
            <div className="text-center text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No Documents Found</p>
              <p>
                {searchTerm || selectedType !== 'all' || selectedStatus !== 'all'
                  ? 'No documents match your current filters.'
                  : 'No documents have been uploaded for this employee.'
                }
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Document Preview Modal */}
      {previewDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Document Preview</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewDocument(null)}
              >
                Close
              </Button>
            </div>
            
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Preview for: {previewDocument.document_name}
              </p>
              
              {previewDocument.mime_type.startsWith('image/') ? (
                <img
                  src={previewDocument.file_url}
                  alt={previewDocument.document_name}
                  className="max-w-full max-h-96 mx-auto"
                />
              ) : previewDocument.mime_type.includes('pdf') ? (
                <iframe
                  src={previewDocument.file_url}
                  className="w-full h-96 border"
                  title={previewDocument.document_name}
                />
              ) : (
                <div className="text-gray-500 py-8">
                  <FileText className="h-16 w-16 mx-auto mb-4" />
                  <p>Preview not available for this file type.</p>
                  <Button
                    className="mt-4"
                    onClick={() => handleDownload(previewDocument)}
                  >
                    Download to View
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

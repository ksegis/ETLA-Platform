'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
// Note: Using simplified select and dialog implementations
// In production, you would use proper UI library components
import { 
  FileText, 
  Download, 
  Eye, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Building,
  Shield,
  AlertCircle,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';
import { useCustomerBranding } from '@/services/brandingService';
import { exportToCSV, exportToExcel } from '@/utils/exportUtils';
import { supabase } from '@/lib/supabase';

interface EmployeeDocument {
  id: string;
  document_id: string;
  employee_id: string;
  employee_name: string;
  document_name: string;
  document_type: string;
  document_category: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  upload_date: string;
  uploaded_by: string;
  uploaded_by_profile?: {
    full_name: string;
  };
  document_status: string;
  access_level: string;
  retention_date?: string;
  tags?: string[];
  description?: string;
  tenant_id: string;
}

interface EnhancedEmployeeDocumentsProps {
  documents: EmployeeDocument[];
  tenantId?: string;
  userRole?: string;
  userId?: string;
}

export default function EnhancedEmployeeDocuments({ 
  documents, 
  tenantId, 
  userRole = 'user',
  userId 
}: EnhancedEmployeeDocumentsProps) {
  const { branding } = useCustomerBranding(tenantId);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedAccessLevel, setSelectedAccessLevel] = useState<string>('');
  const [previewDocument, setPreviewDocument] = useState<EmployeeDocument | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Check if user has access to a document based on RBAC
  const hasDocumentAccess = (document: EmployeeDocument): boolean => {
    // Admin and HR roles have access to all documents
    if (userRole === 'admin' || userRole === 'hr') {
      return true;
    }

    // Managers can access documents for their direct reports
    if (userRole === 'manager') {
      // This would need to be enhanced with actual manager-employee relationships
      return document.access_level !== 'confidential';
    }

    // Employees can only access their own documents (non-confidential)
    if (userRole === 'employee') {
      return document.employee_id === userId && document.access_level === 'public';
    }

    // Default deny
    return false;
  };

  // Filter documents based on RBAC
  const accessibleDocuments = useMemo(() => {
    return documents.filter(doc => hasDocumentAccess(doc));
  }, [documents, userRole, userId]);

  // Get unique values for filters
  const employees = useMemo(() => {
    const uniqueEmployees = new Map();
    accessibleDocuments.forEach(doc => {
      if (!uniqueEmployees.has(doc.employee_id)) {
        uniqueEmployees.set(doc.employee_id, {
          id: doc.employee_id,
          name: doc.employee_name
        });
      }
    });
    return Array.from(uniqueEmployees.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [accessibleDocuments]);

  const documentTypes = useMemo(() => {
    return Array.from(new Set(accessibleDocuments.map(doc => doc.document_type))).sort();
  }, [accessibleDocuments]);

  const categories = useMemo(() => {
    return Array.from(new Set(accessibleDocuments.map(doc => doc.document_category))).sort();
  }, [accessibleDocuments]);

  const statuses = useMemo(() => {
    return Array.from(new Set(accessibleDocuments.map(doc => doc.document_status))).sort();
  }, [accessibleDocuments]);

  const accessLevels = useMemo(() => {
    return Array.from(new Set(accessibleDocuments.map(doc => doc.access_level))).sort();
  }, [accessibleDocuments]);

  // Filter documents
  const filteredDocuments = useMemo(() => {
    let filtered = accessibleDocuments;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.employee_name.toLowerCase().includes(term) ||
        doc.document_name.toLowerCase().includes(term) ||
        doc.document_type.toLowerCase().includes(term) ||
        doc.document_category.toLowerCase().includes(term) ||
        doc.description?.toLowerCase().includes(term)
      );
    }

    if (selectedEmployee) {
      filtered = filtered.filter(doc => doc.employee_id === selectedEmployee);
    }

    if (selectedDocumentType) {
      filtered = filtered.filter(doc => doc.document_type === selectedDocumentType);
    }

    if (selectedCategory) {
      filtered = filtered.filter(doc => doc.document_category === selectedCategory);
    }

    if (selectedStatus) {
      filtered = filtered.filter(doc => doc.document_status === selectedStatus);
    }

    if (selectedAccessLevel) {
      filtered = filtered.filter(doc => doc.access_level === selectedAccessLevel);
    }

    return filtered.sort((a, b) => new Date(b.upload_date).getTime() - new Date(a.upload_date).getTime());
  }, [
    accessibleDocuments, 
    searchTerm, 
    selectedEmployee, 
    selectedDocumentType, 
    selectedCategory, 
    selectedStatus, 
    selectedAccessLevel
  ]);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get status badge variant
  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'approved':
        return 'default';
      case 'pending':
      case 'review':
        return 'secondary';
      case 'expired':
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Get access level badge variant
  const getAccessLevelVariant = (level: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (level.toLowerCase()) {
      case 'public':
        return 'default';
      case 'internal':
        return 'secondary';
      case 'confidential':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Preview document
  const handlePreview = async (employeeDocument: EmployeeDocument) => {
    if (!hasDocumentAccess(employeeDocument)) {
      alert('You do not have permission to view this document.');
      return;
    }

    setLoading(true);
    try {
      // Generate signed URL for document preview
      const { data, error } = await supabase.storage
        .from('employee-documents')
        .createSignedUrl(employeeDocument.file_path, 3600); // 1 hour expiry

      if (error) throw error;

      setPreviewDocument(employeeDocument);
      setPreviewUrl(data.signedUrl);
    } catch (error) {
      console.error('Error generating preview URL:', error);
      alert('Unable to preview document. Please try downloading instead.');
    } finally {
      setLoading(false);
    }
  };

  // Download document
  const handleDownload = async (employeeDocument: EmployeeDocument) => {
    if (!hasDocumentAccess(employeeDocument)) {
      alert('You do not have permission to download this document.');
      return;
    }

    setLoading(true);
    try {
      // Generate signed URL for download
      const { data, error } = await supabase.storage
        .from('employee-documents')
        .createSignedUrl(employeeDocument.file_path, 300); // 5 minute expiry

      if (error) throw error;

      // Trigger download
      const link = document.createElement('a');
      link.href = data.signedUrl;
      link.download = employeeDocument.document_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Unable to download document. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Export functions
  const exportToCSVHandler = () => {
    const exportData = filteredDocuments.map(doc => ({
      'Employee Name': doc.employee_name,
      'Document Name': doc.document_name,
      'Document Type': doc.document_type,
      'Category': doc.document_category,
      'File Size': formatFileSize(doc.file_size),
      'Upload Date': new Date(doc.upload_date).toLocaleDateString(),
      'Uploaded By': doc.uploaded_by_profile?.full_name || doc.uploaded_by,
      'Status': doc.document_status,
      'Access Level': doc.access_level,
      'Description': doc.description || ''
    }));

    exportToCSV(exportData, `${branding?.legalName || 'ETLA'}_Employee_Documents_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportToExcelHandler = () => {
    const exportData = filteredDocuments.map(doc => ({
      'Employee Name': doc.employee_name,
      'Document Name': doc.document_name,
      'Document Type': doc.document_type,
      'Category': doc.document_category,
      'File Size': formatFileSize(doc.file_size),
      'Upload Date': new Date(doc.upload_date).toLocaleDateString(),
      'Uploaded By': doc.uploaded_by_profile?.full_name || doc.uploaded_by,
      'Status': doc.document_status,
      'Access Level': doc.access_level,
      'Description': doc.description || ''
    }));

    exportToExcel(exportData, `${branding?.legalName || 'ETLA'}_Employee_Documents_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Header with branding */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {branding?.legalName || 'ETLA Platform'} - Employee Documents
          </h2>
          <p className="text-gray-600">Secure document management with role-based access control</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToCSVHandler} variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={exportToExcelHandler} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* RBAC Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-blue-800">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-medium">
              Access Level: {userRole} | Showing {filteredDocuments.length} of {documents.length} documents based on your permissions
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <Input
                placeholder="Document name, employee..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="All employees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All employees</SelectItem>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
              <Select value={selectedDocumentType} onValueChange={setSelectedDocumentType}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  {documentTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Access Level</label>
              <Select value={selectedAccessLevel} onValueChange={setSelectedAccessLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All levels</SelectItem>
                  {accessLevels.map(level => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <div className="grid gap-4">
        {filteredDocuments.map((doc) => (
          <Card key={doc.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="h-5 w-5 text-gray-500" />
                    <h3 className="font-medium text-gray-900">{doc.document_name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {doc.document_type}
                    </Badge>
                    <Badge variant={getStatusVariant(doc.document_status)} className="text-xs">
                      {doc.document_status}
                    </Badge>
                    <Badge variant={getAccessLevelVariant(doc.access_level)} className="text-xs">
                      <Shield className="h-3 w-3 mr-1" />
                      {doc.access_level}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{doc.employee_name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      <span>{doc.document_category}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(doc.upload_date).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span>Size: {formatFileSize(doc.file_size)}</span>
                    </div>
                  </div>

                  {doc.description && (
                    <p className="text-sm text-gray-600 mt-2">{doc.description}</p>
                  )}

                  <div className="text-xs text-gray-500 mt-2">
                    Uploaded by: {doc.uploaded_by_profile?.full_name || doc.uploaded_by}
                    {doc.retention_date && (
                      <span className="ml-4">
                        Retention until: {new Date(doc.retention_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Facsimile Label for simulated documents */}
                  {doc.tags?.includes('facsimile') && (
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                        Facsimile Document
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreview(doc)}
                    disabled={loading}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(doc)}
                    disabled={loading}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-600">Try adjusting your filters or check your access permissions.</p>
          </CardContent>
        </Card>
      )}

      {/* Document Preview Modal */}
      <Dialog open={!!previewDocument} onOpenChange={() => {
        setPreviewDocument(null);
        setPreviewUrl(null);
      }}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {previewDocument?.document_name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {previewUrl && previewDocument && (
              <div className="space-y-4">
                {/* Document metadata */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Employee:</strong> {previewDocument.employee_name}
                    </div>
                    <div>
                      <strong>Type:</strong> {previewDocument.document_type}
                    </div>
                    <div>
                      <strong>Category:</strong> {previewDocument.document_category}
                    </div>
                    <div>
                      <strong>Upload Date:</strong> {new Date(previewDocument.upload_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Document preview */}
                <div className="border rounded-lg overflow-hidden">
                  {previewDocument.mime_type.startsWith('image/') ? (
                    <img 
                      src={previewUrl} 
                      alt={previewDocument.document_name}
                      className="w-full h-auto max-h-96 object-contain"
                    />
                  ) : previewDocument.mime_type === 'application/pdf' ? (
                    <iframe
                      src={previewUrl}
                      className="w-full h-96"
                      title={previewDocument.document_name}
                    />
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4" />
                      <p>Preview not available for this file type.</p>
                      <p className="text-sm">Use the download button to view the document.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

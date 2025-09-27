import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { FileText, Download, Loader2, AlertCircle, Eye, ExternalLink } from 'lucide-react'
import { reportingCockpitService, exportToCSV } from '@/services/reportingCockpitService'
import type { DocumentRecord } from '@/types/reporting'

interface DocumentsGridProps {
  employeeId?: string
  tenantId?: string
}

const DocumentsGrid: React.FC<DocumentsGridProps> = ({
  employeeId,
  tenantId
}) => {
  const [documents, setDocuments] = useState<DocumentRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (employeeId) {
      loadDocuments()
    } else {
      setDocuments([])
    }
  }, [employeeId, tenantId])

  const loadDocuments = async () => {
    if (!employeeId) return

    setLoading(true)
    setError(null)

    try {
      const data = await reportingCockpitService.getEmployeeDocuments(employeeId, tenantId)
      setDocuments(data)
    } catch (err) {
      console.error('Error loading documents:', err)
      setError('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getDocumentTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'pdf':
        return 'bg-red-100 text-red-800'
      case 'doc':
      case 'docx':
        return 'bg-blue-100 text-blue-800'
      case 'xls':
      case 'xlsx':
        return 'bg-green-100 text-green-800'
      case 'jpg':
      case 'jpeg':
      case 'png':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'tax forms':
        return 'bg-yellow-100 text-yellow-800'
      case 'hr documents':
        return 'bg-blue-100 text-blue-800'
      case 'payroll':
        return 'bg-green-100 text-green-800'
      case 'benefits':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'default'
      case 'archived':
        return 'secondary'
      case 'expired':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const handleViewDocument = (document: DocumentRecord) => {
    // TODO: Implement document viewer integration
    console.log('Opening document:', document.document_name)
    // This would open the document in a modal or new window
  }

  const handleDownloadDocument = (document: DocumentRecord) => {
    // TODO: Implement document download
    console.log('Downloading document:', document.document_name)
    // This would trigger a download from the document repository
  }

  const openDocumentRepository = () => {
    // TODO: Implement document repository browser
    console.log('Opening document repository for employee:', employeeId)
    // This would open a modal or new window to browse all employee documents
  }

  const exportDocumentsList = () => {
    if (documents.length > 0) {
      const exportData = documents.map(doc => ({
        document_name: doc.document_name,
        document_type: doc.document_type,
        document_category: doc.document_category,
        file_size: formatFileSize(doc.file_size),
        upload_date: formatDate(doc.upload_date),
        status: doc.status,
        tags: doc.tags.join(', ')
      }))
      
      exportToCSV(
        exportData,
        `documents_${employeeId}_${new Date().toISOString().split('T')[0]}`
      )
    }
  }

  if (!employeeId) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">Employee documents will appear here</p>
        <p className="text-xs text-gray-400">Select an employee to view data</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-blue-500" />
        <p className="text-sm text-gray-600">Loading documents...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
        <p className="text-sm">{error}</p>
        <Button variant="outline" size="sm" onClick={loadDocuments} className="mt-2">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with repository browser and export */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium">Employee Documents</h3>
          <p className="text-sm text-gray-500">{documents.length} documents found</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={openDocumentRepository}>
            <ExternalLink className="h-4 w-4 mr-1" />
            Browse Repository
          </Button>
          <Button variant="outline" size="sm" onClick={exportDocumentsList}>
            <Download className="h-4 w-4 mr-1" />
            Export List
          </Button>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {documents.map((document) => (
          <Card key={document.id} className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Document Info */}
              <div className="md:col-span-2">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getDocumentTypeColor(document.document_type)}`}>
                    {document.document_type}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(document.document_category)}`}>
                    {document.document_category}
                  </span>
                  <Badge variant={getStatusBadgeVariant(document.document_status || document.status)}>
                    {document.document_status || document.status || 'Unknown'}
                  </Badge>
                </div>
                <div className="font-medium mb-1">{document.document_name}</div>
                <div className="text-sm text-gray-600">
                  {formatFileSize(document.file_size)} • Uploaded {formatDate(document.upload_date)}
                </div>
              </div>

              {/* Tags */}
              <div>
                <div className="text-sm text-gray-600 mb-1">Tags:</div>
                <div className="flex flex-wrap gap-1">
                  {document.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleViewDocument(document)}
                  className="w-full"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDownloadDocument(document)}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {documents.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No documents found</p>
          <p className="text-xs text-gray-400">No documents available for this employee</p>
          <Button variant="outline" size="sm" onClick={openDocumentRepository} className="mt-4">
            <ExternalLink className="h-4 w-4 mr-1" />
            Browse Document Repository
          </Button>
        </div>
      )}

      {/* Repository Integration Note */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="text-sm text-blue-800">
          <div className="font-medium mb-1">Document Repository Integration</div>
          <div className="text-blue-700">
            Documents are managed through your configured document repository. 
            Click "Browse Repository" to access all employee documents with advanced search and filtering capabilities.
          </div>
        </div>
      </Card>
    </div>
  )
}

export default DocumentsGrid


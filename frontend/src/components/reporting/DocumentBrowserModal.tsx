import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import documentRepositoryService from '@/services/documentRepositoryService'
import type { DocumentRecord, DocumentSearchFilters } from '@/types/reporting'
import {
  Search,
  Filter,
  Download,
  Eye,
  FileText,
  Calendar,
  Tag,
  Shield,
  Loader2,
  AlertCircle,
  X,
  RefreshCw
} from 'lucide-react'

interface DocumentBrowserModalProps {
  isOpen: boolean
  onClose: () => void
  employeeId?: string
  employeeName?: string
  tenantId?: string
  onDocumentSelect?: (document: DocumentRecord) => void
}

const DocumentBrowserModal: React.FC<DocumentBrowserModalProps> = ({
  isOpen,
  onClose,
  employeeId,
  employeeName,
  tenantId,
  onDocumentSelect
}) => {
  const [documents, setDocuments] = useState<DocumentRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  // Filter states
  const [filters, setFilters] = useState<DocumentSearchFilters>({
    employeeId: employeeId
  })
  
  // Filter options
  const [categories, setCategories] = useState<string[]>([])
  const [documentTypes, setDocumentTypes] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const documentsPerPage = 20

  useEffect(() => {
    if (isOpen) {
      loadFilterOptions()
      loadDocuments(true)
    }
  }, [isOpen, employeeId, tenantId])

  useEffect(() => {
    if (isOpen) {
      const delayedSearch = setTimeout(() => {
        loadDocuments(true)
      }, 300)
      return () => clearTimeout(delayedSearch)
    }
  }, [searchTerm, filters])

  const loadFilterOptions = async () => {
    try {
      const [categoriesData, typesData, tagsData] = await Promise.all([
        documentRepositoryService.getDocumentCategories(tenantId),
        documentRepositoryService.getDocumentTypes(tenantId),
        documentRepositoryService.getDocumentTags(tenantId)
      ])
      
      setCategories(categoriesData)
      setDocumentTypes(typesData)
      setTags(tagsData)
    } catch (error) {
      console.error('Error loading filter options:', error)
    }
  }

  const loadDocuments = async (reset: boolean = false) => {
    setLoading(true)
    setError(null)

    try {
      const page = reset ? 1 : currentPage
      const offset = (page - 1) * documentsPerPage

      const searchFilters: DocumentSearchFilters = {
        ...filters,
        searchTerm: searchTerm.trim() || undefined
      }

      const newDocuments = await documentRepositoryService.searchDocuments(
        searchFilters,
        tenantId,
        documentsPerPage,
        offset
      )

      if (reset) {
        setDocuments(newDocuments)
        setCurrentPage(1)
      } else {
        setDocuments(prev => [...prev, ...newDocuments])
      }

      setHasMore(newDocuments.length === documentsPerPage)
    } catch (err) {
      console.error('Error loading documents:', err)
      setError('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  const loadMore = () => {
    if (!loading && hasMore) {
      setCurrentPage(prev => prev + 1)
      loadDocuments(false)
    }
  }

  const handleFilterChange = (key: keyof DocumentSearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const clearFilters = () => {
    setFilters({ employeeId })
    setSearchTerm('')
    setShowFilters(false)
  }

  const handleViewDocument = async (document: DocumentRecord) => {
    try {
      await documentRepositoryService.updateDocumentAccess(document.id, tenantId)
      if (onDocumentSelect) {
        onDocumentSelect(document)
      }
      // TODO: Open document viewer
      console.log('Opening document:', document.document_name)
    } catch (error) {
      console.error('Error viewing document:', error)
    }
  }

  const handleDownloadDocument = async (document: DocumentRecord) => {
    try {
      const downloadUrl = await documentRepositoryService.getDocumentDownloadUrl(document.id, tenantId)
      if (downloadUrl) {
        // TODO: Implement actual download
        console.log('Downloading document:', document.document_name, downloadUrl)
      }
    } catch (error) {
      console.error('Error downloading document:', error)
    }
  }

  const exportDocumentsList = () => {
    if (documents.length > 0) {
      const filename = employeeId 
        ? `documents_${employeeName || employeeId}_${new Date().toISOString().split('T')[0]}`
        : `all_documents_${new Date().toISOString().split('T')[0]}`
      
      documentRepositoryService.exportDocumentsToCSV(documents, filename)
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
      case 'pdf': return 'bg-red-100 text-red-800'
      case 'doc': case 'docx': return 'bg-blue-100 text-blue-800'
      case 'xls': case 'xlsx': return 'bg-green-100 text-green-800'
      case 'jpg': case 'jpeg': case 'png': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'tax forms': return 'bg-yellow-100 text-yellow-800'
      case 'hr documents': return 'bg-blue-100 text-blue-800'
      case 'payroll': return 'bg-green-100 text-green-800'
      case 'benefits': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAccessLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'public': return 'bg-green-100 text-green-800'
      case 'restricted': return 'bg-yellow-100 text-yellow-800'
      case 'confidential': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div>
              <span>Document Repository</span>
              {employeeName && (
                <span className="text-sm font-normal text-gray-600 ml-2">
                  - {employeeName}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={exportDocumentsList}>
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={() => loadDocuments(true)}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Search and Filters */}
        <div className="space-y-4 border-b pb-4">
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-blue-50 border-blue-200' : ''}
            >
              <Filter className="h-4 w-4 mr-1" />
              Filters
            </Button>
            {(Object.keys(filters).length > 1 || searchTerm) && (
              <Button variant="outline" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="text-sm font-medium mb-1 block">Category</label>
                <Select
                  value={filters.documentCategory || ''}
                  onValueChange={(value) => handleFilterChange('documentCategory', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Type</label>
                <Select
                  value={filters.documentType || ''}
                  onValueChange={(value) => handleFilterChange('documentType', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All types</SelectItem>
                    {documentTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Access Level</label>
                <Select
                  value={filters.accessLevel || ''}
                  onValueChange={(value) => handleFilterChange('accessLevel', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All levels</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="restricted">Restricted</SelectItem>
                    <SelectItem value="confidential">Confidential</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Date Range</label>
                <div className="flex space-x-1">
                  <Input
                    type="date"
                    value={filters.dateRange?.start || ''}
                    onChange={(e) => handleFilterChange('dateRange', {
                      ...filters.dateRange,
                      start: e.target.value
                    })}
                    className="text-xs"
                  />
                  <Input
                    type="date"
                    value={filters.dateRange?.end || ''}
                    onChange={(e) => handleFilterChange('dateRange', {
                      ...filters.dateRange,
                      end: e.target.value
                    })}
                    className="text-xs"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Documents List */}
        <div className="flex-1 overflow-y-auto">
          {loading && documents.length === 0 ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-blue-500" />
              <p className="text-sm text-gray-600">Loading documents...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">{error}</p>
              <Button variant="outline" size="sm" onClick={() => loadDocuments(true)} className="mt-2">
                Try Again
              </Button>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No documents found</p>
              <p className="text-xs text-gray-400">
                {searchTerm || Object.keys(filters).length > 1 
                  ? 'Try adjusting your search or filters' 
                  : 'No documents available'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((document) => (
                <Card key={document.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {/* Document Info */}
                    <div className="md:col-span-2">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getDocumentTypeColor(document.document_type)}`}>
                          {document.document_type}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(document.document_category)}`}>
                          {document.document_category}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getAccessLevelColor(document.access_level)}`}>
                          <Shield className="h-3 w-3 mr-1 inline" />
                          {document.access_level}
                        </span>
                      </div>
                      <div className="font-medium mb-1">{document.document_name}</div>
                      <div className="text-sm text-gray-600">
                        {formatFileSize(document.file_size)} • {formatDate(document.upload_date)}
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Tags:</div>
                      <div className="flex flex-wrap gap-1">
                        {document.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs flex items-center">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                        {document.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            +{document.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Metadata */}
                    <div>
                      <div className="text-sm space-y-1">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span className="text-xs">Uploaded {formatDate(document.upload_date)}</span>
                        </div>
                        {document.last_accessed && (
                          <div className="flex items-center text-gray-600">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span className="text-xs">Last Accessed {formatDate(document.last_accessed)}</span>
                          </div>
                        )}
                        {document.metadata && Object.keys(document.metadata).length > 0 && (
                          <div className="text-xs text-gray-600 mt-2">
                            <span className="font-medium">Metadata:</span>
                            <ul className="list-disc list-inside ml-2">
                              {Object.entries(document.metadata).map(([key, value]) => (
                                <li key={key}>{key}: {String(value)}</li>
                              ))}
                            </ul>
                          </div>
                        )}
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
          )}

          {hasMore && !loading && documents.length > 0 && (
            <div className="text-center py-4">
              <Button variant="outline" onClick={loadMore}>
                Load More
              </Button>
            </div>
          )}

          {loading && documents.length > 0 && (
            <div className="text-center py-4">
              <Loader2 className="h-6 w-6 mx-auto animate-spin text-blue-500" />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DocumentBrowserModal


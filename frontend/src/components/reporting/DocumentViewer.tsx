import React, { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { DocumentRecord } from '@/services/documentRepositoryService'
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download, 
  Maximize, 
  Minimize,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  File
} from 'lucide-react'

interface DocumentViewerProps {
  isOpen: boolean
  onClose: () => void
  document: DocumentRecord | null
  documents?: DocumentRecord[]
  onDocumentChange?: (document: DocumentRecord) => void
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  isOpen,
  onClose,
  document,
  documents = [],
  onDocumentChange
}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [documentUrl, setDocumentUrl] = useState<string | null>(null)
  
  const viewerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Navigation
  const currentIndex = documents.findIndex(doc => doc.id === document?.id)
  const hasPrevious = currentIndex > 0
  const hasNext = currentIndex < documents.length - 1

  useEffect(() => {
    if (document && isOpen) {
      loadDocument()
    }
  }, [document, isOpen])

  const loadDocument = async () => {
    if (!document) return

    setLoading(true)
    setError(null)
    setZoom(100)
    setRotation(0)

    try {
      // TODO: Implement actual document loading from repository
      // For now, simulate loading with the file path
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // In production, this would fetch the actual document content
      // For now, we'll use a placeholder based on document type
      setDocumentUrl(document.file_path)
    } catch (err) {
      console.error('Error loading document:', err)
      setError('Failed to load document')
    } finally {
      setLoading(false)
    }
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 300))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 25))
  }

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  const handleFullscreen = () => {
    if (!isFullscreen && viewerRef.current) {
      if (viewerRef.current.requestFullscreen) {
        viewerRef.current.requestFullscreen()
      }
    } else if (window.document.exitFullscreen) {
      window.document.exitFullscreen()
    }
    setIsFullscreen(!isFullscreen)
  }

  const handlePrevious = () => {
    if (hasPrevious && onDocumentChange) {
      onDocumentChange(documents[currentIndex - 1])
    }
  }

  const handleNext = () => {
    if (hasNext && onDocumentChange) {
      onDocumentChange(documents[currentIndex + 1])
    }
  }

  const handleDownload = () => {
    if (document && documentUrl) {
      // TODO: Implement actual download
      console.log('Downloading document:', document.document_name)
      
      // Create a temporary link for download
      const link = window.document.createElement('a')
      link.href = documentUrl
      link.download = document.document_name
      link.click()
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDocumentTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-600" />
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <ImageIcon className="h-5 w-5 text-purple-600" />
      default:
        return <File className="h-5 w-5 text-gray-600" />
    }
  }

  const renderDocumentContent = () => {
    if (!document || !documentUrl) return null

    const documentType = document.document_type?.toLowerCase()
    const style = {
      transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
      transformOrigin: 'center center',
      transition: 'transform 0.2s ease-in-out'
    }

    switch (documentType) {
      case 'pdf':
        return (
          <div className="flex items-center justify-center h-full bg-gray-100">
            <div style={style} className="bg-white shadow-lg">
              {/* TODO: Implement PDF viewer (could use react-pdf or pdf.js) */}
              <div className="w-96 h-[500px] bg-white border flex items-center justify-center">
                <div className="text-center">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-red-600" />
                  <p className="text-lg font-medium">PDF Document</p>
                  <p className="text-sm text-gray-600">{document.document_name}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    PDF viewer integration required for full preview
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return (
          <div className="flex items-center justify-center h-full bg-gray-100">
            <div style={style}>
              {/* TODO: Load actual image from repository */}
              <div className="bg-white shadow-lg p-4">
                <div className="w-96 h-64 bg-gray-200 border flex items-center justify-center">
                  <div className="text-center">
                    <ImageIcon className="h-16 w-16 mx-auto mb-4 text-purple-600" />
                    <p className="text-lg font-medium">Image Document</p>
                    <p className="text-sm text-gray-600">{document.document_name}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="flex items-center justify-center h-full bg-gray-100">
            <div className="text-center">
              <File className="h-16 w-16 mx-auto mb-4 text-gray-600" />
              <p className="text-lg font-medium">Document Preview</p>
              <p className="text-sm text-gray-600">{document.document_name}</p>
              <p className="text-xs text-gray-500 mt-2">
                Preview not available for {document.document_type} files
              </p>
              <Button variant="outline" onClick={handleDownload} className="mt-4">
                <Download className="h-4 w-4 mr-2" />
                Download to View
              </Button>
            </div>
          </div>
        )
    }
  }

  if (!document) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getDocumentTypeIcon(document.document_type)}
              <div>
                <span className="text-lg">{document.document_name}</span>
                <div className="text-sm font-normal text-gray-600 flex items-center space-x-4">
                  <span>{formatFileSize(document.file_size)}</span>
                  <span>•</span>
                  <span>{formatDate(document.upload_date)}</span>
                  <span>•</span>
                  <Badge variant="outline">{document.document_category}</Badge>
                </div>
              </div>
            </div>
            
            {/* Navigation Controls */}
            {documents.length > 1 && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={!hasPrevious}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600">
                  {currentIndex + 1} of {documents.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNext}
                  disabled={!hasNext}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[60px] text-center">
              {zoom}%
            </span>
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleRotate}>
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleFullscreen}>
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </div>
        </div>

        {/* Document Content */}
        <div 
          ref={viewerRef}
          className="flex-1 overflow-auto bg-gray-50"
          style={{ minHeight: '500px' }}
        >
          <div ref={contentRef} className="h-full">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-blue-500" />
                  <p className="text-sm text-gray-600">Loading document...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-red-500">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">{error}</p>
                  <Button variant="outline" size="sm" onClick={loadDocument} className="mt-2">
                    Try Again
                  </Button>
                </div>
              </div>
            ) : (
              renderDocumentContent()
            )}
          </div>
        </div>

        {/* Document Info Footer */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Tags:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {document.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <span className="font-medium">Access Level:</span>
              <Badge 
                variant={document.access_level === 'confidential' ? 'destructive' : 'outline'}
                className="ml-2"
              >
                {document.access_level}
              </Badge>
            </div>
            <div>
              <span className="font-medium">Status:</span>
              <Badge variant="outline" className="ml-2">
                {document.status}
              </Badge>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DocumentViewer

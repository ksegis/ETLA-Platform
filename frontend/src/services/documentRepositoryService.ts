import { createClient } from '@supabase/supabase-js'

// Document Repository Configuration Interface
export interface DocumentRepositoryConfig {
  id: string
  tenant_id: string
  repository_type: 'local' | 'aws_s3' | 'azure_blob' | 'google_cloud' | 'sharepoint'
  repository_name: string
  connection_string: string
  access_key?: string
  secret_key?: string
  bucket_name?: string
  base_path: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// Document Record Interface (enhanced from DocumentsGrid)
export interface DocumentRecord {
  id: string
  employee_id: string
  tenant_id: string
  document_name: string
  document_type: string
  file_path: string
  file_size: number
  upload_date: string
  document_category: string
  status: string
  tags: string[]
  metadata?: Record<string, any>
  thumbnail_path?: string
  is_confidential: boolean
  access_level: 'public' | 'restricted' | 'confidential'
  created_by: string
  last_accessed?: string
}

// Document Search Filters
export interface DocumentSearchFilters {
  employeeId?: string
  documentCategory?: string
  documentType?: string
  tags?: string[]
  dateRange?: {
    start: string
    end: string
  }
  searchTerm?: string
  accessLevel?: string
}

class DocumentRepositoryService {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  /**
   * Get document repository configuration for a tenant
   */
  async getRepositoryConfig(tenantId?: string): Promise<DocumentRepositoryConfig | null> {
    try {
      const { data, error } = await this.supabase
        .from('document_repository_config')
        .select('*')
        .eq('tenant_id', tenantId || 'default')
        .eq('is_active', true)
        .single()

      if (error) {
        console.error('Error fetching repository config:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getRepositoryConfig:', error)
      return null
    }
  }

  /**
   * Search documents with advanced filtering
   */
  async searchDocuments(
    filters: DocumentSearchFilters,
    tenantId?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<DocumentRecord[]> {
    try {
      let query = this.supabase
        .from('employee_documents')
        .select('*')
        .eq('tenant_id', tenantId || 'default')
        .order('upload_date', { ascending: false })
        .range(offset, offset + limit - 1)

      // Apply filters
      if (filters.employeeId) {
        query = query.eq('employee_id', filters.employeeId)
      }

      if (filters.documentCategory) {
        query = query.eq('document_category', filters.documentCategory)
      }

      if (filters.documentType) {
        query = query.eq('document_type', filters.documentType)
      }

      if (filters.accessLevel) {
        query = query.eq('access_level', filters.accessLevel)
      }

      if (filters.searchTerm) {
        query = query.or(`document_name.ilike.%${filters.searchTerm}%,tags.cs.{${filters.searchTerm}}`)
      }

      if (filters.dateRange) {
        query = query
          .gte('upload_date', filters.dateRange.start)
          .lte('upload_date', filters.dateRange.end)
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error searching documents:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in searchDocuments:', error)
      return []
    }
  }

  /**
   * Get documents for a specific employee
   */
  async getEmployeeDocuments(
    employeeId: string,
    tenantId?: string,
    category?: string
  ): Promise<DocumentRecord[]> {
    const filters: DocumentSearchFilters = {
      employeeId,
      ...(category && { documentCategory: category })
    }

    return this.searchDocuments(filters, tenantId)
  }

  /**
   * Get document categories for filtering
   */
  async getDocumentCategories(tenantId?: string): Promise<string[]> {
    try {
      const { data, error } = await this.supabase
        .from('employee_documents')
        .select('document_category')
        .eq('tenant_id', tenantId || 'default')
        .not('document_category', 'is', null)

      if (error) {
        console.error('Error fetching document categories:', error)
        return []
      }

      // Get unique categories
      const categories = Array.from(new Set(data.map(item => item.document_category)))
      return categories.filter(Boolean)
    } catch (error) {
      console.error('Error in getDocumentCategories:', error)
      return []
    }
  }

  /**
   * Get document types for filtering
   */
  async getDocumentTypes(tenantId?: string): Promise<string[]> {
    try {
      const { data, error } = await this.supabase
        .from('employee_documents')
        .select('document_type')
        .eq('tenant_id', tenantId || 'default')
        .not('document_type', 'is', null)

      if (error) {
        console.error('Error fetching document types:', error)
        return []
      }

      // Get unique types
      const types = Array.from(new Set(data.map(item => item.document_type)))
      return types.filter(Boolean)
    } catch (error) {
      console.error('Error in getDocumentTypes:', error)
      return []
    }
  }

  /**
   * Get all unique tags for filtering
   */
  async getDocumentTags(tenantId?: string): Promise<string[]> {
    try {
      const { data, error } = await this.supabase
        .from('employee_documents')
        .select('tags')
        .eq('tenant_id', tenantId || 'default')
        .not('tags', 'is', null)

      if (error) {
        console.error('Error fetching document tags:', error)
        return []
      }

      // Flatten and get unique tags
      const allTags = data.reduce((acc: string[], item) => {
        if (item.tags && Array.isArray(item.tags)) {
          acc.push(...item.tags)
        }
        return acc
      }, [])

      return Array.from(new Set(allTags)).filter(Boolean)
    } catch (error) {
      console.error('Error in getDocumentTags:', error)
      return []
    }
  }

  /**
   * Get document statistics for an employee
   */
  async getDocumentStats(employeeId: string, tenantId?: string): Promise<{
    totalDocuments: number
    documentsByCategory: Record<string, number>
    documentsByType: Record<string, number>
    recentDocuments: number
  }> {
    try {
      const documents = await this.getEmployeeDocuments(employeeId, tenantId)
      
      const stats = {
        totalDocuments: documents.length,
        documentsByCategory: {} as Record<string, number>,
        documentsByType: {} as Record<string, number>,
        recentDocuments: 0
      }

      // Calculate recent documents (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      documents.forEach(doc => {
        // Count by category
        if (doc.document_category) {
          stats.documentsByCategory[doc.document_category] = 
            (stats.documentsByCategory[doc.document_category] || 0) + 1
        }

        // Count by type
        if (doc.document_type) {
          stats.documentsByType[doc.document_type] = 
            (stats.documentsByType[doc.document_type] || 0) + 1
        }

        // Count recent documents
        if (new Date(doc.upload_date) > thirtyDaysAgo) {
          stats.recentDocuments++
        }
      })

      return stats
    } catch (error) {
      console.error('Error in getDocumentStats:', error)
      return {
        totalDocuments: 0,
        documentsByCategory: {},
        documentsByType: {},
        recentDocuments: 0
      }
    }
  }

  /**
   * Generate document download URL (placeholder for repository integration)
   */
  async getDocumentDownloadUrl(documentId: string, tenantId?: string): Promise<string | null> {
    try {
      // TODO: Implement actual repository integration based on repository_type
      // This would generate signed URLs for cloud storage or direct paths for local storage
      
      const { data, error } = await this.supabase
        .from('employee_documents')
        .select('file_path, document_name')
        .eq('id', documentId)
        .eq('tenant_id', tenantId || 'default')
        .single()

      if (error || !data) {
        console.error('Error fetching document:', error)
        return null
      }

      // For now, return the file path - in production this would be a signed URL
      return data.file_path
    } catch (error) {
      console.error('Error in getDocumentDownloadUrl:', error)
      return null
    }
  }

  /**
   * Update document access timestamp
   */
  async updateDocumentAccess(documentId: string, tenantId?: string): Promise<void> {
    try {
      await this.supabase
        .from('employee_documents')
        .update({ 
          last_accessed: new Date().toISOString()
        })
        .eq('id', documentId)
        .eq('tenant_id', tenantId || 'default')
    } catch (error) {
      console.error('Error updating document access:', error)
    }
  }

  /**
   * Export document list to CSV
   */
  exportDocumentsToCSV(documents: DocumentRecord[], filename: string): void {
    const exportData = documents.map(doc => ({
      document_name: doc.document_name,
      document_type: doc.document_type,
      document_category: doc.document_category,
      file_size: this.formatFileSize(doc.file_size),
      upload_date: new Date(doc.upload_date).toLocaleDateString(),
      status: doc.status,
      access_level: doc.access_level,
      tags: doc.tags.join(', '),
      is_confidential: doc.is_confidential ? 'Yes' : 'No'
    }))

    const csvContent = [
      Object.keys(exportData[0]).join(','),
      ...exportData.map(row => 
        Object.values(row).map(value => 
          typeof value === 'string' && value.includes(',') ? `"${value}"` : value
        ).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  /**
   * Format file size helper
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

export const documentRepositoryService = new DocumentRepositoryService()
export default documentRepositoryService

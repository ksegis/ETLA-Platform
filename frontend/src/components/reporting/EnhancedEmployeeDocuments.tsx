'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/Input'
import { FileText, Download, Search, User, Building, Calendar } from 'lucide-react'
import { useCustomerBranding } from '@/services/brandingService'
import { exportToCSV, exportToExcel } from '@/utils/exportUtils'

interface EmployeeDocument {
  id: string
  employee_id: string
  employee_name: string
  employee_code: string
  document_type: string
  document_name: string
  file_path: string
  upload_date: string
  document_status: string
  expiration_date?: string
  department: string
  tenant_id: string
}

interface EnhancedEmployeeDocumentsProps {
  documents?: EmployeeDocument[]
  tenantId?: string
}

export default function EnhancedEmployeeDocuments({ documents = [], tenantId }: EnhancedEmployeeDocumentsProps) {
  const [filteredDocuments, setFilteredDocuments] = useState<EmployeeDocument[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const branding = useCustomerBranding()

  // Mock data for demonstration
  const mockDocuments: EmployeeDocument[] = [
    {
      id: '1',
      employee_id: 'EMP001',
      employee_name: 'John Smith',
      employee_code: 'JS001',
      document_type: 'I-9 Form',
      document_name: 'I9_John_Smith_2024.pdf',
      file_path: '/documents/i9/I9_John_Smith_2024.pdf',
      upload_date: '2024-01-15',
      document_status: 'Active',
      expiration_date: '2027-01-15',
      department: 'Engineering',
      tenant_id: tenantId || 'default'
    },
    {
      id: '2',
      employee_id: 'EMP002',
      employee_name: 'Sarah Johnson',
      employee_code: 'SJ002',
      document_type: 'W-4 Form',
      document_name: 'W4_Sarah_Johnson_2024.pdf',
      file_path: '/documents/w4/W4_Sarah_Johnson_2024.pdf',
      upload_date: '2024-02-01',
      document_status: 'Active',
      department: 'Marketing',
      tenant_id: tenantId || 'default'
    },
    {
      id: '3',
      employee_id: 'EMP003',
      employee_name: 'Mike Davis',
      employee_code: 'MD003',
      document_type: 'Direct Deposit Form',
      document_name: 'DirectDeposit_Mike_Davis.pdf',
      file_path: '/documents/dd/DirectDeposit_Mike_Davis.pdf',
      upload_date: '2024-01-20',
      document_status: 'Active',
      department: 'Sales',
      tenant_id: tenantId || 'default'
    }
  ]

  const dataToUse = documents.length > 0 ? documents : mockDocuments

  useEffect(() => {
    let filtered = dataToUse

    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.employee_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.document_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.document_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(doc => doc.document_status.toLowerCase() === statusFilter)
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(doc => doc.document_type.toLowerCase().includes(typeFilter.toLowerCase()))
    }

    setFilteredDocuments(filtered)
  }, [searchTerm, statusFilter, typeFilter, dataToUse])

  const exportToCSVHandler = () => {
    const exportData = filteredDocuments.map(doc => ({
      'Employee ID': doc.employee_id,
      'Employee Name': doc.employee_name,
      'Employee Code': doc.employee_code,
      'Document Type': doc.document_type,
      'Document Name': doc.document_name,
      'Upload Date': doc.upload_date,
      'Status': doc.document_status,
      'Expiration Date': doc.expiration_date || 'N/A',
      'Department': doc.department
    }))

    exportToCSV(exportData, `${branding?.branding?.legalName || 'ETLA'}_Employee_Documents_${new Date().toISOString().split('T')[0]}.csv`)
  }

  const exportToExcelHandler = () => {
    const exportData = filteredDocuments.map(doc => ({
      'Employee ID': doc.employee_id,
      'Employee Name': doc.employee_name,
      'Employee Code': doc.employee_code,
      'Document Type': doc.document_type,
      'Document Name': doc.document_name,
      'Upload Date': doc.upload_date,
      'Status': doc.document_status,
      'Expiration Date': doc.expiration_date || 'N/A',
      'Department': doc.department
    }))

    exportToExcel(exportData, `${branding?.branding?.legalName || 'ETLA'}_Employee_Documents_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'expired': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Employee Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by employee name, code, or document type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="pending">Pending</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Types</option>
              <option value="i-9">I-9 Forms</option>
              <option value="w-4">W-4 Forms</option>
              <option value="direct">Direct Deposit</option>
            </select>
            <div className="flex gap-2">
              <Button onClick={exportToCSVHandler} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button onClick={exportToExcelHandler} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Employee</th>
                  <th className="text-left p-3 font-medium">Document Type</th>
                  <th className="text-left p-3 font-medium">Document Name</th>
                  <th className="text-left p-3 font-medium">Upload Date</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Expiration</th>
                  <th className="text-left p-3 font-medium">Department</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{doc.employee_name}</div>
                        <div className="text-sm text-gray-500">{doc.employee_code}</div>
                      </div>
                    </td>
                    <td className="p-3">{doc.document_type}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        {doc.document_name}
                      </div>
                    </td>
                    <td className="p-3">{new Date(doc.upload_date).toLocaleDateString()}</td>
                    <td className="p-3">
                      <Badge className={getStatusColor(doc.document_status)}>
                        {doc.document_status}
                      </Badge>
                    </td>
                    <td className="p-3">
                      {doc.expiration_date ? new Date(doc.expiration_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-3">{doc.department}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          Download
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredDocuments.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-600">Try adjusting your filters to see more results.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import React, { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Upload, FileText, CheckCircle, AlertCircle, ArrowRight, Download, Table } from 'lucide-react'

interface FieldMapping {
  sourceField: string
  targetField: string
  required: boolean
  dataType: string
}

interface ImportStep {
  id: number
  title: string
  description: string
}

const IMPORT_STEPS: ImportStep[] = [
  { id: 1, title: 'Upload File', description: 'Upload your CSV or Excel file' },
  { id: 2, title: 'Map Fields', description: 'Map source fields to target fields' },
  { id: 3, title: 'Validate', description: 'Review and validate data' },
  { id: 4, title: 'Import', description: 'Import data into system' },
]

const TARGET_FIELDS: FieldMapping[] = [
  { sourceField: '', targetField: 'first_name', required: true, dataType: 'string' },
  { sourceField: '', targetField: 'last_name', required: true, dataType: 'string' },
  { sourceField: '', targetField: 'email', required: true, dataType: 'email' },
  { sourceField: '', targetField: 'phone', required: false, dataType: 'phone' },
  { sourceField: '', targetField: 'job_title', required: true, dataType: 'string' },
  { sourceField: '', targetField: 'department', required: false, dataType: 'string' },
  { sourceField: '', targetField: 'location', required: false, dataType: 'string' },
  { sourceField: '', targetField: 'hire_date', required: false, dataType: 'date' },
  { sourceField: '', targetField: 'salary', required: false, dataType: 'number' },
  { sourceField: '', targetField: 'status', required: true, dataType: 'enum' },
]

export default function TalentDataImport() {
  const [currentStep, setCurrentStep] = useState(1)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [sourceFields, setSourceFields] = useState<string[]>([])
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>(TARGET_FIELDS)
  const [validationResults, setValidationResults] = useState<any>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      
      // Simulate extracting column headers
      const mockHeaders = [
        'First Name',
        'Last Name',
        'Email Address',
        'Phone Number',
        'Position',
        'Dept',
        'Office Location',
        'Start Date',
        'Annual Salary',
        'Employment Status',
      ]
      setSourceFields(mockHeaders)
      setCurrentStep(2)
    }
  }

  const handleFieldMapping = (targetField: string, sourceField: string) => {
    setFieldMappings(prev =>
      prev.map(mapping =>
        mapping.targetField === targetField
          ? { ...mapping, sourceField }
          : mapping
      )
    )
  }

  const handleValidate = () => {
    // Simulate validation
    const results = {
      totalRecords: 1250,
      validRecords: 1180,
      invalidRecords: 70,
      errors: [
        { field: 'email', count: 45, message: 'Invalid email format' },
        { field: 'hire_date', count: 25, message: 'Invalid date format' },
      ],
      warnings: [
        { field: 'phone', count: 120, message: 'Missing phone number' },
        { field: 'department', count: 85, message: 'Missing department' },
      ],
    }
    setValidationResults(results)
    setCurrentStep(3)
  }

  const handleImport = () => {
    setCurrentStep(4)
    // Simulate import process
    setTimeout(() => {
      alert('Import completed successfully!')
    }, 2000)
  }

  const downloadTemplate = () => {
    alert('Downloading CSV template...')
  }

  const getMappingStatus = () => {
    const requiredMapped = fieldMappings.filter(m => m.required && m.sourceField).length
    const requiredTotal = fieldMappings.filter(m => m.required).length
    return { mapped: requiredMapped, total: requiredTotal }
  }

  const mappingStatus = getMappingStatus()
  const canProceed = mappingStatus.mapped === mappingStatus.total

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Talent Data Import</h1>
          <p className="text-gray-600 mt-2">Bulk import talent data with field mapping and validation</p>
        </div>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
        >
          <Download className="h-4 w-4" />
          Download Template
        </button>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {IMPORT_STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      currentStep > step.id
                        ? 'bg-green-500 text-white'
                        : currentStep === step.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {currentStep > step.id ? <CheckCircle className="h-5 w-5" /> : step.id}
                  </div>
                  <p className="text-sm font-medium mt-2 text-center">{step.title}</p>
                  <p className="text-xs text-gray-500 text-center">{step.description}</p>
                </div>
                {index < IMPORT_STEPS.length - 1 && (
                  <ArrowRight
                    className={`h-5 w-5 mx-2 ${
                      currentStep > step.id ? 'text-green-500' : 'text-gray-300'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Upload File */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Upload File</CardTitle>
            <CardDescription>Upload a CSV or Excel file containing talent data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Drop your file here or click to browse
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Supported formats: CSV, XLSX, XLS (Max 10MB)
              </p>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors"
              >
                <Upload className="h-4 w-4" />
                Select File
              </label>
            </div>

            {uploadedFile && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <FileText className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <p className="font-medium text-green-900">{uploadedFile.name}</p>
                  <p className="text-sm text-green-600">
                    {(uploadedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Map Fields */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Map Fields</CardTitle>
            <CardDescription>
              Map source fields from your file to target fields in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Required fields:</strong> {mappingStatus.mapped} of {mappingStatus.total} mapped
              </p>
            </div>

            <div className="space-y-3">
              {fieldMappings.map(mapping => (
                <div
                  key={mapping.targetField}
                  className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <label className="font-medium text-gray-900">
                        {mapping.targetField.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </label>
                      {mapping.required && (
                        <span className="text-xs text-red-600 font-medium">*Required</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">Type: {mapping.dataType}</p>
                  </div>

                  <ArrowRight className="h-5 w-5 text-gray-400" />

                  <div className="flex-1">
                    <select
                      value={mapping.sourceField}
                      onChange={(e) => handleFieldMapping(mapping.targetField, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Select Source Field --</option>
                      {sourceFields.map(field => (
                        <option key={field} value={field}>
                          {field}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleValidate}
                disabled={!canProceed}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  canProceed
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Validate Data
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Validate */}
      {currentStep === 3 && validationResults && (
        <Card>
          <CardHeader>
            <CardTitle>Validation Results</CardTitle>
            <CardDescription>Review validation results before importing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Total Records</p>
                <p className="text-2xl font-bold text-blue-900">{validationResults.totalRecords}</p>
              </div>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Valid Records</p>
                <p className="text-2xl font-bold text-green-900">{validationResults.validRecords}</p>
              </div>
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 font-medium">Invalid Records</p>
                <p className="text-2xl font-bold text-red-900">{validationResults.invalidRecords}</p>
              </div>
            </div>

            {validationResults.errors.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Errors
                </h3>
                <div className="space-y-2">
                  {validationResults.errors.map((error: any, index: number) => (
                    <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm font-medium text-red-900">
                        {error.field}: {error.message}
                      </p>
                      <p className="text-xs text-red-600">{error.count} records affected</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {validationResults.warnings.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Warnings
                </h3>
                <div className="space-y-2">
                  {validationResults.warnings.map((warning: any, index: number) => (
                    <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm font-medium text-yellow-900">
                        {warning.field}: {warning.message}
                      </p>
                      <p className="text-xs text-yellow-600">{warning.count} records affected</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Back to Mapping
              </button>
              <button
                onClick={handleImport}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Import {validationResults.validRecords} Valid Records
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Import */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Import in Progress</CardTitle>
            <CardDescription>Importing talent data into the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
              <p className="text-lg font-medium text-gray-900">Importing data...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </DashboardLayout>
  )
}

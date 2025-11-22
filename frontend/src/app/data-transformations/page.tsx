'use client'

import React, { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Wand2, Plus, Trash2, Eye, Save, Code, ArrowRight } from 'lucide-react'

interface Transformation {
  id: string
  type: string
  sourceField: string
  targetField: string
  config: any
}

const TRANSFORMATION_TYPES = [
  { value: 'rename', label: 'Rename Field', description: 'Change field name' },
  { value: 'uppercase', label: 'Uppercase', description: 'Convert to uppercase' },
  { value: 'lowercase', label: 'Lowercase', description: 'Convert to lowercase' },
  { value: 'trim', label: 'Trim Whitespace', description: 'Remove leading/trailing spaces' },
  { value: 'concat', label: 'Concatenate', description: 'Combine multiple fields' },
  { value: 'split', label: 'Split Field', description: 'Split field by delimiter' },
  { value: 'replace', label: 'Find & Replace', description: 'Replace text patterns' },
  { value: 'format_date', label: 'Format Date', description: 'Change date format' },
  { value: 'format_phone', label: 'Format Phone', description: 'Standardize phone numbers' },
  { value: 'calculate', label: 'Calculate', description: 'Perform calculations' },
  { value: 'conditional', label: 'Conditional', description: 'If-then-else logic' },
]

const SAMPLE_DATA = [
  {
    first_name: 'John',
    last_name: 'Doe',
    email: 'JOHN.DOE@EXAMPLE.COM',
    phone: '1234567890',
    hire_date: '2024-01-15',
    salary: '75000',
  },
  {
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'JANE.SMITH@EXAMPLE.COM',
    phone: '9876543210',
    hire_date: '2024-02-20',
    salary: '85000',
  },
]

export default function DataTransformations() {
  const [transformations, setTransformations] = useState<Transformation[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [newTransformation, setNewTransformation] = useState({
    type: '',
    sourceField: '',
    targetField: '',
    config: {},
  })
  const [showPreview, setShowPreview] = useState(false)

  const addTransformation = () => {
    if (!newTransformation.type || !newTransformation.sourceField) {
      alert('Please select transformation type and source field')
      return
    }

    const transformation: Transformation = {
      id: Date.now().toString(),
      type: newTransformation.type,
      sourceField: newTransformation.sourceField,
      targetField: newTransformation.targetField || newTransformation.sourceField,
      config: newTransformation.config,
    }

    setTransformations(prev => [...prev, transformation])
    setShowAddModal(false)
    setNewTransformation({ type: '', sourceField: '', targetField: '', config: {} })
  }

  const deleteTransformation = (id: string) => {
    setTransformations(prev => prev.filter(t => t.id !== id))
  }

  const applyTransformations = (data: any[]) => {
    return data.map(row => {
      const transformed = { ...row }
      
      transformations.forEach(t => {
        const value = transformed[t.sourceField]
        
        switch (t.type) {
          case 'uppercase':
            transformed[t.targetField] = value?.toUpperCase()
            break
          case 'lowercase':
            transformed[t.targetField] = value?.toLowerCase()
            break
          case 'trim':
            transformed[t.targetField] = value?.trim()
            break
          case 'format_phone':
            if (value) {
              const cleaned = value.replace(/\D/g, '')
              transformed[t.targetField] = `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6)}`
            }
            break
          case 'format_date':
            if (value) {
              const date = new Date(value)
              transformed[t.targetField] = date.toLocaleDateString('en-US')
            }
            break
          case 'concat':
            if (t.config.fields) {
              transformed[t.targetField] = t.config.fields
                .map((f: string) => transformed[f])
                .join(t.config.separator || ' ')
            }
            break
          default:
            transformed[t.targetField] = value
        }
      })
      
      return transformed
    })
  }

  const previewData = applyTransformations(SAMPLE_DATA)

  const getTransformationIcon = (type: string) => {
    return <Wand2 className="h-4 w-4" />
  }

  const getTransformationLabel = (type: string) => {
    return TRANSFORMATION_TYPES.find(t => t.value === type)?.label || type
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Transformations</h1>
          <p className="text-gray-600 mt-2">Build visual transformation pipelines for your data</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            <Eye className="h-4 w-4" />
            {showPreview ? 'Hide' : 'Show'} Preview
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Transformation
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transformations</CardTitle>
            <Wand2 className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transformations.length}</div>
            <p className="text-xs text-gray-500 mt-1">In pipeline</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Source Fields</CardTitle>
            <Code className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(transformations.map(t => t.sourceField)).size}
            </div>
            <p className="text-xs text-gray-500 mt-1">Unique fields</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Target Fields</CardTitle>
            <Code className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(transformations.map(t => t.targetField)).size}
            </div>
            <p className="text-xs text-gray-500 mt-1">Output fields</p>
          </CardContent>
        </Card>
      </div>

      {/* Transformation Pipeline */}
      <Card>
        <CardHeader>
          <CardTitle>Transformation Pipeline</CardTitle>
          <CardDescription>
            Transformations are applied in order from top to bottom
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transformations.length === 0 ? (
            <div className="text-center py-12">
              <Wand2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No transformations yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Click "Add Transformation" to get started
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transformations.map((transformation, index) => (
                <div
                  key={transformation.id}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-semibold text-sm">
                        {index + 1}
                      </div>
                      
                      <div className="flex items-center gap-2 flex-1">
                        {getTransformationIcon(transformation.type)}
                        <div>
                          <p className="font-semibold text-gray-900">
                            {getTransformationLabel(transformation.type)}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <code className="px-2 py-0.5 bg-gray-100 rounded">
                              {transformation.sourceField}
                            </code>
                            <ArrowRight className="h-3 w-3" />
                            <code className="px-2 py-0.5 bg-gray-100 rounded">
                              {transformation.targetField}
                            </code>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteTransformation(transformation.id)}
                      className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {transformations.length > 0 && (
            <div className="mt-6 flex justify-end">
              <button className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                <Save className="h-4 w-4" />
                Save Pipeline
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview */}
      {showPreview && (
        <Card>
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
            <CardDescription>See how transformations affect your data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Before */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Before Transformations</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {Object.keys(SAMPLE_DATA[0]).map(key => (
                          <th key={key} className="px-3 py-2 text-left font-medium text-gray-700">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {SAMPLE_DATA.map((row, i) => (
                        <tr key={i}>
                          {Object.values(row).map((value, j) => (
                            <td key={j} className="px-3 py-2 text-gray-600">
                              {value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* After */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">After Transformations</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-green-50">
                      <tr>
                        {Object.keys(previewData[0]).map(key => (
                          <th key={key} className="px-3 py-2 text-left font-medium text-green-700">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {previewData.map((row, i) => (
                        <tr key={i}>
                          {Object.values(row).map((value: any, j) => (
                            <td key={j} className="px-3 py-2 text-gray-600">
                              {value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Transformation Modal */}
      {showAddModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowAddModal(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 px-4">
            <Card>
              <CardHeader>
                <CardTitle>Add Transformation</CardTitle>
                <CardDescription>Configure a new data transformation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transformation Type
                  </label>
                  <select
                    value={newTransformation.type}
                    onChange={(e) => setNewTransformation({ ...newTransformation, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Select Type --</option>
                    {TRANSFORMATION_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label} - {type.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Source Field
                  </label>
                  <select
                    value={newTransformation.sourceField}
                    onChange={(e) => setNewTransformation({ ...newTransformation, sourceField: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Select Field --</option>
                    {Object.keys(SAMPLE_DATA[0]).map(field => (
                      <option key={field} value={field}>
                        {field}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Field (Optional)
                  </label>
                  <input
                    type="text"
                    value={newTransformation.targetField}
                    onChange={(e) => setNewTransformation({ ...newTransformation, targetField: e.target.value })}
                    placeholder="Leave empty to use source field"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addTransformation}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Add Transformation
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
      </div>
    </DashboardLayout>
  )
}

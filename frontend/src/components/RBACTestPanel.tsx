'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { usePermissions, FEATURES, PERMISSIONS } from '@/hooks/usePermissions'
import { useAuth } from '@/contexts/AuthContext'

interface TestResult {
  feature: string
  permission: string
  expected: boolean
  actual: boolean
  passed: boolean
}

export default function RBACTestPanel() {
  const { user, currentUserRole: role, currentTenantId } = useAuth()
  const { hasPermission, canAccessFeature, userPermissions } = usePermissions()
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  // Define test cases for each role
  const getTestCases = (userRole: string) => {
    const testCases = [
      // Host Admin Tests
      { feature: FEATURES.USER_MANAGEMENT, permission: PERMISSIONS.MANAGE, roles: ['host_admin'] },
      { feature: FEATURES.TENANT_MANAGEMENT, permission: PERMISSIONS.MANAGE, roles: ['host_admin'] },
      { feature: FEATURES.SYSTEM_SETTINGS, permission: PERMISSIONS.MANAGE, roles: ['host_admin'] },
      { feature: FEATURES.AUDIT_LOGS, permission: PERMISSIONS.VIEW, roles: ['host_admin'] },
      
      // Program Manager Tests
      { feature: FEATURES.PROJECT_MANAGEMENT, permission: PERMISSIONS.MANAGE, roles: ['host_admin', 'program_manager', 'client_admin'] },
      { feature: FEATURES.WORK_REQUESTS, permission: PERMISSIONS.MANAGE, roles: ['host_admin', 'program_manager', 'client_admin'] },
      { feature: FEATURES.RISK_MANAGEMENT, permission: PERMISSIONS.MANAGE, roles: ['host_admin', 'program_manager'] },
      { feature: FEATURES.RESOURCE_MANAGEMENT, permission: PERMISSIONS.MANAGE, roles: ['host_admin', 'program_manager'] },
      
      // Client Admin Tests
      { feature: FEATURES.BENEFITS_MANAGEMENT, permission: PERMISSIONS.MANAGE, roles: ['host_admin', 'client_admin'] },
      { feature: FEATURES.EMPLOYEE_RECORDS, permission: PERMISSIONS.MANAGE, roles: ['host_admin', 'client_admin'] },
      
      // Client User Tests
      { feature: FEATURES.WORK_REQUESTS, permission: PERMISSIONS.CREATE, roles: ['host_admin', 'program_manager', 'client_admin', 'client_user'] },
      { feature: FEATURES.WORK_REQUESTS, permission: PERMISSIONS.VIEW, roles: ['host_admin', 'program_manager', 'client_admin', 'client_user'] },
      { feature: FEATURES.PROJECT_MANAGEMENT, permission: PERMISSIONS.VIEW, roles: ['host_admin', 'program_manager', 'client_admin', 'client_user'] },
      
      // Reporting Tests
      { feature: FEATURES.REPORTING, permission: PERMISSIONS.VIEW, roles: ['host_admin', 'program_manager', 'client_admin', 'client_user'] },
      { feature: FEATURES.DASHBOARDS, permission: PERMISSIONS.VIEW, roles: ['host_admin', 'program_manager', 'client_admin', 'client_user'] },
      
      // Negative Tests (should fail for certain roles)
      { feature: FEATURES.USER_MANAGEMENT, permission: PERMISSIONS.MANAGE, roles: ['host_admin', 'client_admin'] },
      { feature: FEATURES.SYSTEM_SETTINGS, permission: PERMISSIONS.VIEW, roles: ['host_admin'] },
    ]

    return testCases.map((testCase: any) => ({
      ...testCase,
      expected: testCase.roles.includes(userRole)
    }))
  }

  const runRBACTests = async () => {
    if (!role) {
      alert('No user role found. Please ensure you are logged in.')
      return
    }

    setIsRunning(true)
    const testCases = getTestCases(role)
    const results: TestResult[] = []

    for (const testCase of testCases) {
      const actual = hasPermission(testCase.feature, testCase.permission)
      const passed = actual === testCase.expected

      results.push({
        feature: testCase.feature,
        permission: testCase.permission,
        expected: testCase.expected,
        actual,
        passed
      })

      // Small delay to make testing visible
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    setTestResults(results)
    setIsRunning(false)
  }

  const getResultColor = (passed: boolean) => {
    return passed ? 'text-green-600' : 'text-red-600'
  }

  const getResultIcon = (passed: boolean) => {
    return passed ? '✅' : '❌'
  }

  const passedTests = testResults.filter((r: any) => r.passed).length
  const totalTests = testResults.length
  const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔒 RBAC Testing Panel
          </CardTitle>
          <CardDescription>
            Test Role-Based Access Control permissions for the current user
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* User Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Current User Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Email:</span> {user?.email || 'Not available'}
              </div>
              <div>
                <span className="font-medium">Role:</span> 
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  {role || 'Not available'}
                </span>
              </div>
              <div>
                <span className="font-medium">Tenant ID:</span> {currentTenantId || 'Not available'}
              </div>
              <div>
                <span className="font-medium">Total Permissions:</span> {userPermissions?.length || 0}
              </div>
            </div>
          </div>

          {/* Test Controls */}
          <div className="flex items-center gap-4">
            <Button 
              onClick={runRBACTests}
              disabled={isRunning || !role}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Running Tests...
                </>
              ) : (
                <>
                  🧪 Run RBAC Tests
                </>
              )}
            </Button>
            
            {testResults.length > 0 && (
              <div className="text-sm">
                <span className={`font-semibold ${passRate === 100 ? 'text-green-600' : passRate >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {passedTests}/{totalTests} tests passed ({passRate}%)
                </span>
              </div>
            )}
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Test Results</h3>
              <div className="max-h-96 overflow-y-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="text-left p-2 border-b">Feature</th>
                      <th className="text-left p-2 border-b">Permission</th>
                      <th className="text-center p-2 border-b">Expected</th>
                      <th className="text-center p-2 border-b">Actual</th>
                      <th className="text-center p-2 border-b">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testResults.map((result, index: any) => (
                      <tr key={index} className={`border-b ${result.passed ? 'bg-green-50' : 'bg-red-50'}`}>
                        <td className="p-2 font-mono text-xs">{result.feature}</td>
                        <td className="p-2 font-mono text-xs">{result.permission}</td>
                        <td className="p-2 text-center">{result.expected ? '✅' : '❌'}</td>
                        <td className="p-2 text-center">{result.actual ? '✅' : '❌'}</td>
                        <td className={`p-2 text-center font-semibold ${getResultColor(result.passed)}`}>
                          {getResultIcon(result.passed)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Quick RBAC Checks</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">Can Manage Users:</span> 
                <span className={hasPermission(FEATURES.USER_MANAGEMENT, PERMISSIONS.MANAGE) ? 'text-green-600' : 'text-red-600'}>
                  {hasPermission(FEATURES.USER_MANAGEMENT, PERMISSIONS.MANAGE) ? ' Yes' : ' No'}
                </span>
              </div>
              <div>
                <span className="font-medium">Can Manage Projects:</span> 
                <span className={hasPermission(FEATURES.PROJECT_MANAGEMENT, PERMISSIONS.MANAGE) ? 'text-green-600' : 'text-red-600'}>
                  {hasPermission(FEATURES.PROJECT_MANAGEMENT, PERMISSIONS.MANAGE) ? ' Yes' : ' No'}
                </span>
              </div>
              <div>
                <span className="font-medium">Can View Reports:</span> 
                <span className={hasPermission(FEATURES.REPORTING, PERMISSIONS.VIEW) ? 'text-green-600' : 'text-red-600'}>
                  {hasPermission(FEATURES.REPORTING, PERMISSIONS.VIEW) ? ' Yes' : ' No'}
                </span>
              </div>
              <div>
                <span className="font-medium">Can Access System Settings:</span> 
                <span className={hasPermission(FEATURES.SYSTEM_SETTINGS, PERMISSIONS.MANAGE) ? 'text-green-600' : 'text-red-600'}>
                  {hasPermission(FEATURES.SYSTEM_SETTINGS, PERMISSIONS.MANAGE) ? ' Yes' : ' No'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


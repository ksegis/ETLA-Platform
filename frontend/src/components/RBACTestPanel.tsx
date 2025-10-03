"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuth } from "@/contexts/AuthContext";
import { PERMISSIONS, ROLES, ROLE_PERMISSIONS } from "@/lib/rbac";

interface TestResult {
  permission: string;
  expected: boolean;
  actual: boolean;
  passed: boolean;
}

export default function RBACTestPanel() {
  const { user, currentUserRole: role, currentTenantId } = useAuth();
  const { checkPermission } = usePermissions();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Define test cases based on the PERMISSIONS constant
  const allPermissions = Object.values(PERMISSIONS);

  const runRBACTests = async () => {
    if (!role) {
      alert("No user role found. Please ensure you are logged in.");
      return;
    }

    setIsRunning(true);
    const results: TestResult[] = [];

    for (const permission of allPermissions) {
      const expected = ROLE_PERMISSIONS[role]?.includes(permission) || false;
      const actual = checkPermission(permission);
      const passed = actual === expected;

      results.push({
        permission,
        expected,
        actual,
        passed,
      });

      // Small delay to make testing visible
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    setTestResults(results);
    setIsRunning(false);
  };

  const getResultColor = (passed: boolean) => {
    return passed ? "text-green-600" : "text-red-600";
  };

  const getResultIcon = (passed: boolean) => {
    return passed ? "✅" : "❌";
  };

  const passedTests = testResults.filter((r) => r.passed).length;
  const totalTests = testResults.length;
  const passRate =
    totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

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
                <span className="font-medium">Email:</span>{" "}
                {user?.email || "Not available"}
              </div>
              <div>
                <span className="font-medium">Role:</span>
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  {role || "Not available"}
                </span>
              </div>
              <div>
                <span className="font-medium">Tenant ID:</span>{" "}
                {currentTenantId || "Not available"}
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
                <>🧪 Run RBAC Tests</>
              )}
            </Button>

            {testResults.length > 0 && (
              <div className="text-sm">
                <span
                  className={`font-semibold ${passRate === 100 ? "text-green-600" : passRate >= 80 ? "text-yellow-600" : "text-red-600"}`}
                >
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
                      <th className="text-left p-2 border-b">Permission</th>
                      <th className="text-center p-2 border-b">Expected</th>
                      <th className="text-center p-2 border-b">Actual</th>
                      <th className="text-center p-2 border-b">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testResults.map((result, index) => (
                      <tr
                        key={index}
                        className={`border-b ${result.passed ? "bg-green-50" : "bg-red-50"}`}
                      >
                        <td className="p-2 font-mono text-xs">
                          {result.permission}
                        </td>
                        <td className="p-2 text-center">
                          {result.expected ? "✅" : "❌"}
                        </td>
                        <td className="p-2 text-center">
                          {result.actual ? "✅" : "❌"}
                        </td>
                        <td
                          className={`p-2 text-center font-semibold ${getResultColor(result.passed)}`}
                        >
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
                <span className="font-medium">Can Read Users:</span>
                <span
                  className={
                    checkPermission(PERMISSIONS.USER_READ)
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {checkPermission(PERMISSIONS.USER_READ)
                    ? " Yes"
                    : " No"}
                </span>
              </div>
              <div>
                <span className="font-medium">Can Create Projects:</span>
                <span
                  className={
                    checkPermission(PERMISSIONS.PROJECT_CREATE)
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {checkPermission(PERMISSIONS.PROJECT_CREATE)
                    ? " Yes"
                    : " No"}
                </span>
              </div>
              <div>
                <span className="font-medium">Can View Reports:</span>
                <span
                  className={
                    checkPermission(PERMISSIONS.REPORTING_VIEW)
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {checkPermission(PERMISSIONS.REPORTING_VIEW)
                    ? " Yes"
                    : " No"}
                </span>
              </div>
              <div>
                <span className="font-medium">Can Update Tenants:</span>
                <span
                  className={
                    checkPermission(PERMISSIONS.TENANT_UPDATE)
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {checkPermission(PERMISSIONS.TENANT_UPDATE)
                    ? " Yes"
                    : " No"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


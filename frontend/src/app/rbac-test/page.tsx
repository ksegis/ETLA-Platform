"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function RBACtestPage() {
  const { user, tenantUser, isAuthenticated, loading: authLoading } = useAuth();
  const { canManage, currentRole } = usePermissions();

  const features = [
    "tenant-management",
    "user-management",
    "timecard-correction",
    "payroll-processing",
    "report-generation",
    "settings-access",
  ];

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">RBAC Test Page</h1>
          <p className="text-gray-600">
            Loading authentication and permissions...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">RBAC Test Page</h1>
        <p className="text-gray-600">Verify user roles and permissions.</p>

        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <strong>Is Authenticated:</strong>{" "}
              {isAuthenticated ? "Yes" : "No"}
            </p>
            <p>
              <strong>Current User ID:</strong> {user?.id || "N/A"}
            </p>
            <p>
              <strong>Current User Email:</strong> {user?.email || "N/A"}
            </p>
            <p>
              <strong>Current Tenant User Role:</strong>{" "}
              {tenantUser?.role || "N/A"}
            </p>
            <p>
              <strong>Current User Role (from usePermissions):</strong>{" "}
              {currentRole || "N/A"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature Permissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {features.map((feature) => (
              <div key={feature} className="flex justify-between items-center">
                <span>{feature}:</span>
                <Badge variant={canManage(feature) ? "default" : "destructive"}>
                  {canManage(feature) ? "Allowed" : "Denied"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

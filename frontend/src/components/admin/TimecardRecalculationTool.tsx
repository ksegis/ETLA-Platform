'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Calculator, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Building,
  Calendar,
  RefreshCw,
  Info
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { timecardService } from '@/services/timecardService';

interface TimecardRecalculationToolProps {
  className?: string;
}

export default function TimecardRecalculationTool({ className = '' }: TimecardRecalculationToolProps) {
  const { user } = useAuth();
  const { selectedTenant: contextTenant } = useTenant();
  
  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tenants, setTenants] = useState<Array<{
    id: string;
    name: string;
    legal_name: string;
  }>>([]);

  // Form state
  const [selectedTenant, setSelectedTenant] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Check user permissions
  const isHostAdmin = user?.role === 'host_admin';
  const isTenantAdmin = user?.role === 'tenant_admin';
  const canRecalculate = isHostAdmin || isTenantAdmin;

  // Initialize dates to current week
  useEffect(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday

    setStartDate(startOfWeek.toISOString().split('T')[0]);
    setEndDate(endOfWeek.toISOString().split('T')[0]);
  }, []);

  // Set default tenant
  useEffect(() => {
    if (contextTenant && !isHostAdmin) {
      setSelectedTenant(contextTenant.id);
    }
  }, [contextTenant, isHostAdmin]);

  // Load tenants for host admin
  useEffect(() => {
    if (isHostAdmin) {
      loadTenants();
    }
  }, [isHostAdmin]);

  const loadTenants = async () => {
    try {
      const data = await timecardService.getTenants();
      setTenants(data);
    } catch (err) {
      console.error('Error loading tenants:', err);
      setError('Failed to load tenants');
    }
  };

  const handleRecalculate = async () => {
    if (!selectedTenant || !startDate || !endDate) {
      setError('Please fill in all required fields');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date must be before or equal to end date');
      return;
    }

    // Calculate date range (warn if more than 30 days)
    const daysDiff = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 30) {
      if (!confirm(`You are about to recalculate ${daysDiff} days of timecard data. This may take a while. Continue?`)) {
        return;
      }
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await timecardService.recalculateTimecardDailyRange(
        selectedTenant,
        startDate,
        endDate
      );
      
      const tenantName = tenants.find(t => t.id === selectedTenant)?.legal_name || 'Selected tenant';
      setSuccess(`Successfully recalculated timecard summaries for ${tenantName} from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to recalculate timecard summaries');
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  // Don't render if user doesn't have permission
  if (!canRecalculate) {
    return (
      <Card className={`border-yellow-200 bg-yellow-50 ${className}`}>
        <CardContent className="pt-6">
          <div className="flex items-center text-yellow-800">
            <AlertTriangle className="h-5 w-5 mr-2" />
            You do not have permission to access this tool. This utility is restricted to host administrators and tenant administrators.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Calculator className="h-6 w-6 mr-2 text-blue-600" />
          Timecard Summary Recalculation Tool
        </h2>
        <p className="text-gray-600 mt-1">
          Recalculate base timecard values for a specific date range. This will not affect manual corrections.
        </p>
      </div>

      {/* Information Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-blue-800 text-sm">
              <p className="font-medium mb-2">Important Information:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>This tool recalculates the base (non-corrected) values for timecard daily summaries</li>
                <li>Manual corrections and override values will NOT be affected</li>
                <li>The recalculation uses the latest business rules and time calculation logic</li>
                <li>Large date ranges may take several minutes to process</li>
                <li>This action cannot be undone - use with caution</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recalculation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <RefreshCw className="h-5 w-5 mr-2" />
            Recalculation Parameters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Tenant Selection (only for host_admin) */}
            {isHostAdmin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Building className="h-4 w-4 inline mr-1" />
                  Tenant <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedTenant}
                  onChange={(e) => {
                    setSelectedTenant(e.target.value);
                    clearMessages();
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loading}
                >
                  <option value="">Select tenant...</option>
                  {tenants.map(tenant => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.legal_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Start Date <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    clearMessages();
                  }}
                  className="w-full"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  End Date <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    clearMessages();
                  }}
                  className="w-full"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Date Range Info */}
            {startDate && endDate && (
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                <Clock className="h-4 w-4 inline mr-1" />
                Date range: {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} days
                {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) > 30 && (
                  <span className="text-yellow-600 ml-2">⚠️ Large date range - may take several minutes</span>
                )}
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
                <span className="text-red-800">{error}</span>
              </div>
            )}

            {/* Success Display */}
            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                <span className="text-green-800">{success}</span>
              </div>
            )}

            {/* Action Button */}
            <div className="flex justify-end pt-4">
              <Button
                onClick={handleRecalculate}
                disabled={loading || !selectedTenant || !startDate || !endDate}
                className="flex items-center"
                size="lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Recalculating...
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4 mr-2" />
                    Recalculate Timecard Daily Summaries
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Usage Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-700">
            <div>
              <strong>When to use this tool:</strong>
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li>After updating time calculation business rules</li>
                <li>When raw timecard data has been corrected or updated</li>
                <li>To fix calculation errors in historical data</li>
                <li>After system maintenance or data migration</li>
              </ul>
            </div>
            
            <div>
              <strong>What this tool does:</strong>
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li>Recalculates first_clock_in, last_clock_out, and hours totals</li>
                <li>Updates regular_hours, ot_hours, and dt_hours based on current rules</li>
                <li>Preserves all manual corrections and override values</li>
                <li>Updates the updated_at timestamp for affected records</li>
              </ul>
            </div>

            <div>
              <strong>Performance considerations:</strong>
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li>Small ranges (1-7 days): Usually completes in seconds</li>
                <li>Medium ranges (1-4 weeks): May take 1-2 minutes</li>
                <li>Large ranges (1+ months): Can take 5-10 minutes or more</li>
                <li>The tool will show progress and prevent timeout issues</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

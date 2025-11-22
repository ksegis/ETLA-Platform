'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { FEATURES, PERMISSIONS } from '@/rbac/constants';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Clock, Play, Pause, Calendar, Save, AlertCircle } from 'lucide-react';

interface Schedule {
  id: string;
  integration_config_id: string;
  endpoint_name: string;
  endpoint_display_name: string;
  sync_frequency: string;
  sync_schedule_cron: string | null;
  is_enabled: boolean;
  next_sync_at: string | null;
}

const SCHEDULE_TEMPLATES = [
  { label: 'Every 15 minutes', cron: '0 */15 * * * *', frequency: 'every_15min' },
  { label: 'Every 30 minutes', cron: '0 */30 * * * *', frequency: 'every_30min' },
  { label: 'Hourly', cron: '0 0 * * * *', frequency: 'hourly' },
  { label: 'Every 6 hours', cron: '0 0 */6 * * *', frequency: 'every_6h' },
  { label: 'Daily at midnight', cron: '0 0 0 * * *', frequency: 'daily' },
  { label: 'Daily at 9 AM', cron: '0 0 9 * * *', frequency: 'daily_9am' },
  { label: 'Weekly (Monday 9 AM)', cron: '0 0 9 * * 1', frequency: 'weekly' },
  { label: 'Monthly (1st at 9 AM)', cron: '0 0 9 1 * *', frequency: 'monthly' },
  { label: 'Manual only', cron: null, frequency: 'manual' },
];

export default function SchedulingPage() {
  const router = useRouter();
  const { user, tenant } = useAuth();
  const { canAccessFeature, hasPermission, isHostAdmin } = usePermissions();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Tenant selector for host admins
  const [availableTenants, setAvailableTenants] = useState<any[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');

  // Data
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);

  // Form state
  const [customCron, setCustomCron] = useState('');
  const [cronPreview, setCronPreview] = useState<string[]>([]);
  const [cronError, setCronError] = useState('');

  useEffect(() => {
    if (user && isHostAdmin()) {
      loadTenants();
    }
  }, [user]);

  useEffect(() => {
    const tenantId = isHostAdmin() ? selectedTenantId : tenant?.id;
    if (user && tenantId) {
      loadSchedules(tenantId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, tenant, selectedTenantId]);

  const loadTenants = async () => {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setAvailableTenants(data || []);
      
      if (data && data.length > 0 && !selectedTenantId) {
        setSelectedTenantId(data[0].id);
      }
    } catch (error) {
      console.error('Error loading tenants:', error);
    }
  };

  const loadSchedules = async (tenantId: string) => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('integration_sync_configs')
        .select(`
          id,
          integration_config_id,
          endpoint_name,
          endpoint_display_name,
          sync_frequency,
          sync_schedule_cron,
          is_enabled,
          next_sync_at
        `)
        .order('endpoint_name');

      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      console.error('Error loading schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyTemplate = (template: typeof SCHEDULE_TEMPLATES[0]) => {
    if (!selectedSchedule) return;

    setCustomCron(template.cron || '');
    updateSchedule(selectedSchedule.id, template.frequency, template.cron);
  };

  const updateSchedule = async (scheduleId: string, frequency: string, cron: string | null) => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from('integration_sync_configs')
        .update({
          sync_frequency: frequency,
          sync_schedule_cron: cron,
          next_sync_at: cron ? calculateNextRun(cron) : null
        })
        .eq('id', scheduleId);

      if (error) throw error;

      const tenantId = isHostAdmin() ? selectedTenantId : tenant!.id;
      await loadSchedules(tenantId);
    } catch (error) {
      console.error('Error updating schedule:', error);
      alert('Failed to update schedule');
    } finally {
      setSaving(false);
    }
  };

  const toggleSchedule = async (scheduleId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('integration_sync_configs')
        .update({ is_enabled: enabled })
        .eq('id', scheduleId);

      if (error) throw error;

      const tenantId = isHostAdmin() ? selectedTenantId : tenant!.id;
      await loadSchedules(tenantId);
    } catch (error) {
      console.error('Error toggling schedule:', error);
    }
  };

  const validateCron = (cron: string): boolean => {
    if (!cron) return false;
    
    // Basic 6-field cron validation (seconds minutes hours day month dayOfWeek)
    const parts = cron.trim().split(/\s+/);
    if (parts.length !== 6) {
      setCronError('Cron expression must have 6 fields (seconds minutes hours day month dayOfWeek)');
      return false;
    }

    setCronError('');
    return true;
  };

  const calculateNextRun = (cron: string | null): string | null => {
    if (!cron) return null;
    
    // Simplified next run calculation (in production, use a proper cron library)
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1); // Next minute
    return now.toISOString();
  };

  const previewCron = (cron: string) => {
    if (!validateCron(cron)) {
      setCronPreview([]);
      return;
    }

    // Generate next 5 run times (simplified - use proper cron library in production)
    const preview: string[] = [];
    const now = new Date();
    
    for (let i = 1; i <= 5; i++) {
      const nextRun = new Date(now);
      nextRun.setMinutes(now.getMinutes() + (i * 15)); // Simplified
      preview.push(nextRun.toLocaleString());
    }

    setCronPreview(preview);
  };

  const saveCustomCron = () => {
    if (!selectedSchedule || !customCron) return;

    if (!validateCron(customCron)) {
      alert('Invalid cron expression');
      return;
    }

    updateSchedule(selectedSchedule.id, 'custom', customCron);
  };

  const canWrite = hasPermission(FEATURES.INTEGRATIONS, PERMISSIONS.MANAGE);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Advanced Scheduling</h1>
              <p className="text-sm text-gray-600">Configure sync schedules with cron expressions</p>
            </div>
          </div>
          {isHostAdmin() && availableTenants.length > 0 && (
            <div className="flex items-center gap-2">
              <Label htmlFor="tenant-select" className="text-sm font-medium text-gray-700">Tenant:</Label>
              <select
                id="tenant-select"
                value={selectedTenantId}
                onChange={(e) => setSelectedTenantId(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableTenants.map((t: any) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Schedule List */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Sync Schedules</h3>
            <div className="space-y-3">
              {schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedSchedule?.id === schedule.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    setSelectedSchedule(schedule);
                    setCustomCron(schedule.sync_schedule_cron || '');
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{schedule.endpoint_display_name}</h4>
                    <Switch
                      checked={schedule.is_enabled}
                      onCheckedChange={(checked) => toggleSchedule(schedule.id, checked)}
                      disabled={!canWrite}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span className="capitalize">{schedule.sync_frequency.replace(/_/g, ' ')}</span>
                  </div>
                  {schedule.next_sync_at && (
                    <p className="text-xs text-gray-500 mt-1">
                      Next run: {new Date(schedule.next_sync_at).toLocaleString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Schedule Configuration */}
          {selectedSchedule && (
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {selectedSchedule.endpoint_display_name}
                </h3>
                <p className="text-sm text-gray-600">Configure sync schedule</p>
              </div>

              {/* Schedule Templates */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">Schedule Templates</Label>
                <div className="grid grid-cols-1 gap-2">
                  {SCHEDULE_TEMPLATES.map((template) => (
                    <button
                      key={template.frequency}
                      onClick={() => applyTemplate(template)}
                      disabled={!canWrite || saving}
                      className={`p-3 text-left border rounded-lg transition-colors ${
                        selectedSchedule.sync_frequency === template.frequency
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <div className="font-medium text-gray-900">{template.label}</div>
                      {template.cron && (
                        <div className="text-xs text-gray-500 font-mono mt-1">{template.cron}</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Cron */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Custom Cron Expression</Label>
                <div className="space-y-3">
                  <Input
                    type="text"
                    value={customCron}
                    onChange={(e) => {
                      setCustomCron(e.target.value);
                      previewCron(e.target.value);
                    }}
                    placeholder="0 0 * * * * (6 fields: sec min hr day mon dow)"
                    disabled={!canWrite}
                    className="font-mono text-sm"
                  />
                  
                  {cronError && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                      <p className="text-sm text-red-600">{cronError}</p>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 space-y-1">
                    <p className="font-medium">Format: seconds minutes hours day month dayOfWeek</p>
                    <p>Example: 0 0 9 * * 1-5 (Weekdays at 9:00 AM)</p>
                    <p>Wildcards: * (any), */n (every n), n-m (range), n,m (list)</p>
                  </div>

                  {cronPreview.length > 0 && (
                    <div className="p-3 bg-gray-50 border rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-2">Next 5 runs:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {cronPreview.map((time, index) => (
                          <li key={index}>• {time}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button
                    onClick={saveCustomCron}
                    disabled={!canWrite || saving || !customCron || !!cronError}
                    className="w-full"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Custom Schedule'}
                  </Button>
                </div>
              </div>

              {/* Current Status */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Status</span>
                  <span className={`text-sm font-medium ${selectedSchedule.is_enabled ? 'text-green-600' : 'text-gray-400'}`}>
                    {selectedSchedule.is_enabled ? 'Active' : 'Paused'}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Frequency</span>
                  <span className="text-sm text-gray-600 capitalize">
                    {selectedSchedule.sync_frequency.replace(/_/g, ' ')}
                  </span>
                </div>
                {selectedSchedule.next_sync_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Next Run</span>
                    <span className="text-sm text-gray-600">
                      {new Date(selectedSchedule.next_sync_at).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

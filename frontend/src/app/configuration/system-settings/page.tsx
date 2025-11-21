'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { FEATURES, PERMISSIONS } from '@/rbac/constants';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Settings, Mail, Bell, Flag, Save, RotateCcw } from 'lucide-react';

interface SystemSettings {
  email: {
    smtp_host: string;
    smtp_port: string;
    smtp_username: string;
    from_email: string;
    from_name: string;
  };
  notifications: {
    email_enabled: boolean;
    sync_notifications: boolean;
    error_notifications: boolean;
  };
  features: {
    auto_sync_enabled: boolean;
    field_mapping_enabled: boolean;
    audit_logging_enabled: boolean;
  };
}

const defaultSettings: SystemSettings = {
  email: {
    smtp_host: '',
    smtp_port: '587',
    smtp_username: '',
    from_email: '',
    from_name: 'HelixBridge',
  },
  notifications: {
    email_enabled: true,
    sync_notifications: true,
    error_notifications: true,
  },
  features: {
    auto_sync_enabled: false,
    field_mapping_enabled: true,
    audit_logging_enabled: true,
  },
};

export default function SystemSettingsPage() {
  const router = useRouter();
  const { user, tenantUser, loading: authLoading } = useAuth();
  const { checkPermission } = usePermissions();
  
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [configId, setConfigId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Permission check
  useEffect(() => {
    if (authLoading) return;
    
    if (!user || !tenantUser) {
      router.push('/login');
      return;
    }

    const hasAccess = checkPermission(FEATURES.SYSTEM_SETTINGS, PERMISSIONS.VIEW);
    if (!hasAccess) {
      router.push('/unauthorized');
      return;
    }

    loadSettings();
  }, [user, tenantUser, authLoading]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('integration_configs')
        .select('*')
        .eq('tenant_id', tenantUser?.tenant_id)
        .eq('integration_type', 'system_settings')
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (data) {
        setConfigId(data.id);
        const metadata = data.configuration_metadata || {};
        setSettings({
          email: metadata.email || defaultSettings.email,
          notifications: metadata.notifications || defaultSettings.notifications,
          features: metadata.features || defaultSettings.features,
        });
      } else {
        // Create default settings
        await createDefaultSettings();
      }
    } catch (err: any) {
      console.error('Error loading settings:', err);
      setError(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const createDefaultSettings = async () => {
    try {
      const { data, error: insertError } = await supabase
        .from('integration_configs')
        .insert({
          tenant_id: tenantUser?.tenant_id,
          integration_type: 'system_settings',
          integration_name: 'System Settings',
          environment: 'production',
          is_active: true,
          configuration_metadata: defaultSettings,
          created_by: user?.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      if (data) {
        setConfigId(data.id);
        setSettings(defaultSettings);
      }
    } catch (err: any) {
      console.error('Error creating default settings:', err);
      setError(err.message || 'Failed to create default settings');
    }
  };

  const saveSettings = async (category: keyof SystemSettings) => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const updatedMetadata = {
        ...settings,
      };

      const { error: updateError } = await supabase
        .from('integration_configs')
        .update({
          configuration_metadata: updatedMetadata,
          updated_at: new Date().toISOString(),
          updated_by: user?.id,
        })
        .eq('id', configId);

      if (updateError) throw updateError;

      setSuccess(`${category.charAt(0).toUpperCase() + category.slice(1)} settings saved successfully!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = (category: keyof SystemSettings) => {
    setSettings((prev) => ({
      ...prev,
      [category]: defaultSettings[category],
    }));
  };

  if (loading || authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading system settings...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="h-6 w-6 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
                <p className="text-sm text-gray-600">Configure platform-wide settings and preferences</p>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mx-6 mt-4 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
        {success && (
          <div className="mx-6 mt-4 rounded-md bg-green-50 p-4">
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Settings
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="features" className="flex items-center gap-2">
                <Flag className="h-4 w-4" />
                Feature Flags
              </TabsTrigger>
            </TabsList>

            {/* Email Settings Tab */}
            <TabsContent value="email" className="mt-6 space-y-6">
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="smtp_host">SMTP Host</Label>
                    <Input
                      id="smtp_host"
                      value={settings.email.smtp_host}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          email: { ...prev.email, smtp_host: e.target.value },
                        }))
                      }
                      placeholder="smtp.example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtp_port">SMTP Port</Label>
                    <Input
                      id="smtp_port"
                      value={settings.email.smtp_port}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          email: { ...prev.email, smtp_port: e.target.value },
                        }))
                      }
                      placeholder="587"
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtp_username">SMTP Username</Label>
                    <Input
                      id="smtp_username"
                      value={settings.email.smtp_username}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          email: { ...prev.email, smtp_username: e.target.value },
                        }))
                      }
                      placeholder="username@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="from_email">From Email</Label>
                    <Input
                      id="from_email"
                      type="email"
                      value={settings.email.from_email}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          email: { ...prev.email, from_email: e.target.value },
                        }))
                      }
                      placeholder="noreply@helixbridge.cloud"
                    />
                  </div>
                  <div>
                    <Label htmlFor="from_name">From Name</Label>
                    <Input
                      id="from_name"
                      value={settings.email.from_name}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          email: { ...prev.email, from_name: e.target.value },
                        }))
                      }
                      placeholder="HelixBridge"
                    />
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <Button onClick={() => saveSettings('email')} disabled={saving}>
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? 'Saving...' : 'Save Email Settings'}
                  </Button>
                  <Button variant="outline" onClick={() => resetSettings('email')}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset to Defaults
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="mt-6 space-y-6">
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email_enabled">Email Notifications</Label>
                      <p className="text-sm text-gray-500">Enable email notifications for system events</p>
                    </div>
                    <Switch
                      id="email_enabled"
                      checked={settings.notifications.email_enabled}
                      onCheckedChange={(checked) =>
                        setSettings((prev) => ({
                          ...prev,
                          notifications: { ...prev.notifications, email_enabled: checked },
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sync_notifications">Sync Notifications</Label>
                      <p className="text-sm text-gray-500">Notify when data synchronization completes</p>
                    </div>
                    <Switch
                      id="sync_notifications"
                      checked={settings.notifications.sync_notifications}
                      onCheckedChange={(checked) =>
                        setSettings((prev) => ({
                          ...prev,
                          notifications: { ...prev.notifications, sync_notifications: checked },
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="error_notifications">Error Notifications</Label>
                      <p className="text-sm text-gray-500">Notify when sync errors occur</p>
                    </div>
                    <Switch
                      id="error_notifications"
                      checked={settings.notifications.error_notifications}
                      onCheckedChange={(checked) =>
                        setSettings((prev) => ({
                          ...prev,
                          notifications: { ...prev.notifications, error_notifications: checked },
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <Button onClick={() => saveSettings('notifications')} disabled={saving}>
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? 'Saving...' : 'Save Notification Settings'}
                  </Button>
                  <Button variant="outline" onClick={() => resetSettings('notifications')}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset to Defaults
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Feature Flags Tab */}
            <TabsContent value="features" className="mt-6 space-y-6">
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Flags</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto_sync_enabled">Auto-Sync</Label>
                      <p className="text-sm text-gray-500">Enable automatic data synchronization</p>
                    </div>
                    <Switch
                      id="auto_sync_enabled"
                      checked={settings.features.auto_sync_enabled}
                      onCheckedChange={(checked) =>
                        setSettings((prev) => ({
                          ...prev,
                          features: { ...prev.features, auto_sync_enabled: checked },
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="field_mapping_enabled">Field Mapping</Label>
                      <p className="text-sm text-gray-500">Enable custom field mapping for integrations</p>
                    </div>
                    <Switch
                      id="field_mapping_enabled"
                      checked={settings.features.field_mapping_enabled}
                      onCheckedChange={(checked) =>
                        setSettings((prev) => ({
                          ...prev,
                          features: { ...prev.features, field_mapping_enabled: checked },
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="audit_logging_enabled">Audit Logging</Label>
                      <p className="text-sm text-gray-500">Enable detailed audit logging for compliance</p>
                    </div>
                    <Switch
                      id="audit_logging_enabled"
                      checked={settings.features.audit_logging_enabled}
                      onCheckedChange={(checked) =>
                        setSettings((prev) => ({
                          ...prev,
                          features: { ...prev.features, audit_logging_enabled: checked },
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <Button onClick={() => saveSettings('features')} disabled={saving}>
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? 'Saving...' : 'Save Feature Flags'}
                  </Button>
                  <Button variant="outline" onClick={() => resetSettings('features')}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset to Defaults
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}

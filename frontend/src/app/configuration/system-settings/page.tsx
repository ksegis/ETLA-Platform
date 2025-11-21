'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Settings,
  Mail,
  Bell,
  Flag,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FEATURES, PERMISSIONS } from '@/rbac/constants';

interface SystemSetting {
  id: string;
  category: string;
  key: string;
  value: string | boolean | number;
  description: string;
  is_sensitive: boolean;
  created_at: string;
  updated_at: string;
}

interface SettingsByCategory {
  [category: string]: SystemSetting[];
}

export default function SystemSettingsPage() {
  const router = useRouter();
  const { tenantUser, isAuthenticated, loading: authLoading } = useAuth();
  const { checkPermission, isLoading: permissionsLoading } = usePermissions();

  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [settingsByCategory, setSettingsByCategory] = useState<SettingsByCategory>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('email');

  // Check permissions
  useEffect(() => {
    if (authLoading || permissionsLoading) return;

    if (!isAuthenticated || !tenantUser) {
      router.push('/unauthorized');
      return;
    }

    const hasAccess = checkPermission(FEATURES.SYSTEM_SETTINGS, PERMISSIONS.VIEW);
    if (!hasAccess) {
      router.push('/unauthorized');
      return;
    }
  }, [isAuthenticated, tenantUser, authLoading, permissionsLoading, checkPermission, router]);

  // Load settings
  useEffect(() => {
    if (!isAuthenticated || !tenantUser) return;
    loadSettings();
  }, [isAuthenticated, tenantUser]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Query system settings - for now we'll create them if they don't exist
      const { data, error: fetchError } = await supabase
        .from('integration_configs')
        .select('*')
        .eq('tenant_id', tenantUser?.tenant_id)
        .eq('integration_type', 'system_settings');

      if (fetchError) throw fetchError;

      // If no settings exist, initialize default settings
      if (!data || data.length === 0) {
        await initializeDefaultSettings();
        return;
      }

      // Group settings by category
      const grouped: SettingsByCategory = {};
      data.forEach((setting: any) => {
        const category = setting.environment || 'general';
        if (!grouped[category]) {
          grouped[category] = [];
        }
        grouped[category].push({
          id: setting.id,
          category,
          key: setting.name || '',
          value: setting.config_data?.value || '',
          description: setting.description || '',
          is_sensitive: false,
          created_at: setting.created_at,
          updated_at: setting.updated_at,
        });
      });

      setSettings(data);
      setSettingsByCategory(grouped);
    } catch (err: any) {
      console.error('Error loading settings:', err);
      setError(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultSettings = async () => {
    try {
      const defaultSettings = [
        // Email Settings
        {
          tenant_id: tenantUser?.tenant_id,
          integration_type: 'system_settings',
          name: 'smtp_host',
          environment: 'email',
          description: 'SMTP server hostname',
          config_data: { value: '' },
          status: 'active',
        },
        {
          tenant_id: tenantUser?.tenant_id,
          integration_type: 'system_settings',
          name: 'smtp_port',
          environment: 'email',
          description: 'SMTP server port',
          config_data: { value: '587' },
          status: 'active',
        },
        {
          tenant_id: tenantUser?.tenant_id,
          integration_type: 'system_settings',
          name: 'smtp_username',
          environment: 'email',
          description: 'SMTP username',
          config_data: { value: '' },
          status: 'active',
        },
        {
          tenant_id: tenantUser?.tenant_id,
          integration_type: 'system_settings',
          name: 'from_email',
          environment: 'email',
          description: 'Default from email address',
          config_data: { value: '' },
          status: 'active',
        },
        {
          tenant_id: tenantUser?.tenant_id,
          integration_type: 'system_settings',
          name: 'from_name',
          environment: 'email',
          description: 'Default from name',
          config_data: { value: 'HelixBridge' },
          status: 'active',
        },
        // Notification Settings
        {
          tenant_id: tenantUser?.tenant_id,
          integration_type: 'system_settings',
          name: 'enable_email_notifications',
          environment: 'notifications',
          description: 'Enable email notifications',
          config_data: { value: true },
          status: 'active',
        },
        {
          tenant_id: tenantUser?.tenant_id,
          integration_type: 'system_settings',
          name: 'enable_sync_notifications',
          environment: 'notifications',
          description: 'Notify on sync completion',
          config_data: { value: true },
          status: 'active',
        },
        {
          tenant_id: tenantUser?.tenant_id,
          integration_type: 'system_settings',
          name: 'enable_error_notifications',
          environment: 'notifications',
          description: 'Notify on sync errors',
          config_data: { value: true },
          status: 'active',
        },
        // Feature Flags
        {
          tenant_id: tenantUser?.tenant_id,
          integration_type: 'system_settings',
          name: 'enable_auto_sync',
          environment: 'features',
          description: 'Enable automatic data synchronization',
          config_data: { value: false },
          status: 'active',
        },
        {
          tenant_id: tenantUser?.tenant_id,
          integration_type: 'system_settings',
          name: 'enable_field_mapping',
          environment: 'features',
          description: 'Enable custom field mapping',
          config_data: { value: true },
          status: 'active',
        },
        {
          tenant_id: tenantUser?.tenant_id,
          integration_type: 'system_settings',
          name: 'enable_audit_logging',
          environment: 'features',
          description: 'Enable detailed audit logging',
          config_data: { value: true },
          status: 'active',
        },
      ];

      const { error: insertError } = await supabase
        .from('integration_configs')
        .insert(defaultSettings);

      if (insertError) throw insertError;

      // Reload settings
      await loadSettings();
    } catch (err: any) {
      console.error('Error initializing settings:', err);
      setError(err.message || 'Failed to initialize settings');
    }
  };

  const handleSaveSettings = async (category: string) => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const categorySettings = settingsByCategory[category] || [];

      for (const setting of categorySettings) {
        const { error: updateError } = await supabase
          .from('integration_configs')
          .update({
            config_data: { value: setting.value },
            updated_at: new Date().toISOString(),
          })
          .eq('id', setting.id);

        if (updateError) throw updateError;
      }

      setSuccess(`${category.charAt(0).toUpperCase() + category.slice(1)} settings saved successfully`);
      
      // Reload settings to get updated data
      await loadSettings();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = (category: string, key: string, value: any) => {
    setSettingsByCategory((prev) => {
      const updated = { ...prev };
      if (updated[category]) {
        updated[category] = updated[category].map((setting) =>
          setting.key === key ? { ...setting, value } : setting
        );
      }
      return updated;
    });
  };

  const handleResetSettings = async (category: string) => {
    if (!confirm(`Are you sure you want to reset ${category} settings to defaults?`)) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Delete existing settings for this category
      const { error: deleteError } = await supabase
        .from('integration_configs')
        .delete()
        .eq('tenant_id', tenantUser?.tenant_id)
        .eq('integration_type', 'system_settings')
        .eq('environment', category);

      if (deleteError) throw deleteError;

      // Reinitialize
      await initializeDefaultSettings();

      setSuccess(`${category.charAt(0).toUpperCase() + category.slice(1)} settings reset to defaults`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error resetting settings:', err);
      setError(err.message || 'Failed to reset settings');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || permissionsLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex h-full items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
              <p className="mt-1 text-sm text-gray-500">
                Configure platform-wide settings and preferences
              </p>
            </div>
            <Settings className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-4 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 p-4 text-green-800">
              <CheckCircle2 className="h-5 w-5" />
              <span>{success}</span>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
            <TabsContent value="email" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Email Configuration</CardTitle>
                  <CardDescription>
                    Configure SMTP settings for sending emails from the platform
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {settingsByCategory.email?.map((setting) => (
                    <div key={setting.id} className="space-y-2">
                      <Label htmlFor={setting.key}>{setting.description}</Label>
                      {setting.key.includes('password') || setting.key.includes('secret') ? (
                        <Input
                          id={setting.key}
                          type="password"
                          value={setting.value as string}
                          onChange={(e) =>
                            handleSettingChange('email', setting.key, e.target.value)
                          }
                          placeholder={setting.description}
                        />
                      ) : (
                        <Input
                          id={setting.key}
                          type="text"
                          value={setting.value as string}
                          onChange={(e) =>
                            handleSettingChange('email', setting.key, e.target.value)
                          }
                          placeholder={setting.description}
                        />
                      )}
                      <p className="text-xs text-gray-500">{setting.description}</p>
                    </div>
                  ))}

                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={() => handleResetSettings('email')}
                      disabled={saving}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reset to Defaults
                    </Button>
                    <Button
                      onClick={() => handleSaveSettings('email')}
                      disabled={saving}
                    >
                      {saving ? (
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Save Email Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Control when and how you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {settingsByCategory.notifications?.map((setting) => (
                    <div
                      key={setting.id}
                      className="flex items-center justify-between space-x-2"
                    >
                      <div className="space-y-0.5">
                        <Label htmlFor={setting.key}>{setting.description}</Label>
                        <p className="text-xs text-gray-500">{setting.description}</p>
                      </div>
                      <Switch
                        id={setting.key}
                        checked={setting.value as boolean}
                        onCheckedChange={(checked) =>
                          handleSettingChange('notifications', setting.key, checked)
                        }
                      />
                    </div>
                  ))}

                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={() => handleResetSettings('notifications')}
                      disabled={saving}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reset to Defaults
                    </Button>
                    <Button
                      onClick={() => handleSaveSettings('notifications')}
                      disabled={saving}
                    >
                      {saving ? (
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Save Notification Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Feature Flags Tab */}
            <TabsContent value="features" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Feature Flags</CardTitle>
                  <CardDescription>
                    Enable or disable platform features
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {settingsByCategory.features?.map((setting) => (
                    <div
                      key={setting.id}
                      className="flex items-center justify-between space-x-2"
                    >
                      <div className="space-y-0.5">
                        <Label htmlFor={setting.key}>{setting.description}</Label>
                        <p className="text-xs text-gray-500">{setting.description}</p>
                      </div>
                      <Switch
                        id={setting.key}
                        checked={setting.value as boolean}
                        onCheckedChange={(checked) =>
                          handleSettingChange('features', setting.key, checked)
                        }
                      />
                    </div>
                  ))}

                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={() => handleResetSettings('features')}
                      disabled={saving}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reset to Defaults
                    </Button>
                    <Button
                      onClick={() => handleSaveSettings('features')}
                      disabled={saving}
                    >
                      {saving ? (
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Save Feature Flags
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}

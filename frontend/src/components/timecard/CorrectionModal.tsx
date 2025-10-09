'use client';

import React, { useState, useEffect } from 'react';
import { X, Clock, AlertCircle, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { timecardService, TimecardDailyRecord, CorrectionData } from '@/services/timecardService';

interface CorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  employeeRef: string;
  employeeName: string;
  workDate: string;
  onSave: () => void;
  currentUserId: string;
}

export default function CorrectionModal({
  isOpen,
  onClose,
  tenantId,
  employeeRef,
  employeeName,
  workDate,
  onSave,
  currentUserId
}: CorrectionModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [record, setRecord] = useState<TimecardDailyRecord | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<CorrectionData>({
    override_first_clock_in: null,
    override_last_clock_out: null,
    override_total_hours: null,
    override_regular_hours: null,
    override_ot_hours: null,
    override_dt_hours: null,
    correction_reason: ''
  });

  // Load the current record when modal opens
  useEffect(() => {
    if (isOpen && tenantId && employeeRef && workDate) {
      loadRecord();
    }
  }, [isOpen, tenantId, employeeRef, workDate]);

  const loadRecord = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await timecardService.getDailyRecord(tenantId, employeeRef, workDate);
      if (data) {
        setRecord(data);
        // Pre-fill form with existing override values
        setFormData({
          override_first_clock_in: data.override_first_clock_in || null,
          override_last_clock_out: data.override_last_clock_out || null,
          override_total_hours: data.override_total_hours || null,
          override_regular_hours: data.override_regular_hours || null,
          override_ot_hours: data.override_ot_hours || null,
          override_dt_hours: data.override_dt_hours || null,
          correction_reason: ''
        });
      } else {
        setError('Timecard record not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load record');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CorrectionData, value: string | number | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTimeChange = (field: 'override_first_clock_in' | 'override_last_clock_out', value: string) => {
    // Convert time input to HH:MM format
    const timeValue = value ? value : null;
    handleInputChange(field, timeValue);
  };

  const handleNumberChange = (field: keyof CorrectionData, value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    handleInputChange(field, numValue);
  };

  const formatTime = (timeString: string | null | undefined): string => {
    if (!timeString) return '';
    // Handle both HH:MM and HH:MM:SS formats
    return timeString.substring(0, 5);
  };

  const formatHours = (hours: number | null | undefined): string => {
    return hours !== null && hours !== undefined ? hours.toFixed(2) : '';
  };

  const handleSave = async () => {
    if (!formData.correction_reason.trim()) {
      setError('Correction reason is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await timecardService.correctDailySummary(
        tenantId,
        employeeRef,
        workDate,
        formData,
        currentUserId
      );
      
      onSave();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save correction');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setFormData({
      override_first_clock_in: null,
      override_last_clock_out: null,
      override_total_hours: null,
      override_regular_hours: null,
      override_ot_hours: null,
      override_dt_hours: null,
      correction_reason: ''
    });
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-full overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-600" />
              Correct Timecard Entry
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {employeeName} • {new Date(workDate).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          )}

          {record && !loading && (
            <div className="space-y-6">
              {/* Current Values Display */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Current Calculated Values</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">First Clock In</label>
                      <div className="text-lg font-semibold text-gray-900">
                        {formatTime(record.first_clock_in) || '--:--'}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Last Clock Out</label>
                      <div className="text-lg font-semibold text-gray-900">
                        {formatTime(record.last_clock_out) || '--:--'}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Total Hours</label>
                      <div className="text-lg font-semibold text-gray-900">
                        {formatHours(record.total_hours)}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Regular Hours</label>
                      <div className="text-lg font-semibold text-gray-900">
                        {formatHours(record.regular_hours)}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Overtime Hours</label>
                      <div className="text-lg font-semibold text-gray-900">
                        {formatHours(record.ot_hours)}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Double Time Hours</label>
                      <div className="text-lg font-semibold text-gray-900">
                        {formatHours(record.dt_hours)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Override Values Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Override Values</CardTitle>
                  <p className="text-sm text-gray-600">
                    Leave fields empty to use calculated values. Enter values to override.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Time Fields */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Time Overrides</h4>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Override First Clock In
                        </label>
                        <Input
                          type="time"
                          value={formatTime(formData.override_first_clock_in)}
                          onChange={(e) => handleTimeChange('override_first_clock_in', e.target.value)}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Override Last Clock Out
                        </label>
                        <Input
                          type="time"
                          value={formatTime(formData.override_last_clock_out)}
                          onChange={(e) => handleTimeChange('override_last_clock_out', e.target.value)}
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Hours Fields */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Hours Overrides</h4>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Override Total Hours
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="24"
                          value={formatHours(formData.override_total_hours)}
                          onChange={(e) => handleNumberChange('override_total_hours', e.target.value)}
                          placeholder="0.00"
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Override Regular Hours
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="24"
                          value={formatHours(formData.override_regular_hours)}
                          onChange={(e) => handleNumberChange('override_regular_hours', e.target.value)}
                          placeholder="0.00"
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Override Overtime Hours
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="24"
                          value={formatHours(formData.override_ot_hours)}
                          onChange={(e) => handleNumberChange('override_ot_hours', e.target.value)}
                          placeholder="0.00"
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Override Double Time Hours
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="24"
                          value={formatHours(formData.override_dt_hours)}
                          onChange={(e) => handleNumberChange('override_dt_hours', e.target.value)}
                          placeholder="0.00"
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Correction Reason */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Correction Reason <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.correction_reason}
                      onChange={(e) => handleInputChange('correction_reason', e.target.value)}
                      placeholder="Please provide a reason for this correction..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Previous Corrections */}
              {(record.corrected_by || record.corrected_at) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Previous Correction</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4">
                      <Badge variant="secondary">Corrected</Badge>
                      <span className="text-sm text-gray-600">
                        Corrected by {record.corrected_by} on{' '}
                        {record.corrected_at ? new Date(record.corrected_at).toLocaleString() : 'Unknown'}
                      </span>
                    </div>
                    {record.correction_reason && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-700">
                          <strong>Reason:</strong> {record.correction_reason}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !formData.correction_reason.trim()}
            className="flex items-center"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Correction
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

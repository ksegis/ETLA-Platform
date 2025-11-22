'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Clock, Calendar, Play, Pause, Edit, Trash2, Plus, CheckCircle } from 'lucide-react'

interface Schedule {
  id: string
  name: string
  jobType: string
  cronExpression: string
  humanReadable: string
  enabled: boolean
  lastRun?: Date
  nextRun: Date
  status: 'active' | 'paused' | 'error'
}

const CRON_PRESETS = [
  { label: 'Every minute', value: '* * * * *' },
  { label: 'Every 5 minutes', value: '*/5 * * * *' },
  { label: 'Every 15 minutes', value: '*/15 * * * *' },
  { label: 'Every 30 minutes', value: '*/30 * * * *' },
  { label: 'Every hour', value: '0 * * * *' },
  { label: 'Every day at midnight', value: '0 0 * * *' },
  { label: 'Every day at 6 AM', value: '0 6 * * *' },
  { label: 'Every Monday at 9 AM', value: '0 9 * * 1' },
  { label: 'Every weekday at 9 AM', value: '0 9 * * 1-5' },
  { label: 'First day of month at midnight', value: '0 0 1 * *' },
]

const JOB_TYPES = [
  'Talent Data Import',
  'Employee Data Sync',
  'Job Postings Update',
  'Benefits Data Migration',
  'Payroll Data Validation',
  'Performance Review Sync',
  'Attendance Data Import',
]

export default function ETLScheduling() {
  const [schedules, setSchedules] = useState<Schedule[]>([
    {
      id: '1',
      name: 'Daily Talent Sync',
      jobType: 'Talent Data Import',
      cronExpression: '0 2 * * *',
      humanReadable: 'Every day at 2:00 AM',
      enabled: true,
      lastRun: new Date(Date.now() - 6 * 60 * 60 * 1000),
      nextRun: new Date(Date.now() + 18 * 60 * 60 * 1000),
      status: 'active',
    },
    {
      id: '2',
      name: 'Hourly Employee Sync',
      jobType: 'Employee Data Sync',
      cronExpression: '0 * * * *',
      humanReadable: 'Every hour',
      enabled: true,
      lastRun: new Date(Date.now() - 30 * 60 * 1000),
      nextRun: new Date(Date.now() + 30 * 60 * 1000),
      status: 'active',
    },
    {
      id: '3',
      name: 'Weekly Benefits Update',
      jobType: 'Benefits Data Migration',
      cronExpression: '0 9 * * 1',
      humanReadable: 'Every Monday at 9:00 AM',
      enabled: false,
      nextRun: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      status: 'paused',
    },
  ])

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newSchedule, setNewSchedule] = useState({
    name: '',
    jobType: '',
    cronExpression: '',
  })

  const toggleSchedule = (id: string) => {
    setSchedules(prev =>
      prev.map(schedule =>
        schedule.id === id
          ? { ...schedule, enabled: !schedule.enabled, status: !schedule.enabled ? 'active' : 'paused' }
          : schedule
      )
    )
  }

  const deleteSchedule = (id: string) => {
    if (confirm('Are you sure you want to delete this schedule?')) {
      setSchedules(prev => prev.filter(schedule => schedule.id !== id))
    }
  }

  const parseCronToHuman = (cron: string): string => {
    const preset = CRON_PRESETS.find(p => p.value === cron)
    if (preset) return preset.label
    return cron
  }

  const handleCreateSchedule = () => {
    if (!newSchedule.name || !newSchedule.jobType || !newSchedule.cronExpression) {
      alert('Please fill in all fields')
      return
    }

    const schedule: Schedule = {
      id: Date.now().toString(),
      name: newSchedule.name,
      jobType: newSchedule.jobType,
      cronExpression: newSchedule.cronExpression,
      humanReadable: parseCronToHuman(newSchedule.cronExpression),
      enabled: true,
      nextRun: new Date(Date.now() + 60 * 60 * 1000),
      status: 'active',
    }

    setSchedules(prev => [...prev, schedule])
    setShowCreateModal(false)
    setNewSchedule({ name: '', jobType: '', cronExpression: '' })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status: Schedule['status']) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      paused: 'bg-gray-100 text-gray-800',
      error: 'bg-red-100 text-red-800',
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ETL Scheduling</h1>
          <p className="text-gray-600 mt-2">Manage automated ETL job schedules with cron expressions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Schedule
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Schedules</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schedules.length}</div>
            <p className="text-xs text-gray-500 mt-1">Active and paused</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Schedules</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {schedules.filter(s => s.enabled).length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paused Schedules</CardTitle>
            <Pause className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {schedules.filter(s => !s.enabled).length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Temporarily disabled</p>
          </CardContent>
        </Card>
      </div>

      {/* Schedules List */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Jobs</CardTitle>
          <CardDescription>View and manage your ETL job schedules</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {schedules.map(schedule => (
              <div
                key={schedule.id}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{schedule.name}</h3>
                      {getStatusBadge(schedule.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{schedule.jobType}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Schedule
                        </p>
                        <p className="font-medium text-gray-900">{schedule.humanReadable}</p>
                        <p className="text-xs text-gray-400 font-mono">{schedule.cronExpression}</p>
                      </div>
                      {schedule.lastRun && (
                        <div>
                          <p className="text-gray-500">Last Run</p>
                          <p className="font-medium text-gray-900">{formatDate(schedule.lastRun)}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-gray-500">Next Run</p>
                        <p className="font-medium text-gray-900">{formatDate(schedule.nextRun)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => toggleSchedule(schedule.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        schedule.enabled
                          ? 'bg-green-100 text-green-600 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={schedule.enabled ? 'Pause' : 'Resume'}
                    >
                      {schedule.enabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </button>
                    <button
                      className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteSchedule(schedule.id)}
                      className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Schedule Modal */}
      {showCreateModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 px-4">
            <Card>
              <CardHeader>
                <CardTitle>Create New Schedule</CardTitle>
                <CardDescription>Set up a new automated ETL job schedule</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Schedule Name
                  </label>
                  <input
                    type="text"
                    value={newSchedule.name}
                    onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
                    placeholder="e.g., Daily Talent Sync"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Type
                  </label>
                  <select
                    value={newSchedule.jobType}
                    onChange={(e) => setNewSchedule({ ...newSchedule, jobType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Select Job Type --</option>
                    {JOB_TYPES.map(type => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Schedule (Cron Expression)
                  </label>
                  <select
                    value={newSchedule.cronExpression}
                    onChange={(e) => setNewSchedule({ ...newSchedule, cronExpression: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Select Schedule --</option>
                    {CRON_PRESETS.map(preset => (
                      <option key={preset.value} value={preset.value}>
                        {preset.label} ({preset.value})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateSchedule}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Create Schedule
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

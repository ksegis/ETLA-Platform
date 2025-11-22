'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Activity, CheckCircle, XCircle, Clock, TrendingUp, Database, Zap, AlertTriangle } from 'lucide-react'

interface ETLJob {
  id: string
  name: string
  status: 'running' | 'completed' | 'failed' | 'pending'
  progress: number
  recordsProcessed: number
  totalRecords: number
  startTime: Date
  endTime?: Date
  duration?: number
  throughput: number
  errors: number
}

export default function ETLProgressMonitor() {
  const [jobs, setJobs] = useState<ETLJob[]>([])
  const [stats, setStats] = useState({
    totalJobs: 0,
    runningJobs: 0,
    completedJobs: 0,
    failedJobs: 0,
    totalRecords: 0,
    avgThroughput: 0,
  })

  // Simulate real-time job updates
  useEffect(() => {
    // Initialize with mock data
    const mockJobs: ETLJob[] = [
      {
        id: '1',
        name: 'Talent Data Import - Q4 2024',
        status: 'running',
        progress: 67,
        recordsProcessed: 6700,
        totalRecords: 10000,
        startTime: new Date(Date.now() - 5 * 60 * 1000),
        throughput: 22.3,
        errors: 0,
      },
      {
        id: '2',
        name: 'Employee Data Sync',
        status: 'completed',
        progress: 100,
        recordsProcessed: 5000,
        totalRecords: 5000,
        startTime: new Date(Date.now() - 15 * 60 * 1000),
        endTime: new Date(Date.now() - 5 * 60 * 1000),
        duration: 600,
        throughput: 8.3,
        errors: 0,
      },
      {
        id: '3',
        name: 'Job Postings Update',
        status: 'running',
        progress: 34,
        recordsProcessed: 340,
        totalRecords: 1000,
        startTime: new Date(Date.now() - 2 * 60 * 1000),
        throughput: 2.8,
        errors: 0,
      },
      {
        id: '4',
        name: 'Benefits Data Migration',
        status: 'failed',
        progress: 45,
        recordsProcessed: 2250,
        totalRecords: 5000,
        startTime: new Date(Date.now() - 30 * 60 * 1000),
        endTime: new Date(Date.now() - 20 * 60 * 1000),
        duration: 600,
        throughput: 3.75,
        errors: 127,
      },
      {
        id: '5',
        name: 'Payroll Data Validation',
        status: 'pending',
        progress: 0,
        recordsProcessed: 0,
        totalRecords: 3000,
        startTime: new Date(),
        throughput: 0,
        errors: 0,
      },
    ]

    setJobs(mockJobs)

    // Calculate stats
    const newStats = {
      totalJobs: mockJobs.length,
      runningJobs: mockJobs.filter(j => j.status === 'running').length,
      completedJobs: mockJobs.filter(j => j.status === 'completed').length,
      failedJobs: mockJobs.filter(j => j.status === 'failed').length,
      totalRecords: mockJobs.reduce((sum, j) => sum + j.recordsProcessed, 0),
      avgThroughput: mockJobs.reduce((sum, j) => sum + j.throughput, 0) / mockJobs.length,
    }
    setStats(newStats)

    // Simulate progress updates for running jobs
    const interval = setInterval(() => {
      setJobs(prevJobs =>
        prevJobs.map(job => {
          if (job.status === 'running' && job.progress < 100) {
            const newProgress = Math.min(job.progress + Math.random() * 5, 100)
            const newRecordsProcessed = Math.floor((newProgress / 100) * job.totalRecords)
            return {
              ...job,
              progress: newProgress,
              recordsProcessed: newRecordsProcessed,
              throughput: newRecordsProcessed / ((Date.now() - job.startTime.getTime()) / 1000 / 60),
            }
          }
          return job
        })
      )
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const getStatusIcon = (status: ETLJob['status']) => {
    switch (status) {
      case 'running':
        return <Activity className="h-5 w-5 text-blue-500 animate-pulse" />
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'pending':
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: ETLJob['status']) => {
    const styles = {
      running: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      pending: 'bg-gray-100 text-gray-800',
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">ETL Progress Monitor</h1>
        <p className="text-gray-600 mt-2">Real-time monitoring of ETL jobs and data processing</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Database className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJobs}</div>
            <p className="text-xs text-gray-500 mt-1">Active and completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Running Jobs</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.runningJobs}</div>
            <p className="text-xs text-gray-500 mt-1">Currently processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Records Processed</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalRecords.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Total records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Throughput</CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.avgThroughput.toFixed(1)}</div>
            <p className="text-xs text-gray-500 mt-1">Records/min</p>
          </CardContent>
        </Card>
      </div>

      {/* Jobs List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Jobs</CardTitle>
          <CardDescription>Monitor the progress of your ETL jobs in real-time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {jobs.map(job => (
              <div
                key={job.id}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                {/* Job Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(job.status)}
                    <div>
                      <h3 className="font-semibold text-gray-900">{job.name}</h3>
                      <p className="text-sm text-gray-500">
                        Started at {formatTime(job.startTime)}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(job.status)}
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm font-medium text-gray-700">{job.progress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        job.status === 'completed'
                          ? 'bg-green-500'
                          : job.status === 'failed'
                          ? 'bg-red-500'
                          : job.status === 'running'
                          ? 'bg-blue-500'
                          : 'bg-gray-400'
                      }`}
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>
                </div>

                {/* Job Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Records</p>
                    <p className="font-semibold text-gray-900">
                      {job.recordsProcessed.toLocaleString()} / {job.totalRecords.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Throughput</p>
                    <p className="font-semibold text-gray-900">{job.throughput.toFixed(1)} rec/min</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Duration</p>
                    <p className="font-semibold text-gray-900">{formatDuration(job.duration)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Errors</p>
                    <p className={`font-semibold ${job.errors > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                      {job.errors > 0 && <AlertTriangle className="inline h-4 w-4 mr-1" />}
                      {job.errors}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  )
}

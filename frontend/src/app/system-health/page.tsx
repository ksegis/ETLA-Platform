'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Activity, CheckCircle, XCircle, AlertTriangle, Database, Server, Zap, Clock, TrendingUp, TrendingDown } from 'lucide-react'

interface ServiceStatus {
  name: string
  status: 'healthy' | 'degraded' | 'down'
  responseTime: number
  uptime: number
  lastCheck: Date
  message?: string
}

interface SystemMetric {
  name: string
  value: number
  unit: string
  status: 'good' | 'warning' | 'critical'
  threshold: number
  trend: 'up' | 'down' | 'stable'
}

export default function SystemHealth() {
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: 'Database (Supabase)',
      status: 'healthy',
      responseTime: 45,
      uptime: 99.98,
      lastCheck: new Date(),
    },
    {
      name: 'API Server',
      status: 'healthy',
      responseTime: 120,
      uptime: 99.95,
      lastCheck: new Date(),
    },
    {
      name: 'ETL Pipeline',
      status: 'healthy',
      responseTime: 230,
      uptime: 99.87,
      lastCheck: new Date(),
    },
    {
      name: 'File Storage (S3)',
      status: 'healthy',
      responseTime: 180,
      uptime: 99.99,
      lastCheck: new Date(),
    },
    {
      name: 'Authentication Service',
      status: 'healthy',
      responseTime: 95,
      uptime: 99.92,
      lastCheck: new Date(),
    },
    {
      name: 'Email Service',
      status: 'degraded',
      responseTime: 450,
      uptime: 98.5,
      lastCheck: new Date(),
      message: 'High latency detected',
    },
  ])

  const [metrics, setMetrics] = useState<SystemMetric[]>([
    {
      name: 'CPU Usage',
      value: 45,
      unit: '%',
      status: 'good',
      threshold: 80,
      trend: 'stable',
    },
    {
      name: 'Memory Usage',
      value: 62,
      unit: '%',
      status: 'good',
      threshold: 85,
      trend: 'up',
    },
    {
      name: 'Disk Usage',
      value: 73,
      unit: '%',
      status: 'warning',
      threshold: 80,
      trend: 'up',
    },
    {
      name: 'Network I/O',
      value: 125,
      unit: 'Mbps',
      status: 'good',
      threshold: 500,
      trend: 'stable',
    },
    {
      name: 'Active Connections',
      value: 342,
      unit: 'connections',
      status: 'good',
      threshold: 1000,
      trend: 'down',
    },
    {
      name: 'Request Rate',
      value: 1250,
      unit: 'req/min',
      status: 'good',
      threshold: 5000,
      trend: 'stable',
    },
  ])

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setServices(prev =>
        prev.map(service => ({
          ...service,
          responseTime: service.responseTime + (Math.random() - 0.5) * 20,
          lastCheck: new Date(),
        }))
      )

      setMetrics(prev =>
        prev.map(metric => ({
          ...metric,
          value: Math.max(0, metric.value + (Math.random() - 0.5) * 5),
        }))
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'down':
        return <XCircle className="h-5 w-5 text-red-500" />
    }
  }

  const getStatusBadge = (status: ServiceStatus['status']) => {
    const styles = {
      healthy: 'bg-green-100 text-green-800',
      degraded: 'bg-yellow-100 text-yellow-800',
      down: 'bg-red-100 text-red-800',
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getMetricStatusColor = (status: SystemMetric['status']) => {
    switch (status) {
      case 'good':
        return 'text-green-600'
      case 'warning':
        return 'text-yellow-600'
      case 'critical':
        return 'text-red-600'
    }
  }

  const getTrendIcon = (trend: SystemMetric['trend']) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-red-500" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-green-500" />
      case 'stable':
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const overallHealth = services.filter(s => s.status === 'healthy').length / services.length * 100
  const healthyCount = services.filter(s => s.status === 'healthy').length
  const degradedCount = services.filter(s => s.status === 'degraded').length
  const downCount = services.filter(s => s.status === 'down').length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Health</h1>
        <p className="text-gray-600 mt-2">Monitor the health and performance of all system components</p>
      </div>

      {/* Overall Health */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overall System Health</p>
              <div className="flex items-center gap-3 mt-2">
                <div className="text-4xl font-bold text-gray-900">{overallHealth.toFixed(1)}%</div>
                {overallHealth >= 95 ? (
                  <CheckCircle className="h-8 w-8 text-green-500" />
                ) : overallHealth >= 80 ? (
                  <AlertTriangle className="h-8 w-8 text-yellow-500" />
                ) : (
                  <XCircle className="h-8 w-8 text-red-500" />
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">{healthyCount}</p>
                <p className="text-xs text-gray-500">Healthy</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{degradedCount}</p>
                <p className="text-xs text-gray-500">Degraded</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{downCount}</p>
                <p className="text-xs text-gray-500">Down</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Status */}
      <Card>
        <CardHeader>
          <CardTitle>Service Status</CardTitle>
          <CardDescription>Real-time status of all system services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map(service => (
              <div
                key={service.name}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(service.status)}
                    <div>
                      <h3 className="font-semibold text-gray-900">{service.name}</h3>
                      <p className="text-sm text-gray-500">
                        Last checked: {service.lastCheck.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(service.status)}
                </div>

                {service.message && (
                  <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                    {service.message}
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Response Time</p>
                    <p className="font-semibold text-gray-900">{service.responseTime.toFixed(0)} ms</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Uptime</p>
                    <p className="font-semibold text-gray-900">{service.uptime.toFixed(2)}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    <p className={`font-semibold ${
                      service.status === 'healthy' ? 'text-green-600' :
                      service.status === 'degraded' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {service.status === 'healthy' ? 'Operational' :
                       service.status === 'degraded' ? 'Degraded Performance' :
                       'Service Unavailable'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>System Metrics</CardTitle>
          <CardDescription>Real-time system resource utilization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map(metric => (
              <div
                key={metric.name}
                className="p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{metric.name}</h3>
                  {getTrendIcon(metric.trend)}
                </div>

                <div className="mb-2">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-2xl font-bold ${getMetricStatusColor(metric.status)}`}>
                      {metric.value.toFixed(0)}
                    </span>
                    <span className="text-sm text-gray-500">{metric.unit}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      metric.status === 'good'
                        ? 'bg-green-500'
                        : metric.status === 'warning'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min((metric.value / metric.threshold) * 100, 100)}%` }}
                  />
                </div>

                <p className="text-xs text-gray-500">
                  Threshold: {metric.threshold} {metric.unit}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Incidents */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Incidents</CardTitle>
          <CardDescription>System incidents and maintenance events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 border border-yellow-200 bg-yellow-50 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-yellow-900">Email Service Degradation</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Experiencing higher than normal latency. Investigating...
                  </p>
                  <p className="text-xs text-yellow-600 mt-2">2 hours ago</p>
                </div>
              </div>
            </div>

            <div className="p-3 border border-green-200 bg-green-50 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-green-900">Scheduled Maintenance Completed</p>
                  <p className="text-sm text-green-700 mt-1">
                    Database optimization completed successfully.
                  </p>
                  <p className="text-xs text-green-600 mt-2">5 hours ago</p>
                </div>
              </div>
            </div>

            <div className="p-3 border border-gray-200 bg-gray-50 rounded-lg">
              <div className="flex items-start gap-3">
                <Activity className="h-5 w-5 text-gray-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">System Update</p>
                  <p className="text-sm text-gray-700 mt-1">
                    Deployed new ETL features and navigation improvements.
                  </p>
                  <p className="text-xs text-gray-600 mt-2">1 day ago</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { createClient } from '@supabase/supabase-js'
import { useTenant } from '@/contexts/TenantContext'
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  Target,
  X,
  ExternalLink
} from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_TOKEN!
)

interface Notification {
  id: string
  project_id: string
  notification_type: string
  title: string
  message: string
  is_read: boolean
  created_at: string
  project_name?: string
}

interface NotificationDropdownProps {
  onClose: () => void
  onMarkAllAsRead: () => void
  onNotificationRead: () => void
}

export default function NotificationDropdown({
  onClose,
  onMarkAllAsRead,
  onNotificationRead
}: NotificationDropdownProps) {
  const router = useRouter()
  const { selectedTenant } = useTenant()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [selectedTenant?.id])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('customer_project_notifications')
        .select(`
          *,
          project_charters (
            project_name
          )
        `)
        .eq('tenant_id', selectedTenant?.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      
      const formattedData = (data || []).map(item => ({
        ...item,
        project_name: item.project_charters?.project_name
      }))
      
      setNotifications(formattedData)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('customer_project_notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

      if (error) throw error
      
      setNotifications(notifications.map(n =>
        n.id === notificationId ? { ...n, is_read: true } : n
      ))
      onNotificationRead()
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id)
    }
    router.push(`/customer/projects/${notification.project_id}`)
    onClose()
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'status_update':
        return <MessageSquare className="h-4 w-4 text-blue-600" />
      case 'milestone_completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'roadblock_added':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'action_required':
        return <Target className="h-4 w-4 text-purple-600" />
      default:
        return <Bell className="h-4 w-4 text-gray-600" />
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return date.toLocaleDateString()
  }

  return (
    <Card className="absolute right-0 top-12 w-96 max-h-[600px] shadow-lg z-50">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <div className="flex items-center gap-2">
            {notifications.some(n => !n.is_read) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMarkAllAsRead}
                className="text-xs"
              >
                Mark all read
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 max-h-[500px] overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No notifications</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  !notification.is_read ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getNotificationIcon(notification.notification_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-medium text-sm">{notification.title}</p>
                      {!notification.is_read && (
                        <div className="h-2 w-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{notification.message}</p>
                    {notification.project_name && (
                      <Badge variant="outline" className="text-xs mb-2">
                        {notification.project_name}
                      </Badge>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(notification.created_at)}
                      </span>
                      <ExternalLink className="h-3 w-3 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      {notifications.length > 0 && (
        <div className="border-t p-3 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              router.push('/customer/notifications')
              onClose()
            }}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            View All Notifications
          </Button>
        </div>
      )}
    </Card>
  )
}

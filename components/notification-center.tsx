"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Bell, BellRing, Mail, MessageSquare, Check, X, Clock, AlertTriangle } from "lucide-react"

interface Notification {
  id: string
  type: "push" | "email" | "sms" | "in-app"
  severity: "info" | "warning" | "danger" | "emergency"
  title: string
  message: string
  timestamp: string
  read: boolean
  actionRequired?: boolean
  actions?: Array<{
    label: string
    action: string
  }>
}

interface NotificationSettings {
  pushEnabled: boolean
  emailEnabled: boolean
  smsEnabled: boolean
  quietHours: {
    enabled: boolean
    start: string
    end: string
  }
  categories: {
    airQuality: boolean
    forecasts: boolean
    emergencies: boolean
    healthTips: boolean
  }
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [settings, setSettings] = useState<NotificationSettings>({
    pushEnabled: true,
    emailEnabled: true,
    smsEnabled: false,
    quietHours: {
      enabled: false,
      start: "22:00",
      end: "07:00",
    },
    categories: {
      airQuality: true,
      forecasts: true,
      emergencies: true,
      healthTips: false,
    },
  })
  const [pushSupported, setPushSupported] = useState(false)
  const [pushPermission, setPushPermission] = useState<NotificationPermission>("default")

  useEffect(() => {
    // Check if push notifications are supported
    if ("Notification" in window && "serviceWorker" in navigator) {
      setPushSupported(true)
      setPushPermission(Notification.permission)
    }

    // Load existing notifications
    loadNotifications()

    // Set up real-time notification listener
    const interval = setInterval(checkForNewNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadNotifications = () => {
    // Simulate loading notifications from API/localStorage
    const mockNotifications: Notification[] = [
      {
        id: "1",
        type: "push",
        severity: "warning",
        title: "Air Quality Alert",
        message: "AQI has reached 125. Consider limiting outdoor activities.",
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        read: false,
        actionRequired: true,
        actions: [
          { label: "View Details", action: "view-details" },
          { label: "Dismiss", action: "dismiss" },
        ],
      },
      {
        id: "2",
        type: "email",
        severity: "info",
        title: "Daily Air Quality Forecast",
        message: "Tomorrow's air quality is expected to be moderate (AQI 75-85).",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: true,
      },
      {
        id: "3",
        type: "in-app",
        severity: "danger",
        title: "Emergency Alert",
        message: "Hazardous air quality detected. Stay indoors immediately.",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        read: false,
        actionRequired: true,
      },
    ]
    setNotifications(mockNotifications)
  }

  const checkForNewNotifications = async () => {
    // Simulate checking for new notifications
    if (Math.random() > 0.8) {
      const newNotification: Notification = {
        id: Date.now().toString(),
        type: "push",
        severity: "info",
        title: "Air Quality Update",
        message: "Air quality has improved to moderate levels.",
        timestamp: new Date().toISOString(),
        read: false,
      }
      setNotifications((prev) => [newNotification, ...prev])

      // Send push notification if enabled
      if (settings.pushEnabled && pushPermission === "granted") {
        sendPushNotification(newNotification)
      }
    }
  }

  const requestPushPermission = async () => {
    if (!pushSupported) return

    try {
      const permission = await Notification.requestPermission()
      setPushPermission(permission)

      if (permission === "granted") {
        // Register service worker for push notifications
        const registration = await navigator.serviceWorker.register("/sw.js")
        console.log("Service Worker registered:", registration)
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error)
    }
  }

  const sendPushNotification = (notification: Notification) => {
    if (pushPermission !== "granted") return

    const options: NotificationOptions = {
      body: notification.message,
      icon: "/icon-192x192.png",
      badge: "/badge-72x72.png",
      tag: notification.id,
      requireInteraction: notification.severity === "emergency",
      actions: notification.actions?.map((action) => ({
        action: action.action,
        title: action.label,
      })),
    }

    new Notification(notification.title, options)
  }

  const sendEmailNotification = async (notification: Notification) => {
    try {
      const response = await fetch("/api/notifications/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: "user@example.com", // In real app, get from user profile
          subject: notification.title,
          message: notification.message,
          severity: notification.severity,
        }),
      })

      if (response.ok) {
        console.log("Email notification sent successfully")
      }
    } catch (error) {
      console.error("Failed to send email notification:", error)
    }
  }

  const sendSMSNotification = async (notification: Notification) => {
    try {
      const response = await fetch("/api/notifications/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: "+1234567890", // In real app, get from user profile
          message: `${notification.title}: ${notification.message}`,
          severity: notification.severity,
        }),
      })

      if (response.ok) {
        console.log("SMS notification sent successfully")
      }
    } catch (error) {
      console.error("Failed to send SMS notification:", error)
    }
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id))
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "emergency":
        return "text-red-600 bg-red-50 border-red-200"
      case "danger":
        return "text-red-500 bg-red-50 border-red-200"
      case "warning":
        return "text-orange-500 bg-orange-50 border-orange-200"
      default:
        return "text-blue-500 bg-blue-50 border-blue-200"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "emergency":
      case "danger":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BellRing className="h-5 w-5" />
                Notification Center
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Manage your air quality alerts and notifications</CardDescription>
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button onClick={markAllAsRead} variant="outline" size="sm">
                  <Check className="h-4 w-4 mr-2" />
                  Mark All Read
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="notifications" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="notifications" className="space-y-4">
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {notifications.length === 0 ? (
                    <div className="text-center py-8">
                      <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-lg font-medium">No Notifications</p>
                      <p className="text-sm text-muted-foreground">You're all caught up!</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border ${getSeverityColor(notification.severity)} ${
                          !notification.read ? "ring-2 ring-primary/20" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {getSeverityIcon(notification.severity)}
                              <h4 className="font-medium">{notification.title}</h4>
                              <Badge variant="outline" className="text-xs">
                                {notification.type.toUpperCase()}
                              </Badge>
                              {!notification.read && <div className="w-2 h-2 bg-primary rounded-full" />}
                            </div>
                            <p className="text-sm mb-2">{notification.message}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {new Date(notification.timestamp).toLocaleString()}
                            </div>
                            {notification.actions && (
                              <div className="flex gap-2 mt-3">
                                {notification.actions.map((action, index) => (
                                  <Button key={index} variant="outline" size="sm">
                                    {action.label}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-1 ml-4">
                            {!notification.read && (
                              <Button onClick={() => markAsRead(notification.id)} variant="ghost" size="sm">
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button onClick={() => deleteNotification(notification.id)} variant="ghost" size="sm">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              {/* Push Notification Settings */}
              <div className="space-y-4">
                <h4 className="font-medium">Push Notifications</h4>
                {!pushSupported ? (
                  <p className="text-sm text-muted-foreground">Push notifications are not supported in this browser.</p>
                ) : pushPermission === "denied" ? (
                  <p className="text-sm text-destructive">
                    Push notifications are blocked. Please enable them in your browser settings.
                  </p>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Enable Push Notifications</label>
                      <div className="flex items-center gap-2">
                        {pushPermission === "default" && (
                          <Button onClick={requestPushPermission} size="sm">
                            Enable
                          </Button>
                        )}
                        <Switch
                          checked={settings.pushEnabled && pushPermission === "granted"}
                          onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, pushEnabled: checked }))}
                          disabled={pushPermission !== "granted"}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Email and SMS Settings */}
              <div className="space-y-4">
                <h4 className="font-medium">Other Notification Methods</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <label className="text-sm">Email Notifications</label>
                    </div>
                    <Switch
                      checked={settings.emailEnabled}
                      onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, emailEnabled: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <label className="text-sm">SMS Notifications</label>
                    </div>
                    <Switch
                      checked={settings.smsEnabled}
                      onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, smsEnabled: checked }))}
                    />
                  </div>
                </div>
              </div>

              {/* Quiet Hours */}
              <div className="space-y-4">
                <h4 className="font-medium">Quiet Hours</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Enable Quiet Hours</label>
                    <Switch
                      checked={settings.quietHours.enabled}
                      onCheckedChange={(checked) =>
                        setSettings((prev) => ({
                          ...prev,
                          quietHours: { ...prev.quietHours, enabled: checked },
                        }))
                      }
                    />
                  </div>
                  {settings.quietHours.enabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Start Time</label>
                        <input
                          type="time"
                          value={settings.quietHours.start}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              quietHours: { ...prev.quietHours, start: e.target.value },
                            }))
                          }
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">End Time</label>
                        <input
                          type="time"
                          value={settings.quietHours.end}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              quietHours: { ...prev.quietHours, end: e.target.value },
                            }))
                          }
                          className="w-full p-2 border rounded"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notification Categories */}
              <div className="space-y-4">
                <h4 className="font-medium">Notification Categories</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Air Quality Alerts</label>
                    <Switch
                      checked={settings.categories.airQuality}
                      onCheckedChange={(checked) =>
                        setSettings((prev) => ({
                          ...prev,
                          categories: { ...prev.categories, airQuality: checked },
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Forecast Updates</label>
                    <Switch
                      checked={settings.categories.forecasts}
                      onCheckedChange={(checked) =>
                        setSettings((prev) => ({
                          ...prev,
                          categories: { ...prev.categories, forecasts: checked },
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Emergency Alerts</label>
                    <Switch
                      checked={settings.categories.emergencies}
                      onCheckedChange={(checked) =>
                        setSettings((prev) => ({
                          ...prev,
                          categories: { ...prev.categories, emergencies: checked },
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Health Tips</label>
                    <Switch
                      checked={settings.categories.healthTips}
                      onCheckedChange={(checked) =>
                        setSettings((prev) => ({
                          ...prev,
                          categories: { ...prev.categories, healthTips: checked },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { AlertTriangle, Heart, Users, Activity, Shield, Bell, Settings, MapPin, Clock, Zap } from "lucide-react"
import useSWR from "swr"

interface HealthAlertsProps {
  currentAqi?: number
}

interface UserProfile {
  age: "child" | "adult" | "senior"
  conditions: string[]
  activityLevel: "low" | "moderate" | "high"
  location: string
  alertPreferences: {
    email: boolean
    push: boolean
    sms: boolean
    threshold: number
  }
}

interface HealthAlert {
  id: string
  severity: "info" | "warning" | "danger" | "emergency"
  title: string
  description: string
  recommendations: string[]
  affectedGroups: string[]
  timestamp: string
  expiresAt?: string
  location?: string
  pollutants?: string[]
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function HealthAlerts({ currentAqi = 85 }: HealthAlertsProps) {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    age: "adult",
    conditions: [],
    activityLevel: "moderate",
    location: "Washington, DC",
    alertPreferences: {
      email: true,
      push: true,
      sms: false,
      threshold: 100,
    },
  })

  const [activeAlerts, setActiveAlerts] = useState<HealthAlert[]>([])

  const { data: alertData } = useSWR<{ alerts: HealthAlert[] }>("/api/health-alerts", fetcher, {
    refreshInterval: 60000, // Check for new alerts every minute
    revalidateOnFocus: true,
  })

  const getPersonalizedRecommendations = (aqi: number, profile: UserProfile) => {
    const baseRecommendations = getHealthRecommendations(aqi)
    const personalizedRecs = [...baseRecommendations.recommendations]

    // Age-specific recommendations
    if (profile.age === "child") {
      if (aqi > 50) personalizedRecs.unshift("Children should avoid prolonged outdoor play")
      if (aqi > 100) personalizedRecs.unshift("Keep children indoors during peak pollution hours")
    } else if (profile.age === "senior") {
      if (aqi > 75) personalizedRecs.unshift("Seniors should limit outdoor activities")
      if (aqi > 100) personalizedRecs.unshift("Consider postponing outdoor errands")
    }

    // Condition-specific recommendations
    if (profile.conditions.includes("asthma")) {
      if (aqi > 50) personalizedRecs.unshift("Keep rescue inhaler readily available")
      if (aqi > 100) personalizedRecs.unshift("Consider pre-medicating before going outside")
    }

    if (profile.conditions.includes("heart-disease")) {
      if (aqi > 75) personalizedRecs.unshift("Avoid strenuous outdoor activities")
      if (aqi > 100) personalizedRecs.unshift("Monitor for chest pain or shortness of breath")
    }

    // Activity level adjustments
    if (profile.activityLevel === "high" && aqi > 100) {
      personalizedRecs.unshift("Move workouts indoors or to early morning hours")
    }

    return {
      ...baseRecommendations,
      recommendations: personalizedRecs,
    }
  }

  const getHealthRecommendations = (aqi: number) => {
    if (aqi <= 50) {
      return {
        level: "good",
        title: "Good Air Quality",
        description: "Air quality is satisfactory. Enjoy outdoor activities!",
        color: "text-green-700",
        bgColor: "bg-green-50",
        recommendations: [
          "Perfect conditions for outdoor exercise",
          "Great time for children to play outside",
          "No restrictions on outdoor activities",
        ],
      }
    } else if (aqi <= 100) {
      return {
        level: "moderate",
        title: "Moderate Air Quality",
        description: "Air quality is acceptable for most people.",
        color: "text-yellow-700",
        bgColor: "bg-yellow-50",
        recommendations: [
          "Sensitive individuals should consider reducing prolonged outdoor exertion",
          "Most people can enjoy normal outdoor activities",
          "Monitor symptoms if you have respiratory conditions",
        ],
      }
    } else if (aqi <= 150) {
      return {
        level: "unhealthy-sensitive",
        title: "Unhealthy for Sensitive Groups",
        description: "Sensitive groups should limit outdoor activities.",
        color: "text-orange-700",
        bgColor: "bg-orange-50",
        recommendations: [
          "People with heart or lung disease should reduce outdoor exertion",
          "Children and older adults should limit prolonged outdoor activities",
          "Consider moving activities indoors",
        ],
      }
    } else if (aqi <= 200) {
      return {
        level: "unhealthy",
        title: "Unhealthy Air Quality",
        description: "Everyone should limit outdoor activities.",
        color: "text-red-700",
        bgColor: "bg-red-50",
        recommendations: [
          "Avoid outdoor activities, especially exercise",
          "Keep windows closed and use air purifiers",
          "Wear N95 masks if you must go outside",
        ],
      }
    } else {
      return {
        level: "hazardous",
        title: "Hazardous Air Quality",
        description: "Emergency conditions. Everyone should avoid outdoor activities.",
        color: "text-red-900",
        bgColor: "bg-red-100",
        recommendations: [
          "Stay indoors with windows and doors closed",
          "Run air purifiers on high setting",
          "Seek medical attention if experiencing symptoms",
          "Avoid all outdoor activities",
        ],
      }
    }
  }

  useEffect(() => {
    const generateAlerts = () => {
      const alerts: HealthAlert[] = []
      const now = new Date()

      // Current condition alert
      if (currentAqi > userProfile.alertPreferences.threshold) {
        alerts.push({
          id: "current-aqi",
          severity: currentAqi > 150 ? "danger" : "warning",
          title: `Air Quality Alert - AQI ${currentAqi}`,
          description: `Current air quality exceeds your alert threshold of ${userProfile.alertPreferences.threshold}`,
          recommendations: getPersonalizedRecommendations(currentAqi, userProfile).recommendations.slice(0, 3),
          affectedGroups: userProfile.conditions.length > 0 ? ["Sensitive individuals"] : ["General population"],
          timestamp: now.toISOString(),
          location: userProfile.location,
          pollutants: currentAqi > 100 ? ["PM2.5", "Ozone"] : ["PM2.5"],
        })
      }

      // Forecast-based proactive alerts
      if (currentAqi < 100 && Math.random() > 0.7) {
        // Simulate forecast indicating worsening conditions
        alerts.push({
          id: "forecast-alert",
          severity: "warning",
          title: "Air Quality Expected to Worsen",
          description: "Forecast models predict AQI will exceed 120 in the next 3 hours",
          recommendations: [
            "Complete outdoor activities before 2 PM",
            "Close windows and prepare air purifiers",
            "Consider rescheduling outdoor exercise",
          ],
          affectedGroups: ["Sensitive groups", "Active individuals"],
          timestamp: now.toISOString(),
          expiresAt: new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString(),
          location: userProfile.location,
        })
      }

      // Emergency alert for hazardous conditions
      if (currentAqi > 200) {
        alerts.push({
          id: "emergency-alert",
          severity: "emergency",
          title: "EMERGENCY: Hazardous Air Quality",
          description: "Extremely dangerous air quality conditions detected",
          recommendations: [
            "STAY INDOORS IMMEDIATELY",
            "Seal windows and doors",
            "Seek medical attention if experiencing symptoms",
            "Do not go outside unless absolutely necessary",
          ],
          affectedGroups: ["Everyone"],
          timestamp: now.toISOString(),
          location: userProfile.location,
          pollutants: ["PM2.5", "PM10", "Ozone", "NO2"],
        })
      }

      setActiveAlerts(alerts)
    }

    generateAlerts()
    const interval = setInterval(generateAlerts, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [currentAqi, userProfile])

  const healthInfo = getPersonalizedRecommendations(currentAqi, userProfile)

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "emergency":
        return "border-red-600 bg-red-50"
      case "danger":
        return "border-red-400 bg-red-50"
      case "warning":
        return "border-orange-400 bg-orange-50"
      default:
        return "border-blue-200 bg-blue-50"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "emergency":
        return <Zap className="h-4 w-4 text-red-600" />
      case "danger":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      default:
        return <Shield className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="alerts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Active Health Alerts
                {activeAlerts.length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {activeAlerts.length}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Real-time alerts based on current and forecasted air quality</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeAlerts.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <p className="text-lg font-medium text-green-700">No Active Alerts</p>
                  <p className="text-sm text-muted-foreground">Air quality is within acceptable levels</p>
                </div>
              ) : (
                activeAlerts.map((alert) => (
                  <Alert key={alert.id} className={getSeverityColor(alert.severity)}>
                    {getSeverityIcon(alert.severity)}
                    <div className="flex-1">
                      <AlertTitle className="flex items-center gap-2">
                        {alert.title}
                        <Badge
                          variant={alert.severity === "emergency" ? "destructive" : "secondary"}
                          className="text-xs"
                        >
                          {alert.severity.toUpperCase()}
                        </Badge>
                      </AlertTitle>
                      <AlertDescription className="mt-2 space-y-2">
                        <p>{alert.description}</p>
                        {alert.location && (
                          <div className="flex items-center gap-1 text-xs">
                            <MapPin className="h-3 w-3" />
                            {alert.location}
                          </div>
                        )}
                        {alert.expiresAt && (
                          <div className="flex items-center gap-1 text-xs">
                            <Clock className="h-3 w-3" />
                            Expires: {new Date(alert.expiresAt).toLocaleTimeString()}
                          </div>
                        )}
                      </AlertDescription>
                    </div>
                  </Alert>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Personalized Health Recommendations
              </CardTitle>
              <CardDescription>Tailored guidance based on your health profile and current conditions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Health Status */}
              <div className={`p-4 rounded-lg ${healthInfo.bgColor}`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Current Health Risk Level</h4>
                  <Badge variant={currentAqi > 100 ? "destructive" : currentAqi > 50 ? "secondary" : "default"}>
                    AQI {currentAqi}
                  </Badge>
                </div>
                <Progress value={Math.min((currentAqi / 200) * 100, 100)} className="mb-3" />
                <p className={`text-sm ${healthInfo.color}`}>{healthInfo.description}</p>
              </div>

              {/* Personalized Recommendations */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Your Personalized Actions
                </h4>
                <ul className="space-y-2">
                  {healthInfo.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Health Impact Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h5 className="font-medium mb-2">Immediate Effects</h5>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Eye and throat irritation</li>
                    <li>• Reduced lung function</li>
                    <li>• Increased coughing</li>
                  </ul>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h5 className="font-medium mb-2">Long-term Risks</h5>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Cardiovascular disease</li>
                    <li>• Respiratory infections</li>
                    <li>• Premature aging</li>
                  </ul>
                </div>
              </div>

              {/* Vulnerable Groups */}
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  High-Risk Groups
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span>People with heart disease</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-blue-500" />
                    <span>Respiratory conditions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-500" />
                    <span>Children and elderly</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-pink-500" />
                    <span>Pregnant women</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Alert Preferences
              </CardTitle>
              <CardDescription>Customize your health alerts and notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Settings */}
              <div className="space-y-4">
                <h4 className="font-medium">Health Profile</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Age Group</label>
                    <Select
                      value={userProfile.age}
                      onValueChange={(value: any) => setUserProfile((prev) => ({ ...prev, age: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="child">Child (0-17)</SelectItem>
                        <SelectItem value="adult">Adult (18-64)</SelectItem>
                        <SelectItem value="senior">Senior (65+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Activity Level</label>
                    <Select
                      value={userProfile.activityLevel}
                      onValueChange={(value: any) => setUserProfile((prev) => ({ ...prev, activityLevel: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Activity</SelectItem>
                        <SelectItem value="moderate">Moderate Activity</SelectItem>
                        <SelectItem value="high">High Activity</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Alert Thresholds */}
              <div className="space-y-4">
                <h4 className="font-medium">Alert Settings</h4>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Alert Threshold: AQI {userProfile.alertPreferences.threshold}
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="200"
                    step="10"
                    value={userProfile.alertPreferences.threshold}
                    onChange={(e) =>
                      setUserProfile((prev) => ({
                        ...prev,
                        alertPreferences: { ...prev.alertPreferences, threshold: Number(e.target.value) },
                      }))
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>50 (Good)</span>
                    <span>100 (Moderate)</span>
                    <span>150 (Unhealthy)</span>
                    <span>200 (Very Unhealthy)</span>
                  </div>
                </div>
              </div>

              {/* Notification Preferences */}
              <div className="space-y-4">
                <h4 className="font-medium">Notification Methods</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Push Notifications</label>
                    <Switch
                      checked={userProfile.alertPreferences.push}
                      onCheckedChange={(checked) =>
                        setUserProfile((prev) => ({
                          ...prev,
                          alertPreferences: { ...prev.alertPreferences, push: checked },
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Email Alerts</label>
                    <Switch
                      checked={userProfile.alertPreferences.email}
                      onCheckedChange={(checked) =>
                        setUserProfile((prev) => ({
                          ...prev,
                          alertPreferences: { ...prev.alertPreferences, email: checked },
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm">SMS Alerts</label>
                    <Switch
                      checked={userProfile.alertPreferences.sms}
                      onCheckedChange={(checked) =>
                        setUserProfile((prev) => ({
                          ...prev,
                          alertPreferences: { ...prev.alertPreferences, sms: checked },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

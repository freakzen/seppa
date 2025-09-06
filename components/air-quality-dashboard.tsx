"use client"

import type React from "react"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Satellite, AlertTriangle, TrendingUp, Search, RefreshCw, Clock } from "lucide-react"
import { AirQualityMap } from "./air-quality-map"
import { ForecastChart } from "./forecast-chart"
import { HealthAlerts } from "./health-alerts"
import { PollutantChart } from "./pollutant-chart"
import { HistoricalTrends } from "./historical-trends"
import { NotificationCenter } from "./notification-center"

interface AirQualityData {
  location: string
  aqi: number
  pm25: number
  pm10: number
  no2: number
  o3: number
  co: number
  timestamp: string
  source: "TEMPO" | "Ground" | "Combined"
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function AirQualityDashboard() {
  const [selectedLocation, setSelectedLocation] = useState("Washington, DC")
  const [searchQuery, setSearchQuery] = useState("")

  const {
    data: currentData,
    error,
    isLoading,
    mutate,
  } = useSWR<AirQualityData>("/api/air-quality", fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: true,
  })

  const getAQILevel = (aqi: number) => {
    if (aqi <= 50) return { level: "Good", color: "bg-green-500", textColor: "text-green-700", bgColor: "bg-green-50" }
    if (aqi <= 100)
      return { level: "Moderate", color: "bg-yellow-500", textColor: "text-yellow-700", bgColor: "bg-yellow-50" }
    if (aqi <= 150)
      return {
        level: "Unhealthy for Sensitive Groups",
        color: "bg-orange-500",
        textColor: "text-orange-700",
        bgColor: "bg-orange-50",
      }
    if (aqi <= 200) return { level: "Unhealthy", color: "bg-red-500", textColor: "text-red-700", bgColor: "bg-red-50" }
    if (aqi <= 300)
      return { level: "Very Unhealthy", color: "bg-purple-500", textColor: "text-purple-700", bgColor: "bg-purple-50" }
    return { level: "Hazardous", color: "bg-red-800", textColor: "text-red-900", bgColor: "bg-red-100" }
  }

  const handleRefresh = () => {
    mutate()
  }

  const handleLocationSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setSelectedLocation(searchQuery.trim())
      setSearchQuery("")
      mutate() // Refresh data for new location
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading air quality data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
          <p className="text-destructive">Failed to load air quality data</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  const aqiInfo = currentData ? getAQILevel(currentData.aqi) : null

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-balance">Air Quality Monitor</h1>
          <p className="text-muted-foreground text-pretty">
            Real-time air quality data powered by NASA TEMPO satellite and ground sensors
          </p>
        </div>

        <div className="flex items-center gap-4">
          <form onSubmit={handleLocationSearch} className="flex gap-2">
            <Input
              placeholder="Search location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48"
            />
            <Button type="submit" size="icon" variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </form>

          <Button onClick={handleRefresh} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2">
            <Satellite className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">TEMPO Active</span>
          </div>
        </div>
      </div>

      {/* Current Conditions Alert */}
      {currentData && aqiInfo && currentData.aqi > 100 && (
        <Alert className="border-destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Air Quality Alert</AlertTitle>
          <AlertDescription>
            Current AQI is {currentData.aqi} ({aqiInfo.level}). Consider limiting outdoor activities.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Dashboard */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="map">Live Map</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
          <TabsTrigger value="alerts">Health Alerts</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Current AQI Card - Enhanced */}
          {currentData && aqiInfo && (
            <Card className="col-span-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      {selectedLocation}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Last updated: {new Date(currentData.timestamp).toLocaleTimeString()}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {currentData.source} Data
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className={`p-6 rounded-lg mb-6 ${aqiInfo.bgColor}`}>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-5xl font-bold">{currentData.aqi}</div>
                      <div className={`text-lg font-medium ${aqiInfo.textColor}`}>{aqiInfo.level}</div>
                    </div>
                    <div className={`w-6 h-20 rounded-full ${aqiInfo.color}`}></div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">Air Quality Index</h3>
                      <p className="text-sm text-muted-foreground">
                        {currentData.aqi <= 50 &&
                          "Air quality is satisfactory, and air pollution poses little or no risk."}
                        {currentData.aqi > 50 &&
                          currentData.aqi <= 100 &&
                          "Air quality is acceptable for most people. Sensitive individuals may experience minor issues."}
                        {currentData.aqi > 100 &&
                          currentData.aqi <= 150 &&
                          "Members of sensitive groups may experience health effects. The general public is less likely to be affected."}
                        {currentData.aqi > 150 &&
                          "Everyone may begin to experience health effects. Members of sensitive groups may experience more serious effects."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="text-center p-4 bg-card border rounded-lg">
                    <div className="text-2xl font-bold text-primary">{(currentData.pm25 ?? 0).toFixed(1)}</div>
                    <div className="text-sm font-medium">PM2.5</div>
                    <div className="text-xs text-muted-foreground">μg/m³</div>
                  </div>
                  <div className="text-center p-4 bg-card border rounded-lg">
                    <div className="text-2xl font-bold text-primary">{(currentData.pm10 ?? 0).toFixed(1)}</div>
                    <div className="text-sm font-medium">PM10</div>
                    <div className="text-xs text-muted-foreground">μg/m³</div>
                  </div>
                  <div className="text-center p-4 bg-card border rounded-lg">
                    <div className="text-2xl font-bold text-primary">{(currentData.no2 ?? 0).toFixed(1)}</div>
                    <div className="text-sm font-medium">NO₂</div>
                    <div className="text-xs text-muted-foreground">ppb</div>
                  </div>
                  <div className="text-center p-4 bg-card border rounded-lg">
                    <div className="text-2xl font-bold text-primary">{(currentData.o3 ?? 0).toFixed(1)}</div>
                    <div className="text-sm font-medium">O₃</div>
                    <div className="text-xs text-muted-foreground">ppb</div>
                  </div>
                  <div className="text-center p-4 bg-card border rounded-lg">
                    <div className="text-2xl font-bold text-primary">{(currentData.co ?? 0).toFixed(1)}</div>
                    <div className="text-sm font-medium">CO</div>
                    <div className="text-xs text-muted-foreground">ppm</div>
                  </div>
                  <div className="text-center p-4 bg-card border rounded-lg">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-sm font-medium">Trending</div>
                    <div className="text-xs text-muted-foreground">Stable</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <PollutantChart data={currentData} />
        </TabsContent>

        <TabsContent value="map">
          <AirQualityMap />
        </TabsContent>

        <TabsContent value="trends">
          <HistoricalTrends />
        </TabsContent>

        <TabsContent value="forecast">
          <ForecastChart />
        </TabsContent>

        <TabsContent value="alerts">
          <HealthAlerts currentAqi={currentData?.aqi} />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationCenter />
        </TabsContent>
      </Tabs>
    </div>
  )
}

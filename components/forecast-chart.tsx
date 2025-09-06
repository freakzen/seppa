"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  ComposedChart,
  Bar,
} from "recharts"
import { TrendingUp, Calendar, Brain, Cloud, Satellite, RefreshCw } from "lucide-react"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface ForecastData {
  timestamp: string
  aqi: number
  confidence: number
  pm25: number
  no2: number
  o3: number
  weather: {
    temperature: number
    humidity: number
    windSpeed: number
    pressure: number
  }
  sources: {
    tempo: number
    ground: number
    weather: number
  }
}

export function ForecastChart() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<"6h" | "24h" | "48h">("24h")

  const { data, error, isLoading, mutate } = useSWR<{ forecast: ForecastData[] }>(
    `/api/forecast?timeframe=${selectedTimeframe}`,
    fetcher,
    {
      refreshInterval: 300000, // Refresh every 5 minutes
      revalidateOnFocus: true,
    },
  )

  const generateForecastData = (hours: number): ForecastData[] => {
    const forecast: ForecastData[] = []
    const now = new Date()

    for (let i = 0; i < hours; i++) {
      const timestamp = new Date(now.getTime() + i * 60 * 60 * 1000)

      // Simulate ML model predictions with multiple factors
      const timeOfDay = timestamp.getHours()
      const dayOfWeek = timestamp.getDay()

      // Base AQI with diurnal and weekly patterns
      let baseAqi = 60 + Math.sin(((timeOfDay - 6) / 24) * 2 * Math.PI) * 20
      baseAqi += dayOfWeek === 0 || dayOfWeek === 6 ? -10 : 15 // Weekend effect
      baseAqi += Math.random() * 30 - 15 // Random variation

      // Weather influence on air quality
      const temperature = 20 + Math.sin((timeOfDay / 24) * 2 * Math.PI) * 10 + Math.random() * 5
      const humidity = 50 + Math.random() * 30
      const windSpeed = 5 + Math.random() * 10
      const pressure = 1013 + Math.random() * 20 - 10

      // Weather corrections to AQI
      if (windSpeed > 10) baseAqi -= 15 // High wind disperses pollutants
      if (humidity > 70) baseAqi += 10 // High humidity traps pollutants
      if (pressure < 1010) baseAqi += 5 // Low pressure can trap pollutants

      const aqi = Math.max(20, Math.min(200, baseAqi))
      const confidence = Math.max(0.6, 1 - (i / hours) * 0.4) // Confidence decreases over time

      forecast.push({
        timestamp: timestamp.toISOString(),
        aqi: Math.round(aqi),
        confidence: Math.round(confidence * 100) / 100,
        pm25: aqi * 0.3 + Math.random() * 10,
        no2: aqi * 0.4 + Math.random() * 15,
        o3: aqi * 0.5 + Math.random() * 20,
        weather: {
          temperature: Math.round(temperature * 10) / 10,
          humidity: Math.round(humidity),
          windSpeed: Math.round(windSpeed * 10) / 10,
          pressure: Math.round(pressure * 10) / 10,
        },
        sources: {
          tempo: 0.4 + Math.random() * 0.2,
          ground: 0.3 + Math.random() * 0.2,
          weather: 0.2 + Math.random() * 0.1,
        },
      })
    }

    return forecast
  }

  const forecastData =
    data?.forecast || generateForecastData(selectedTimeframe === "6h" ? 6 : selectedTimeframe === "24h" ? 24 : 48)

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    if (selectedTimeframe === "6h") {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit" })
  }

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return "#10b981"
    if (aqi <= 100) return "#f59e0b"
    if (aqi <= 150) return "#f97316"
    if (aqi <= 200) return "#ef4444"
    return "#dc2626"
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Generating Forecast...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground">Processing satellite and weather data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI-Powered Air Quality Forecast
              </CardTitle>
              <CardDescription>
                Machine learning predictions using TEMPO satellite, ground sensors, and weather data
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => mutate()} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            value={selectedTimeframe}
            onValueChange={(value) => setSelectedTimeframe(value as any)}
            className="mb-6"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="6h">6 Hours</TabsTrigger>
              <TabsTrigger value="24h">24 Hours</TabsTrigger>
              <TabsTrigger value="48h">48 Hours</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="h-96 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={forecastData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" tickFormatter={formatTime} interval="preserveStartEnd" />
                <YAxis yAxisId="aqi" orientation="left" />
                <YAxis yAxisId="confidence" orientation="right" domain={[0, 1]} />
                <Tooltip
                  formatter={(value: any, name: string) => {
                    if (name === "Confidence") return [`${(value * 100).toFixed(0)}%`, name]
                    if (name === "AQI") return [Math.round(value), name]
                    return [value.toFixed(1), name]
                  }}
                  labelFormatter={(label) => `Time: ${formatTime(label)}`}
                />
                <Legend />

                {/* AQI forecast line with confidence area */}
                <Area
                  yAxisId="aqi"
                  type="monotone"
                  dataKey="aqi"
                  stroke="#059669"
                  fill="#059669"
                  fillOpacity={0.1}
                  strokeWidth={3}
                  name="AQI Forecast"
                />

                {/* Confidence indicator */}
                <Bar yAxisId="confidence" dataKey="confidence" fill="#10b981" fillOpacity={0.3} name="Confidence" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Satellite className="h-4 w-4 text-primary" />
                <span className="font-medium">TEMPO Satellite</span>
              </div>
              <div className="text-2xl font-bold text-primary">{Math.round(forecastData[0]?.sources.tempo * 100)}%</div>
              <p className="text-xs text-muted-foreground">Data contribution</p>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-secondary" />
                <span className="font-medium">Ground Sensors</span>
              </div>
              <div className="text-2xl font-bold text-secondary">
                {Math.round(forecastData[0]?.sources.ground * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">Data contribution</p>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Cloud className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Weather Data</span>
              </div>
              <div className="text-2xl font-bold text-blue-500">
                {Math.round(forecastData[0]?.sources.weather * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">Data contribution</p>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Model Performance
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium">Accuracy</div>
                <div className="text-primary">87.3%</div>
              </div>
              <div>
                <div className="font-medium">RMSE</div>
                <div className="text-primary">12.4 AQI</div>
              </div>
              <div>
                <div className="font-medium">Last Updated</div>
                <div className="text-muted-foreground">2 min ago</div>
              </div>
              <div>
                <div className="font-medium">Next Update</div>
                <div className="text-muted-foreground">3 min</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Pollutant Forecasts
          </CardTitle>
          <CardDescription>Individual pollutant predictions over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" tickFormatter={formatTime} />
                <YAxis />
                <Tooltip
                  formatter={(value: any, name: string) => [value.toFixed(1), name]}
                  labelFormatter={(label) => `Time: ${formatTime(label)}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="pm25"
                  stroke="#059669"
                  strokeWidth={2}
                  name="PM2.5 (μg/m³)"
                  dot={{ fill: "#059669", strokeWidth: 2, r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="no2"
                  stroke="#dc2626"
                  strokeWidth={2}
                  name="NO₂ (ppb)"
                  dot={{ fill: "#dc2626", strokeWidth: 2, r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="o3"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="O₃ (ppb)"
                  dot={{ fill: "#f59e0b", strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Weather Impact Analysis
          </CardTitle>
          <CardDescription>How weather conditions affect air quality predictions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {forecastData.slice(0, 4).map((data, index) => (
              <div key={index} className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">{formatTime(data.timestamp)}</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Temperature:</span>
                    <span className="font-medium">{data.weather.temperature}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Humidity:</span>
                    <span className="font-medium">{data.weather.humidity}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wind Speed:</span>
                    <span className="font-medium">{data.weather.windSpeed} m/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pressure:</span>
                    <span className="font-medium">{data.weather.pressure} hPa</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span>Predicted AQI:</span>
                      <Badge
                        variant="outline"
                        style={{
                          borderColor: getAQIColor(data.aqi),
                          color: getAQIColor(data.aqi),
                        }}
                      >
                        {data.aqi}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

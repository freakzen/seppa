"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { TrendingUp } from "lucide-react"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function HistoricalTrends() {
  const { data, isLoading } = useSWR("/api/historical", fetcher)

  // Generate mock historical data
  const generateHistoricalData = () => {
    const data = []
    const now = new Date()

    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000)
      data.push({
        time: time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        aqi: Math.floor(Math.random() * 50) + 50 + Math.sin(i / 6) * 20,
        pm25: Math.random() * 20 + 15 + Math.sin(i / 8) * 10,
        no2: Math.random() * 30 + 20 + Math.cos(i / 4) * 15,
      })
    }
    return data
  }

  const historicalData = data?.trends || generateHistoricalData()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading trends...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          24-Hour Trends
        </CardTitle>
        <CardDescription>Historical air quality data for the past 24 hours</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={historicalData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="aqi"
              stroke="#059669"
              strokeWidth={2}
              name="AQI"
              dot={{ fill: "#059669", strokeWidth: 2, r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="pm25"
              stroke="#10b981"
              strokeWidth={2}
              name="PM2.5 (μg/m³)"
              dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="no2"
              stroke="#dc2626"
              strokeWidth={2}
              name="NO₂ (ppb)"
              dot={{ fill: "#dc2626", strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

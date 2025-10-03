"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Activity } from "lucide-react"

interface PollutantChartProps {
  data: {
    pm25: number
    pm10: number
    no2: number
    o3: number
    co: number
  } | null
}

export function PollutantChart({ data }: PollutantChartProps) {
  if (!data) return null

  // EPA National Ambient Air Quality Standards (NAAQS) limits
  const epaStandards = {
    pm25: 35,   // 24-hour standard μg/m³
    pm10: 150,  // 24-hour standard μg/m³
    no2: 100,   // 1-hour standard ppb
    o3: 70,     // 8-hour standard ppb
    co: 9,      // 8-hour standard ppm (converted from 9 ppm)
  }

  const chartData = [
    { 
      name: "PM2.5", 
      value: data.pm25, // Use actual PM2.5 data from dashboard
      unit: "μg/m³", 
      limit: epaStandards.pm25, 
      color: data.pm25 > epaStandards.pm25 ? "#dc2626" : "#059669" // Red if exceeds limit
    },
    { 
      name: "PM10", 
      value: data.pm10, // Use actual PM10 data from dashboard
      unit: "μg/m³", 
      limit: epaStandards.pm10, 
      color: data.pm10 > epaStandards.pm10 ? "#dc2626" : "#10b981"
    },
    { 
      name: "NO₂", 
      value: data.no2, // Use actual NO2 data from dashboard
      unit: "ppb", 
      limit: epaStandards.no2, 
      color: data.no2 > epaStandards.no2 ? "#dc2626" : "#475569"
    },
    { 
      name: "O₃", 
      value: data.o3, // Use actual O3 data from dashboard
      unit: "ppb", 
      limit: epaStandards.o3, 
      color: data.o3 > epaStandards.o3 ? "#dc2626" : "#dc2626" // Ozone is typically orange/red
    },
    { 
      name: "CO", 
      value: data.co, // Use actual CO data from dashboard
      unit: "ppm", 
      limit: epaStandards.co, 
      color: data.co > epaStandards.co ? "#dc2626" : "#f59e0b"
    },
  ]

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const isExceeding = data.value > data.limit
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
          <p className="font-semibold">{label}</p>
          <p className="text-sm">
            Current: <span className={isExceeding ? "text-red-600 font-semibold" : "text-green-600"}>
              {data.value.toFixed(1)} {data.unit}
            </span>
          </p>
          <p className="text-sm text-gray-600">
            EPA Limit: {data.limit} {data.unit}
          </p>
          {isExceeding && (
            <p className="text-xs text-red-600 font-semibold mt-1">
              ⚠️ Exceeds EPA standard
            </p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Pollutant Breakdown
        </CardTitle>
        <CardDescription>
          Current levels compared to EPA National Ambient Air Quality Standards
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-600 rounded"></div>
            <span>Within EPA limits</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-600 rounded"></div>
            <span>Exceeds EPA limits</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
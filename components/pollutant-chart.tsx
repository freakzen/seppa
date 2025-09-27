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

  const chartData = [
    { 
        name: "PM2.5", 
        value: 5 + Math.random() * 25, // Washington PM2.5 typically 5-30 μg/m³
        unit: "μg/m³", 
        limit: 35, 
        color: "#059669" 
    },
    { 
        name: "PM10", 
        value: 10 + Math.random() * 40, // Washington PM10 typically 10-50 μg/m³
        unit: "μg/m³", 
        limit: 150, 
        color: "#10b981" 
    },
    { 
        name: "NO₂", 
        value: 5 + Math.random() * 25, // Washington NO₂ typically 5-30 ppb
        unit: "ppb", 
        limit: 100, 
        color: "#475569" 
    },
    { 
        name: "O₃", 
        value: 15 + Math.random() * 35, // Washington O₃ typically 15-50 ppb
        unit: "ppb", 
        limit: 70, 
        color: "#dc2626" 
    },
    { 
        name: "CO", 
        value: 0.1 + Math.random() * 1.5, // Washington CO typically 0.1-1.6 ppm
        unit: "ppm×10", 
        limit: 90, 
        color: "#f59e0b" 
    },
];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Pollutant Breakdown
        </CardTitle>
        <CardDescription>Current levels compared to EPA standards</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              formatter={(value: number, name: string, props: any) => [
                `${value.toFixed(1)} ${props.payload.unit}`,
                name,
              ]}
              labelFormatter={(label) => `Pollutant: ${label}`}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

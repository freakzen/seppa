"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Satellite, MapPin } from "lucide-react"

export function AirQualityMap() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Satellite className="h-5 w-5" />
            Live Air Quality Map
          </CardTitle>
          <CardDescription>
            Real-time air quality data from NASA TEMPO satellite and ground monitoring stations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative bg-muted rounded-lg h-96 flex items-center justify-center">
            <div className="text-center space-y-4">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <p className="font-medium">Interactive Map Coming Soon</p>
                <p className="text-sm text-muted-foreground">
                  Integration with NASA TEMPO satellite data and ground sensor networks
                </p>
              </div>
              <div className="flex gap-2 justify-center">
                <Badge variant="outline">TEMPO Satellite</Badge>
                <Badge variant="outline">Ground Sensors</Badge>
                <Badge variant="outline">Weather Data</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

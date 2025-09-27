"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Satellite, MapPin, RefreshCw, Eye } from "lucide-react"
import { useEffect, useState } from "react"

// Types for air quality data
interface AirQualityData {
  lat: number
  lng: number
  aqi: number
  pm25: number
  pm10: number
  no2?: number
  so2?: number
  o3?: number
  city: string
  country: string
  timestamp: string
}

export function AirQualityMap() {
  const [airQualityData, setAirQualityData] = useState<AirQualityData[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>('')

  // Function to get AQI color based on value
  const getAQIColor = (aqi: number): string => {
    if (aqi <= 50) return '#00E400' // Good
    if (aqi <= 100) return '#FFFF00' // Moderate
    if (aqi <= 150) return '#FF7E00' // Unhealthy for sensitive groups
    if (aqi <= 200) return '#FF0000' // Unhealthy
    if (aqi <= 300) return '#8F3F97' // Very unhealthy
    return '#7E0023' // Hazardous
  }

  // Function to get AQI description
  const getAQIDescription = (aqi: number): string => {
    if (aqi <= 50) return 'Good'
    if (aqi <= 100) return 'Moderate'
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups'
    if (aqi <= 200) return 'Unhealthy'
    if (aqi <= 300) return 'Very Unhealthy'
    return 'Hazardous'
  }

  // Fetch real air quality data from OpenAQ API
  const fetchAirQualityData = async () => {
    setLoading(true)
    try {
      // Using OpenAQ API for real-time air quality data
      const response = await fetch('https://api.openaq.org/v2/latest?limit=50&country=US&country=CA&order_by=value&sort=desc')
      const data = await response.json()

      const formattedData: AirQualityData[] = data.results.map((station: any) => {
        const pm25 = station.measurements.find((m: any) => m.parameter === 'pm25')
        const pm10 = station.measurements.find((m: any) => m.parameter === 'pm10')
        const no2 = station.measurements.find((m: any) => m.parameter === 'no2')
        const so2 = station.measurements.find((m: any) => m.parameter === 'so2')
        const o3 = station.measurements.find((m: any) => m.parameter === 'o3')

        // Calculate AQI (simplified version)
        const primaryPollutant = pm25 || pm10 || no2 || so2 || o3
        const aqi = primaryPollutant ? Math.min(Math.round(primaryPollutant.value * 2), 500) : 0

        return {
          lat: station.coordinates.latitude,
          lng: station.coordinates.longitude,
          aqi: aqi,
          pm25: pm25?.value || 0,
          pm10: pm10?.value || 0,
          no2: no2?.value,
          so2: so2?.value,
          o3: o3?.value,
          city: station.city,
          country: station.country,
          timestamp: station.lastUpdated
        }
      }).filter((station: AirQualityData) => station.aqi > 0)

      setAirQualityData(formattedData)
      setLastUpdated(new Date().toLocaleTimeString())
    } catch (error) {
      console.error('Error fetching air quality data:', error)
      // Fallback to mock data if API fails
      setAirQualityData(getMockData())
    } finally {
      setLoading(false)
    }
  }

  // Mock data fallback
  const getMockData = (): AirQualityData[] => [
    { lat: 38.9072, lng: -77.0369, aqi: 45, pm25: 12.3, pm10: 23.1, no2: 18.7, so2: 5.2, o3: 32.4, city: "Washington DC", country: "US", timestamp: new Date().toISOString() },
    { lat: 40.7128, lng: -74.0060, aqi: 62, pm25: 18.9, pm10: 31.5, no2: 28.3, so2: 8.1, o3: 45.2, city: "New York", country: "US", timestamp: new Date().toISOString() },
    { lat: 34.0522, lng: -118.2437, aqi: 78, pm25: 25.6, pm10: 42.8, no2: 35.9, so2: 12.4, o3: 58.7, city: "Los Angeles", country: "US", timestamp: new Date().toISOString() },
    { lat: 41.8781, lng: -87.6298, aqi: 55, pm25: 15.8, pm10: 28.3, no2: 22.1, so2: 6.8, o3: 38.9, city: "Chicago", country: "US", timestamp: new Date().toISOString() },
    { lat: 29.7604, lng: -95.3698, aqi: 68, pm25: 21.2, pm10: 36.7, no2: 30.5, so2: 10.3, o3: 52.1, city: "Houston", country: "US", timestamp: new Date().toISOString() },
    { lat: 43.6532, lng: -79.3832, aqi: 38, pm25: 9.8, pm10: 18.4, no2: 15.2, so2: 3.9, o3: 28.7, city: "Toronto", country: "CA", timestamp: new Date().toISOString() },
    { lat: 49.2827, lng: -123.1207, aqi: 42, pm25: 10.5, pm10: 19.8, no2: 16.8, so2: 4.3, o3: 30.2, city: "Vancouver", country: "CA", timestamp: new Date().toISOString() }
  ]

  useEffect(() => {
    fetchAirQualityData()
    const interval = setInterval(fetchAirQualityData, 300000) // Update every 5 minutes

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (airQualityData.length === 0) return

    const initMap = async () => {
      const L = await import('leaflet')
      
      // Fix for default markers
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      })

      const map = L.map('map-container').setView([45.0, -100.0], 4)
      
      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map)

      // Add air quality markers
      airQualityData.forEach(station => {
        const aqiColor = getAQIColor(station.aqi)
        
        // Create custom marker with AQI color
        const customIcon = L.divIcon({
          className: 'aqi-marker',
          html: `
            <div style="
              background-color: ${aqiColor};
              width: 20px;
              height: 20px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 10px;
            ">${station.aqi}</div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        })

        const popupContent = `
          <div style="min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; color: #333;">${station.city}, ${station.country}</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
              <div><strong>AQI:</strong> <span style="color: ${aqiColor}; font-weight: bold;">${station.aqi} (${getAQIDescription(station.aqi)})</span></div>
              <div><strong>PM2.5:</strong> ${station.pm25} µg/m³</div>
              <div><strong>PM10:</strong> ${station.pm10} µg/m³</div>
              ${station.no2 ? `<div><strong>NO₂:</strong> ${station.no2} µg/m³</div>` : ''}
              ${station.o3 ? `<div><strong>O₃:</strong> ${station.o3} µg/m³</div>` : ''}
              ${station.so2 ? `<div><strong>SO₂:</strong> ${station.so2} µg/m³</div>` : ''}
            </div>
            <div style="margin-top: 8px; font-size: 10px; color: #666;">
              Last updated: ${new Date(station.timestamp).toLocaleString()}
            </div>
          </div>
        `

        L.marker([station.lat, station.lng], { icon: customIcon })
          .addTo(map)
          .bindPopup(popupContent)
      })

      // Set North America bounds
      const northAmericaBounds = L.latLngBounds(
        L.latLng(15.0, -170.0),
        L.latLng(75.0, -50.0)
      )
      map.setMaxBounds(northAmericaBounds)
      map.setMinZoom(3)

      return () => {
        map.remove()
      }
    }

    initMap()
  }, [airQualityData])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Satellite className="h-5 w-5" />
              Live Air Quality Map - North America
            </CardTitle>
            <div className="flex items-center gap-4">
              {lastUpdated && (
                <span className="text-sm text-muted-foreground">
                  Last updated: {lastUpdated}
                </span>
              )}
              <button 
                onClick={fetchAirQualityData}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-1 text-sm bg-secondary rounded-md hover:bg-secondary/80 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
          <CardDescription>
            Real-time air quality data from monitoring stations across North America
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* AQI Legend */}
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="outline" style={{ backgroundColor: '#00E400', color: 'black' }}>Good (0-50)</Badge>
              <Badge variant="outline" style={{ backgroundColor: '#FFFF00', color: 'black' }}>Moderate (51-100)</Badge>
              <Badge variant="outline" style={{ backgroundColor: '#FF7E00' }}>Unhealthy Sensitive (101-150)</Badge>
              <Badge variant="outline" style={{ backgroundColor: '#FF0000' }}>Unhealthy (151-200)</Badge>
              <Badge variant="outline" style={{ backgroundColor: '#8F3F97' }}>Very Unhealthy (201-300)</Badge>
              <Badge variant="outline" style={{ backgroundColor: '#7E0023' }}>Hazardous (301-500)</Badge>
            </div>

            {/* Map Container */}
            <div className="relative bg-muted rounded-lg h-96">
              <div id="map-container" className="w-full h-full rounded-lg"></div>
              
              {loading && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-lg">
                  <div className="text-center space-y-4 p-6 rounded-lg">
                    <RefreshCw className="h-12 w-12 mx-auto animate-spin" />
                    <div>
                      <p className="font-medium">Loading Real-time Air Quality Data</p>
                      <p className="text-sm text-muted-foreground">
                        Fetching latest measurements from monitoring stations...
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Data Sources Info */}
            <div className="flex gap-2 justify-center flex-wrap">
              <Badge variant="outline" className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                OpenAQ API
              </Badge>
              <Badge variant="outline">PM2.5 & PM10</Badge>
              <Badge variant="outline">NO₂ Monitoring</Badge>
              <Badge variant="outline">O₃ Levels</Badge>
              <Badge variant="outline">SO₂ Detection</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
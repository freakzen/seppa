import { NextResponse } from "next/server"
import { fetchEpaAirQuality, fetchAirPollutionData } from "@/lib/api-client"
import { validateApiKeys } from "@/lib/API-CONFIG"

interface AirQualityReading {
  location: {
    lat: number
    lng: number
    name: string
    zipCode?: string
  }
  measurements: {
    aqi: number
    pm25: number
    pm10: number
    no2: number
    o3: number
    co: number
  }
  source: "EPA_AirNow" | "OpenWeather" | "Combined" | "Mock" | "EPA_AirNow + TEMPO" | "TEMPO"
  timestamp: string
  dataAvailable: boolean
}

function transformEpaData(
  epaData: any[],
  location: { lat: number; lng: number; name: string; zipCode?: string },
): AirQualityReading {
  const measurements = {
    aqi: 0,
    pm25: 0,
    pm10: 0,
    no2: 0,
    o3: 0,
    co: 0,
  }

  // EPA AirNow returns array of measurements by parameter
  epaData.forEach((reading) => {
    const parameterName = reading.ParameterName?.toLowerCase()
    const aqi = reading.AQI || 0
    const concentration = reading.Value || 0

    if (parameterName?.includes("pm2.5")) {
      measurements.pm25 = concentration
      measurements.aqi = Math.max(measurements.aqi, aqi)
    } else if (parameterName?.includes("pm10")) {
      measurements.pm10 = concentration
      measurements.aqi = Math.max(measurements.aqi, aqi)
    } else if (parameterName?.includes("ozone") || parameterName?.includes("o3")) {
      measurements.o3 = concentration
      measurements.aqi = Math.max(measurements.aqi, aqi)
    } else if (parameterName?.includes("no2")) {
      measurements.no2 = concentration
      measurements.aqi = Math.max(measurements.aqi, aqi)
    } else if (parameterName?.includes("co")) {
      measurements.co = concentration
      measurements.aqi = Math.max(measurements.aqi, aqi)
    }
  })

  return {
    location,
    measurements,
    source: "EPA_AirNow",
    timestamp: new Date().toISOString(),
    dataAvailable: epaData.length > 0,
  }
}

async function getFallbackData(lat: number, lng: number): Promise<AirQualityReading> {
  try {
    const airPollutionData = await fetchAirPollutionData(lat, lng)
    const components = airPollutionData.list[0]?.components || {}

    return {
      location: { lat, lng, name: `${lat.toFixed(2)}, ${lng.toFixed(2)}` },
      measurements: {
        aqi: airPollutionData.list[0]?.main?.aqi * 50 || 50, // Convert 1-5 scale to AQI
        pm25: components.pm2_5 || 0,
        pm10: components.pm10 || 0,
        no2: components.no2 || 0,
        o3: components.o3 || 0,
        co: components.co || 0,
      },
      source: "OpenWeather",
      timestamp: new Date().toISOString(),
      dataAvailable: true,
    }
  } catch (error) {
    console.error("[ OpenWeather fallback failed:", error)
    throw error
  }
}

function getMockData(lat: number, lng: number): AirQualityReading {
  return {
    location: {
      lat,
      lng,
      name: "Mock Location",
    },
    measurements: {
      aqi: Math.floor(Math.random() * 150) + 50,
      pm25: Math.random() * 50 + 10,
      pm10: Math.random() * 80 + 20,
      no2: Math.random() * 60 + 15,
      o3: Math.random() * 100 + 30,
      co: Math.random() * 3 + 0.5,
    },
    source: "Mock",
    timestamp: new Date().toISOString(),
    dataAvailable: true,
  }
}

async function getTempoData(lat: number, lng: number): Promise<any> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000")

    const response = await fetch(`${baseUrl}/api/tempo?lat=${lat}&lng=${lng}`, {
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (response.ok) {
      return await response.json()
    } else {
      console.error("[ TEMPO API response not ok:", response.status)
      return null
    }
  } catch (error) {
    console.error("[strawhats] Failed to fetch TEMPO data:", error)
    return null
  }
}

function combineDataSources(epaData: any[], tempoData: any, weatherData: any, location: any): AirQualityReading {
  const measurements = {
    aqi: 0,
    pm25: 0,
    pm10: 0,
    no2: 0,
    o3: 0,
    co: 0,
  }

  let dataSource = "Combined"
  let hasEpaData = false
  let hasTempoData = false

  // Process EPA ground sensor data
  if (epaData && epaData.length > 0) {
    hasEpaData = true
    epaData.forEach((reading) => {
      const parameterName = reading.ParameterName?.toLowerCase()
      const aqi = reading.AQI || 0
      const concentration = reading.Value || 0

      if (parameterName?.includes("pm2.5")) {
        measurements.pm25 = concentration
        measurements.aqi = Math.max(measurements.aqi, aqi)
      } else if (parameterName?.includes("pm10")) {
        measurements.pm10 = concentration
        measurements.aqi = Math.max(measurements.aqi, aqi)
      } else if (parameterName?.includes("ozone") || parameterName?.includes("o3")) {
        measurements.o3 = concentration
        measurements.aqi = Math.max(measurements.aqi, aqi)
      } else if (parameterName?.includes("no2")) {
        measurements.no2 = concentration
        measurements.aqi = Math.max(measurements.aqi, aqi)
      } else if (parameterName?.includes("co")) {
        measurements.co = concentration
        measurements.aqi = Math.max(measurements.aqi, aqi)
      }
    })
  }

  // Enhance with TEMPO satellite data
  if (tempoData && tempoData.measurements) {
    hasTempoData = true
    const tempo = tempoData.measurements

    // Convert TEMPO column measurements to surface concentrations (simplified conversion)
    if (!measurements.no2 && tempo.no2_column) {
      measurements.no2 = tempo.no2_column * 0.8 // Approximate surface conversion
    }
    if (!measurements.o3 && tempo.o3_column) {
      measurements.o3 = tempo.o3_column * 0.6
    }

    // Use TEMPO data to enhance AQI calculation if no ground data
    if (!hasEpaData) {
      const tempoAqi = Math.max(tempo.no2_column * 2, tempo.o3_column * 1.5, tempo.aerosol_optical_depth * 100)
      measurements.aqi = Math.min(200, Math.max(20, tempoAqi))
    }
  }

  // Enhance with weather data if available
  if (weatherData && weatherData.list && weatherData.list[0]) {
    const components = weatherData.list[0].components || {}
    if (!measurements.pm25 && components.pm2_5) measurements.pm25 = components.pm2_5
    if (!measurements.pm10 && components.pm10) measurements.pm10 = components.pm10
    if (!measurements.no2 && components.no2) measurements.no2 = components.no2
    if (!measurements.o3 && components.o3) measurements.o3 = components.o3
    if (!measurements.co && components.co) measurements.co = components.co
  }

  // ENSURE ALL VALUES ARE POPULATED - ADD FALLBACK VALUES
  if (measurements.pm25 === 0) measurements.pm25 = 12.5 // Typical urban PM2.5
  if (measurements.pm10 === 0) measurements.pm10 = 23.8 // Typical urban PM10
  if (measurements.co === 0) measurements.co = 0.8 // Typical urban CO
  if (measurements.no2 === 0) measurements.no2 = 18.2 // Typical urban NO2
  if (measurements.o3 === 0) measurements.o3 = 34.7 // Typical urban O3
  if (measurements.aqi === 0) {
    // Calculate AQI from pollutant values if not set
    const maxPollutant = Math.max(measurements.pm25, measurements.pm10, measurements.no2, measurements.o3)
    measurements.aqi = Math.min(200, Math.max(20, maxPollutant * 2))
  }

  // Determine data source priority
  if (hasEpaData && hasTempoData) {
    dataSource = "EPA_AirNow + TEMPO"
  } else if (hasEpaData) {
    dataSource = "EPA_AirNow"
  } else if (hasTempoData) {
    dataSource = "TEMPO"
  } else if (weatherData) {
    dataSource = "OpenWeather"
  } else {
    dataSource = "Mock"
  }

  return {
    location,
    measurements,
    source: dataSource as any,
    timestamp: new Date().toISOString(),
    dataAvailable: hasEpaData || hasTempoData || !!weatherData,
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get("lat")
  const lng = searchParams.get("lng")
  const zipCode = searchParams.get("zipCode")

  // Default to Washington, DC coordinates
  const latitude = lat ? Number.parseFloat(lat) : 38.9072
  const longitude = lng ? Number.parseFloat(lng) : -77.0369
  const zip = zipCode || "20001"

  console.log("[strawhats] Fetching comprehensive air quality data for:", { latitude, longitude, zip })

  try {
    let epaData = null
    let tempoData = null
    let weatherData = null

    const availableApis = validateApiKeys()

    // Fetch EPA AirNow data if API key is available
    if (availableApis.epa) {
      try {
        console.log("[strawhats] Attempting EPA AirNow API call...")
        epaData = await fetchEpaAirQuality(zip)
        console.log("[strawhats] EPA AirNow response:", epaData?.length || 0, "readings")
        
        // DEBUG: Log what parameters we received from EPA
        if (epaData && epaData.length > 0) {
          console.log("[strawhats] EPA Parameters received:", epaData.map((r: any) => ({
            parameter: r.ParameterName,
            value: r.Value,
            aqi: r.AQI
          })))
        }
      } catch (epaError) {
        console.error("[strawhats] EPA AirNow API failed:", epaError)
      }
    } else {
      console.log("[strawhats] EPA AirNow API key not available, skipping...")
    }

    // Fetch weather-based air pollution data if API key is available
    if (availableApis.openweather) {
      try {
        console.log("[strawhats] Attempting OpenWeather air pollution API call...")
        weatherData = await fetchAirPollutionData(latitude, longitude)
        console.log("[strawhats] OpenWeather air pollution data received")
        
        // DEBUG: Log OpenWeather components
        if (weatherData && weatherData.list && weatherData.list[0]) {
          console.log("[strawhats] OpenWeather components:", weatherData.list[0].components)
        }
      } catch (weatherError) {
        console.error("[strawhats] OpenWeather API failed:", weatherError)
      }
    } else {
      console.log("[strawhats] OpenWeather API key not available, skipping...")
    }

    // Fetch TEMPO satellite data
    try {
      console.log("[strawhats] Attempting TEMPO satellite data fetch...")
      tempoData = await getTempoData(latitude, longitude)
      console.log("[strawhats] TEMPO data received:", tempoData?.data_source)
    } catch (tempoError) {
      console.error("[strawhats] TEMPO data fetch failed:", tempoError)
    }

    const locationName = epaData?.[0]?.ReportingArea || `${latitude}, ${longitude}`
    const location = {
      lat: latitude,
      lng: longitude,
      name: locationName,
      zipCode: zip,
    }

    // Combine all data sources
    const result = combineDataSources(epaData, tempoData, weatherData, location)
    console.log("[strawhats] Returning combined air quality data from:", result.source)
    console.log("[strawhats] Final measurements:", result.measurements)

    return NextResponse.json(result)
  } catch (error) {
    console.error("[strawhats] Air quality API error:", error)

    // Return mock data on any error
    const mockData = getMockData(latitude, longitude)
    return NextResponse.json(mockData, { status: 200 })
  }
}
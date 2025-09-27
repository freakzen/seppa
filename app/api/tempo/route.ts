import { NextResponse } from "next/server"
import { fetchTempoSatelliteData, fetchTempoTroposphericData, generateSimulatedTempoData } from "@/lib/api-client"
import { validateApiKeys } from "@/lib/api-config"

interface TempoSatelliteData {
  satellite: string
  timestamp: string
  location: {
    latitude: number
    longitude: number
  }
  measurements: {
    no2_column: number
    o3_column: number
    so2_column: number
    hcho_column: number
    aerosol_optical_depth: number
    cloud_fraction: number
  }
  quality_flags: {
    no2_quality: string
    o3_quality: string
    overall_quality: string
  }
  spatial_resolution: string
  overpass_time: string
  data_source: "NASA_TEMPO_Real" | "NASA_TEMPO_Simulated"
}

function transformTempoData(rawData: any, lat: number, lon: number): TempoSatelliteData {
  // Transform real NASA TEMPO data format to our standardized format
  return {
    satellite: "TEMPO",
    timestamp: rawData.timestamp || new Date().toISOString(),
    location: {
      latitude: lat,
      longitude: lon,
    },
    measurements: {
      no2_column: rawData.no2_tropospheric_column || rawData.no2_column || 0,
      o3_column: rawData.o3_tropospheric_column || rawData.o3_column || 0,
      so2_column: rawData.so2_tropospheric_column || rawData.so2_column || 0,
      hcho_column: rawData.hcho_tropospheric_column || rawData.hcho_column || 0,
      aerosol_optical_depth: rawData.aerosol_optical_depth || 0,
      cloud_fraction: rawData.cloud_fraction || 0,
    },
    quality_flags: {
      no2_quality: rawData.no2_quality_flag || "unknown",
      o3_quality: rawData.o3_quality_flag || "unknown",
      overall_quality: rawData.overall_quality_flag || "unknown",
    },
    spatial_resolution: rawData.spatial_resolution || "2.1km x 4.4km",
    overpass_time: rawData.overpass_time || new Date().toISOString(),
    data_source: "NASA_TEMPO_Real",
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get("lat")
  const lng = searchParams.get("lng")
  const date = searchParams.get("date")

  // Default to Washington, DC coordinates
  const latitude = lat ? Number.parseFloat(lat) : 38.9072
  const longitude = lng ? Number.parseFloat(lng) : -77.0369

  console.log("[v0] Fetching TEMPO satellite data for:", { latitude, longitude, date })

  try {
    const availableApis = validateApiKeys()

    if (availableApis.tempo) {
      try {
        console.log("[v0] Attempting NASA TEMPO API call...")

        // Try both satellite data endpoints
        let tempoData = null
        try {
          tempoData = await fetchTempoSatelliteData(latitude, longitude, date ?? undefined)
        } catch (error) {
          console.log("[v0] Satellite endpoint failed, trying tropospheric endpoint...")
          tempoData = await fetchTempoTroposphericData(latitude, longitude)
        }

        if (tempoData) {
          console.log("[v0] NASA TEMPO data received:", tempoData)
          const transformedData = transformTempoData(tempoData, latitude, longitude)
          return NextResponse.json(transformedData)
        }
      } catch (tempoError) {
        console.error("[v0] NASA TEMPO API failed:", tempoError)
      }
    } else {
      console.log("[v0] NASA TEMPO API key not available, using simulated data")
    }

    // Fallback to simulated TEMPO data
    console.log("[v0] Using simulated TEMPO data")
    const simulatedData = generateSimulatedTempoData(latitude, longitude)
    const result: TempoSatelliteData = {
      ...simulatedData,
      data_source: "NASA_TEMPO_Simulated",
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] TEMPO API error:", error)

    // Return simulated data on error
    const fallbackData = generateSimulatedTempoData(latitude, longitude)
    return NextResponse.json(
      {
        ...fallbackData,
        data_source: "NASA_TEMPO_Simulated",
      },
      { status: 200 },
    )
  }
}

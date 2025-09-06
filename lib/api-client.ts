import { API_CONFIG } from "./api-config"

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export async function fetchWithErrorHandling(url: string, options?: RequestInit) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    })

    if (!response.ok) {
      throw new ApiError(`HTTP error! status: ${response.status}`, response.status)
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(`Network error: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export function buildApiUrl(baseUrl: string, endpoint: string, params: Record<string, string | number> = {}) {
  const url = new URL(endpoint, baseUrl)
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value.toString())
  })
  return url.toString()
}

// EPA AirNow API helpers
export async function fetchEpaAirQuality(zipCode: string) {
  if (!API_CONFIG.EPA_AIRNOW.API_KEY) {
    throw new ApiError("EPA AirNow API key not configured")
  }

  const url = buildApiUrl(API_CONFIG.EPA_AIRNOW.BASE_URL, API_CONFIG.EPA_AIRNOW.ENDPOINTS.CURRENT_CONDITIONS, {
    format: "application/json",
    zipCode,
    distance: "25",
    API_KEY: API_CONFIG.EPA_AIRNOW.API_KEY,
  })

  return fetchWithErrorHandling(url)
}

// OpenWeather API helpers
export async function fetchWeatherData(lat: number, lon: number) {
  if (!API_CONFIG.WEATHER.OPENWEATHER.API_KEY) {
    throw new ApiError("OpenWeather API key not configured")
  }

  const url = buildApiUrl(API_CONFIG.WEATHER.OPENWEATHER.BASE_URL, API_CONFIG.WEATHER.OPENWEATHER.ENDPOINTS.CURRENT, {
    lat: lat.toString(),
    lon: lon.toString(),
    appid: API_CONFIG.WEATHER.OPENWEATHER.API_KEY,
    units: "metric",
  })

  return fetchWithErrorHandling(url)
}

export async function fetchAirPollutionData(lat: number, lon: number) {
  if (!API_CONFIG.WEATHER.OPENWEATHER.API_KEY) {
    throw new ApiError("OpenWeather API key not configured")
  }

  const url = buildApiUrl(
    API_CONFIG.WEATHER.OPENWEATHER.BASE_URL,
    API_CONFIG.WEATHER.OPENWEATHER.ENDPOINTS.AIR_POLLUTION,
    {
      lat: lat.toString(),
      lon: lon.toString(),
      appid: API_CONFIG.WEATHER.OPENWEATHER.API_KEY,
    },
  )

  return fetchWithErrorHandling(url)
}

// NASA TEMPO satellite data integration functions
export async function fetchTempoSatelliteData(lat: number, lon: number, date?: string) {
  if (!API_CONFIG.TEMPO.API_KEY) {
    throw new ApiError("NASA TEMPO API key not configured")
  }

  const targetDate = date || new Date().toISOString().split("T")[0]

  const url = buildApiUrl(API_CONFIG.TEMPO.BASE_URL, API_CONFIG.TEMPO.ENDPOINTS.SATELLITE_DATA, {
    lat: lat.toString(),
    lon: lon.toString(),
    date: targetDate,
    api_key: API_CONFIG.TEMPO.API_KEY,
  })

  return fetchWithErrorHandling(url)
}

export async function fetchTempoTroposphericData(lat: number, lon: number) {
  if (!API_CONFIG.TEMPO.API_KEY) {
    throw new ApiError("NASA TEMPO API key not configured")
  }

  const url = buildApiUrl(API_CONFIG.TEMPO.BASE_URL, API_CONFIG.TEMPO.ENDPOINTS.TROPOSPHERIC_DATA, {
    latitude: lat.toString(),
    longitude: lon.toString(),
    api_key: API_CONFIG.TEMPO.API_KEY,
    format: "json",
  })

  return fetchWithErrorHandling(url)
}

// Simulate TEMPO data structure based on NASA specifications
export function generateSimulatedTempoData(lat: number, lon: number) {
  const now = new Date()
  const timeOfDay = now.getHours()

  // Simulate realistic TEMPO measurements
  const baseNO2 = 15 + Math.sin(((timeOfDay - 8) / 12) * Math.PI) * 8 // Peak during rush hours
  const baseO3 = 40 + Math.sin(((timeOfDay - 14) / 12) * Math.PI) * 20 // Peak in afternoon
  const baseSO2 = 5 + Math.random() * 3
  const baseHCHO = 2 + Math.random() * 1.5

  return {
    satellite: "TEMPO",
    timestamp: now.toISOString(),
    location: { latitude: lat, longitude: lon },
    measurements: {
      no2_column: baseNO2 + (Math.random() - 0.5) * 4, // molecules/cm²
      o3_column: baseO3 + (Math.random() - 0.5) * 8,
      so2_column: baseSO2 + (Math.random() - 0.5) * 2,
      hcho_column: baseHCHO + (Math.random() - 0.5) * 1,
      aerosol_optical_depth: 0.1 + Math.random() * 0.3,
      cloud_fraction: Math.random() * 0.8,
    },
    quality_flags: {
      no2_quality: Math.random() > 0.2 ? "good" : "moderate",
      o3_quality: Math.random() > 0.15 ? "good" : "moderate",
      overall_quality: Math.random() > 0.1 ? "good" : "moderate",
    },
    spatial_resolution: "2.1km x 4.4km", // TEMPO's native resolution
    overpass_time: now.toISOString(),
  }
}

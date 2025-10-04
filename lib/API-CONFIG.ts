export const API_CONFIG = {
  EPA_AIRNOW: {
    BASE_URL: process.env.EPA_AIRNOW_BASE_URL || "https://www.airnowapi.org",
    API_KEY: process.env.EPA_AIRNOW_API_KEY,
    ENDPOINTS: {
      CURRENT_CONDITIONS: "/aq/observation/zipCode/current",
      FORECAST: "/aq/forecast/zipCode",
      HISTORICAL: "/aq/observation/zipCode/historical",
    },
  },
  TEMPO: {
    BASE_URL: process.env.TEMPO_BASE_URL || "https://api.nasa.gov/tempo",
    API_KEY: process.env.TEMPO_API_KEY,
    ENDPOINTS: {
      SATELLITE_DATA: "/satellite/air-quality",
      TROPOSPHERIC_DATA: "/tropospheric/pollution",
    },
  },
  WEATHER: {
    OPENWEATHER: {
      BASE_URL: "https://api.openweathermap.org/data/2.5",
      API_KEY: process.env.OPENWEATHER_API_KEY,
      ENDPOINTS: {
        CURRENT: "/weather",
        FORECAST: "/forecast",
        AIR_POLLUTION: "/air_pollution",
      },
    },
  },
}

export const validateApiKeys = () => {
  console.log("[strawhats] Environment variable debugging:")
  console.log("[strawhats] EPA_AIRNOW_API_KEY:", process.env.EPA_AIRNOW_API_KEY ? "SET" : "NOT SET")
  console.log("[strawhats] OPENWEATHER_API_KEY:", process.env.OPENWEATHER_API_KEY ? "SET" : "NOT SET")
  console.log("[strawhats] TEMPO_API_KEY:", process.env.TEMPO_API_KEY ? "SET" : "NOT SET")

  const available = {
    epa: !!API_CONFIG.EPA_AIRNOW.API_KEY,
    openweather: !!API_CONFIG.WEATHER.OPENWEATHER.API_KEY,
    tempo: !!API_CONFIG.TEMPO.API_KEY,
  }

  console.log("[strawhats] API availability:", available)

  const missing = []
  if (!available.epa) missing.push("EPA_AIRNOW_API_KEY")
  if (!available.openweather) missing.push("OPENWEATHER_API_KEY")
  if (!available.tempo) missing.push("TEMPO_API_KEY")

  if (missing.length > 0) {
    console.warn(`[strawhats] Missing API keys: ${missing.join(", ")}`)
    console.warn("[strawhats] App will use available APIs and fallback to simulated data where needed.")
  }

  return available
}

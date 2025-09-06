import { NextResponse } from "next/server"

interface HealthAlert {
  id: string
  severity: "info" | "warning" | "danger" | "emergency"
  title: string
  description: string
  recommendations: string[]
  affectedGroups: string[]
  timestamp: string
  expiresAt?: string
  location?: string
  pollutants?: string[]
}

class HealthAlertSystem {
  static generateAlerts(currentAqi: number, forecastData?: any[]): HealthAlert[] {
    const alerts: HealthAlert[] = []
    const now = new Date()

    // Current condition alerts
    if (currentAqi > 150) {
      alerts.push({
        id: `current-${Date.now()}`,
        severity: currentAqi > 200 ? "emergency" : "danger",
        title: currentAqi > 200 ? "EMERGENCY: Hazardous Air Quality" : "Unhealthy Air Quality Alert",
        description: `Current AQI of ${currentAqi} poses health risks to all individuals`,
        recommendations: [
          "Avoid all outdoor activities",
          "Keep windows and doors closed",
          "Use air purifiers if available",
          "Seek medical attention if experiencing symptoms",
        ],
        affectedGroups: ["Everyone"],
        timestamp: now.toISOString(),
        location: "Washington, DC",
        pollutants: ["PM2.5", "PM10", "Ozone"],
      })
    } else if (currentAqi > 100) {
      alerts.push({
        id: `moderate-${Date.now()}`,
        severity: "warning",
        title: "Air Quality Alert for Sensitive Groups",
        description: `AQI of ${currentAqi} may cause health effects for sensitive individuals`,
        recommendations: [
          "Sensitive groups should limit outdoor activities",
          "Consider moving exercise indoors",
          "Monitor air quality throughout the day",
        ],
        affectedGroups: ["Children", "Elderly", "People with respiratory conditions"],
        timestamp: now.toISOString(),
        location: "Washington, DC",
        pollutants: ["PM2.5", "Ozone"],
      })
    }

    // Forecast-based proactive alerts
    if (Math.random() > 0.6) {
      // Simulate forecast indicating changes
      alerts.push({
        id: `forecast-${Date.now()}`,
        severity: "warning",
        title: "Air Quality Expected to Deteriorate",
        description:
          "Forecast models predict AQI will exceed 120 in the next 4 hours due to stagnant weather conditions",
        recommendations: [
          "Complete outdoor activities before conditions worsen",
          "Prepare indoor alternatives for planned activities",
          "Close windows and prepare air filtration systems",
        ],
        affectedGroups: ["Sensitive groups", "Outdoor workers", "Athletes"],
        timestamp: now.toISOString(),
        expiresAt: new Date(now.getTime() + 8 * 60 * 60 * 1000).toISOString(),
        location: "Washington, DC",
      })
    }

    // Special event alerts (wildfires, industrial incidents, etc.)
    if (Math.random() > 0.8) {
      alerts.push({
        id: `event-${Date.now()}`,
        severity: "danger",
        title: "Wildfire Smoke Advisory",
        description: "Smoke from regional wildfires is affecting local air quality",
        recommendations: [
          "Stay indoors with windows closed",
          "Avoid outdoor exercise and activities",
          "Use air purifiers with HEPA filters",
          "Check on vulnerable family members and neighbors",
        ],
        affectedGroups: ["Everyone", "Especially sensitive groups"],
        timestamp: now.toISOString(),
        expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        location: "Regional",
        pollutants: ["PM2.5", "PM10", "Carbon Monoxide"],
      })
    }

    // Health advisory for specific pollutants
    if (currentAqi > 80) {
      alerts.push({
        id: `pollutant-${Date.now()}`,
        severity: "info",
        title: "Elevated Ozone Levels",
        description: "Ground-level ozone concentrations are elevated due to sunny, warm conditions",
        recommendations: [
          "Limit outdoor activities during peak sun hours (10 AM - 4 PM)",
          "Choose early morning or evening for outdoor exercise",
          "Stay hydrated and take frequent breaks if outdoors",
        ],
        affectedGroups: ["People with asthma", "Children", "Outdoor workers"],
        timestamp: now.toISOString(),
        expiresAt: new Date(now.getTime() + 12 * 60 * 60 * 1000).toISOString(),
        pollutants: ["Ozone"],
      })
    }

    return alerts
  }

  static getHealthImpactAssessment(aqi: number) {
    return {
      immediateEffects: this.getImmediateEffects(aqi),
      longTermRisks: this.getLongTermRisks(aqi),
      vulnerablePopulations: this.getVulnerablePopulations(aqi),
      protectiveMeasures: this.getProtectiveMeasures(aqi),
    }
  }

  private static getImmediateEffects(aqi: number) {
    if (aqi <= 50) return ["None for healthy individuals"]
    if (aqi <= 100) return ["Possible minor irritation for sensitive individuals"]
    if (aqi <= 150) return ["Eye irritation", "Throat irritation", "Coughing for sensitive groups"]
    if (aqi <= 200) return ["Breathing difficulties", "Chest tightness", "Reduced lung function"]
    return ["Serious respiratory symptoms", "Cardiovascular stress", "Emergency medical attention may be needed"]
  }

  private static getLongTermRisks(aqi: number) {
    if (aqi <= 100) return ["Minimal long-term health risks"]
    if (aqi <= 150) return ["Increased risk of respiratory infections", "Accelerated lung function decline"]
    return ["Cardiovascular disease", "Chronic respiratory conditions", "Premature mortality risk"]
  }

  private static getVulnerablePopulations(aqi: number) {
    const base = ["Children", "Elderly (65+)", "Pregnant women"]
    if (aqi > 50) base.push("People with asthma", "Heart disease patients")
    if (aqi > 100) base.push("Outdoor workers", "Athletes")
    return base
  }

  private static getProtectiveMeasures(aqi: number) {
    const measures = ["Monitor air quality regularly"]
    if (aqi > 50) measures.push("Limit prolonged outdoor exertion")
    if (aqi > 100) measures.push("Use air purifiers indoors", "Keep windows closed")
    if (aqi > 150) measures.push("Wear N95 masks outdoors", "Avoid all outdoor activities")
    return measures
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const aqi = Number.parseInt(searchParams.get("aqi") || "85")

  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 300))

  try {
    const alerts = HealthAlertSystem.generateAlerts(aqi)
    const healthImpact = HealthAlertSystem.getHealthImpactAssessment(aqi)

    return NextResponse.json({
      alerts,
      healthImpact,
      metadata: {
        generatedAt: new Date().toISOString(),
        alertCount: alerts.length,
        highestSeverity: alerts.reduce((max, alert) => {
          const severityLevels = { info: 1, warning: 2, danger: 3, emergency: 4 }
          return severityLevels[alert.severity as keyof typeof severityLevels] >
            severityLevels[max as keyof typeof severityLevels]
            ? alert.severity
            : max
        }, "info"),
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate health alerts" }, { status: 500 })
  }
}

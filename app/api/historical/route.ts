import { NextResponse } from "next/server"

export async function GET() {
  // Simulate fetching historical data for trends analysis
  await new Promise((resolve) => setTimeout(resolve, 500))

  const trends = []
  const now = new Date()

  // Generate 24 hours of historical data
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000)
    const hour = time.getHours()

    // Realistic diurnal pattern with traffic peaks
    let baseAqi = 50 + Math.sin(((hour - 6) / 24) * 2 * Math.PI) * 25
    if (hour >= 7 && hour <= 9) baseAqi += 20 // Morning rush
    if (hour >= 17 && hour <= 19) baseAqi += 15 // Evening rush

    trends.push({
      time: time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      aqi: Math.max(20, Math.round(baseAqi + (Math.random() - 0.5) * 20)),
      pm25: Math.max(5, Math.round(baseAqi * 0.4 + (Math.random() - 0.5) * 10)),
      no2: Math.max(10, Math.round(baseAqi * 0.5 + (Math.random() - 0.5) * 15)),
    })
  }

  return NextResponse.json({ trends })
}

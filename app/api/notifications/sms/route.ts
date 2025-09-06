import { NextResponse } from "next/server"

interface SMSNotificationRequest {
  to: string
  message: string
  severity: "info" | "warning" | "danger" | "emergency"
}

class SMSNotificationService {
  static async sendSMS(request: SMSNotificationRequest): Promise<boolean> {
    try {
      // In production, integrate with SMS service like:
      // - Twilio
      // - AWS SNS
      // - Vonage (Nexmo)
      // - MessageBird

      console.log("Sending SMS notification:", {
        to: request.to,
        message: request.message,
        severity: request.severity,
        timestamp: new Date().toISOString(),
      })

      // Simulate SMS sending delay
      await new Promise((resolve) => setTimeout(resolve, 300))

      // Simulate success/failure
      if (Math.random() > 0.05) {
        // 95% success rate
        return true
      } else {
        throw new Error("SMS delivery failed")
      }
    } catch (error) {
      console.error("SMS notification failed:", error)
      return false
    }
  }

  static formatSMSMessage(message: string, severity: string): string {
    const prefix =
      severity === "emergency"
        ? "🚨 EMERGENCY"
        : severity === "danger"
          ? "⚠️ ALERT"
          : severity === "warning"
            ? "⚠️ WARNING"
            : "ℹ️ INFO"

    // SMS messages should be concise (160 characters max for single SMS)
    const maxLength = 140 // Leave room for prefix
    const truncatedMessage = message.length > maxLength ? message.substring(0, maxLength - 3) + "..." : message

    return `${prefix}: ${truncatedMessage}`
  }
}

export async function POST(request: Request) {
  try {
    const body: SMSNotificationRequest = await request.json()

    // Validate request
    if (!body.to || !body.message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^\+?[\d\s\-$$$$]+$/
    if (!phoneRegex.test(body.to)) {
      return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 })
    }

    // Format message for SMS
    const formattedMessage = SMSNotificationService.formatSMSMessage(body.message, body.severity)

    // Send SMS
    const success = await SMSNotificationService.sendSMS({
      ...body,
      message: formattedMessage,
    })

    if (success) {
      return NextResponse.json({
        success: true,
        message: "SMS notification sent successfully",
        timestamp: new Date().toISOString(),
      })
    } else {
      return NextResponse.json({ error: "Failed to send SMS notification" }, { status: 500 })
    }
  } catch (error) {
    console.error("SMS notification API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

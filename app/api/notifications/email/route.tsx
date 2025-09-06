import { NextResponse } from "next/server"

interface EmailNotificationRequest {
  to: string
  subject: string
  message: string
  severity: "info" | "warning" | "danger" | "emergency"
}

class EmailNotificationService {
  static async sendEmail(request: EmailNotificationRequest): Promise<boolean> {
    try {
      // In production, integrate with email service like:
      // - SendGrid
      // - AWS SES
      // - Resend
      // - Nodemailer with SMTP

      console.log("Sending email notification:", {
        to: request.to,
        subject: request.subject,
        message: request.message,
        severity: request.severity,
        timestamp: new Date().toISOString(),
      })

      // Simulate email sending delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Simulate success/failure
      if (Math.random() > 0.1) {
        // 90% success rate
        return true
      } else {
        throw new Error("Email delivery failed")
      }
    } catch (error) {
      console.error("Email notification failed:", error)
      return false
    }
  }

  static generateEmailTemplate(subject: string, message: string, severity: string): string {
    const severityColors = {
      info: "#3b82f6",
      warning: "#f59e0b",
      danger: "#ef4444",
      emergency: "#dc2626",
    }

    const color = severityColors[severity as keyof typeof severityColors] || "#3b82f6"

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: ${color}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">${subject}</h1>
          </div>
          <div style="background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #ddd;">
            <p style="font-size: 16px; margin-bottom: 20px;">${message}</p>
            <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid ${color};">
              <p style="margin: 0; font-weight: bold;">Air Quality Monitor</p>
              <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">
                Stay informed about air quality conditions in your area.
              </p>
            </div>
            <p style="font-size: 12px; color: #888; margin-top: 20px;">
              You received this notification because you subscribed to air quality alerts.
              <a href="#" style="color: ${color};">Manage your preferences</a>
            </p>
          </div>
        </body>
      </html>
    `
  }
}

export async function POST(request: Request) {
  try {
    const body: EmailNotificationRequest = await request.json()

    // Validate request
    if (!body.to || !body.subject || !body.message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Send email
    const success = await EmailNotificationService.sendEmail(body)

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Email notification sent successfully",
        timestamp: new Date().toISOString(),
      })
    } else {
      return NextResponse.json({ error: "Failed to send email notification" }, { status: 500 })
    }
  } catch (error) {
    console.error("Email notification API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

self.addEventListener("install", (event) => {
  console.log("Service Worker installing...")
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...")
  event.waitUntil(self.clients.claim())
})

self.addEventListener("push", (event) => {
  console.log("Push notification received:", event)

  if (event.data) {
    const data = event.data.json()

    const options = {
      body: data.message || "Air quality alert",
      icon: "/icon-192x192.png",
      badge: "/badge-72x72.png",
      tag: data.tag || "air-quality-alert",
      requireInteraction: data.severity === "emergency",
      actions: [
        {
          action: "view",
          title: "View Details",
        },
        {
          action: "dismiss",
          title: "Dismiss",
        },
      ],
      data: {
        url: data.url || "/",
        severity: data.severity || "info",
      },
    }

    event.waitUntil(self.registration.showNotification(data.title || "Air Quality Alert", options))
  }
})

self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event)

  event.notification.close()

  if (event.action === "view") {
    // Open the app to view details
    event.waitUntil(self.clients.openWindow(event.notification.data.url || "/"))
  } else if (event.action === "dismiss") {
    // Just close the notification
    return
  } else {
    // Default action - open the app
    event.waitUntil(self.clients.openWindow("/"))
  }
})

self.addEventListener("notificationclose", (event) => {
  console.log("Notification closed:", event)
  // Track notification dismissal analytics here if needed
})

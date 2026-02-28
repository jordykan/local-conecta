/* =====================================================
   Local Conecta - Service Worker (iOS Safe Version)
   Compatible:
   ✅ iOS PWA
   ✅ Android
   ✅ Desktop
===================================================== */

const STATIC_CACHE = "local-conecta-static-v3";
const DYNAMIC_CACHE = "local-conecta-dynamic-v3";

const STATIC_ASSETS = ["/", "/offline.html", "/manifest.json", "/icon.svg"];

/* ===============================
   INSTALL
================================ */
self.addEventListener("install", (event) => {
  console.log("[SW] Installing...");

  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }),
  );

  self.skipWaiting();
});

/* ===============================
   ACTIVATE
================================ */
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating...");

  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
            .map((key) => caches.delete(key)),
        ),
      ),
  );

  self.clients.claim();
});

/* ===============================
   FETCH (Network First)
================================ */
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (url.origin !== location.origin) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        // ✅ Solo cachear solicitudes GET (Cache API no soporta POST/PUT/DELETE)
        if (response && response.status === 200 && request.method === "GET") {
          const clone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, clone);
          });
        }
        return response;
      })
      .catch(() =>
        caches.match(request).then((cached) => {
          if (cached) return cached;

          if (request.destination === "document") {
            return caches.match("/offline.html");
          }

          return new Response("Offline", { status: 503 });
        }),
      ),
  );
});

/* ===============================
   PUSH (🔥 iOS SAFE)
================================ */
self.addEventListener("push", (event) => {
  console.log("🔥 PUSH EVENT RECEIVED - Service Worker awakened");
  console.log("[SW] Event data exists:", !!event.data);

  let data = {};

  if (event.data) {
    try {
      data = event.data.json();
      console.log("[SW] Payload parsed successfully:", data);
    } catch (err) {
      console.warn("[SW] Failed to parse as JSON, trying text:", err);
      try {
        data = JSON.parse(event.data.text());
        console.log("[SW] Parsed from text:", data);
      } catch {
        console.error("[SW] All parsing failed, using fallback");
        data = {
          title: "Mercadito",
          body: event.data.text() || "Nueva notificación",
        };
      }
    }
  } else {
    console.warn("[SW] No event.data, using default");
    data = {
      title: "Mercadito",
      body: "Notificación recibida",
    };
  }

  const title = data.title || "Mercadito";

  // ✅ iOS-compatible notification options
  const options = {
    body: data.body || "Nueva notificación",
    icon: data.icon || "/icon.svg",
    badge: "/icon.svg",
    data: {
      url: data.url || "/",
    },
    tag: data.tag || "default",
    requireInteraction: false, // iOS compatibility
    silent: false, // Ensure notification is visible
  };

  console.log("[SW] Showing notification:", title, options);

  event.waitUntil(
    self.registration
      .showNotification(title, options)
      .then(() => console.log("✅ [SW] Notification shown successfully"))
      .catch((err) => console.error("❌ [SW] Notification error:", err)),
  );
});

/* ===============================
   NOTIFICATION CLICK
================================ */
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked");

  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && "focus" in client) {
            return client.focus();
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      }),
  );
});

/* ===============================
   ERROR DEBUGGING
================================ */
self.addEventListener("error", (e) => {
  console.error("[SW] Error:", e.message);
});

self.addEventListener("unhandledrejection", (e) => {
  console.error("[SW] Unhandled rejection:", e.reason);
});

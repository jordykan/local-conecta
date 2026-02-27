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

self.addEventListener("push", (event) => {
  console.log("🔥 PUSH EVENT RECEIVED");

  let data = {};

  try {
    data = event.data?.json() ?? {};
  } catch {
    data = { title: "Fallback", body: "No payload" };
  }

  event.waitUntil(
    self.registration.showNotification(data.title || "TEST PUSH", {
      body: data.body || "Push recibido",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
    }),
  );
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
        if (response && response.status === 200) {
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
  console.log("[SW] PUSH RECEIVED");

  let data = {};

  if (event.data) {
    try {
      data = event.data.json();
    } catch (err) {
      try {
        data = JSON.parse(event.data.text());
      } catch {
        data = {
          title: "Local Conecta",
          body: event.data.text(),
        };
      }
    }
  }

  const title = data.title || "Local Conecta";

  const options = {
    body: data.body || "Nueva notificación",
    icon: "/icon.svg",
    badge: "/icon.svg",
    data: {
      url: data.url || "/",
    },
    tag: data.tag || "default",
  };

  event.waitUntil(
    self.registration
      .showNotification(title, options)
      .then(() => console.log("[SW] Notification shown"))
      .catch((err) => console.error("[SW] Notification error:", err)),
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

const CACHE = "wiring-3600-app-117";

self.addEventListener("install", (e) => {
  e.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of windows) {
        if ("navigate" in client) {
          try {
            await client.navigate(client.url);
          } catch {
            client.postMessage({ type: "RELOAD" });
          }
        }
      }
    })(),
  );
});

self.addEventListener("message", (e) => {
  if (e.data && e.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.pathname.endsWith("/sw.js")) return;
  if (url.pathname.endsWith(".pdf")) return;
  if (/version\.json|app-update\.json/.test(url.pathname) || req.mode === "navigate") {
    e.respondWith(fetch(req, { cache: "no-store" }).catch(() => caches.match(req)));
    return;
  }
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req)),
  );
});

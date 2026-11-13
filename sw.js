/* Service worker · English 20 Minutes
 * - Ficheros propios: network-first con timeout (3 s), revalidando siempre con el
 *   servidor (no se fía de la caché HTTP). Con red lenta o sin red se sirve la
 *   caché; la respuesta de red, si llega, actualiza la caché igualmente.
 * - CDN (Tailwind, Google Fonts): stale-while-revalidate.
 * - Solo se cachean respuestas válidas (nunca 404/500).
 * - Sin red, solo las navegaciones caen al shell (index.html); un .js que falta
 *   no recibe HTML a cambio.
 * Sube CACHE_VERSION si cambias la lista de ASSETS.
 */
const CACHE_VERSION = "e20-c1-v9";
const ASSETS = ["./", "./index.html", "./js/core.js", "./js/app.js", "./js/data_c1.js", "./js/content/lote-02.js", "./manifest.json", "./icons/icon.svg"];
const NET_TIMEOUT_MS = 3000;

self.addEventListener("install", (e) => {
  // cache: "reload" → la precaché siempre baja la versión actual del servidor.
  const reqs = ASSETS.map((u) => new Request(u, { cache: "reload" }));
  e.waitUntil(caches.open(CACHE_VERSION).then((c) => c.addAll(reqs)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms));

async function networkFirst(event) {
  const req = event.request;
  const cache = await caches.open(CACHE_VERSION);
  // cache: "no-cache" → revalida con el servidor (304 si no cambió) en vez de aceptar
  // una copia antigua de la caché HTTP del navegador (app.js nuevo + datos viejos).
  const net = fetch(req, { cache: "no-cache" }).then((res) => {
    if (res.ok) return cache.put(req, res.clone()).then(() => res);
    return res;
  });
  event.waitUntil(net.catch(() => {})); // deja terminar la actualización de caché aunque ganemos por timeout

  try {
    const res = await Promise.race([net, timeout(NET_TIMEOUT_MS)]);
    if (res.ok) return res;
    return (await cache.match(req)) || res; // 5xx/404: mejor la versión cacheada si existe
  } catch (_) {
    const cached = await cache.match(req);
    if (cached) return cached;
    if (req.mode === "navigate") {
      const shell = await cache.match("./index.html");
      if (shell) return shell;
    }
    return net.catch(() => Response.error()); // sin caché: seguimos esperando a la red
  }
}

async function staleWhileRevalidate(event) {
  const req = event.request;
  const cache = await caches.open(CACHE_VERSION);
  const cached = await cache.match(req);
  const net = fetch(req).then((res) => {
    // Las respuestas "opaque" (no-cors, p. ej. el script de Tailwind) no exponen su estado.
    if (res.ok || res.type === "opaque") return cache.put(req, res.clone()).then(() => res);
    return res;
  });
  event.waitUntil(net.catch(() => {}));
  return cached || net.catch(() => Response.error());
}

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.protocol !== "http:" && url.protocol !== "https:") return;
  if (url.origin === location.origin && url.pathname.includes("/api/")) return; // sincronización local: nunca desde caché
  e.respondWith(url.origin === location.origin ? networkFirst(e) : staleWhileRevalidate(e));
});

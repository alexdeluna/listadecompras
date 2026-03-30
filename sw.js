// ==========================================================
// SERVICE WORKER
// Faz cache básico dos arquivos estáticos para permitir
// carregamento mais rápido e funcionamento offline parcial.
// ==========================================================

const CACHE_NAME = "feira-facil-v1";

const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./visual.css",
  "./app.js",
  "./ui.js",
  "./db.js",
  "./firebase-config.js",
  "./manifest.json"
];

// Instalação do service worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// Ativação e limpeza de caches antigos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Estratégia cache first para arquivos estáticos
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
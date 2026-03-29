// =========================================
// NOME DO CACHE
// Troque a versão quando alterar bastante o app.
// =========================================
const CACHE_NAME = "lista-compras-pwa-v2";

// =========================================
// ARQUIVOS PRINCIPAIS DO APP
// Esses arquivos ficam disponíveis offline.
// =========================================
const ARQUIVOS_CACHE = [
  "./",
  "./index.html",
  "./visual.css",
  "./app.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// =========================================
// INSTALAÇÃO
// =========================================
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ARQUIVOS_CACHE);
    })
  );

  self.skipWaiting();
});

// =========================================
// ATIVAÇÃO
// Remove caches antigos.
// =========================================
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((listaCaches) => {
      return Promise.all(
        listaCaches
          .filter((cacheAntigo) => cacheAntigo !== CACHE_NAME)
          .map((cacheAntigo) => caches.delete(cacheAntigo))
      );
    })
  );

  self.clients.claim();
});

// =========================================
// FETCH
// Busca no cache primeiro, depois na rede.
// =========================================
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((respostaCache) => {
      if (respostaCache) {
        return respostaCache;
      }

      return fetch(event.request);
    })
  );
});

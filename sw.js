// =========================================
// NOME DO CACHE
// Sempre que você alterar bastante o app,
// pode trocar a versão para forçar atualização.
// =========================================
const CACHE_NAME = "lista-compras-pwa-v1";

// =========================================
// ARQUIVOS QUE O APP VAI GUARDAR EM CACHE
// Isso ajuda no funcionamento offline.
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
// INSTALAÇÃO DO SERVICE WORKER
// Guarda os arquivos principais no cache.
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
// ATIVAÇÃO DO SERVICE WORKER
// Remove caches antigos.
// =========================================
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((listaDeCaches) => {
      return Promise.all(
        listaDeCaches
          .filter((cacheAntigo) => cacheAntigo !== CACHE_NAME)
          .map((cacheAntigo) => caches.delete(cacheAntigo))
      );
    })
  );

  self.clients.claim();
});

// =========================================
// INTERCEPTAÇÃO DAS REQUISIÇÕES
// Estratégia: tenta buscar no cache primeiro.
// Se não encontrar, busca na internet.
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

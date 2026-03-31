// ==========================================================
// SERVICE WORKER PROFISSIONAL - FEIRA FÁCIL
// Atualização automática + cache inteligente
// ==========================================================

const VERSION = "feira-facil-v3";

const STATIC_CACHE = VERSION + "-static";
const DYNAMIC_CACHE = VERSION + "-dynamic";

const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./visual.css",
  "./app.js",
  "./ui.js",
  "./db.js",
  "./firebase-config.js",
  "./manifest.json"
];


// ==========================================================
// INSTALAÇÃO
// ==========================================================

self.addEventListener("install", (event) => {

  self.skipWaiting();

  event.waitUntil(

    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))

  );

});


// ==========================================================
// ATIVAÇÃO
// Remove caches antigos automaticamente
// ==========================================================

self.addEventListener("activate", (event) => {

  event.waitUntil(

    caches.keys().then(keys => {

      return Promise.all(

        keys.map(key => {

          if(
            key !== STATIC_CACHE &&
            key !== DYNAMIC_CACHE
          ){
            return caches.delete(key);
          }

        })

      )

    })

  )

  self.clients.claim()

})


// ==========================================================
// FETCH
// Estratégia: NETWORK FIRST
// ==========================================================

self.addEventListener("fetch", (event) => {

  const request = event.request

  // NÃO cachear Firebase ou APIs
  if(
    request.url.includes("firestore") ||
    request.url.includes("googleapis") ||
    request.url.includes("firebase")
  ){
    return
  }

  event.respondWith(

    fetch(request)

      .then(response => {

        const clone = response.clone()

        caches.open(DYNAMIC_CACHE)
          .then(cache => cache.put(request, clone))

        return response

      })

      .catch(() => caches.match(request))

  )

})


// ==========================================================
// DETECTAR NOVA VERSÃO
// ==========================================================

self.addEventListener("message", (event) => {

  if(event.data === "skipWaiting"){
    self.skipWaiting()
  }

})

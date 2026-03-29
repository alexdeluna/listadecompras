const CACHE="feira-v2"

const arquivos=[

"./",
"./index.html",
"./visual.css",
"./app.js",
"./manifest.json"

]

self.addEventListener("install",e=>{

e.waitUntil(

caches.open(CACHE).then(c=>c.addAll(arquivos))

)

})

self.addEventListener("fetch",e=>{

e.respondWith(

caches.match(e.request).then(r=>r||fetch(e.request))

)

})

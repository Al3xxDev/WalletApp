// AGGIORNA VERSIONE: v10 (Così l'utente scarica i nuovi file separati)
const CACHE_NAME = "wallet-v10";

const ASSETS = [
  "./",
  "./index.html",
  "./style.css", // NUOVO
  "./app.js", // NUOVO
  "./manifest.json",
  "./icon.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  e.respondWith(caches.match(e.request).then((res) => res || fetch(e.request)));
});

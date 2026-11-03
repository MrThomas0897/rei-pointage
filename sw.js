/* Pointage REI : fonctionnement hors connexion (actif uniquement en HTTPS ou sur localhost).
   Après une mise à jour des fichiers, augmentez le numéro de version ci-dessous. */
const CACHE = "pointage-rei-v3";
const FILES = ["./", "index.html", "manifest.webmanifest", "modele-pointage.xlsx",
  "lib/jszip.min.js", "lib/pdf-lib.min.js", "fonts/archivo-rei.woff",
  "icons/icon-180.png", "icons/icon-192.png", "icons/icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
/* Réseau d'abord (pour recevoir les mises à jour), cache si le serveur est injoignable. */
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match("index.html")))
  );
});

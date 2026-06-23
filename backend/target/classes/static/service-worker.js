const CACHE_NAME = "worshipflow-mvp-v68";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/style.css",
  "./js/api.js",
  "./js/common.js",
  "./js/login.js",
  "./js/cadastro.js",
  "./js/esqueci-senha.js",
  "./js/redefinir-senha.js",
  "./js/dashboard.js",
  "./js/musicas.js",
  "./js/escalas.js",
  "./js/usuarios.js",
  "./js/perfil.js",
  "./js/equipe.js",
  "./js/search.js",
  "./js/musicas.js?v=50",
  "./js/escalas.js?v=52",
  "./js/search.js?v=50",
  "./pages/login.html",
  "./pages/cadastro.html",
  "./pages/esqueci-senha.html",
  "./pages/redefinir-senha.html",
  "./pages/dashboard.html",
  "./pages/musicas.html",
  "./pages/escalas.html",
  "./pages/usuarios.html",
  "./pages/perfil.html",
  "./pages/equipe.html",
  "./pages/termos.html",
  "./pages/privacidade.html",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/LogoWorshipFlow.png",
  "./assets/stage-celebration.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || event.request.url.includes("/api/")) return;

  event.respondWith(
    caches.match(event.request).then((cached) =>
      cached || fetch(event.request).catch(() => caches.match("./index.html"))
    )
  );
});

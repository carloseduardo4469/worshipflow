const CACHE_NAME = "worshipflow-mvp-v101";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/style.css",
  "./css/style.css?v=70",
  "./css/style.css?v=71",
  "./css/style.css?v=72",
  "./css/style.css?v=73",
  "./css/style.css?v=74",
  "./css/style.css?v=81",
  "./css/style.css?v=82",
  "./css/style.css?v=83",
  "./css/style.css?v=84",
  "./css/style.css?v=89",
  "./css/style.css?v=93",
  "./css/style.css?v=94",
  "./js/api.js",
  "./js/api.js?v=70",
  "./js/common.js",
  "./js/common.js?v=70",
  "./js/common.js?v=91",
  "./js/contato.js?v=79",
  "./js/login.js",
  "./js/cadastro.js",
  "./js/cadastro.js?v=51",
  "./js/esqueci-senha.js",
  "./js/redefinir-senha.js",
  "./js/dashboard.js",
  "./js/musicas.js",
  "./js/escalas.js",
  "./js/usuarios.js",
  "./js/perfil.js",
  "./js/equipe.js",
  "./js/search.js",
  "./js/musicas.js?v=55",
  "./js/escalas.js?v=85",
  "./js/usuarios.js?v=80",
  "./js/historico.js?v=73",
  "./js/search.js?v=50",
  "./pages/login.html",
  "./pages/cadastro.html",
  "./pages/esqueci-senha.html",
  "./pages/redefinir-senha.html",
  "./pages/dashboard.html",
  "./pages/musicas.html",
  "./pages/escalas.html",
  "./pages/historico.html",
  "./pages/usuarios.html",
  "./pages/perfil.html",
  "./pages/equipe.html",
  "./pages/termos.html",
  "./pages/privacidade.html",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/LogoWorshipFlow.png",
  "./assets/LogoWorshipFlowIcon.png"
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

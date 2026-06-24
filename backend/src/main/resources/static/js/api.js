const API_BASE_URL = "/api";
const AUTH_STORAGE_KEY = "worshipflow:auth";
const DATA_CACHE_PREFIX = "worshipflow:data-cache:v3:";

const memoryCache = new Map();
const pendingRequests = new Map();

function getStoredAuth() {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getAuthToken() {
  return getStoredAuth()?.token || null;
}

function cacheScope() {
  const token = getAuthToken();
  return token ? token.slice(-24) : "public";
}

function cacheKey(endpoint) {
  const epoch = endpoint.startsWith("/escalas")
    ? new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Sao_Paulo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }).format(new Date())
    : "session";
  return `${DATA_CACHE_PREFIX}${cacheScope()}:${endpoint}:${epoch}`;
}

function readCachedData(endpoint) {
  const key = cacheKey(endpoint);
  if (memoryCache.has(key)) return memoryCache.get(key);

  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return undefined;

    const cached = JSON.parse(raw);
    memoryCache.set(key, cached);
    return cached;
  } catch {
    sessionStorage.removeItem(key);
    return undefined;
  }
}

function writeCachedData(endpoint, data) {
  const key = cacheKey(endpoint);
  memoryCache.set(key, data);

  try {
    sessionStorage.setItem(key, JSON.stringify(data));
  } catch {
    sessionStorage.removeItem(key);
  }
}

function invalidateDataCache(prefix = "") {
  const scopedPrefix = `${DATA_CACHE_PREFIX}${cacheScope()}:${prefix}`;

  for (const key of Array.from(memoryCache.keys())) {
    if (key.startsWith(scopedPrefix)) memoryCache.delete(key);
  }

  try {
    for (let index = sessionStorage.length - 1; index >= 0; index -= 1) {
      const key = sessionStorage.key(index);
      if (key?.startsWith(scopedPrefix)) sessionStorage.removeItem(key);
    }
  } catch {
    memoryCache.clear();
  }
}

function invalidateChangedResources(endpoint) {
  invalidateDataCache(endpoint.replace(/\/\d+$/, ""));

  if (endpoint.startsWith("/musicas")) {
    invalidateDataCache("/musicas");
    invalidateDataCache("/escalas");
  }

  if (endpoint.startsWith("/usuarios")) {
    invalidateDataCache("/usuarios");
    invalidateDataCache("/usuarios/equipe");
    invalidateDataCache("/escalas");
  }

  if (endpoint.startsWith("/escalas")) {
    invalidateDataCache("/escalas");
  }

  if (endpoint.startsWith("/auth/me")) {
    invalidateDataCache("/auth");
    invalidateDataCache("/usuarios/equipe");
    invalidateDataCache("/escalas");
  } else if (endpoint.startsWith("/auth")) {
    invalidateDataCache("/auth");
  }
}

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || payload?.success === false) {
    if (response.status === 401 || response.status === 403) {
      clearAuth();
    }
    throw new Error(payload?.message || "Nao foi possivel concluir a operacao.");
  }

  return payload;
}

async function getData(endpoint) {
  const cached = readCachedData(endpoint);
  if (cached !== undefined) return cached;

  const key = cacheKey(endpoint);
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }

  const promise = request(endpoint)
    .then((payload) => {
      writeCachedData(endpoint, payload.data);
      return payload.data;
    })
    .finally(() => {
      pendingRequests.delete(key);
    });

  pendingRequests.set(key, promise);
  return promise;
}

async function getFreshData(endpoint) {
  invalidateDataCache(endpoint);
  const payload = await request(endpoint);
  writeCachedData(endpoint, payload.data);
  return payload.data;
}

async function postData(endpoint, dados) {
  const response = await request(endpoint, {
    method: "POST",
    body: JSON.stringify(dados)
  });
  invalidateChangedResources(endpoint);
  return response;
}

async function putData(endpoint, dados) {
  const response = await request(endpoint, {
    method: "PUT",
    body: JSON.stringify(dados)
  });
  invalidateChangedResources(endpoint);
  return response;
}

async function deleteData(endpoint) {
  const response = await request(endpoint, { method: "DELETE" });
  invalidateChangedResources(endpoint);
  return response;
}

function saveAuth(authResponse) {
  const data = authResponse?.data || authResponse;
  const usuario = data?.usuario || data?.user || data;
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ ...data, usuario }));
}

function clearAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  memoryCache.clear();
  pendingRequests.clear();

  try {
    for (let index = sessionStorage.length - 1; index >= 0; index -= 1) {
      const key = sessionStorage.key(index);
      if (key?.startsWith(DATA_CACHE_PREFIX)) sessionStorage.removeItem(key);
    }
  } catch {
    // Sem sessionStorage disponivel; o cache em memoria ja foi limpo.
  }
}

window.WorshipFlowApi = {
  baseUrl: API_BASE_URL,
  authKey: AUTH_STORAGE_KEY,
  request,
  getData,
  getFreshData,
  postData,
  putData,
  deleteData,
  invalidateDataCache,
  getStoredAuth,
  saveAuth,
  clearAuth
};

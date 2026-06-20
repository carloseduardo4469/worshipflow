const API_BASE_URL = localStorage.getItem("worshipflow:apiUrl") || "/api";
const AUTH_STORAGE_KEY = "worshipflow:auth";

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
    throw new Error(payload?.message || "Nao foi possivel concluir a operacao.");
  }

  return payload;
}

async function getData(endpoint) {
  const payload = await request(endpoint);
  return payload.data;
}

function postData(endpoint, dados) {
  return request(endpoint, {
    method: "POST",
    body: JSON.stringify(dados)
  });
}

function putData(endpoint, dados) {
  return request(endpoint, {
    method: "PUT",
    body: JSON.stringify(dados)
  });
}

function deleteData(endpoint) {
  return request(endpoint, { method: "DELETE" });
}

function saveAuth(authResponse) {
  const data = authResponse?.data || authResponse;
  const usuario = data?.usuario || data?.user || data;
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ ...data, usuario }));
}

function clearAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

window.WorshipFlowApi = {
  baseUrl: API_BASE_URL,
  authKey: AUTH_STORAGE_KEY,
  request,
  getData,
  postData,
  putData,
  deleteData,
  getStoredAuth,
  saveAuth,
  clearAuth
};

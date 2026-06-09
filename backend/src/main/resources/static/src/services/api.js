const API_BASE_URL = localStorage.getItem("worshipflow:apiUrl") || "/api";
const AUTH_KEY = "worshipflow:auth";

function getAuthToken() {
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw).token || null;
  } catch {
    return null;
  }
}

async function request(path, options = {}) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    },
    ...options
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.message || "Não foi possível concluir a operação.");
  }

  return payload;
}

export const api = {
  baseUrl: API_BASE_URL,
  request,
  list: (resource) => request(`/${resource}`).then((payload) => payload.data || []),
  create: (resource, data) => request(`/${resource}`, { method: "POST", body: JSON.stringify(data) }),
  update: (resource, id, data) => request(`/${resource}/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (resource, id) => request(`/${resource}/${id}`, { method: "DELETE" })
};

import { api } from "./api.js";

const STORAGE_KEY = "worshipflow:auth";

export function getUser() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw).usuario || null;
  } catch {
    return null;
  }
}

export function updateStoredUser(usuario) {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  try {
    const data = JSON.parse(raw);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, usuario }));
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export async function login(credentials) {
  const payload = await api.request("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials)
  });
  persistAuth(payload.data);
  return payload.data.usuario;
}

export async function register(data) {
  const payload = await api.request("/auth/cadastro", {
    method: "POST",
    body: JSON.stringify(data)
  });
  persistAuth(payload.data);
  return payload.data.usuario;
}

export function forgotPassword(email) {
  return api.request("/auth/esqueci-senha", {
    method: "POST",
    body: JSON.stringify({ email })
  });
}

export function resetPassword(data) {
  return api.request("/auth/redefinir-senha", {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export function updateProfile(data) {
  return api.request("/auth/me", {
    method: "PUT",
    body: JSON.stringify(data)
  });
}

export function toggleFavoriteMusic(musicaId) {
  return api.request(`/auth/favoritos/musicas/${musicaId}`, {
    method: "POST"
  });
}

export function logout() {
  localStorage.removeItem(STORAGE_KEY);
}

function persistAuth(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

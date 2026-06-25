const WF = window.WorshipFlowApi;
const PERSON_NAME_PATTERN = /^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ .'’-]{1,119}$/;

function onlyDigits(value = "") {
  return String(value || "").replace(/\D/g, "");
}

function normalizePersonName(value = "") {
  return String(value || "")
    .replace(/[0-9]/g, "")
    .replace(/\s+/g, " ")
    .trimStart();
}

function isValidPersonName(value = "") {
  return PERSON_NAME_PATTERN.test(String(value || "").trim());
}

function phoneDigits(value = "") {
  return onlyDigits(value).slice(0, 11);
}

function formatPhone(value = "") {
  const digits = phoneDigits(value);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function isValidBrazilPhone(value = "", { required = true } = {}) {
  const digits = onlyDigits(value);
  if (!digits) return !required;
  return digits.length === 11;
}

function normalizeEmail(value = "") {
  return String(value || "").trim().toLowerCase();
}

function isValidRegistrationEmail(value = "") {
  const email = normalizeEmail(value);
  const [localPart, domain] = email.split("@");
  if (!localPart || !domain || email.split("@").length !== 2) return false;
  if (localPart.length < 5 || email.length > 160) return false;
  if (/\s|[.]{2}/.test(email)) return false;
  if (!/^[a-z0-9][a-z0-9._%+-]*[a-z0-9]$/i.test(localPart)) return false;
  return /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i.test(domain);
}

function setupNameField(input) {
  if (!input) return;
  input.maxLength = 120;
  input.addEventListener("input", () => {
    const normalized = normalizePersonName(input.value);
    if (input.value !== normalized) input.value = normalized;
    input.setCustomValidity("");
  });
  input.addEventListener("blur", () => {
    input.value = String(input.value || "").trim().replace(/\s+/g, " ");
  });
}

function setupPhoneField(input, { required = false } = {}) {
  if (!input) return;
  input.type = "tel";
  input.inputMode = "numeric";
  input.autocomplete = "tel";
  input.maxLength = 15;
  input.placeholder = "(11) 98552-0784";
  input.addEventListener("input", () => {
    input.value = formatPhone(input.value);
    input.setCustomValidity("");
  });
  input.addEventListener("blur", () => {
    input.value = formatPhone(input.value);
    validatePhoneField(input, { required });
  });
}

function setupEmailField(input) {
  if (!input) return;
  input.type = "email";
  input.autocomplete = "email";
  input.maxLength = 160;
  input.addEventListener("input", () => {
    input.value = normalizeEmail(input.value);
    input.setCustomValidity("");
  });
  input.addEventListener("blur", () => {
    input.value = normalizeEmail(input.value);
    validateRegistrationEmail(input);
  });
}

function validateNameField(input) {
  if (!input) return true;
  const valid = isValidPersonName(input.value);
  input.setCustomValidity(valid ? "" : "Informe um nome válido, usando apenas letras e espaços.");
  return valid;
}

function validatePhoneField(input, { required = false } = {}) {
  if (!input) return true;
  const valid = isValidBrazilPhone(input.value, { required });
  input.setCustomValidity(valid ? "" : "Informe o telefone com 11 números, incluindo DDD.");
  return valid;
}

function validateRegistrationEmail(input) {
  if (!input) return true;
  const valid = isValidRegistrationEmail(input.value);
  input.setCustomValidity(valid ? "" : "Informe um e-mail válido, com pelo menos 5 caracteres antes do @.");
  return valid;
}

function compactText(value = "") {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function setupTextField(input, { maxLength, placeholder, hint } = {}) {
  if (!input) return;
  if (maxLength) input.maxLength = maxLength;
  if (placeholder) input.placeholder = placeholder;
  if (hint) input.title = hint;
  input.addEventListener("input", () => {
    input.setCustomValidity("");
  });
  input.addEventListener("blur", () => {
    input.value = compactText(input.value);
  });
}

function validateTextField(input, { required = false, minLength = 1, maxLength = Infinity, label = "Campo" } = {}) {
  if (!input) return true;
  const value = compactText(input.value);
  const valid = (!required && !value) || (value.length >= minLength && value.length <= maxLength);
  input.setCustomValidity(valid ? "" : `${label} deve ter entre ${minLength} e ${maxLength} caracteres.`);
  return valid;
}

function todayIsoDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function setupFutureDateField(input) {
  if (!input) return;
  input.min = todayIsoDate();
  input.addEventListener("input", () => {
    input.setCustomValidity("");
  });
}

function validateFutureDateField(input, { required = true, label = "Data" } = {}) {
  if (!input) return true;
  const value = String(input.value || "");
  const today = todayIsoDate();
  const valid = (!required && !value) || (value && value >= today);
  input.setCustomValidity(valid ? "" : `${label} deve ser hoje ou uma data futura.`);
  return valid;
}

function isValidHttpUrl(value = "") {
  const rawUrl = String(value || "").trim();
  if (!rawUrl) return true;
  try {
    const parsed = new URL(/^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function normalizeHttpUrl(value = "") {
  const rawUrl = String(value || "").trim();
  if (!rawUrl) return "";
  try {
    const parsed = new URL(/^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`);
    return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : "";
  } catch {
    return rawUrl;
  }
}

const allowedMusicLinkDomains = [
  "cifraclub.com.br",
  "letras.mus.br",
  "cifra.com.br",
  "songsterr.com",
  "youtube.com",
  "youtu.be",
  "spotify.com",
  "open.spotify.com"
];

function isAllowedMusicLink(value = "") {
  const normalizedUrl = normalizeHttpUrl(value);
  if (!normalizedUrl) return true;

  try {
    const parsed = new URL(normalizedUrl);
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");
    return allowedMusicLinkDomains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}

function validateUrlField(input, { label = "Link" } = {}) {
  if (!input) return true;
  const valid = isValidHttpUrl(input.value);
  input.setCustomValidity(valid ? "" : `${label} deve ser uma URL válida, iniciando com http ou https.`);
  return valid;
}

function validateMusicLinkField(input) {
  if (!input) return true;
  const validUrl = isValidHttpUrl(input.value);
  const validDomain = isAllowedMusicLink(input.value);
  input.setCustomValidity(validUrl && validDomain ? "" : "Informe um link musical válido: Cifra Club, Letras, Cifra, Songsterr, Spotify ou YouTube.");
  return validUrl && validDomain;
}

function validateNumberField(input, { min, max, required = false, label = "Número" } = {}) {
  if (!input) return true;
  const value = String(input.value || "").trim();
  const number = Number(value);
  const valid = (!required && !value) || (Number.isFinite(number) && number >= min && number <= max);
  input.setCustomValidity(valid ? "" : `${label} deve estar entre ${min} e ${max}.`);
  return valid;
}

async function disableLocalDevelopmentCaches() {
  const isLocalHost = ["localhost", "127.0.0.1", "::1"].includes(location.hostname);
  if (!isLocalHost) return;

  try {
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }

    if ("caches" in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((cacheName) => cacheName.startsWith("worshipflow-"))
          .map((cacheName) => caches.delete(cacheName))
      );
    }
  } catch {
    // Cache cleanup is best-effort and must not block page initialization.
  }
}

void disableLocalDevelopmentCaches();

const icons = {
  calendar: '<path d="M8 2v4M16 2v4M3 10h18"/><rect x="3" y="4" width="18" height="18" rx="2"/>',
  checkCircle: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-5"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>',
  externalLink: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  logOut: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 7.8A9 9 0 1 1 12 3Z"/>',
  music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  refresh: '<path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"/><path d="M3 21v-5h5"/><path d="M3 12A9 9 0 0 1 18.5 5.8L21 8"/><path d="M21 3v5h-5"/>',
  save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
  star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.3L5.8 21 7 14.2 2 9.3l6.9-1Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  team: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  xCircle: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>'
};

function icon(name) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.music}</svg>`;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDateTime(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

function toDatetimeLocal(value) {
  return value ? value.slice(0, 16) : "";
}

function countLabel(count, singular, plural) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function getUser() {
  return WF.getStoredAuth()?.usuario || null;
}

function updateStoredUser(usuario) {
  const current = WF.getStoredAuth() || {};
  localStorage.setItem(WF.authKey, JSON.stringify({ ...current, usuario }));
}

function isAdmin(user = getUser()) {
  return user?.perfil === "ADMIN";
}

function pageUrl(name) {
  return `/pages/${name}.html`;
}

const toneSemitoneByRoot = {
  A: 0,
  "A#": 1,
  Bb: 1,
  B: 2,
  C: 3,
  "C#": 4,
  Db: 4,
  D: 5,
  "D#": 6,
  Eb: 6,
  E: 7,
  F: 8,
  "F#": 9,
  Gb: 9,
  G: 10,
  "G#": 11,
  Ab: 11
};

const cifraClubKeyByTone = { ...toneSemitoneByRoot };
const toneRootBySemitone = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];
const relativeMinorByMajorRoot = {
  C: "A",
  "C#": "A#",
  Db: "A#",
  D: "B",
  "D#": "C",
  Eb: "C",
  E: "C#",
  F: "D",
  "F#": "D#",
  Gb: "D#",
  G: "E",
  "G#": "F",
  Ab: "F",
  A: "F#",
  "A#": "G",
  Bb: "G",
  B: "G#"
};
const relativeMajorByMinorRoot = Object.fromEntries(
  Object.entries(relativeMinorByMajorRoot).map(([majorRoot, minorRoot]) => [minorRoot, majorRoot])
);

function normalizeExternalUrl(value) {
  const rawUrl = String(value || "").trim();
  if (!rawUrl) return "";

  try {
    const parsed = new URL(/^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`);
    return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : "";
  } catch {
    return "";
  }
}

function parseTone(value) {
  const match = String(value || "").trim().match(/^([A-Ga-g])([#b]?)(m?)$/);
  if (!match) return null;

  const root = `${match[1].toUpperCase()}${match[2]}`;
  const semitone = toneSemitoneByRoot[root];
  if (semitone === undefined) return null;

  return {
    root,
    semitone,
    minor: match[3] === "m"
  };
}

function toneRoot(value) {
  return parseTone(value)?.root || "";
}

function wrapSemitone(value) {
  return ((value % 12) + 12) % 12;
}

function relativeMajorRoot(minorTone) {
  return relativeMajorByMinorRoot[minorTone.root] || toneRootBySemitone[wrapSemitone(minorTone.semitone + 3)];
}

function relativeMinorRoot(majorTone) {
  return relativeMinorByMajorRoot[majorTone.root] || toneRootBySemitone[wrapSemitone(majorTone.semitone - 3)];
}

function isCifraClubUrl(parsed) {
  const hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");
  return hostname === "cifraclub.com.br" || hostname.endsWith(".cifraclub.com.br");
}

function hashParams(hash = "") {
  const value = String(hash || "").replace(/^#/, "");
  return value.includes("=") ? new URLSearchParams(value) : new URLSearchParams();
}

function removeCifraClubCapoParams(parsed) {
  parsed.searchParams.delete("capo");
  parsed.searchParams.delete("capotraste");

  if (!parsed.hash) return;

  const params = hashParams(parsed.hash);
  params.delete("capo");
  params.delete("capotraste");
  parsed.hash = params.toString();
}

function parseToneValue(value) {
  const rawValue = String(value || "").trim();
  if (!rawValue) return null;

  const numericValue = Number(rawValue);
  if (Number.isInteger(numericValue) && numericValue >= 0 && numericValue <= 11) {
    return {
      root: toneRootBySemitone[numericValue],
      semitone: numericValue,
      minor: null
    };
  }

  return parseTone(rawValue);
}

function detectCifraClubSourceMode(parsed) {
  const params = new URLSearchParams(parsed.searchParams);
  for (const [key, value] of hashParams(parsed.hash)) {
    params.append(key, value);
  }

  const worshipFlowMode = String(params.get("wfMode") || "").toLowerCase();
  if (worshipFlowMode === "minor" || worshipFlowMode === "major") return worshipFlowMode;

  for (const paramName of ["tone", "tom", "key", "originalTone", "originalTom"]) {
    const parsedTone = parseToneValue(params.get(paramName));
    if (parsedTone?.minor === true) return "minor";
    if (parsedTone?.minor === false) return "major";
  }

  return "major";
}

function cifraClubRootForTone(targetTone, sourceMode) {
  if (!targetTone) return "";
  if (sourceMode === "minor" && !targetTone.minor) return relativeMinorRoot(targetTone);
  if (sourceMode !== "minor" && targetTone.minor) return relativeMajorRoot(targetTone);
  return targetTone.root;
}

function setCifraClubSourceMode(parsed, sourceMode) {
  if (!sourceMode) return;

  const params = hashParams(parsed.hash);
  params.delete("wfMode");
  if (sourceMode === "minor" || sourceMode === "major") params.set("wfMode", sourceMode);
  parsed.hash = params.toString();
}

function cifraClubSourceMode(link) {
  const normalizedUrl = normalizeExternalUrl(link);
  if (!normalizedUrl) return "major";

  try {
    const parsed = new URL(normalizedUrl);
    if (!isCifraClubUrl(parsed)) return "major";
    return detectCifraClubSourceMode(parsed);
  } catch {
    return "major";
  }
}

function normalizeMusicLinkUrl(value = "", { sourceMode } = {}) {
  const normalizedUrl = normalizeHttpUrl(value);
  if (!normalizedUrl) return "";

  try {
    const parsed = new URL(normalizedUrl);
    if (isCifraClubUrl(parsed)) {
      removeCifraClubCapoParams(parsed);
      setCifraClubSourceMode(parsed, sourceMode);
    }
    return parsed.href;
  } catch {
    return normalizedUrl;
  }
}

function cifraClubUrlForTone(link, tone) {
  const normalizedUrl = normalizeExternalUrl(link);
  const targetTone = parseTone(tone);

  if (!normalizedUrl) return "";

  try {
    const parsed = new URL(normalizedUrl);
    if (!isCifraClubUrl(parsed)) {
      return normalizedUrl;
    }

    removeCifraClubCapoParams(parsed);

    const root = cifraClubRootForTone(targetTone, detectCifraClubSourceMode(parsed));
    const key = cifraClubKeyByTone[root];
    if (key === undefined) return parsed.href;

    const params = hashParams(parsed.hash);
    params.delete("wfMode");
    params.set("key", String(key));
    parsed.hash = params.toString();
    return parsed.href;
  } catch {
    return normalizedUrl;
  }
}

function loginUrl(extra = "") {
  return `/pages/login.html${extra}`;
}

function activePageFromLocation() {
  const page = location.pathname.split("/").pop()?.replace(/\.html$/, "") || "dashboard";
  if (page === "escalas" && new URLSearchParams(location.search).get("modo") === "admin") {
    return "registro-escalas";
  }
  return page;
}

function currentPageRequiresAdmin() {
  return ["usuarios", "registro-escalas"].includes(activePageFromLocation());
}

let authRefreshPromise = null;
let dataWarmupScheduled = false;

function redirectToDashboardForMissingAdmin() {
  showToast("Acesso permitido apenas para administradores.", "error");
  setTimeout(() => {
    location.href = pageUrl("dashboard");
  }, 600);
}

function refreshAuthInBackground() {
  if (authRefreshPromise) return authRefreshPromise;

  authRefreshPromise = WF.getFreshData("/auth/me")
    .then((freshUser) => {
      updateStoredUser(freshUser);
      setupShell(freshUser, activePageFromLocation());

      if (currentPageRequiresAdmin() && !isAdmin(freshUser)) {
        redirectToDashboardForMissingAdmin();
      }

      return freshUser;
    })
    .catch(() => {
      if (!WF.getStoredAuth()) location.href = loginUrl();
      return null;
    });

  return authRefreshPromise;
}

function warmSharedData(user) {
  if (dataWarmupScheduled) return;
  dataWarmupScheduled = true;

  const endpoints = ["/musicas", "/usuarios/equipe", "/escalas", "/escalas/historico"];
  if (isAdmin(user)) endpoints.push("/usuarios");

  const warmup = () => {
    Promise.allSettled(endpoints.map((endpoint) => WF.getData(endpoint)));
  };

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(warmup, { timeout: 800 });
  } else {
    setTimeout(warmup, 200);
  }
}

async function requireAuth({ admin = false } = {}) {
  const storedAuth = WF.getStoredAuth();
  if (!storedAuth) {
    location.href = loginUrl();
    return null;
  }

  const cachedUser = storedAuth.usuario || null;
  if (cachedUser) {
    if (admin && !isAdmin(cachedUser)) {
      redirectToDashboardForMissingAdmin();
      return null;
    }

    setupShell(cachedUser, activePageFromLocation());
    warmSharedData(cachedUser);
    void refreshAuthInBackground();
    return cachedUser;
  }

  try {
    const user = await WF.getData("/auth/me");
    updateStoredUser(user);

    if (admin && !isAdmin(user)) {
      redirectToDashboardForMissingAdmin();
      return null;
    }

    warmSharedData(user);
    return user;
  } catch (error) {
    WF.clearAuth();
    location.href = loginUrl();
    return null;
  }
}

function initTheme() {
  const theme = localStorage.getItem("worshipflow:theme") || "dark";
  document.documentElement.dataset.theme = theme;
  document.documentElement.classList.toggle("dark", theme === "dark");
}

function updateThemeButtons() {
  document.querySelectorAll("[data-action='toggle-theme']").forEach((button) => {
    button.innerHTML = icon(document.documentElement.dataset.theme === "dark" ? "sun" : "moon");
  });
}

function toggleTheme() {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  document.documentElement.classList.toggle("dark", next === "dark");
  localStorage.setItem("worshipflow:theme", next);
  updateThemeButtons();
}

function showToast(message, type = "success") {
  const root = document.getElementById("toast-root");
  if (!root) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type === "error" ? "toast-error" : ""}`;
  toast.textContent = message;
  root.appendChild(toast);
  setTimeout(() => toast.remove(), 3600);
}

function initials(name = "") {
  const letters = String(name)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return letters || "WF";
}

function renderAvatar(user) {
  if (user?.fotoPerfil) {
    const type = user.fotoPerfilTipo || "image/png";
    return `<span class="user-avatar"><img src="data:${escapeHtml(type)};base64,${escapeHtml(user.fotoPerfil)}" alt="" /></span>`;
  }

  return `<span class="user-avatar">${icon("user")}</span>`;
}

function setupShell(user, activePage) {
  const shell = document.querySelector(".app-shell");
  if (!shell) return;

  document.querySelectorAll("[data-user-name]").forEach((element) => {
    element.textContent = user?.nome || "Usuário";
  });

  document.querySelectorAll("[data-user-avatar]").forEach((element) => {
    element.innerHTML = renderAvatar(user);
  });

  document.querySelectorAll("[data-admin-only]").forEach((element) => {
    element.hidden = !isAdmin(user);
  });

  document.querySelectorAll("[data-page]").forEach((element) => {
    element.classList.toggle("is-active", element.dataset.page === activePage);
  });

  updateThemeButtons();

  document.querySelectorAll("[data-action='open-drawer']").forEach((button) => {
    button.innerHTML = icon("menu");
  });

  document.querySelectorAll("[data-action='close-drawer'][data-drawer-close-icon]").forEach((button) => {
    button.innerHTML = icon("xCircle");
  });

  document.querySelectorAll("[data-action='logout']").forEach((button) => {
    button.innerHTML = icon("logOut");
  });

  if (!shell.dataset.shellReady) {
    shell.dataset.shellReady = "true";
    shell.addEventListener("click", (event) => {
      const actionTarget = event.target.closest("[data-action]");
      if (!actionTarget) return;

      const action = actionTarget.dataset.action;

      if (action === "open-drawer") shell.classList.add("drawer-open");
      if (action === "close-drawer") shell.classList.remove("drawer-open");
      if (action === "logout") {
        WF.clearAuth();
        location.href = loginUrl();
      }
      if (action === "toggle-theme") {
        toggleTheme();
      }
    });
  }
}

function confirmDialog({
  title = "Confirmar acao?",
  message = "Deseja continuar?",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  tone = "default",
  iconName = "checkCircle"
} = {}) {
  return new Promise((resolve) => {
    const backdrop = document.createElement("div");
    const titleId = `wf-dialog-title-${Date.now()}`;
    const toneClass = tone ? ` confirm-dialog-${tone}` : "";

    backdrop.className = "confirm-dialog-backdrop";
    backdrop.innerHTML = `
      <section class="confirm-dialog${toneClass}" role="dialog" aria-modal="true" aria-labelledby="${titleId}">
        <div class="confirm-dialog-icon">${icon(iconName)}</div>
        <div class="confirm-dialog-copy">
          <h2 id="${titleId}">${escapeHtml(title)}</h2>
          <p>${escapeHtml(message)}</p>
        </div>
        <div class="confirm-dialog-actions">
          <button class="button" type="button" data-dialog-action="cancel">${escapeHtml(cancelText)}</button>
          <button class="button primary" type="button" data-dialog-action="confirm">${escapeHtml(confirmText)}</button>
        </div>
      </section>
    `;

    function close(result) {
      backdrop.remove();
      document.removeEventListener("keydown", onKeydown);
      resolve(result);
    }

    function onKeydown(event) {
      if (event.key === "Escape") close(false);
    }

    backdrop.addEventListener("click", (event) => {
      const action = event.target.closest("[data-dialog-action]")?.dataset.dialogAction;
      if (event.target === backdrop || action === "cancel") close(false);
      if (action === "confirm") close(true);
    });

    document.addEventListener("keydown", onKeydown);
    document.body.appendChild(backdrop);
    backdrop.querySelector("[data-dialog-action='confirm']").focus();
  });
}

function confirmDelete(message = "Excluir registro?") {
  return confirmDialog({
    title: "Excluir registro?",
    message,
    confirmText: "Excluir",
    cancelText: "Cancelar",
    tone: "danger",
    iconName: "trash"
  });
}

function formToObject(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function selectedSkills(form) {
  return Array.from(form.querySelectorAll('input[name="habilidades"]:checked'))
    .map((input) => input.value);
}

function selectedSkillsText(form) {
  return selectedSkills(form).join(", ");
}

function normalizeSkillName(value = "") {
  const normalized = String(value).trim().toLowerCase();
  return {
    "violao": "violão",
    "violão": "violão",
    "guitarra": "guitarra",
    "bateria": "bateria",
    "baixo": "baixo",
    "back 1": "vocal de apoio 1",
    "vocal de apoio 1": "vocal de apoio 1",
    "back 2": "vocal de apoio 2",
    "vocal de apoio 2": "vocal de apoio 2",
    "cantor principal": "cantor principal",
    "mesa de som": "mesa de som"
  }[normalized] || normalized;
}

function formatSkillName(value = "") {
  return {
    "violão": "Violão",
    "guitarra": "Guitarra",
    "bateria": "Bateria",
    "baixo": "Baixo",
    "vocal de apoio 1": "Vocal de apoio 1",
    "vocal de apoio 2": "Vocal de apoio 2",
    "cantor principal": "Cantor principal",
    "mesa de som": "Mesa de som"
  }[normalizeSkillName(value)] || String(value).trim();
}

function formatSkills(value = "") {
  return String(value)
    .split(",")
    .map(formatSkillName)
    .filter(Boolean)
    .join(", ");
}

function setSelectedSkills(form, value = "") {
  const selected = new Set(String(value)
    .split(",")
    .map(normalizeSkillName)
    .filter(Boolean));

  form.querySelectorAll('input[name="habilidades"]').forEach((input) => {
    input.checked = selected.has(normalizeSkillName(input.value));
  });
}

initTheme();
updateThemeButtons();

const cachedShellUser = getUser();
if (cachedShellUser && document.querySelector(".app-shell")) {
  setupShell(cachedShellUser, activePageFromLocation());
  warmSharedData(cachedShellUser);
}

document.addEventListener("click", (event) => {
  const actionTarget = event.target.closest("[data-action]");
  if (actionTarget?.dataset.action === "toggle-theme" && !actionTarget.closest(".app-shell")) {
    toggleTheme();
  }
  if (actionTarget?.dataset.action === "back-to-top") {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

window.WorshipFlow = {
  icon,
  escapeHtml,
  onlyDigits,
  normalizeEmail,
  isValidRegistrationEmail,
  normalizePersonName,
  isValidPersonName,
  phoneDigits,
  formatPhone,
  isValidBrazilPhone,
  setupNameField,
  setupPhoneField,
  setupEmailField,
  validateNameField,
  validatePhoneField,
  validateRegistrationEmail,
  compactText,
  setupTextField,
  validateTextField,
  todayIsoDate,
  setupFutureDateField,
  validateFutureDateField,
  isValidHttpUrl,
  normalizeHttpUrl,
  isAllowedMusicLink,
  validateUrlField,
  validateMusicLinkField,
  validateNumberField,
  formatDateTime,
  toDatetimeLocal,
  countLabel,
  getUser,
  updateStoredUser,
  isAdmin,
  pageUrl,
  normalizeExternalUrl,
  normalizeMusicLinkUrl,
  cifraClubSourceMode,
  cifraClubUrlForTone,
  loginUrl,
  requireAuth,
  setupShell,
  updateThemeButtons,
  toggleTheme,
  showToast,
  confirmDialog,
  confirmDelete,
  formToObject,
  selectedSkills,
  selectedSkillsText,
  formatSkillName,
  formatSkills,
  setSelectedSkills
};

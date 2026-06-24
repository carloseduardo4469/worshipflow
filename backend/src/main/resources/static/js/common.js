const WF = window.WorshipFlowApi;

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

const cifraClubKeyByTone = {
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

function toneRoot(value) {
  const match = String(value || "").trim().match(/^([A-Ga-g])([#b]?)(m?)$/);
  if (!match) return "";
  return `${match[1].toUpperCase()}${match[2]}`;
}

function cifraClubUrlForTone(link, tone) {
  const normalizedUrl = normalizeExternalUrl(link);
  const root = toneRoot(tone);
  const key = cifraClubKeyByTone[root];

  if (!normalizedUrl || key === undefined) return normalizedUrl;

  try {
    const parsed = new URL(normalizedUrl);
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");
    if (hostname !== "cifraclub.com.br" && !hostname.endsWith(".cifraclub.com.br")) {
      return normalizedUrl;
    }

    parsed.hash = `key=${key}`;
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
    element.textContent = user?.nome || "Usuario";
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
  formatDateTime,
  toDatetimeLocal,
  countLabel,
  getUser,
  updateStoredUser,
  isAdmin,
  pageUrl,
  normalizeExternalUrl,
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

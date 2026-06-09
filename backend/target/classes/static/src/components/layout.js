import { icon } from "./icons.js";

export const routes = [
  { id: "dashboard", label: "Início", icon: "music", group: "member" },
  { id: "perfil", label: "Perfil", icon: "team", group: "member" },
  { id: "equipe", label: "Equipe", icon: "team", group: "member" },
  { id: "musicas", label: "Músicas", icon: "music", group: "member" },
  { id: "membros", label: "Registros de usuários", icon: "team", adminOnly: true },
  { id: "eventos", label: "Eventos", icon: "calendar", adminOnly: true },
  { id: "escalas", label: "Escalas", icon: "chevron", group: "member" },
  { id: "registro-escalas", label: "Registro de escalas", icon: "calendar", adminOnly: true }
];

export function shell({ route, user, content, drawerOpen }) {
  const admin = isAdmin(user);
  const visibleRoutes = routes.filter((item) => !item.adminOnly || admin);
  const bottomRoutes = admin
    ? visibleRoutes.filter((item) => ["dashboard", "perfil", "equipe", "musicas", "escalas"].includes(item.id))
    : visibleRoutes;
  const memberRoutes = visibleRoutes.filter((item) => item.group === "member");
  const adminRoutes = visibleRoutes.filter((item) => item.adminOnly);
  return `
    <div class="app-shell ${drawerOpen ? "drawer-open" : ""}">
      <aside class="sidebar">
        <div class="brand">
          <span class="brand-mark">${icon("music")}</span>
          <div>
            <strong>WorshipFlow</strong>
            <small>Ministério de louvor</small>
          </div>
        </div>
        <nav class="nav-list">
          ${navGroup("Membro", memberRoutes, route)}
          ${admin ? navGroup("Administrador", adminRoutes, route) : ""}
        </nav>
      </aside>
      <button class="drawer-backdrop" data-action="close-drawer" aria-label="Fechar menu"></button>
      <main class="main">
        <header class="topbar">
          <button class="icon-button menu-button" data-action="open-drawer" aria-label="Abrir menu">${icon("menu")}</button>
          <div class="topbar-title">
            <span>Gestão de ministério</span>
            <strong>${routes.find((item) => item.id === route)?.label || "Início"}</strong>
          </div>
          <div class="topbar-actions">
            <button class="icon-button" data-action="toggle-theme" aria-label="Alternar tema">${icon(document.documentElement.dataset.theme === "dark" ? "sun" : "moon")}</button>
            <button class="ghost-user" data-route="perfil" aria-label="Abrir perfil">
              ${avatar(user)}
              <span>${escapeHtml(user.nome || "Usuário")}</span>
            </button>
            <button class="icon-button" data-action="logout" aria-label="Sair">${icon("logOut")}</button>
          </div>
        </header>
        <section class="content">${content}</section>
      </main>
      <nav class="bottom-nav">
        ${bottomRoutes.slice(0, 5).map((item) => navItem(item, route, "bottom-link")).join("")}
      </nav>
    </div>
  `;
}

function navItem(item, route, className = "nav-link") {
  const active = route === item.id ? "is-active" : "";
  return `<button class="${className} ${active}" data-route="${item.id}">${icon(item.icon)}<span>${item.label}</span></button>`;
}

function navGroup(label, items, route) {
  if (!items.length) return "";

  return `
    <div class="nav-group">
      <span class="nav-group-label">${label}</span>
      ${items.map((item) => navItem(item, route)).join("")}
    </div>
  `;
}

function isAdmin(user) {
  return user?.perfil === "ADMIN";
}

function avatar(user) {
  if (user?.fotoPerfil) {
    const type = user.fotoPerfilTipo || "image/png";
    return `<span class="user-avatar"><img src="data:${escapeHtml(type)};base64,${escapeHtml(user.fotoPerfil)}" alt="" /></span>`;
  }

  return `<span class="user-avatar">${initials(user?.nome)}</span>`;
}

function initials(name = "") {
  const letters = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return letters || "WF";
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

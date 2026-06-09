import { shell } from "./components/layout.js";
import { showToast } from "./components/toast.js";
import { dashboardPage } from "./pages/dashboardPage.js";
import { crudPage, pageConfigs } from "./pages/crudPage.js";
import { escalasPage } from "./pages/escalasPage.js";
import { loginPage } from "./pages/loginPage.js";
import { profilePage } from "./pages/profilePage.js";
import { teamPage } from "./pages/teamPage.js";
import { api } from "./services/api.js";
import { forgotPassword, getUser, login, logout, register, resetPassword, toggleFavoriteMusic, updateProfile, updateStoredUser } from "./services/authService.js";

const app = document.getElementById("app");
const adminRoutes = ["membros", "eventos", "registro-escalas"];

const state = {
  route: currentRoute(),
  authMode: currentAuthMode(),
  resetToken: currentResetToken(),
  drawerOpen: false,
  user: getUser(),
  apiOnline: true,
  loading: false,
  editing: null,
  data: {
    usuarios: [],
    equipe: [],
    musicas: [],
    eventos: [],
    escalas: []
  }
};

document.documentElement.dataset.theme = localStorage.getItem("worshipflow:theme") || "light";

async function loadData() {
  state.loading = true;
  render();

  try {
    try {
      const profilePayload = await api.request("/auth/me");
      state.user = profilePayload.data;
      updateStoredUser(state.user);
    } catch (error) {
      if (state.route === "perfil") {
        showToast("Perfil carregado com dados locais. Atualize a página se os dados não aparecerem completos.", "error");
      } else {
        throw error;
      }
    }

    const [musicas, equipe, escalas] = await Promise.all([
      api.list("musicas"),
      api.list("usuarios/equipe"),
      api.list("escalas")
    ]);
    let usuarios = [];
    let eventos = [];

    if (isAdmin(state.user)) {
      [usuarios, eventos] = await Promise.all([
        api.list("usuarios"),
        api.list("eventos")
      ]);
    }

    state.data = { usuarios, equipe, musicas, eventos, escalas };
    state.apiOnline = true;
  } catch (error) {
    state.apiOnline = false;
    showToast(`API indisponível em ${api.baseUrl}`, "error");
  } finally {
    state.loading = false;
    render();
  }
}

function render() {
  if (!state.user) {
    app.innerHTML = loginPage(state.authMode, state.resetToken);
    return;
  }

  if (adminRoutes.includes(state.route) && !isAdmin(state.user)) {
    state.route = "dashboard";
    location.hash = "/dashboard";
  }

  const content = state.loading ? loadingView() : routeContent();
  app.innerHTML = shell({
    route: state.route,
    user: state.user,
    drawerOpen: state.drawerOpen,
    content
  });
}

function routeContent() {
  if (state.route === "dashboard") {
    return dashboardPage({ ...state.data, musicos: state.data.equipe, apiOnline: state.apiOnline });
  }

  if (state.route === "perfil") {
    return profilePage(state.user);
  }

  if (state.route === "equipe") {
    return teamPage(state.data.equipe);
  }

  if (state.route === "escalas") {
    return escalasPage({
      ...state.data,
      editing: state.editing?.resource === "escalas" ? state.editing.item : null,
      canManage: false
    });
  }

  if (state.route === "registro-escalas") {
    return escalasPage({
      ...state.data,
      editing: state.editing?.resource === "escalas" ? state.editing.item : null,
      canManage: true
    });
  }

  const config = pageConfigs[state.route];
  if (!config) {
    return dashboardPage({ ...state.data, musicos: state.data.equipe, apiOnline: state.apiOnline });
  }

  return crudPage(
    config,
    state.data[config.resource],
    state.editing?.resource === config.resource ? state.editing.item : null,
    state.user
  );
}

function loadingView() {
  return `
    <div class="loading-state">
      <span class="loader"></span>
      <strong>Carregando dados do ministério...</strong>
    </div>
  `;
}

function navigate(route) {
  if (adminRoutes.includes(route) && !isAdmin(state.user)) {
    showToast("Acesso permitido apenas para administradores.", "error");
    return;
  }

  state.route = route;
  state.drawerOpen = false;
  state.editing = null;
  location.hash = `/${route}`;
  render();
}

function normalizePayload(resource, form) {
  const formData = new FormData(form);

  if (resource === "escalas") {
    return {
      titulo: formData.get("titulo"),
      status: formData.get("status"),
      observacoes: formData.get("observacoes"),
      eventoId: Number(formData.get("eventoId")),
      usuarioIds: formData.getAll("usuarioIds").map(Number),
      musicaIds: formData.getAll("musicaIds").map(Number)
    };
  }

  const payload = Object.fromEntries(formData.entries());
  if (resource === "musicas" && payload.bpm) payload.bpm = Number(payload.bpm);
  if (payload.bpm === "") payload.bpm = null;
  return payload;
}

async function saveResource(form) {
  const resource = form.dataset.form;
  const id = form.dataset.id;
  const payload = normalizePayload(resource, form);

  state.loading = true;
  render();

  try {
    const result = id
      ? await api.update(resource, id, payload)
      : await api.create(resource, payload);

    showToast(result.message || "Registro salvo com sucesso.");
    state.editing = null;
    await loadData();
  } catch (error) {
    state.loading = false;
    showToast(error.message, "error");
    render();
  }
}

async function deleteResource(resource, id) {
  const confirmed = await confirmDelete();
  if (!confirmed) return;

  try {
    const result = await api.remove(resource, id);
    showToast(result.message || "Registro removido com sucesso.");
    await loadData();
  } catch (error) {
    showToast(error.message, "error");
  }
}

function confirmDelete() {
  return new Promise((resolve) => {
    const dialog = document.createElement("div");
    dialog.className = "confirm-dialog-backdrop";
    Object.assign(dialog.style, {
      position: "fixed",
      inset: "0",
      zIndex: "1000",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "18px",
      background: "rgba(7, 17, 31, 0.56)"
    });
    dialog.innerHTML = `
      <div class="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title">
        <span class="confirm-dialog-icon" aria-hidden="true">!</span>
        <div class="confirm-dialog-copy">
          <h2 id="delete-dialog-title">Excluir registro?</h2>
          <p>Esta ação não pode ser desfeita. Confirme apenas se deseja remover este item definitivamente.</p>
        </div>
        <div class="confirm-dialog-actions">
          <button class="button" type="button" data-confirm-action="cancel">Cancelar</button>
          <button class="button primary danger-action" type="button" data-confirm-action="confirm">Excluir</button>
        </div>
      </div>
    `;
    Object.assign(dialog.querySelector(".confirm-dialog").style, {
      position: "relative",
      margin: "auto"
    });

    const close = (result) => {
      document.removeEventListener("keydown", handleKeydown);
      dialog.remove();
      resolve(result);
    };

    const handleKeydown = (event) => {
      if (event.key === "Escape") close(false);
    };

    dialog.addEventListener("click", (event) => {
      const action = event.target.closest("[data-confirm-action]")?.dataset.confirmAction;

      if (event.target === dialog || action === "cancel") {
        close(false);
        return;
      }

      if (action === "confirm") close(true);
    });

    document.addEventListener("keydown", handleKeydown);
    document.body.appendChild(dialog);
    dialog.querySelector("[data-confirm-action='cancel']").focus();
  });
}

async function favoriteMusic(id) {
  try {
    const result = await toggleFavoriteMusic(id);
    state.user = result.data;
    updateStoredUser(state.user);
    showToast(result.message || "Música favorita atualizada.");
    render();
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function saveProfile(form) {
  try {
    const payload = await profilePayloadFromForm(form);

    state.loading = true;
    render();

    const result = await updateProfile(payload);
    state.user = result.data;
    updateStoredUser(state.user);
    showToast(result.message || "Perfil atualizado com sucesso.");
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    state.loading = false;
    render();
  }
}

document.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.target;

  if (form.dataset.form === "login") {
    try {
      state.user = await login(Object.fromEntries(new FormData(form).entries()));
      state.authMode = "login";
      showToast("Login realizado com sucesso.");
      await loadData();
    } catch (error) {
      showToast(error.message, "error");
    }
    return;
  }

  if (form.dataset.form === "register") {
    try {
      state.user = await register(Object.fromEntries(new FormData(form).entries()));
      state.authMode = "login";
      showToast("Cadastro realizado com sucesso.");
      await loadData();
    } catch (error) {
      showToast(error.message, "error");
    }
    return;
  }

  if (form.dataset.form === "forgot-password") {
    try {
      const result = await forgotPassword(new FormData(form).get("email"));
      showToast(result.message || "Verifique seu e-mail.");
      state.authMode = "login";
      location.hash = "/";
      render();
    } catch (error) {
      showToast(error.message, "error");
    }
    return;
  }

  if (form.dataset.form === "reset-password") {
    try {
      const data = Object.fromEntries(new FormData(form).entries());
      if (data.novaSenha !== data.confirmarNovaSenha) {
        showToast("As senhas informadas nao conferem.", "error");
        return;
      }

      const result = await resetPassword({
        token: data.token,
        novaSenha: data.novaSenha
      });
      showToast(result.message || "Senha redefinida com sucesso.");
      state.authMode = "login";
      state.resetToken = "";
      location.hash = "/";
      render();
    } catch (error) {
      showToast(error.message, "error");
    }
    return;
  }

  if (form.dataset.form === "profile") {
    saveProfile(form);
    return;
  }

  saveResource(form);
});

document.addEventListener("click", (event) => {
  const authTarget = event.target.closest("[data-auth-view]");
  if (authTarget) {
    state.authMode = authTarget.dataset.authView;
    location.hash = state.authMode === "login" ? "/" : `/${state.authMode}`;
    renderAuthView();
    return;
  }

  const routeTarget = event.target.closest("[data-route]");
  if (routeTarget) {
    navigate(routeTarget.dataset.route);
    return;
  }

  const actionTarget = event.target.closest("[data-action]");
  if (!actionTarget) return;

  const { action, resource, id } = actionTarget.dataset;

  if (action === "open-drawer") state.drawerOpen = true;
  if (action === "close-drawer") state.drawerOpen = false;
  if (action === "refresh") loadData();
  if (action === "logout") {
    logout();
    state.user = null;
    state.route = "dashboard";
  }
  if (action === "toggle-theme") {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("worshipflow:theme", next);
  }
  if (action === "cancel-edit") state.editing = null;
  if (action === "edit") {
    state.editing = {
      resource,
      item: state.data[resource].find((item) => String(item.id) === String(id))
    };
  }
  if (action === "delete") {
    deleteResource(resource, id);
    return;
  }
  if (action === "favorite-music") favoriteMusic(id);

  render();
});

window.addEventListener("hashchange", () => {
  state.route = currentRoute();
  state.authMode = currentAuthMode();
  state.resetToken = currentResetToken();
  state.editing = null;
  render();
});

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("./service-worker.js").catch(() => {});
}

render();
if (state.user) loadData();

function currentRoute() {
  const hash = location.hash.replace("#/", "").split("?")[0];
  return hash && !["register", "forgot", "redefinir-senha"].includes(hash) ? hash : "dashboard";
}

function currentAuthMode() {
  const hash = location.hash.replace("#/", "").split("?")[0];
  if (hash === "register") return "register";
  if (hash === "forgot") return "forgot";
  if (hash === "redefinir-senha") return "reset";
  return "login";
}

function currentResetToken() {
  const query = location.hash.split("?")[1] || "";
  return new URLSearchParams(query).get("token") || "";
}

function isAdmin(user) {
  return user?.perfil === "ADMIN";
}

function renderAuthView() {
  if (state.user || !document.startViewTransition) {
    render();
    return;
  }

  document.startViewTransition(() => {
    render();
  });
}

async function profilePayloadFromForm(form) {
  const formData = new FormData(form);
  const file = formData.get("foto");
  const payload = {
    nome: formData.get("nome"),
    telefone: formData.get("telefone"),
    instrumentoPrincipal: formData.get("instrumentoPrincipal"),
    habilidades: formData.get("habilidades"),
    removerFoto: formData.get("removerFoto") === "true"
  };

  if (file?.size) {
    if (file.size > 1_000_000) {
      throw new Error("A foto deve ter no máximo 1 MB.");
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      throw new Error("Use uma foto JPG, PNG ou WEBP.");
    }

    const dataUrl = await readFileAsDataUrl(file);
    payload.fotoPerfil = dataUrl.split(",")[1];
    payload.fotoPerfilTipo = file.type;
    payload.removerFoto = false;
  }

  return payload;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Não foi possível carregar a foto."));
    reader.readAsDataURL(file);
  });
}

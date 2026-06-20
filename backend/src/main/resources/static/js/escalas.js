const API = window.WorshipFlowApi;
const App = window.WorshipFlow;

let escalas = [];
let usuarios = [];
let musicas = [];
let user = null;

const form = document.getElementById("escala-form");
const cancelButton = document.getElementById("cancel-edit");
const list = document.getElementById("escalas-list");
const adminList = document.getElementById("admin-escalas-list");
const adminLayout = document.getElementById("admin-scale-layout");
const publicPanel = document.getElementById("public-scale-panel");

function isAdminMode() {
  return App.isAdmin(user) && new URLSearchParams(location.search).get("modo") === "admin";
}

function resetForm() {
  form.reset();
  form.elements.id.value = "";
  document.getElementById("form-title").textContent = "Nova escala";
  cancelButton.hidden = true;
  document.querySelectorAll("#usuarios-options input, #musicas-options input").forEach((input) => {
    input.checked = false;
  });
}

function optionLabel(item, subtitle) {
  return `<strong>${App.escapeHtml(item.nome || item.titulo)}</strong><small>${App.escapeHtml(subtitle || "Detalhes nao informados")}</small>`;
}

function renderFormOptions() {
  document.getElementById("usuarios-options").innerHTML = usuarios.length ? usuarios.map((usuario) => `
    <label class="check-option">
      <input type="checkbox" name="usuarioIds" value="${usuario.id}" />
      <span>${optionLabel(usuario, usuario.instrumentoPrincipal || "Funcao nao informada")}</span>
    </label>
  `).join("") : '<div class="empty compact">Nenhum membro cadastrado.</div>';

  document.getElementById("musicas-options").innerHTML = musicas.length ? musicas.map((musica) => `
    <label class="check-option">
      <input type="checkbox" name="musicaIds" value="${musica.id}" />
      <span>${optionLabel(musica, [musica.artista, musica.tonalidade ? `Tom ${musica.tonalidade}` : ""].filter(Boolean).join(" - "))}</span>
    </label>
  `).join("") : '<div class="empty compact">Nenhuma musica cadastrada.</div>';
}

function fillForm(escala) {
  form.elements.id.value = escala.id;
  form.elements.titulo.value = escala.titulo || "";
  form.elements.status.value = escala.status || "RASCUNHO";
  form.elements.observacoes.value = escala.observacoes || "";

  const selectedUsers = new Set((escala.usuarios || []).map((item) => String(item.id)));
  const selectedSongs = new Set((escala.musicas || []).map((item) => String(item.id)));

  document.querySelectorAll("#usuarios-options input").forEach((input) => {
    input.checked = selectedUsers.has(input.value);
  });
  document.querySelectorAll("#musicas-options input").forEach((input) => {
    input.checked = selectedSongs.has(input.value);
  });

  document.getElementById("form-title").textContent = "Editar escala";
  cancelButton.hidden = false;
  form.scrollIntoView({ behavior: "smooth", block: "start" });
}

function card(escala, canManage) {
  const escalaMusicas = escala.musicas || [];
  const escalaUsuarios = escala.usuarios || [];
  return `
    <article class="scale-card">
      <div class="scale-card-header">
        <div><strong>${App.escapeHtml(escala.titulo)}</strong></div>
        <span class="status">${App.escapeHtml(escala.status || "-")}</span>
      </div>
      <div class="scale-detail-grid">
        <section class="scale-section">
          <h3>Equipe</h3>
          ${escalaUsuarios.length ? escalaUsuarios.map((usuario) => `<article class="scale-person"><div><strong>${App.escapeHtml(usuario.nome)}</strong><p>${App.escapeHtml(usuario.instrumentoPrincipal || "Funcao nao informada")}${usuario.habilidades ? ` - ${App.escapeHtml(usuario.habilidades)}` : ""}</p></div><small>Louvores: ${escalaMusicas.length ? escalaMusicas.map((musica) => App.escapeHtml(musica.titulo)).join(", ") : "nenhuma musica definida"}</small></article>`).join("") : '<p class="muted-text">Nenhum membro selecionado.</p>'}
        </section>
        <section class="scale-section">
          <h3>Repert&oacute;rio</h3>
          ${escalaMusicas.length ? `<ul class="scale-song-list">${escalaMusicas.map((musica) => `<li><strong>${App.escapeHtml(musica.titulo)}</strong><span>${App.escapeHtml(musica.tonalidade || "Tom nao informado")}</span></li>`).join("")}</ul>` : '<p class="muted-text">Nenhuma musica selecionada.</p>'}
        </section>
      </div>
      ${escala.observacoes ? `<p class="scale-note">${App.escapeHtml(escala.observacoes)}</p>` : ""}
      ${canManage ? `<div class="form-actions"><button class="button small" type="button" data-action="edit" data-id="${escala.id}">Editar</button><button class="button small danger" type="button" data-action="delete" data-id="${escala.id}">Excluir</button></div>` : ""}
    </article>
  `;
}

function renderLists() {
  const empty = '<div class="empty">Nenhuma escala cadastrada.</div>';
  list.innerHTML = escalas.length ? escalas.map((escala) => card(escala, false)).join("") : empty;
  adminList.innerHTML = escalas.length ? escalas.map((escala) => card(escala, true)).join("") : empty;
}

async function loadEscalas() {
  escalas = await API.getData("/escalas");

  if (isAdminMode()) {
    [usuarios, musicas] = await Promise.all([
      API.getData("/usuarios"),
      API.getData("/musicas")
    ]);
    renderFormOptions();
  }

  renderLists();
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const id = formData.get("id");
  const payload = {
    titulo: formData.get("titulo"),
    status: formData.get("status"),
    observacoes: formData.get("observacoes"),
    usuarioIds: formData.getAll("usuarioIds").map(Number),
    musicaIds: formData.getAll("musicaIds").map(Number)
  };

  try {
    const response = id ? await API.putData(`/escalas/${id}`, payload) : await API.postData("/escalas", payload);
    App.showToast(response.message || "Escala salva com sucesso.");
    resetForm();
    await loadEscalas();
  } catch (error) {
    App.showToast(error.message, "error");
  }
});

adminList.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const id = Number(button.dataset.id);
  const escala = escalas.find((item) => item.id === id);

  if (button.dataset.action === "edit" && escala) fillForm(escala);

  if (button.dataset.action === "delete" && await App.confirmDelete("Excluir escala?")) {
    try {
      const response = await API.deleteData(`/escalas/${id}`);
      App.showToast(response.message || "Escala removida com sucesso.");
      await loadEscalas();
    } catch (error) {
      App.showToast(error.message, "error");
    }
  }
});

cancelButton.addEventListener("click", resetForm);
document.getElementById("refresh-button").addEventListener("click", loadEscalas);

(async function init() {
  user = await App.requireAuth();
  if (!user) return;

  const manage = isAdminMode();
  App.setupShell(user, manage ? "registro-escalas" : "escalas");
  adminLayout.hidden = !manage;
  publicPanel.hidden = manage;
  document.getElementById("page-description").textContent = manage
    ? "Relacione equipe e repert\u00f3rio em uma escala publicavel."
    : "Consulte a equipe, o repert\u00f3rio e as observacoes das proximas escalas.";

  await loadEscalas();
})();

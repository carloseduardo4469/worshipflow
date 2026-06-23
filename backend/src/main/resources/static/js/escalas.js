const API = window.WorshipFlowApi;
const App = window.WorshipFlow;

let escalas = [];
let usuarios = [];
let musicas = [];
let user = null;
let memberSearch = null;
let scaleMusicSearch = null;
let scaleMusicToneFilter = null;

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
  updateMemberRoleVisibility();
}

function optionLabel(item, subtitle) {
  return `<strong>${App.escapeHtml(item.nome || item.titulo)}</strong><small>${App.escapeHtml(subtitle || "Detalhes não informados")}</small>`;
}

function memberSkills(usuario) {
  return App.formatSkills(usuario.habilidades)
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

function memberRolePicker(usuario) {
  const skills = memberSkills(usuario);
  if (!skills.length) {
    return '<p class="member-role-empty">Cadastre habilidades no perfil deste membro para escolher a função.</p>';
  }

  return `
    <div class="member-role-options">
      ${skills.map((skill) => `
        <label class="member-role-chip">
          <input type="radio" name="funcaoUsuario-${usuario.id}" value="${App.escapeHtml(skill)}" />
          <span>${App.escapeHtml(skill)}</span>
        </label>
      `).join("")}
    </div>
  `;
}

function updateMemberRoleVisibility() {
  document.querySelectorAll("[data-member-option]").forEach((option) => {
    const checkbox = option.querySelector('input[name="usuarioIds"]');
    const rolePicker = option.querySelector("[data-role-picker]");
    if (!checkbox || !rolePicker) return;

    rolePicker.hidden = !checkbox.checked;

    if (!checkbox.checked) {
      option.querySelectorAll('input[type="radio"]').forEach((radio) => {
        radio.checked = false;
      });
      return;
    }

    if (checkbox.checked && !option.querySelector('input[type="radio"]:checked')) {
      const firstRole = option.querySelector('input[type="radio"]');
      if (firstRole) firstRole.checked = true;
    }
  });
}

function findRoleInput(usuarioId, funcao) {
  return Array.from(form.querySelectorAll(`input[name="funcaoUsuario-${usuarioId}"]`))
    .find((input) => input.value === funcao);
}

function scaleDateLabel(value) {
  if (!value) return "Data não definida";
  const [year, month, day] = String(value).split("-").map(Number);
  if (!year || !month || !day) return "Data não definida";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    weekday: "short"
  }).format(new Date(year, month - 1, day)).replace(".", "");
}

function renderFormOptions() {
  document.getElementById("usuarios-options").innerHTML = usuarios.length ? usuarios.map((usuario) => `
    <article class="check-option member-option" data-member-option data-member-id="${usuario.id}">
      <label class="member-main-check">
        <input type="checkbox" name="usuarioIds" value="${usuario.id}" />
        <span>${optionLabel(usuario, App.formatSkills(usuario.habilidades) || "Habilidades não informadas")}</span>
      </label>
      <div class="member-role-picker" data-role-picker hidden>
        <strong>Função nesta escala</strong>
        ${memberRolePicker(usuario)}
      </div>
    </article>
  `).join("") : '<div class="empty compact">Nenhum membro cadastrado.</div>';

  document.getElementById("musicas-options").innerHTML = musicas.length ? musicas.map((musica) => `
    <label class="check-option" data-music-option data-music-id="${musica.id}">
      <input type="checkbox" name="musicaIds" value="${musica.id}" />
      <span>${optionLabel(musica, [musica.artista, musica.tonalidade ? `Tom ${musica.tonalidade}` : ""].filter(Boolean).join(" - "))}</span>
    </label>
  `).join("") : '<div class="empty compact">Nenhuma musica cadastrada.</div>';
}

function applyOptionVisibility(containerSelector, optionSelector, dataKey, items) {
  const ids = new Set(items.map((item) => String(item.id)));
  document.querySelectorAll(`${containerSelector} ${optionSelector}`).forEach((option) => {
    option.hidden = !ids.has(String(option.dataset[dataKey]));
  });
}

function setupFormSearches() {
  if (!window.WorshipFlowSearch) return;

  if (!memberSearch) {
    memberSearch = window.WorshipFlowSearch.create({
      input: "#scale-member-search",
      clearButton: "#scale-member-search-clear",
      counter: "#scale-member-search-count",
      fields: ["nome", "email", "habilidades", "instrumentoPrincipal"],
      onChange: (items) => applyOptionVisibility("#usuarios-options", "[data-member-option]", "memberId", items)
    });
  }

  if (!scaleMusicSearch) {
    scaleMusicSearch = window.WorshipFlowSearch.create({
      input: "#scale-music-search",
      clearButton: "#scale-music-search-clear",
      counter: "#scale-music-search-count",
      fields: ["titulo", "artista", "tonalidade", "bpm"],
      filter: (musica, filters) => {
        if (!filters.tonalidade) return true;
        return window.WorshipFlowSearch.normalizeTone(musica.tonalidade) === window.WorshipFlowSearch.normalizeTone(filters.tonalidade);
      },
      onChange: (items) => applyOptionVisibility("#musicas-options", "[data-music-option]", "musicId", items)
    });
  }

  if (!scaleMusicToneFilter) {
    scaleMusicToneFilter = window.WorshipFlowSearch.createToneFilter({
      button: "#scale-music-tone-filter",
      menu: "#scale-music-tone-menu",
      onChange: (tone) => scaleMusicSearch?.setFilter("tonalidade", tone)
    });
  }

  memberSearch.setItems(usuarios);
  scaleMusicSearch.setItems(musicas);
}

function fillForm(escala) {
  form.elements.id.value = escala.id;
  form.elements.titulo.value = escala.titulo || "";
  form.elements.dataEscala.value = escala.dataEscala || "";
  form.elements.status.value = escala.status || "RASCUNHO";
  form.elements.observacoes.value = escala.observacoes || "";

  const selectedUsers = new Set((escala.usuarios || []).map((item) => String(item.id)));
  const selectedSongs = new Set((escala.musicas || []).map((item) => String(item.id)));
  const funcoesUsuarios = escala.funcoesUsuarios || {};

  document.querySelectorAll("#usuarios-options input").forEach((input) => {
    if (input.name === "usuarioIds") {
      input.checked = selectedUsers.has(input.value);
    }
  });
  document.querySelectorAll("#musicas-options input").forEach((input) => {
    input.checked = selectedSongs.has(input.value);
  });
  document.querySelectorAll('#usuarios-options input[type="radio"]').forEach((input) => {
    input.checked = false;
  });
  Object.entries(funcoesUsuarios).forEach(([usuarioId, funcao]) => {
    const radio = findRoleInput(usuarioId, funcao);
    if (radio) radio.checked = true;
  });
  updateMemberRoleVisibility();

  document.getElementById("form-title").textContent = "Editar escala";
  cancelButton.hidden = false;
  form.scrollIntoView({ behavior: "smooth", block: "start" });
}

function statusInfo(value) {
  const status = String(value || "RASCUNHO").toUpperCase();
  const map = {
    RASCUNHO: {
      label: "Rascunho",
      className: "status-rascunho",
      title: "Escala em edição. Ainda não foi publicada para o ministério."
    },
    PUBLICADA: {
      label: "Publicada",
      className: "status-publicada",
      title: "Escala publicada e visível para a equipe."
    },
    CONCLUIDA: {
      label: "Concluída",
      className: "status-concluida",
      title: "Escala já concluída."
    },
    CANCELADA: {
      label: "Cancelada",
      className: "status-cancelada",
      title: "Escala cancelada. Não deve ser considerada no planejamento."
    }
  };

  return map[status] || {
    label: status,
    className: "status-indefinido",
    title: "Status não reconhecido."
  };
}

function songCard(musica) {
  return `
    <li class="scale-song-card">
      <div class="scale-song-card-header">
        <strong>${App.escapeHtml(musica.titulo || "Musica sem titulo")}</strong>
      </div>
      <dl class="scale-song-meta">
        <div>
          <dt>Artista</dt>
          <dd>${App.escapeHtml(musica.artista || "Artista não informado")}</dd>
        </div>
        <div>
          <dt>Tom</dt>
          <dd>${App.escapeHtml(musica.tonalidade || "-")}</dd>
        </div>
        <div>
          <dt>BPM</dt>
          <dd>${App.escapeHtml(musica.bpm || "-")}</dd>
        </div>
      </dl>
    </li>
  `;
}

function assignedMemberRole(funcoesUsuarios, usuarioId) {
  return funcoesUsuarios?.[usuarioId] || funcoesUsuarios?.[String(usuarioId)] || "Função não definida";
}

function memberScaleCard(usuario, funcoesUsuarios) {
  return `
    <article class="scale-person">
      <div>
        <strong>${App.escapeHtml(usuario.nome)}</strong>
        <p>${App.escapeHtml(assignedMemberRole(funcoesUsuarios, usuario.id))}</p>
      </div>
    </article>
  `;
}

function card(escala, canManage) {
  const escalaMusicas = escala.musicas || [];
  const escalaUsuarios = escala.usuarios || [];
  const funcoesUsuarios = escala.funcoesUsuarios || {};
  const status = statusInfo(escala.status);
  return `
    <article class="scale-card">
      <div class="scale-card-header">
        <div>
          <strong>${App.escapeHtml(escala.titulo)}</strong>
          <p class="muted-text">${App.escapeHtml(scaleDateLabel(escala.dataEscala))}</p>
        </div>
        <span class="status scale-status ${status.className}" title="${App.escapeHtml(status.title)}"><span aria-hidden="true"></span>${App.escapeHtml(status.label)}</span>
      </div>
      <div class="scale-detail-grid">
        <section class="scale-section">
          <h3>Equipe</h3>
          ${escalaUsuarios.length ? escalaUsuarios.map((usuario) => memberScaleCard(usuario, funcoesUsuarios)).join("") : '<p class="muted-text">Nenhum membro selecionado.</p>'}
        </section>
        <section class="scale-section">
          <h3>Repert&oacute;rio</h3>
          ${escalaMusicas.length ? `<ul class="scale-song-list">${escalaMusicas.map(songCard).join("")}</ul>` : '<p class="muted-text">Nenhuma musica selecionada.</p>'}
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
      API.getData("/usuarios/equipe"),
      API.getData("/musicas")
    ]);
    renderFormOptions();
    setupFormSearches();
  }

  renderLists();
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const id = formData.get("id");
  const funcoesUsuarios = {};
  formData.getAll("usuarioIds").forEach((usuarioId) => {
    const funcao = formData.get(`funcaoUsuario-${usuarioId}`);
    if (funcao) funcoesUsuarios[usuarioId] = funcao;
  });

  const payload = {
    titulo: formData.get("titulo"),
    dataEscala: formData.get("dataEscala") || null,
    status: formData.get("status"),
    observacoes: formData.get("observacoes"),
    usuarioIds: formData.getAll("usuarioIds").map(Number),
    funcoesUsuarios,
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
document.getElementById("usuarios-options").addEventListener("change", updateMemberRoleVisibility);

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

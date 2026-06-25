const API = window.WorshipFlowApi;
const App = window.WorshipFlow;

let escalas = [];
let usuarios = [];
let musicas = [];
let user = null;
let memberSearch = null;

const form = document.getElementById("escala-form");
const cancelButton = document.getElementById("cancel-edit");
const list = document.getElementById("escalas-list");
const adminList = document.getElementById("admin-escalas-list");
const adminLayout = document.getElementById("admin-scale-layout");
const publicPanel = document.getElementById("public-scale-panel");

App.setupTextField(form.elements.titulo, {
  maxLength: 140,
  placeholder: "Ex.: Culto de domingo",
  hint: "Informe um título claro para a escala."
});
App.setupTextField(form.elements.observacoes, {
  maxLength: 600,
  placeholder: "Observações para equipe, repertório ou ensaio."
});
App.setupFutureDateField(form.elements.dataEscala);

function configureScaleDate() {
  form.elements.dataEscala.min = App.todayIsoDate();
}

function isAdminMode() {
  return App.isAdmin(user) && new URLSearchParams(location.search).get("modo") === "admin";
}

function resetForm() {
  form.reset();
  form.elements.id.value = "";
  document.getElementById("form-title").textContent = "Nova escala";
  cancelButton.hidden = true;
  configureScaleDate();
  document.querySelectorAll("#usuarios-options input").forEach((input) => {
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
          <input type="checkbox" name="funcaoUsuario-${usuario.id}" value="${App.escapeHtml(skill)}" />
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
      option.querySelectorAll('input[type="checkbox"][name^="funcaoUsuario-"]').forEach((roleInput) => {
        roleInput.checked = false;
      });
      return;
    }

    if (checkbox.checked && !option.querySelector('input[name^="funcaoUsuario-"]:checked')) {
      const firstRole = option.querySelector('input[name^="funcaoUsuario-"]');
      if (firstRole) firstRole.checked = true;
    }
  });
}

function selectedRoleNames(value = "") {
  return String(value)
    .split(",")
    .map((funcao) => funcao.trim())
    .filter(Boolean);
}

function findRoleInput(usuarioId, funcao) {
  const normalizedFuncao = App.formatSkills(funcao).trim();
  return Array.from(form.querySelectorAll(`input[name="funcaoUsuario-${usuarioId}"]`))
    .find((input) => App.formatSkills(input.value).trim() === normalizedFuncao);
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

}

function applyOptionVisibility(containerSelector, optionSelector, dataKey, items, state = {}) {
  const container = document.querySelector(containerSelector);
  const ids = new Set(items.map((item) => String(item.id)));
  document.querySelectorAll(`${containerSelector} ${optionSelector}`).forEach((option) => {
    option.hidden = !ids.has(String(option.dataset[dataKey]));
  });

  if (!container) return;

  const hasSearch = Boolean(String(state.query || "").trim());
  const hasFilters = Object.values(state.filters || {}).some((value) => Boolean(String(value || "").trim()));
  container.hidden = items.length === 0 && (hasSearch || hasFilters);
}

function setupFormSearches() {
  if (!window.WorshipFlowSearch) return;

  if (!memberSearch) {
    memberSearch = window.WorshipFlowSearch.create({
      input: "#scale-member-search",
      counter: "#scale-member-search-count",
      fields: ["nome", "email", "habilidades", "instrumentoPrincipal"],
      onChange: (items, state) => applyOptionVisibility("#usuarios-options", "[data-member-option]", "memberId", items, state)
    });
  }

  memberSearch.setItems(usuarios);
}

function fillForm(escala) {
  form.elements.id.value = escala.id;
  form.elements.titulo.value = escala.titulo || "";
  form.elements.dataEscala.value = escala.dataEscala || "";
  form.elements.status.value = escala.status || "RASCUNHO";
  form.elements.observacoes.value = escala.observacoes || "";

  const selectedUsers = new Set((escala.usuarios || []).map((item) => String(item.id)));
  const funcoesUsuarios = escala.funcoesUsuarios || {};

  document.querySelectorAll("#usuarios-options input").forEach((input) => {
    if (input.name === "usuarioIds") {
      input.checked = selectedUsers.has(input.value);
    }
  });
  document.querySelectorAll('#usuarios-options input[name^="funcaoUsuario-"]').forEach((input) => {
    input.checked = false;
  });
  Object.entries(funcoesUsuarios).forEach(([usuarioId, funcao]) => {
    selectedRoleNames(funcao).forEach((funcaoNome) => {
      const roleInput = findRoleInput(usuarioId, funcaoNome);
      if (roleInput) roleInput.checked = true;
    });
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
  const hasCifra = Boolean(String(musica.linkCifra || "").trim());
  const content = `
    <div class="scale-song-card-header">
      <strong>${App.escapeHtml(musica.titulo || "Música sem título")}</strong>
      ${hasCifra ? `<span class="scale-song-cifra-icon" title="Cifra disponível" aria-hidden="true">${App.icon("externalLink")}</span>` : ""}
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
  `;

  return `
    <li class="scale-song-card${hasCifra ? " has-cifra" : ""}">
      ${hasCifra
        ? `<a class="scale-song-card-content" href="#" data-action="open-cifra" data-music-id="${musica.id}" aria-label="Abrir cifra de ${App.escapeHtml(musica.titulo || "música")}">${content}</a>`
        : `<div class="scale-song-card-content">${content}</div>`}
    </li>
  `;
}

function findScaleSong(musicId) {
  for (const escala of escalas) {
    const musica = (escala.musicas || []).find((item) => Number(item.id) === Number(musicId));
    if (musica) return musica;
  }
  return null;
}

async function requestOpenCifra(musica) {
  const cifraUrl = App.cifraClubUrlForTone(musica?.linkCifra, musica?.tonalidade);
  if (!cifraUrl) return;

  const confirmed = await App.confirmDialog({
    title: "Abrir cifra?",
    message: `Deseja acessar a cifra de “${musica.titulo || "esta música"}”?`,
    confirmText: "Abrir cifra",
    cancelText: "Cancelar",
    iconName: "externalLink"
  });
  if (confirmed) window.open(cifraUrl, "_blank", "noopener,noreferrer");
}

function assignedMemberRole(funcoesUsuarios, usuarioId) {
  return funcoesUsuarios?.[usuarioId] || funcoesUsuarios?.[String(usuarioId)] || "Função não definida";
}

function isPrincipalSingerRole(value = "") {
  return String(value).toLowerCase().includes("cantor principal");
}

function canManageScaleSongs(escala) {
  if (!user?.id) return false;
  const isScaleMember = (escala.usuarios || []).some((usuario) => Number(usuario.id) === Number(user.id));
  if (!isScaleMember) return false;

  return isPrincipalSingerRole(assignedMemberRole(escala.funcoesUsuarios || {}, user.id));
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
        <section class="scale-section scale-repertoire-panel">
          <h3>Repert&oacute;rio</h3>
          ${escalaMusicas.length ? `<ul class="scale-song-list${escalaMusicas.length > 4 ? " is-scrollable" : ""}">${escalaMusicas.map(songCard).join("")}</ul>` : '<p class="muted-text">Nenhuma música selecionada.</p>'}
        </section>
      </div>
      ${escala.observacoes ? `<p class="scale-note">${App.escapeHtml(escala.observacoes)}</p>` : ""}
      ${canManageScaleSongs(escala) ? `<div class="scale-card-actions"><button class="button scale-song-action" type="button" data-action="songs" data-id="${escala.id}">${App.icon("music")}Adicionar músicas</button></div>` : ""}
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
    usuarios = await API.getData("/usuarios/equipe");
    renderFormOptions();
    setupFormSearches();
  }

  renderLists();
}

async function ensureMusicasLoaded() {
  if (musicas.length) return;
  musicas = await API.getData("/musicas");
}

function selectedSongsFromScale(escala) {
  return new Map((escala.musicas || []).map((musica) => [String(musica.id), musica]));
}

function normalizeSongKey(value) {
  return String(value || "").trim();
}

function songDialogRow(musica, selected) {
  const selectedSong = selected.get(String(musica.id));
  const checked = Boolean(selectedSong);
  const tonalidade = normalizeSongKey(selectedSong?.tonalidade || musica.tonalidade || "");
  const cifraUrl = App.cifraClubUrlForTone(musica.linkCifra, tonalidade || musica.tonalidade);

  return `
    <article class="scale-song-picker-item" data-song-picker-item data-search-text="${App.escapeHtml(`${musica.titulo || ""} ${musica.artista || ""} ${musica.tonalidade || ""}`.toLowerCase())}">
      <label class="scale-song-picker-main">
        <input type="checkbox" name="songIds" value="${musica.id}" ${checked ? "checked" : ""} />
        <span>
          <strong>${App.escapeHtml(musica.titulo || "Música sem título")}</strong>
          <small>Tom original: ${App.escapeHtml(musica.tonalidade || "-")}</small>
        </span>
      </label>
      <label class="scale-song-key-field">
        <span>Tom na escala</span>
        <input type="text" name="songKey-${musica.id}" value="${App.escapeHtml(tonalidade)}" maxlength="12" />
      </label>
      ${cifraUrl ? `<button class="button small" type="button" data-action="open-picker-cifra" data-song-id="${musica.id}">Cifra</button>` : '<span class="scale-song-no-cifra">Sem cifra</span>'}
    </article>
  `;
}

async function showScaleSongsDialog(escala) {
  await ensureMusicasLoaded();
  const selected = selectedSongsFromScale(escala);

  return new Promise((resolve) => {
    const backdrop = document.createElement("div");
    backdrop.className = "confirm-dialog-backdrop";
    backdrop.innerHTML = `
      <section class="confirm-dialog scale-songs-dialog" role="dialog" aria-modal="true" aria-labelledby="scale-songs-dialog-title">
        <div class="confirm-dialog-copy">
          <h2 id="scale-songs-dialog-title">Adicionar músicas</h2>
          <p>Escolha as músicas da escala e ajuste o tom sem alterar o cadastro original.</p>
        </div>
        <label class="search-field scale-song-search">
          <span>Pesquisar música</span>
          <input type="search" data-song-search placeholder="Nome, artista ou tom" autocomplete="off" />
        </label>
        <div class="scale-song-picker-list">
          ${musicas.length ? musicas.map((musica) => songDialogRow(musica, selected)).join("") : '<div class="empty compact">Nenhuma música cadastrada.</div>'}
        </div>
        <div class="confirm-dialog-actions">
          <button class="button" type="button" data-dialog-action="cancel">Cancelar</button>
          <button class="button primary" type="button" data-dialog-action="confirm">Salvar músicas</button>
        </div>
      </section>
    `;

    const searchInput = backdrop.querySelector("[data-song-search]");

    function close(result) {
      backdrop.remove();
      document.removeEventListener("keydown", onKeydown);
      resolve(result);
    }

    function onKeydown(event) {
      if (event.key === "Escape") close(null);
    }

    function payloadFromDialog() {
      const musicaIds = Array.from(backdrop.querySelectorAll('input[name="songIds"]:checked')).map((input) => Number(input.value));
      const tonalidadesMusicas = {};

      musicaIds.forEach((musicaId) => {
        const tonalidade = normalizeSongKey(backdrop.querySelector(`input[name="songKey-${musicaId}"]`)?.value);
        if (tonalidade) tonalidadesMusicas[musicaId] = tonalidade;
      });

      return { musicaIds, tonalidadesMusicas };
    }

    backdrop.addEventListener("input", (event) => {
      if (event.target !== searchInput) return;
      const query = String(searchInput.value || "").trim().toLowerCase();
      backdrop.querySelectorAll("[data-song-picker-item]").forEach((item) => {
        item.hidden = query && !String(item.dataset.searchText || "").includes(query);
      });
    });

    backdrop.addEventListener("click", (event) => {
      const cifraButton = event.target.closest("[data-action='open-picker-cifra']");
      if (cifraButton) {
        const musica = musicas.find((item) => Number(item.id) === Number(cifraButton.dataset.songId));
        const tonalidade = normalizeSongKey(backdrop.querySelector(`input[name="songKey-${cifraButton.dataset.songId}"]`)?.value) || musica?.tonalidade;
        const cifraUrl = App.cifraClubUrlForTone(musica?.linkCifra, tonalidade);
        if (cifraUrl) window.open(cifraUrl, "_blank", "noopener,noreferrer");
        return;
      }

      const action = event.target.closest("[data-dialog-action]")?.dataset.dialogAction;
      if (event.target === backdrop || action === "cancel") close(null);
      if (action === "confirm") close(payloadFromDialog());
    });

    document.addEventListener("keydown", onKeydown);
    document.body.appendChild(backdrop);
    searchInput.focus();
  });
}

async function updateScaleSongs(escala) {
  const payload = await showScaleSongsDialog(escala);
  if (!payload) return;

  try {
    const response = await API.putData(`/escalas/${escala.id}/repertorio`, payload);
    App.showToast(response.message || "Repertório atualizado com sucesso.");
    await loadEscalas();
  } catch (error) {
    App.showToast(error.message, "error");
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const validTitle = App.validateTextField(form.elements.titulo, {
    required: true,
    minLength: 3,
    maxLength: 140,
    label: "Título"
  });
  const validDate = App.validateFutureDateField(form.elements.dataEscala, {
    required: true,
    label: "Data da escala"
  });
  const validNotes = App.validateTextField(form.elements.observacoes, {
    required: false,
    minLength: 1,
    maxLength: 600,
    label: "Observações"
  });
  if (!validTitle || !validDate || !validNotes || !form.reportValidity()) return;

  const formData = new FormData(form);
  const id = formData.get("id");
  const funcoesUsuarios = {};
  formData.getAll("usuarioIds").forEach((usuarioId) => {
    const funcoes = formData.getAll(`funcaoUsuario-${usuarioId}`)
      .map((funcao) => String(funcao).trim())
      .filter(Boolean);
    if (funcoes.length) funcoesUsuarios[usuarioId] = funcoes.join(", ");
  });

  const payload = {
    titulo: App.compactText(formData.get("titulo")),
    dataEscala: formData.get("dataEscala") || null,
    status: formData.get("status"),
    observacoes: App.compactText(formData.get("observacoes")),
    usuarioIds: formData.getAll("usuarioIds").map(Number),
    funcoesUsuarios
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

  if (button.dataset.action === "open-cifra") {
    event.preventDefault();
    await requestOpenCifra(findScaleSong(button.dataset.musicId));
    return;
  }

  const id = Number(button.dataset.id);
  const escala = escalas.find((item) => item.id === id);

  if (button.dataset.action === "edit" && escala) fillForm(escala);
  if (button.dataset.action === "songs" && escala) await updateScaleSongs(escala);

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

list.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  if (button.dataset.action === "open-cifra") {
    event.preventDefault();
    await requestOpenCifra(findScaleSong(button.dataset.musicId));
    return;
  }

  const id = Number(button.dataset.id);
  const escala = escalas.find((item) => item.id === id);
  if (button.dataset.action === "songs" && escala) await updateScaleSongs(escala);
});

cancelButton.addEventListener("click", resetForm);
document.getElementById("usuarios-options").addEventListener("change", updateMemberRoleVisibility);

(async function init() {
  user = await App.requireAuth();
  if (!user) return;

  const manage = isAdminMode();
  App.setupShell(user, manage ? "registro-escalas" : "escalas");
  configureScaleDate();
  adminLayout.hidden = !manage;
  publicPanel.hidden = manage;
  document.getElementById("page-description").textContent = manage
    ? "Relacione equipe e repertório em uma escala publicável."
    : "Consulte a equipe, o repertório e as observações das próximas escalas.";

  await loadEscalas();
})();

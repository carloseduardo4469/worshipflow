const API = window.WorshipFlowApi;
const App = window.WorshipFlow;

let musicas = [];
let user = null;
let musicSearch = null;

const form = document.getElementById("musica-form");
const list = document.getElementById("musicas-list");
const cancelButton = document.getElementById("cancel-edit");

function resetForm() {
  form.reset();
  form.elements.id.value = "";
  document.getElementById("form-title").textContent = "Novo louvor";
  cancelButton.hidden = true;
}

function fillForm(musica) {
  form.elements.id.value = musica.id;
  form.elements.titulo.value = musica.titulo || "";
  form.elements.artista.value = musica.artista || "";
  form.elements.tonalidade.value = musica.tonalidade || "";
  form.elements.bpm.value = musica.bpm || "";
  form.elements.linkCifra.value = musica.linkCifra || "";
  document.getElementById("form-title").textContent = "Editar louvor";
  cancelButton.hidden = false;
  form.scrollIntoView({ behavior: "smooth", block: "start" });
}

function hasCifra(musica) {
  return Boolean(String(musica.linkCifra || "").trim());
}

function cifraStatus(musica) {
  return hasCifra(musica)
    ? `<span class="cifra-status cifra-status-ok" title="Cifra cadastrada" aria-label="Cifra cadastrada">${App.icon("checkCircle")}</span>`
    : `<span class="cifra-status cifra-status-missing" title="Sem cifra cadastrada" aria-label="Sem cifra cadastrada">${App.icon("xCircle")}</span>`;
}

function normalizeUrl(value) {
  const url = String(value || "").trim();
  if (!url) return "";
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function showCifraDialog(musica) {
  return new Promise((resolve) => {
    const backdrop = document.createElement("div");
    backdrop.className = "confirm-dialog-backdrop";
    backdrop.innerHTML = `
      <section class="confirm-dialog cifra-dialog" role="dialog" aria-modal="true" aria-labelledby="cifra-dialog-title">
        <div class="confirm-dialog-icon cifra-dialog-icon">${App.icon("externalLink")}</div>
        <div class="confirm-dialog-copy">
          <h2 id="cifra-dialog-title">Ver cifra?</h2>
          <p>Gostaria de ver a cifra de "${App.escapeHtml(musica.titulo)}"?</p>
        </div>
        <div class="confirm-dialog-actions">
          <button class="button" type="button" data-dialog-action="cancel">Cancelar</button>
          <button class="button primary" type="button" data-dialog-action="confirm">Ver cifra</button>
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

function renderList(items = musicas) {
  if (!items.length) {
    list.innerHTML = musicas.length
      ? '<div class="empty compact">Nenhuma musica encontrada para a pesquisa.</div>'
      : '<div class="empty compact">Nenhuma musica cadastrada.</div>';
    return;
  }

  const favorites = new Set((user?.musicasFavoritas || []).map((musica) => musica.id));
  list.innerHTML = items.map((musica) => `
    <article class="music-record">
      <div class="music-record-main">
        <button class="music-title-button" type="button" data-action="open-cifra" data-id="${musica.id}" ${hasCifra(musica) ? "" : "disabled"} title="${hasCifra(musica) ? "Abrir cifra" : "Sem link de cifra"}">
          <span>${App.escapeHtml(musica.titulo)}</span>
          ${cifraStatus(musica)}
        </button>
        <dl class="music-record-details">
          <div><dt>Artista</dt><dd>${App.escapeHtml(musica.artista || "-")}</dd></div>
          <div><dt>Tom</dt><dd>${App.escapeHtml(musica.tonalidade || "-")}</dd></div>
          <div><dt>BPM</dt><dd>${App.escapeHtml(musica.bpm || "-")}</dd></div>
        </dl>
      </div>
      <div class="music-record-actions">
        <button class="icon-button favorite-button ${favorites.has(musica.id) ? "is-active" : ""}" type="button" data-action="favorite" data-id="${musica.id}" aria-label="Favoritar">${App.icon("star")}</button>
        <button class="icon-button" type="button" data-action="edit" data-id="${musica.id}" aria-label="Editar">${App.icon("save")}</button>
        <button class="icon-button danger" type="button" data-action="delete" data-id="${musica.id}" aria-label="Excluir">${App.icon("trash")}</button>
      </div>
    </article>
  `).join("");
}

async function loadMusicas() {
  musicas = await API.getData("/musicas");
  if (musicSearch) {
    musicSearch.setItems(musicas);
    return;
  }
  renderList(musicas);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = App.formToObject(form);
  const id = data.id;
  delete data.id;
  data.bpm = data.bpm ? Number(data.bpm) : null;

  try {
    const response = id ? await API.putData(`/musicas/${id}`, data) : await API.postData("/musicas", data);
    App.showToast(response.message || "Louvor salvo com sucesso.");
    resetForm();
    await loadMusicas();
  } catch (error) {
    App.showToast(error.message, "error");
  }
});

list.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const id = Number(button.dataset.id);
  const musica = musicas.find((item) => item.id === id);
  if (!musica) return;

  if (button.dataset.action === "open-cifra") {
    if (!hasCifra(musica)) return;
    if (await showCifraDialog(musica)) {
      window.open(normalizeUrl(musica.linkCifra), "_blank", "noopener,noreferrer");
    }
  }

  if (button.dataset.action === "edit") fillForm(musica);

  if (button.dataset.action === "delete" && await App.confirmDelete("Excluir musica?")) {
    try {
      const response = await API.deleteData(`/musicas/${id}`);
      App.showToast(response.message || "Musica removida com sucesso.");
      await loadMusicas();
    } catch (error) {
      App.showToast(error.message, "error");
    }
  }

  if (button.dataset.action === "favorite") {
    try {
      const response = await API.postData(`/auth/favoritos/musicas/${id}`, {});
      user = response.data;
      App.updateStoredUser(user);
      App.showToast(response.message || "Musica favorita atualizada.");
      musicSearch?.apply() || renderList(musicas);
    } catch (error) {
      App.showToast(error.message, "error");
    }
  }
});

cancelButton.addEventListener("click", resetForm);
document.getElementById("refresh-button").addEventListener("click", loadMusicas);

(async function init() {
  user = await App.requireAuth();
  if (!user) return;
  App.setupShell(user, "musicas");
  await loadMusicas();
  musicSearch = window.WorshipFlowSearch.create({
    input: "#music-search",
    clearButton: "#music-search-clear",
    counter: "#music-search-count",
    fields: ["titulo", "artista", "tonalidade", "bpm"],
    items: musicas,
    onChange: renderList
  });
})();

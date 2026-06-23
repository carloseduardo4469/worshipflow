const API = window.WorshipFlowApi;
const App = window.WorshipFlow;

let musicas = [];
let user = null;
let page = 0;
let hasMore = true;
let loading = false;
let pendingReset = false;
let currentQuery = "";
let currentTone = "";
let loadObserver = null;
let searchTimer = null;
let toneFilter = null;

const PAGE_SIZE = 20;

const form = document.getElementById("musica-form");
const list = document.getElementById("musicas-list");
const cancelButton = document.getElementById("cancel-edit");
const searchInput = document.getElementById("music-search");
const searchClearButton = document.getElementById("music-search-clear");
const searchCounter = document.getElementById("music-search-count");
const loadMoreSentinel = document.createElement("div");

loadMoreSentinel.className = "empty compact";
loadMoreSentinel.id = "musicas-load-sentinel";

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

function normalizeKey(value) {
  const key = String(value || "").trim();
  if (!key) return "";

  const match = key.match(/^([A-Ga-g])([#b]?)(m?)$/);
  if (!match) return null;

  return `${match[1].toUpperCase()}${match[2]}${match[3].toLowerCase()}`;
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

function updateCounter() {
  if (!searchCounter) return;
  const suffix = hasMore ? "carregados" : "registros";
  const filtered = Boolean(currentQuery || currentTone);
  searchCounter.textContent = filtered
    ? `${musicas.length} resultados ${suffix}`
    : `${musicas.length} ${suffix}`;
}

function updateLoadState() {
  loadMoreSentinel.hidden = !musicas.length && !loading;
  loadMoreSentinel.textContent = loading
    ? "Carregando mais musicas..."
    : hasMore
      ? "Continue descendo para carregar mais."
      : "Fim da lista.";
}

function renderList() {
  updateCounter();

  if (!musicas.length) {
    list.innerHTML = loading
      ? '<div class="empty compact">Carregando musicas...</div>'
      : currentQuery || currentTone
        ? '<div class="empty compact">Nenhuma musica encontrada para a pesquisa.</div>'
        : '<div class="empty compact">Nenhuma musica cadastrada.</div>';
    updateLoadState();
    return;
  }

  const favorites = new Set((user?.musicasFavoritas || []).map((musica) => musica.id));
  list.innerHTML = musicas.map((musica) => `
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

  updateLoadState();
  list.appendChild(loadMoreSentinel);
}

function buildEndpoint() {
  const params = new URLSearchParams({
    page: String(page),
    size: String(PAGE_SIZE)
  });

  if (currentQuery) params.set("query", currentQuery);
  if (currentTone) params.set("tonalidade", currentTone);
  return `/musicas?${params.toString()}`;
}

async function loadMusicas({ reset = false } = {}) {
  if (loading) {
    if (reset) pendingReset = true;
    return;
  }
  if (!reset && !hasMore) return;

  if (reset) {
    page = 0;
    hasMore = true;
    musicas = [];
    renderList();
  }

  loading = true;
  updateLoadState();

  try {
    const nextItems = await API.getData(buildEndpoint());
    const items = Array.isArray(nextItems) ? nextItems : [];
    const knownIds = new Set(musicas.map((musica) => musica.id));
    const uniqueItems = items.filter((musica) => !knownIds.has(musica.id));

    musicas = reset ? items : [...musicas, ...uniqueItems];
    hasMore = items.length === PAGE_SIZE;
    if (items.length) page += 1;
  } catch (error) {
    App.showToast(error.message, "error");
    hasMore = false;
  } finally {
    loading = false;
    if (pendingReset) {
      pendingReset = false;
      loadMusicas({ reset: true });
      return;
    }
    renderList();
  }
}

function scheduleSearch() {
  window.clearTimeout(searchTimer);
  searchTimer = window.setTimeout(() => {
    currentQuery = String(searchInput?.value || "").trim();
    if (searchClearButton) searchClearButton.hidden = !currentQuery;
    loadMusicas({ reset: true });
  }, 250);
}

function setupInfiniteScroll() {
  if (!("IntersectionObserver" in window)) {
    list.addEventListener("scroll", () => {
      const nearBottom = list.scrollTop + list.clientHeight >= list.scrollHeight - 400;
      if (nearBottom) loadMusicas();
    }, { passive: true });
    return;
  }

  loadObserver = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      loadMusicas();
    }
  }, { root: list, rootMargin: "520px 0px" });

  loadObserver.observe(loadMoreSentinel);
}

function setupToneFilter() {
  if (typeof window.WorshipFlowSearch?.createToneFilter !== "function") return;

  toneFilter = window.WorshipFlowSearch.createToneFilter({
    button: "#music-tone-filter",
    menu: "#music-tone-menu",
    onChange: (tone) => {
      currentTone = tone;
      loadMusicas({ reset: true });
    }
  });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = App.formToObject(form);
  const id = data.id;
  delete data.id;
  data.titulo = String(data.titulo || "").trim();
  data.artista = String(data.artista || "").trim();
  data.tonalidade = normalizeKey(data.tonalidade);
  data.bpm = data.bpm ? Number(data.bpm) : null;

  if (!data.titulo || !data.artista || !data.tonalidade || !data.bpm) {
    App.showToast("Título, artista, tom e BPM são obrigatórios.", "error");
    return;
  }

  if (data.tonalidade === null) {
    App.showToast("Informe um tom válido, como C, D, E, F, G, A, B, C#, Bm ou A#m.", "error");
    return;
  }

  try {
    const response = id ? await API.putData(`/musicas/${id}`, data) : await API.postData("/musicas", data);
    App.showToast(response.message || "Louvor salvo com sucesso.");
    resetForm();
    await loadMusicas({ reset: true });
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
      await loadMusicas({ reset: true });
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
      renderList();
    } catch (error) {
      App.showToast(error.message, "error");
    }
  }
});

cancelButton.addEventListener("click", resetForm);

searchInput?.addEventListener("input", scheduleSearch);
searchClearButton?.addEventListener("click", () => {
  searchInput.value = "";
  currentQuery = "";
  searchClearButton.hidden = true;
  loadMusicas({ reset: true });
});

(async function init() {
  user = await App.requireAuth();
  if (!user) return;
  App.setupShell(user, "musicas");
  setupToneFilter();
  setupInfiniteScroll();
  await loadMusicas({ reset: true });
})();

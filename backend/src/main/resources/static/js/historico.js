const API = window.WorshipFlowApi;
const App = window.WorshipFlow;

const state = {
  escalas: [],
  month: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  selectedId: null,
  filters: {
    query: "",
    member: "",
    song: "",
    status: ""
  }
};

const calendarGrid = document.getElementById("history-calendar-grid");
const detailsPanel = document.getElementById("history-details");
const recentList = document.getElementById("history-recent-list");
const monthLabel = document.getElementById("history-month-label");
const resultCount = document.getElementById("history-result-count");
const filterForm = document.getElementById("history-filters");

function parseDate(value) {
  const [year, month, day] = String(value || "").split("-").map(Number);
  return year && month && day ? new Date(year, month - 1, day) : null;
}

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalize(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function formatMonth(date) {
  const label = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatFullDate(value) {
  const date = parseDate(value);
  if (!date) return "Data não informada";
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(date);
}

function statusInfo(value) {
  return value === "CANCELADA"
    ? { label: "Cancelada", className: "status-cancelada" }
    : { label: "Concluída", className: "status-concluida" };
}

function uniqueSorted(items, labelSelector) {
  const values = new Map();
  items.forEach((item) => {
    const value = String(item.id ?? labelSelector(item));
    if (!values.has(value)) values.set(value, labelSelector(item));
  });
  return Array.from(values, ([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
}

function fillSelect(id, options, placeholder) {
  const select = document.getElementById(id);
  select.innerHTML = `<option value="">${placeholder}</option>${options.map((option) => `
    <option value="${App.escapeHtml(option.value)}">${App.escapeHtml(option.label)}</option>
  `).join("")}`;
}

function configureFilters() {
  const members = uniqueSorted(state.escalas.flatMap((escala) => escala.usuarios || []), (item) => item.nome || "Sem nome");
  const songs = uniqueSorted(state.escalas.flatMap((escala) => escala.musicas || []), (item) => item.titulo || "Sem título");
  fillSelect("history-member-filter", members, "Todos os integrantes");
  fillSelect("history-song-filter", songs, "Todas as músicas");
}

function matchesFilters(escala) {
  const { query, member, song, status } = state.filters;
  const usuarios = escala.usuarios || [];
  const musicas = escala.musicas || [];
  const searchable = normalize([
    escala.titulo,
    escala.observacoes,
    ...usuarios.flatMap((usuario) => [usuario.nome, escala.funcoesUsuarios?.[usuario.id]]),
    ...musicas.flatMap((musica) => [musica.titulo, musica.artista, musica.tonalidade])
  ].filter(Boolean).join(" "));

  return (!query || searchable.includes(normalize(query)))
    && (!member || usuarios.some((usuario) => String(usuario.id) === member))
    && (!song || musicas.some((musica) => String(musica.id) === song))
    && (!status || escala.status === status);
}

function filteredScales() {
  return state.escalas.filter(matchesFilters);
}

function scalesInCurrentMonth(scales) {
  return scales.filter((escala) => {
    const date = parseDate(escala.dataEscala);
    return date
      && date.getFullYear() === state.month.getFullYear()
      && date.getMonth() === state.month.getMonth();
  });
}

function selectDefaultScale(monthScales) {
  if (monthScales.some((escala) => escala.id === state.selectedId)) return;
  state.selectedId = monthScales[0]?.id || null;
}

function renderMetrics(scales, monthScales) {
  const uniqueSongs = new Set();
  const uniqueMembers = new Set();
  scales.forEach((escala) => {
    (escala.musicas || []).forEach((musica) => uniqueSongs.add(musica.id || musica.titulo));
    (escala.usuarios || []).forEach((usuario) => uniqueMembers.add(usuario.id || usuario.nome));
  });

  document.getElementById("history-metric-month").textContent = monthScales.length;
  document.getElementById("history-metric-songs").textContent = uniqueSongs.size;
  document.getElementById("history-metric-members").textContent = uniqueMembers.size;
  resultCount.textContent = App.countLabel(scales.length, "escala encontrada", "escalas encontradas");
}

function renderCalendar(monthScales) {
  monthLabel.textContent = formatMonth(state.month);
  const firstDay = new Date(state.month.getFullYear(), state.month.getMonth(), 1);
  const gridStart = new Date(firstDay.getFullYear(), firstDay.getMonth(), 1 - firstDay.getDay());
  const byDate = new Map();

  monthScales.forEach((escala) => {
    const items = byDate.get(escala.dataEscala) || [];
    items.push(escala);
    byDate.set(escala.dataEscala, items);
  });

  calendarGrid.innerHTML = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    const key = dateKey(date);
    const events = byDate.get(key) || [];
    const outside = date.getMonth() !== state.month.getMonth();
    const today = key === dateKey(new Date());
    const selected = events.some((escala) => escala.id === state.selectedId);

    return `
      <article class="history-day${outside ? " is-outside" : ""}${today ? " is-today" : ""}${selected ? " is-selected" : ""}">
        <button class="history-day-number" type="button" data-history-date="${key}" aria-label="${App.escapeHtml(formatFullDate(key))}">${date.getDate()}</button>
        <div class="history-day-events">
          ${events.slice(0, 3).map((escala) => `
            <button class="history-event history-event-${String(escala.status).toLowerCase()}" type="button" data-scale-id="${escala.id}" title="${App.escapeHtml(escala.titulo)}">
              <span class="history-event-dot" aria-hidden="true"></span>
              <span class="history-event-label">${App.escapeHtml(escala.titulo)}</span>
            </button>
          `).join("")}
          ${events.length > 3 ? `<span class="history-more-events">+${events.length - 3}</span>` : ""}
        </div>
      </article>
    `;
  }).join("");
}

function roleFor(escala, usuario) {
  return escala.funcoesUsuarios?.[usuario.id]
    || escala.funcoesUsuarios?.[String(usuario.id)]
    || App.formatSkills(usuario.habilidades)
    || "Função não informada";
}

function renderDetails(scale) {
  if (!scale) {
    detailsPanel.innerHTML = `
      <div class="history-empty-detail">
        ${App.icon("calendar")}
        <strong>Nenhuma escala neste mês</strong>
        <p>Altere o mês ou remova algum filtro para consultar outros registros.</p>
      </div>
    `;
    return;
  }

  const status = statusInfo(scale.status);
  const members = scale.usuarios || [];
  const songs = scale.musicas || [];
  detailsPanel.innerHTML = `
    <div class="history-detail-heading">
      <div>
        <p class="wf-label text-[10px] font-extrabold text-cyan-500">Registro selecionado</p>
        <h2>${App.escapeHtml(scale.titulo)}</h2>
        <p>${App.escapeHtml(formatFullDate(scale.dataEscala))}</p>
      </div>
      <span class="status scale-status ${status.className}"><span aria-hidden="true"></span>${status.label}</span>
    </div>

    <section class="history-detail-section">
      <div class="history-section-title"><span>Equipe</span><small>${members.length}</small></div>
      <div class="history-member-list">
        ${members.length ? members.map((usuario) => `
          <article class="history-member">
            <span class="history-member-avatar">${App.escapeHtml(String(usuario.nome || "WF").split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase())}</span>
            <div><strong>${App.escapeHtml(usuario.nome)}</strong><p>${App.escapeHtml(roleFor(scale, usuario))}</p></div>
          </article>
        `).join("") : '<p class="muted-text">Nenhum integrante registrado.</p>'}
      </div>
    </section>

    <section class="history-detail-section">
      <div class="history-section-title"><span>Repertório</span><small>${songs.length}</small></div>
      <div class="history-song-list">
        ${songs.length ? songs.map((musica) => `
          <article class="history-song">
            <div><strong>${App.escapeHtml(musica.titulo)}</strong><p>${App.escapeHtml(musica.artista || "Artista não informado")}</p></div>
            <div class="history-song-data"><span>Tom <b>${App.escapeHtml(musica.tonalidade || "-")}</b></span><span>BPM <b>${App.escapeHtml(musica.bpm || "-")}</b></span></div>
          </article>
        `).join("") : '<p class="muted-text">Nenhuma música registrada.</p>'}
      </div>
    </section>

    ${scale.observacoes ? `<section class="history-note"><strong>Observações</strong><p>${App.escapeHtml(scale.observacoes)}</p></section>` : ""}
  `;
}

function renderRecentList(monthScales) {
  const sorted = [...monthScales].sort((a, b) => String(b.dataEscala).localeCompare(String(a.dataEscala)));
  recentList.innerHTML = sorted.length ? sorted.map((escala) => {
    const status = statusInfo(escala.status);
    return `
      <button class="history-recent-card${escala.id === state.selectedId ? " is-selected" : ""}" type="button" data-scale-id="${escala.id}">
        <span class="history-recent-date"><strong>${parseDate(escala.dataEscala)?.getDate() || "-"}</strong><small>${new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(parseDate(escala.dataEscala)).replace(".", "")}</small></span>
        <span class="history-recent-copy"><strong>${App.escapeHtml(escala.titulo)}</strong><small>${App.countLabel((escala.usuarios || []).length, "integrante", "integrantes")} • ${App.countLabel((escala.musicas || []).length, "música", "músicas")}</small></span>
        <span class="history-recent-status ${status.className}">${status.label}</span>
      </button>
    `;
  }).join("") : '<div class="empty compact">Nenhuma escala encontrada neste mês.</div>';
}

function render() {
  const filtered = filteredScales();
  const monthScales = scalesInCurrentMonth(filtered);
  selectDefaultScale(monthScales);
  renderMetrics(filtered, monthScales);
  renderCalendar(monthScales);
  renderDetails(monthScales.find((escala) => escala.id === state.selectedId));
  renderRecentList(monthScales);
}

function changeMonth(offset) {
  state.month = new Date(state.month.getFullYear(), state.month.getMonth() + offset, 1);
  state.selectedId = null;
  render();
}

document.addEventListener("click", (event) => {
  const action = event.target.closest("[data-history-action]")?.dataset.historyAction;
  if (action === "previous-month") changeMonth(-1);
  if (action === "next-month") changeMonth(1);
  if (action === "current-month") {
    const today = new Date();
    state.month = new Date(today.getFullYear(), today.getMonth(), 1);
    state.selectedId = null;
    render();
  }

  const scaleButton = event.target.closest("[data-scale-id]");
  if (scaleButton) {
    state.selectedId = Number(scaleButton.dataset.scaleId);
    render();
    if (window.innerWidth < 768) detailsPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const dateButton = event.target.closest("[data-history-date]");
  if (dateButton) {
    const firstScale = filteredScales().find((escala) => escala.dataEscala === dateButton.dataset.historyDate);
    if (firstScale) {
      state.selectedId = firstScale.id;
      render();
    }
  }
});

filterForm.addEventListener("input", () => {
  const data = new FormData(filterForm);
  state.filters.query = String(data.get("query") || "");
  state.filters.member = String(data.get("member") || "");
  state.filters.song = String(data.get("song") || "");
  state.filters.status = String(data.get("status") || "");
  state.selectedId = null;
  render();
});

filterForm.addEventListener("reset", () => {
  setTimeout(() => {
    state.filters = { query: "", member: "", song: "", status: "" };
    state.selectedId = null;
    render();
  });
});

(async function init() {
  const user = await App.requireAuth();
  if (!user) return;
  App.setupShell(user, "historico");

  try {
    state.escalas = await API.getData("/escalas/historico");
    const latestDate = parseDate(state.escalas[0]?.dataEscala);
    if (latestDate) state.month = new Date(latestDate.getFullYear(), latestDate.getMonth(), 1);
    configureFilters();
    render();
  } catch (error) {
    App.showToast(error.message, "error");
    calendarGrid.innerHTML = '<div class="empty history-calendar-error">Não foi possível carregar o histórico.</div>';
  }
})();

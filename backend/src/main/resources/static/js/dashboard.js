const API = window.WorshipFlowApi;
const App = window.WorshipFlow;

function byId(id) {
  return document.getElementById(id);
}

function setText(id, value) {
  const element = byId(id);
  if (element) element.textContent = value;
}

function updateBreadcrumbDate() {
  const element = byId("dashboard-breadcrumb");
  if (!element) return;

  const formatted = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long"
  }).format(new Date());

  element.textContent = `Painel • ${formatted.replace("-feira", "")}`;
}

function updateProfileOnboarding(user) {
  const onboarding = byId("profile-onboarding");
  if (!onboarding) return;

  const profileIncomplete = !String(user?.habilidades || "").trim();
  onboarding.hidden = !profileIncomplete;
  document.querySelector(".wf-profile-pill")?.classList.toggle("profile-onboarding-target", profileIncomplete);
}

function statusInfo(status) {
  const map = {
    RASCUNHO: { label: "Rascunho", className: "status-warning" },
    PUBLICADA: { label: "Publicada", className: "status-success" },
    CONCLUIDA: { label: "Concluída", className: "status-neutral" },
    CANCELADA: { label: "Cancelada", className: "status-danger" }
  };

  return map[status] || { label: status || "Sem status", className: "status-neutral" };
}

function songMeta(musica) {
  return [musica.artista, musica.tonalidade ? `Tom ${musica.tonalidade}` : "", musica.bpm ? `${musica.bpm} BPM` : ""]
    .filter(Boolean)
    .join(" • ");
}

function asList(value) {
  return Array.isArray(value) ? value : [];
}

async function safeGetData(endpoint) {
  try {
    return asList(await API.getData(endpoint));
  } catch (error) {
    console.error(`Falha ao carregar ${endpoint}`, error);
    return [];
  }
}

function formatSkills(value = "") {
  if (typeof App.formatSkills === "function") {
    return App.formatSkills(value);
  }

  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .join(", ");
}

function parseLocalDate(value) {
  if (!value) return null;
  const raw = String(value).slice(0, 10);
  const [year, month, day] = raw.split("-").map(Number);
  if (!year || !month || !day) return null;

  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function endOfCurrentMonth() {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
}

function scaleDate(escala) {
  return parseLocalDate(escala.dataEscala || escala.data || escala.dataHora);
}

function scaleDateLabel(escala) {
  const date = scaleDate(escala);
  if (!date) return "Data não definida";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    weekday: "short"
  }).format(date).replace(".", "");
}

function monthlyScales(escalas) {
  const active = escalas.filter((escala) => escala.status !== "CANCELADA");
  const hasDates = active.some((escala) => scaleDate(escala));

  if (!hasDates) return active;

  const today = startOfToday();
  const end = endOfCurrentMonth();

  return active
    .filter((escala) => {
      const date = scaleDate(escala);
      return date && date >= today && date <= end;
    })
    .sort((a, b) => scaleDate(a) - scaleDate(b));
}

function renderMetrics(user, musicas, equipe, escalas) {
  const published = escalas.filter((escala) => escala.status === "PUBLICADA");
  const readySongs = musicas.filter((musica) => String(musica.linkCifra || "").trim());
  const favorites = user.musicasFavoritas || [];

  setText("metric-membros", App.countLabel(equipe.length, "cadastro", "cadastros"));
  setText("metric-musicas", App.countLabel(musicas.length, "item", "itens"));
  setText("metric-escalas", App.countLabel(escalas.length, "escala", "escalas"));
  setText("metric-favoritos", App.countLabel(favorites.length, "louvor", "louvores"));

  setText("hero-active-scales", published.length);
  setText("hero-ready-songs", readySongs.length);
  setText("hero-team-ready", equipe.length);
}

function renderMonthlyScales(escalas) {
  const container = byId("weekly-scales");
  if (!container) return;

  const visible = monthlyScales(escalas);

  container.innerHTML = visible.length ? visible.map((escala) => {
    const status = statusInfo(escala.status);
    const songs = escala.musicas || [];
    const members = escala.usuarios || [];

    return `
      <article class="dashboard-feed-item">
        <div class="dashboard-feed-main">
          <strong>${App.escapeHtml(escala.titulo)}</strong>
          <p>${App.escapeHtml(scaleDateLabel(escala))}</p>
        </div>
        <div class="dashboard-feed-meta">
          <span class="status ${status.className}"><span aria-hidden="true"></span>${App.escapeHtml(status.label)}</span>
          <small>${App.countLabel(members.length, "membro", "membros")} • ${App.countLabel(songs.length, "louvor", "louvores")}</small>
        </div>
      </article>
    `;
  }).join("") : '<div class="empty compact">Nenhuma escala prevista até o fim deste mês.</div>';
}

function topSongsFromScales(musicas, escalas) {
  const usage = new Map();

  escalas.filter((escala) => escala.status !== "CANCELADA").forEach((escala) => {
    (escala.musicas || []).forEach((musica) => {
      const key = musica.id || String(musica.titulo || "").toLowerCase();
      const current = usage.get(key) || { ...musica, count: 0 };
      current.count += 1;
      usage.set(key, current);
    });
  });

  return Array.from(usage.values())
    .sort((a, b) => b.count - a.count || String(a.titulo).localeCompare(String(b.titulo), "pt-BR"))
    .slice(0, 5);
}

function renderTopSongs(musicas, escalas) {
  const container = byId("top-louvores");
  if (!container) return;

  const songs = topSongsFromScales(musicas, escalas);

  container.innerHTML = songs.length ? songs.map((musica, index) => `
    <article class="dashboard-rank-item">
      <span>${index + 1}</span>
      <div>
        <strong>${App.escapeHtml(musica.titulo || "Louvor sem título")}</strong>
        <p>${App.escapeHtml(songMeta(musica) || "Detalhes não informados")}</p>
      </div>
      <small>${App.countLabel(musica.count, "vez", "vezes")}</small>
    </article>
  `).join("") : '<div class="empty compact">Nenhum louvor foi usado em escalas ainda.</div>';
}

function renderTeamCoverage(equipe) {
  const container = byId("team-coverage");
  if (!container) return;

  const counts = new Map();

  equipe.forEach((member) => {
    formatSkills(member.habilidades || "")
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean)
      .forEach((skill) => counts.set(skill, (counts.get(skill) || 0) + 1));
  });

  const skills = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "pt-BR"))
    .slice(0, 8);

  container.innerHTML = skills.length ? skills.map(([skill, count]) => `
    <article>
      <strong>${App.escapeHtml(skill)}</strong>
      <span>${App.countLabel(count, "pessoa", "pessoas")}</span>
    </article>
  `).join("") : '<div class="empty compact">Cadastre habilidades no perfil da equipe.</div>';
}

function renderMonthlySummary(user, musicas, equipe, escalas) {
  const container = byId("dashboard-insights");
  if (!container) return;

  const monthScales = monthlyScales(escalas);
  const nextScale = monthScales.find((escala) => escala.status !== "CONCLUIDA") || monthScales[0];
  const myScales = monthScales.filter((escala) =>
    (escala.usuarios || []).some((member) => Number(member.id) === Number(user.id))
  );
  const uniqueSongs = new Set();
  const uniqueMembers = new Set();

  monthScales.forEach((escala) => {
    (escala.musicas || []).forEach((musica) => uniqueSongs.add(musica.id || musica.titulo));
    (escala.usuarios || []).forEach((member) => uniqueMembers.add(member.id || member.nome));
  });

  const items = [
    {
      title: "Próxima escala",
      detail: nextScale ? `${scaleDateLabel(nextScale)} • ${nextScale.titulo}` : "Nenhuma escala prevista até o fim do mês.",
      tone: "success"
    },
    {
      title: "Minhas escalas",
      detail: `${App.countLabel(myScales.length, "escala", "escalas")} com você neste mês.`,
      tone: myScales.length ? "success" : "neutral"
    },
    {
      title: "Louvores do mês",
      detail: `${App.countLabel(uniqueSongs.size, "louvor", "louvores")} distribuídos nas escalas.`,
      tone: uniqueSongs.size ? "success" : "neutral"
    },
    {
      title: "Equipe escalada",
      detail: `${App.countLabel(uniqueMembers.size, "membro", "membros")} participando até o fim do mês.`,
      tone: uniqueMembers.size ? "success" : "neutral"
    }
  ];

  container.innerHTML = items.map((item) => `
    <article class="dashboard-insight dashboard-insight-${item.tone}">
      <span aria-hidden="true"></span>
      <div>
        <strong>${App.escapeHtml(item.title)}</strong>
        <p>${App.escapeHtml(item.detail)}</p>
      </div>
    </article>
  `).join("");
}

async function loadDashboard() {
  const user = await App.requireAuth();
  if (!user) return;

  App.setupShell(user, "dashboard");
  updateProfileOnboarding(user);
  updateBreadcrumbDate();

  const [musicas, equipe, escalas] = await Promise.all([
    safeGetData("/musicas"),
    safeGetData("/usuarios/equipe"),
    safeGetData("/escalas")
  ]);

  renderMetrics(user, musicas, equipe, escalas);
  renderMonthlyScales(escalas);
  renderTopSongs(musicas, escalas);
  renderTeamCoverage(equipe);
  renderMonthlySummary(user, musicas, equipe, escalas);
}

loadDashboard();

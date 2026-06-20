const API = window.WorshipFlowApi;
const App = window.WorshipFlow;

function updateBreadcrumbDate() {
  const element = document.getElementById("dashboard-breadcrumb");
  if (!element) return;

  const formatted = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long"
  }).format(new Date());

  element.textContent = `Painel • ${formatted.replace("-feira", "").toUpperCase()}`;
}

async function loadDashboard() {
  const user = await App.requireAuth();
  if (!user) return;

  App.setupShell(user, "dashboard");
  updateBreadcrumbDate();

  try {
    const [musicas, equipe, escalas] = await Promise.all([
      API.getData("/musicas"),
      API.getData("/usuarios/equipe"),
      API.getData("/escalas")
    ]);

    document.getElementById("metric-membros").textContent = App.countLabel(equipe.length, "cadastro", "cadastros");
    document.getElementById("metric-musicas").textContent = App.countLabel(musicas.length, "item", "itens");
    document.getElementById("metric-escalas").textContent = App.countLabel(escalas.length, "escala", "escalas");

    const publishedScales = escalas.filter((escala) => escala.status === "PUBLICADA").length;
    document.getElementById("scale-summary").innerHTML = `
      <div class="grid gap-2 p-5">
        <span class="wf-label text-[10px] font-extrabold text-gold-500">Publicadas</span>
        <strong class="wf-card-number text-3xl font-black">${App.countLabel(publishedScales, "escala publicada", "escalas publicadas")}</strong>
        <p class="text-sm font-semibold wf-muted">${App.countLabel(escalas.length, "escala cadastrada", "escalas cadastradas")} no total.</p>
      </div>
      <div class="grid gap-3 p-5 sm:grid-cols-3">
        <span class="rounded-2xl border border-gold-400/30 bg-gold-300/[0.12] px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-gold-500">Equipe</span>
        <span class="rounded-2xl border border-cyan-400/30 bg-cyan-300/[0.12] px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-500">Repertório</span>
        <span class="rounded-2xl border border-purple-400/30 bg-purple-400/[0.12] px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-purple-500">Escala</span>
      </div>
    `;
  } catch (error) {
    App.showToast(`API indisponivel em ${API.baseUrl}`, "error");
  }
}

loadDashboard();

const API = window.WorshipFlowApi;
const App = window.WorshipFlow;

async function loadDashboard() {
  const user = await App.requireAuth();
  if (!user) return;

  App.setupShell(user, "dashboard");

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
      <p class="large">${App.countLabel(publishedScales, "escala publicada", "escalas publicadas")}</p>
      <p>${App.countLabel(escalas.length, "escala cadastrada", "escalas cadastradas")} no total.</p>
    `;
  } catch (error) {
    App.showToast(`API indisponivel em ${API.baseUrl}`, "error");
  }
}

loadDashboard();

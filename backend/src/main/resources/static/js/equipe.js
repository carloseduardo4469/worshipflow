const API = window.WorshipFlowApi;
const App = window.WorshipFlow;

function photo(member) {
  if (member?.fotoPerfil) {
    const type = member.fotoPerfilTipo || "image/png";
    return `<img src="data:${App.escapeHtml(type)};base64,${App.escapeHtml(member.fotoPerfil)}" alt="Foto de ${App.escapeHtml(member.nome)}" />`;
  }

  const initials = String(member?.nome || "WF").split(" ").filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join("") || "WF";
  return `<span>${initials}</span>`;
}

function skills(value = "") {
  const items = String(value).split(",").map((item) => item.trim()).filter(Boolean);
  return items.length
    ? `<div class="team-skills">${items.map((item) => `<small>${App.escapeHtml(item)}</small>`).join("")}</div>`
    : "<p>Habilidades nao informadas.</p>";
}

function renderTeam(equipe) {
  const grid = document.getElementById("team-grid");
  grid.innerHTML = equipe.length ? equipe.map((member) => `
    <article class="team-card">
      <div class="team-photo">${photo(member)}</div>
      <div class="team-info">
        <strong>${App.escapeHtml(member.nome)}</strong>
        <span>${App.escapeHtml(member.instrumentoPrincipal || "Funcao nao informada")}</span>
        ${skills(member.habilidades)}
      </div>
    </article>
  `).join("") : '<div class="empty">Nenhum integrante ativo cadastrado.</div>';
}

(async function init() {
  const user = await App.requireAuth();
  if (!user) return;
  App.setupShell(user, "equipe");

  try {
    renderTeam(await API.getData("/usuarios/equipe"));
  } catch (error) {
    App.showToast(error.message, "error");
  }
})();

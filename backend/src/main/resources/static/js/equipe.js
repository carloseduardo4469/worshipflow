const API = window.WorshipFlowApi;
const App = window.WorshipFlow;

let equipe = [];
let teamSearch = null;

function photo(member) {
  if (member?.fotoPerfil) {
    const type = member.fotoPerfilTipo || "image/png";
    return `<img src="data:${App.escapeHtml(type)};base64,${App.escapeHtml(member.fotoPerfil)}" alt="Foto de ${App.escapeHtml(member.nome)}" />`;
  }

  const initials = String(member?.nome || "WF").split(" ").filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join("") || "WF";
  return `<span>${initials}</span>`;
}

function skills(value = "") {
  const items = App.formatSkills(value).split(",").map((item) => item.trim()).filter(Boolean);
  return items.length
    ? `<div class="team-skills">${items.map((item) => `<small>${App.escapeHtml(item)}</small>`).join("")}</div>`
    : "<p>Habilidades não informadas.</p>";
}

function renderTeam(items = equipe) {
  const grid = document.getElementById("team-grid");
  grid.innerHTML = items.length ? items.map((member) => `
    <article class="team-card">
      <div class="team-photo">${photo(member)}</div>
      <div class="team-info">
        <strong>${App.escapeHtml(member.nome)}</strong>
        ${skills(member.habilidades)}
      </div>
    </article>
  `).join("") : equipe.length
    ? '<div class="empty">Nenhum integrante encontrado para a pesquisa.</div>'
    : '<div class="empty">Nenhum integrante ativo cadastrado.</div>';
}

(async function init() {
  const user = await App.requireAuth();
  if (!user) return;
  App.setupShell(user, "equipe");

  try {
    equipe = await API.getData("/usuarios/equipe");
    teamSearch = window.WorshipFlowSearch.create({
      input: "#team-search",
      clearButton: "#team-search-clear",
      counter: "#team-search-count",
      fields: ["nome", "habilidades"],
      items: equipe,
      onChange: renderTeam
    });
  } catch (error) {
    App.showToast(error.message, "error");
  }
})();

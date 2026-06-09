import { escapeHtml } from "../utils/html.js";

export function teamPage(equipe = []) {
  return `
    <div class="page-stack">
      <section class="page-heading">
        <div>
          <span class="eyebrow">Equipe ministerial</span>
          <h1>Equipe</h1>
          <p>Conheça os integrantes ativos do ministério, suas funções e habilidades.</p>
        </div>
      </section>

      ${equipe.length ? `
        <section class="team-grid">
          ${equipe.map(memberCard).join("")}
        </section>
      ` : '<div class="empty">Nenhum integrante ativo cadastrado.</div>'}
    </div>
  `;
}

function memberCard(member) {
  return `
    <article class="team-card">
      <div class="team-photo">${profilePhoto(member)}</div>
      <div class="team-info">
        <strong>${escapeHtml(member.nome)}</strong>
        <span>${escapeHtml(member.instrumentoPrincipal || "Função não informada")}</span>
        ${skills(member.habilidades)}
      </div>
    </article>
  `;
}

function profilePhoto(member) {
  if (member?.fotoPerfil) {
    const type = member.fotoPerfilTipo || "image/png";
    return `<img src="data:${escapeHtml(type)};base64,${escapeHtml(member.fotoPerfil)}" alt="Foto de ${escapeHtml(member.nome)}" />`;
  }

  return `<span>${initials(member?.nome)}</span>`;
}

function skills(value = "") {
  const items = String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!items.length) {
    return '<p>Habilidades não informadas.</p>';
  }

  return `<div class="team-skills">${items.map((item) => `<small>${escapeHtml(item)}</small>`).join("")}</div>`;
}

function initials(name = "") {
  const letters = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return letters || "WF";
}

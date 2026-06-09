import { icon } from "../components/icons.js";
import { escapeHtml } from "../utils/html.js";

export function profilePage(user) {
  const favoritas = user?.musicasFavoritas || [];
  const habilidades = splitSkills(user?.habilidades);

  return `
    <div class="page-stack">
      <section class="profile-hero panel">
        <div class="profile-photo">${profilePhoto(user)}</div>
        <div class="profile-info">
          <span class="eyebrow">Perfil do usuário</span>
          <h1>${escapeHtml(user?.nome || "Usuário")}</h1>
          <p>${escapeHtml(user?.email || "")}</p>
          <span class="status">${cargoLabel(user?.perfil)}</span>
        </div>
      </section>

      <section class="grid two">
        <article class="panel">
          <h2>Habilidades</h2>
          ${habilidades.length ? `
            <div class="skill-list">
              ${habilidades.map((skill) => `<span>${escapeHtml(skill)}</span>`).join("")}
            </div>
          ` : '<div class="empty compact">Nenhuma habilidade cadastrada.</div>'}
        </article>
      </section>

      <section class="grid two">
        <article class="panel">
          <h2>Músicas favoritas</h2>
          ${favoritas.length ? `
            <div class="favorite-list">
              ${favoritas.map(favoriteCard).join("")}
            </div>
          ` : '<div class="empty compact">Marque músicas como favoritas pelo ícone de estrela na tela de Músicas.</div>'}
        </article>

        <form class="panel form-grid" data-form="profile">
          <h2>Alterar perfil</h2>
          <label>Nome<input name="nome" value="${escapeHtml(user?.nome || "")}" maxlength="120" required /></label>
          <label>Telefone<input name="telefone" type="tel" inputmode="tel" value="${escapeHtml(user?.telefone || "")}" maxlength="30" /></label>
          <label>Instrumento principal<input name="instrumentoPrincipal" value="${escapeHtml(user?.instrumentoPrincipal || "")}" maxlength="80" required /></label>
          <label>Habilidades<textarea name="habilidades" maxlength="300" placeholder="Ex: violão, baixo, bateria">${escapeHtml(user?.habilidades || "")}</textarea></label>
          <label>Foto de perfil<input name="foto" type="file" accept="image/png,image/jpeg,image/webp" /></label>
          ${user?.fotoPerfil ? '<label class="inline-check"><input name="removerFoto" type="checkbox" value="true" /> Remover foto atual</label>' : ""}
          <div class="form-actions">
            <button class="button primary" type="submit">${icon("save")}Salvar perfil</button>
          </div>
        </form>
      </section>
    </div>
  `;
}

function profilePhoto(user) {
  if (user?.fotoPerfil) {
    const type = user.fotoPerfilTipo || "image/png";
    return `<img src="data:${escapeHtml(type)};base64,${escapeHtml(user.fotoPerfil)}" alt="Foto de ${escapeHtml(user.nome)}" />`;
  }

  return `<span>${initials(user?.nome)}</span>`;
}

function favoriteCard(musica) {
  return `
    <article class="favorite-card">
      <span class="favorite-icon">${icon("star")}</span>
      <div>
        <strong>${escapeHtml(musica.titulo)}</strong>
        <p>${escapeHtml(musica.artista || "Artista não informado")} ${musica.tonalidade ? `- Tom ${escapeHtml(musica.tonalidade)}` : ""}</p>
      </div>
    </article>
  `;
}

function splitSkills(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
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

function cargoLabel(perfil) {
  const labels = {
    ADMIN: "Administrador",
    LIDER: "Líder",
    MUSICO: "Músico",
    MEMBRO: "Membro"
  };

  return labels[perfil] || "Membro";
}

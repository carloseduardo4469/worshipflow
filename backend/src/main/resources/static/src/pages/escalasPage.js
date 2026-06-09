import { icon } from "../components/icons.js";
import { escapeHtml } from "../utils/html.js";
import { formatDateTime } from "../utils/format.js";

export function escalasPage({ escalas, eventos, usuarios, musicas, editing, canManage = false }) {
  const list = `
    <article class="panel">
      <h2>${canManage ? "Escalas cadastradas" : "Escalas do ministério"}</h2>
      ${escalas.length ? escalas.map((escala) => card(escala, canManage)).join("") : '<div class="empty">Nenhuma escala cadastrada.</div>'}
    </article>
  `;

  return `
    <div class="page-stack">
      <section class="page-heading">
        <div>
          <span class="eyebrow">Planejamento</span>
          <h1>Escalas</h1>
          <p>${canManage ? "Relacione evento, equipe e repertório em uma escala publicável." : "Consulte a equipe, o repertório e as observações das próximas escalas."}</p>
        </div>
        <button class="button" data-action="refresh">${icon("refresh")}Atualizar</button>
      </section>
      ${canManage ? `
      <section class="grid form-layout">
        <form class="panel form-grid" data-form="escalas" data-id="${editing?.id || ""}">
          <h2>${editing ? "Editar escala" : "Nova escala"}</h2>
          <label>Título<input name="titulo" required value="${escapeHtml(editing?.titulo || "")}" /></label>
          <label>Status
            <select name="status">
              ${["RASCUNHO", "PUBLICADA", "CONCLUIDA", "CANCELADA"].map((status) => `<option value="${status}" ${editing?.status === status ? "selected" : ""}>${status}</option>`).join("")}
            </select>
          </label>
          <label>Evento
            <select name="eventoId" required>
              <option value="">Selecione</option>
              ${eventos.map((evento) => `<option value="${evento.id}" ${editing?.evento?.id === evento.id ? "selected" : ""}>${escapeHtml(evento.titulo)} - ${formatDateTime(evento.dataHora)}</option>`).join("")}
            </select>
          </label>
          ${checkboxGroup("Membros", "usuarioIds", usuarios, editing?.usuarios, usuarioLabel)}
          ${checkboxGroup("Músicas", "musicaIds", musicas, editing?.musicas, musicaLabel)}
          <label>Observações<textarea name="observacoes">${escapeHtml(editing?.observacoes || "")}</textarea></label>
          <div class="form-actions">
            ${editing ? '<button class="button" type="button" data-action="cancel-edit">Cancelar</button>' : ""}
            <button class="button primary" type="submit">${icon("save")}Salvar escala</button>
          </div>
        </form>
        ${list}
      </section>` : list}
    </div>
  `;
}

function checkboxGroup(title, name, items, selectedItems = [], labelFn) {
  return `
    <fieldset class="checkbox-fieldset">
      <legend>${title}</legend>
      <div class="checkbox-list">
        ${items.length ? items.map((item) => `
          <label class="check-option">
            <input type="checkbox" name="${name}" value="${item.id}" ${checked(selectedItems, item.id)} />
            <span>${labelFn(item)}</span>
          </label>
        `).join("") : `<div class="empty compact">Nenhum item cadastrado.</div>`}
      </div>
    </fieldset>
  `;
}

function checked(list = [], id) {
  return list.some((item) => item.id === id) ? "checked" : "";
}

function usuarioLabel(usuario) {
  return `
    <strong>${escapeHtml(usuario.nome)}</strong>
    <small>${escapeHtml(usuario.instrumentoPrincipal || "Função não informada")}</small>
  `;
}

function musicaLabel(musica) {
  return `
    <strong>${escapeHtml(musica.titulo)}</strong>
    <small>${escapeHtml([musica.artista, musica.tonalidade ? `Tom ${musica.tonalidade}` : ""].filter(Boolean).join(" - ") || "Detalhes não informados")}</small>
  `;
}

function card(escala, canManage) {
  const musicas = escala.musicas || [];
  const usuarios = escala.usuarios || [];

  return `
    <article class="scale-card">
      <div class="scale-card-header">
        <div>
          <strong>${escapeHtml(escala.titulo)}</strong>
          <p>${escapeHtml(escala.evento?.titulo || "Evento não informado")} - ${formatDateTime(escala.evento?.dataHora)}</p>
        </div>
        <span class="status">${escala.status}</span>
      </div>

      <div class="scale-detail-grid">
        <section class="scale-section">
          <h3>Equipe</h3>
          ${usuarios.length ? usuarios.map((usuario) => musicianCard(usuario, musicas)).join("") : '<p class="muted-text">Nenhum membro selecionado.</p>'}
        </section>

        <section class="scale-section">
          <h3>Repertório</h3>
          ${musicas.length ? `
            <ul class="scale-song-list">
              ${musicas.map((musica) => `<li><strong>${escapeHtml(musica.titulo)}</strong><span>${escapeHtml(musica.tonalidade || "Tom não informado")}</span></li>`).join("")}
            </ul>
          ` : '<p class="muted-text">Nenhuma música selecionada.</p>'}
        </section>
      </div>

      ${escala.observacoes ? `<p class="scale-note">${escapeHtml(escala.observacoes)}</p>` : ""}

      ${canManage ? `<div class="form-actions">
        <button class="button small" data-action="edit" data-resource="escalas" data-id="${escala.id}">Editar</button>
        <button class="button small danger" data-action="delete" data-resource="escalas" data-id="${escala.id}">Excluir</button>
      </div>` : ""}
    </article>
  `;
}

function musicianCard(usuario, musicas) {
  return `
    <article class="scale-person">
      <div>
        <strong>${escapeHtml(usuario.nome)}</strong>
        <p>${escapeHtml(usuario.instrumentoPrincipal || "Função não informada")}${usuario.habilidades ? ` - ${escapeHtml(usuario.habilidades)}` : ""}</p>
      </div>
      <small>Toca: ${musicas.length ? musicas.map((musica) => escapeHtml(musica.titulo)).join(", ") : "nenhuma música definida"}</small>
    </article>
  `;
}

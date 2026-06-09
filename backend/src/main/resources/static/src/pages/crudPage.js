import { icon } from "../components/icons.js";
import { escapeHtml, toDatetimeLocal } from "../utils/html.js";

export const pageConfigs = {
  membros: {
    title: "Registros de usuários",
    description: "Controle dados ministeriais, perfil de acesso e status dos membros.",
    resource: "usuarios",
    submitLabel: "Salvar usuário",
    empty: "Nenhum usuário cadastrado.",
    manageExistingOnly: true,
    fields: [
      { name: "nome", label: "Nome", required: true },
      { name: "email", label: "E-mail", type: "email", required: true },
      { name: "telefone", label: "Telefone", type: "tel", inputmode: "tel" },
      { name: "instrumentoPrincipal", label: "Instrumento principal", required: true },
      { name: "habilidades", label: "Habilidades" },
      { name: "perfil", label: "Perfil", type: "select", options: ["ADMIN", "LIDER", "MUSICO", "MEMBRO"] },
      { name: "statusMinisterio", label: "Status ministerial", type: "select", options: ["ATIVO", "INATIVO", "EM_PAUSA", "BLOQUEADO"] }
    ],
    columns: [
      { label: "Nome", value: (item) => item.nome },
      { label: "Instrumento", value: (item) => item.instrumentoPrincipal },
      { label: "Telefone", value: (item) => item.telefone || "-" },
      { label: "E-mail", value: (item) => item.email },
      { label: "Perfil", value: (item) => item.perfil },
      { label: "Status", value: (item) => item.statusMinisterio }
    ]
  },
  musicas: {
    title: "Músicas",
    description: "Monte a base de repertório com tom, BPM, categoria e link de cifra.",
    resource: "musicas",
    submitLabel: "Salvar música",
    empty: "Nenhuma música cadastrada.",
    fields: [
      { name: "titulo", label: "Título", required: true },
      { name: "artista", label: "Artista" },
      { name: "tonalidade", label: "Tom" },
      { name: "bpm", label: "BPM", type: "number", inputmode: "numeric" },
      { name: "categoria", label: "Categoria" },
      { name: "linkCifra", label: "Link da cifra", type: "url" }
    ],
    columns: [
      { label: "Título", value: (item) => item.titulo },
      { label: "Artista", value: (item) => item.artista || "-" },
      { label: "Tom", value: (item) => item.tonalidade || "-" },
      { label: "BPM", value: (item) => item.bpm || "-" }
    ]
  },
  eventos: {
    title: "Eventos",
    description: "Registre cultos, ensaios e reuniões que receberão escalas.",
    resource: "eventos",
    submitLabel: "Salvar evento",
    empty: "Nenhum evento cadastrado.",
    fields: [
      { name: "titulo", label: "Título", required: true },
      { name: "tipo", label: "Tipo", required: true },
      { name: "dataHora", label: "Data e horário", type: "datetime-local", required: true },
      { name: "local", label: "Local" },
      { name: "observacoes", label: "Observações", type: "textarea" }
    ],
    columns: [
      { label: "Título", value: (item) => item.titulo },
      { label: "Tipo", value: (item) => item.tipo },
      { label: "Data", value: (item) => new Date(item.dataHora).toLocaleString("pt-BR") },
      { label: "Local", value: (item) => item.local || "-" }
    ]
  }
};

export function crudPage(config, items, editingItem, user) {
  return `
    <div class="page-stack">
      <section class="page-heading">
        <div>
          <span class="eyebrow">CRUD integrado</span>
          <h1>${config.title}</h1>
          <p>${config.description}</p>
        </div>
        <button class="button" data-action="refresh">${icon("refresh")}Atualizar</button>
      </section>
      <section class="grid form-layout">
        ${config.manageExistingOnly && !editingItem ? adminOnlyInfo(config) : `<form class="panel form-grid" data-form="${config.resource}" data-id="${editingItem?.id || ""}">
          <h2>${editingItem ? "Editar cadastro" : "Novo cadastro"}</h2>
          ${config.fields.map((field) => renderField(field, editingItem?.[field.name])).join("")}
          <div class="form-actions">
            ${editingItem ? '<button class="button" type="button" data-action="cancel-edit">Cancelar</button>' : ""}
            <button class="button primary" type="submit">${icon("save")}${config.submitLabel}</button>
          </div>
        </form>`}
        <article class="panel">
          <h2>Registros</h2>
          ${items.length ? renderList(config, items, user) : `<div class="empty">${config.empty}</div>`}
        </article>
      </section>
    </div>
  `;
}

function adminOnlyInfo(config) {
  return `
    <article class="panel">
      <h2>Gerenciamento</h2>
      <p>Novos usuários entram pelo cadastro. Selecione um registro ao lado para editar dados ministeriais, perfil e status.</p>
    </article>
  `;
}

function renderField(field, value = "") {
  const currentValue = field.type === "datetime-local" ? toDatetimeLocal(value) : value || "";
  const required = field.required ? "required" : "";

  if (field.type === "textarea") {
    return `<label>${field.label}<textarea name="${field.name}" ${required}>${escapeHtml(currentValue)}</textarea></label>`;
  }

  if (field.type === "select") {
    return `
      <label>${field.label}
        <select name="${field.name}" ${required}>
          ${field.options.map((option) => `<option value="${option}" ${option === currentValue ? "selected" : ""}>${option}</option>`).join("")}
        </select>
      </label>
    `;
  }

  const inputMode = field.inputmode ? `inputmode="${field.inputmode}"` : "";
  return `<label>${field.label}<input name="${field.name}" type="${field.type || "text"}" value="${escapeHtml(currentValue)}" ${inputMode} ${required} /></label>`;
}

function renderList(config, items, user) {
  if (config.resource === "usuarios") {
    return renderCardList(config, items);
  }

  const favoriteIds = new Set((user?.musicasFavoritas || []).map((musica) => musica.id));
  return `
    <div class="responsive-table">
      <table>
        <thead>
          <tr>${config.columns.map((column) => `<th>${column.label}</th>`).join("")}<th>Ações</th></tr>
        </thead>
        <tbody>
          ${items.map((item) => `
            <tr>
              ${config.columns.map((column) => `<td data-label="${escapeHtml(column.label)}">${escapeHtml(column.value(item))}</td>`).join("")}
              <td class="table-actions" data-label="Ações">
                ${config.resource === "musicas" ? favoriteButton(item, favoriteIds.has(item.id)) : ""}
                <button class="icon-button" data-action="edit" data-resource="${config.resource}" data-id="${item.id}" aria-label="Editar">${icon("save")}</button>
                <button class="icon-button danger" data-action="delete" data-resource="${config.resource}" data-id="${item.id}" aria-label="Excluir">${icon("trash")}</button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderCardList(config, items) {
  return `
    <div class="record-grid">
      ${items.map((item) => `
        <article class="record-card">
          <div class="record-card-header">
            <strong>${escapeHtml(item.nome)}</strong>
            <span class="status ${statusClass(item.statusMinisterio)}">${statusLabel(item.statusMinisterio)}</span>
          </div>
          <dl class="record-details">
            ${config.columns.filter((column) => column.label !== "Nome" && column.label !== "Status").map((column) => `
              <div>
                <dt>${escapeHtml(column.label)}</dt>
                <dd>${escapeHtml(column.value(item))}</dd>
              </div>
            `).join("")}
          </dl>
          <div class="form-actions">
            <button class="button small" data-action="edit" data-resource="${config.resource}" data-id="${item.id}">Editar</button>
            <button class="button small danger" data-action="delete" data-resource="${config.resource}" data-id="${item.id}">Excluir</button>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function statusLabel(status) {
  const labels = {
    ATIVO: "ATIVO",
    INATIVO: "INATIVO",
    EM_PAUSA: "EM PAUSA",
    BLOQUEADO: "BLOQUEADO",
    DESLIGADO: "BLOQUEADO"
  };

  return labels[status] || "-";
}

function statusClass(status) {
  const classes = {
    ATIVO: "status-success",
    INATIVO: "status-neutral",
    EM_PAUSA: "status-warning",
    BLOQUEADO: "status-danger",
    DESLIGADO: "status-danger"
  };

  return classes[status] || "status-neutral";
}

function favoriteButton(item, active) {
  const title = active ? "Remover dos favoritos" : "Adicionar aos favoritos";
  return `<button class="icon-button favorite-button ${active ? "is-active" : ""}" data-action="favorite-music" data-id="${item.id}" aria-label="${title}" title="${title}">${icon("star")}</button>`;
}

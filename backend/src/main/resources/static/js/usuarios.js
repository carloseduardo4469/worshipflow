const API = window.WorshipFlowApi;
const App = window.WorshipFlow;

let usuarios = [];

const form = document.getElementById("usuario-form");
const list = document.getElementById("usuarios-list");
const cancelButton = document.getElementById("cancel-edit");

App.setupNameField(form.elements.nome);
App.setupPhoneField(form.elements.telefone);

function statusClass(status) {
  return {
    ATIVO: "status-success",
    INATIVO: "status-neutral"
  }[status] || "status-neutral";
}

function statusLabel(status) {
  return {
    ATIVO: "Ativo",
    INATIVO: "Inativo"
  }[status] || status || "-";
}

function perfilLabel(perfil) {
  return perfil === "ADMIN" ? "Administrador" : "Usuário";
}

function resetForm() {
  form.reset();
  form.elements.id.value = "";
  cancelButton.hidden = true;
}

function fillForm(usuario) {
  form.elements.id.value = usuario.id;
  form.elements.nome.value = usuario.nome || "";
  form.elements.email.value = usuario.email || "";
  form.elements.telefone.value = App.formatPhone(usuario.telefone || "");
  form.elements.perfil.value = usuario.perfil === "ADMIN" ? "ADMIN" : "USER";
  form.elements.statusMinisterio.value = usuario.statusMinisterio || "ATIVO";
  cancelButton.hidden = false;
  form.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderList() {
  if (!usuarios.length) {
    list.innerHTML = '<div class="empty">Nenhum usuário cadastrado.</div>';
    return;
  }

  list.innerHTML = usuarios.map((usuario) => `
    <article class="record-card">
      <div class="record-card-header">
        <strong>${App.escapeHtml(usuario.nome)}</strong>
        <span class="status user-status ${statusClass(usuario.statusMinisterio)}"><span aria-hidden="true"></span>${App.escapeHtml(statusLabel(usuario.statusMinisterio))}</span>
      </div>
      <dl class="record-details">
        <div><dt>Telefone</dt><dd>${App.escapeHtml(usuario.telefone || "-")}</dd></div>
        <div><dt>E-mail</dt><dd>${App.escapeHtml(usuario.email || "-")}</dd></div>
        <div><dt>Perfil</dt><dd>${App.escapeHtml(perfilLabel(usuario.perfil))}</dd></div>
      </dl>
      <div class="form-actions">
        <button class="button small" type="button" data-action="edit" data-id="${usuario.id}">Editar</button>
        <button class="button small danger" type="button" data-action="delete" data-id="${usuario.id}">Excluir</button>
      </div>
    </article>
  `).join("");
}

async function loadUsuarios() {
  usuarios = await API.getData("/usuarios");
  renderList();
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const validName = App.validateNameField(form.elements.nome);
  const validPhone = App.validatePhoneField(form.elements.telefone);
  if (!validName || !validPhone || !form.reportValidity()) return;

  const data = App.formToObject(form);
  const id = data.id;
  if (!id) {
    App.showToast("Selecione um usuário para editar.", "error");
    return;
  }
  delete data.id;
  data.nome = String(data.nome || "").trim().replace(/\s+/g, " ");
  data.telefone = App.phoneDigits(data.telefone);
  try {
    const response = await API.putData(`/usuarios/${id}`, data);
    App.showToast(response.message || "Usuário salvo com sucesso.");
    resetForm();
    await loadUsuarios();
  } catch (error) {
    App.showToast(error.message, "error");
  }
});

list.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const id = Number(button.dataset.id);
  const usuario = usuarios.find((item) => item.id === id);

  if (button.dataset.action === "edit" && usuario) fillForm(usuario);

  if (button.dataset.action === "delete" && await App.confirmDelete("Excluir usuário?")) {
    try {
      const response = await API.deleteData(`/usuarios/${id}`);
      App.showToast(response.message || "Usuário removido com sucesso.");
      await loadUsuarios();
    } catch (error) {
      App.showToast(error.message, "error");
    }
  }
});

cancelButton.addEventListener("click", resetForm);

(async function init() {
  const user = await App.requireAuth({ admin: true });
  if (!user) return;
  App.setupShell(user, "usuarios");
  await loadUsuarios();
})();

const API = window.WorshipFlowApi;
const App = window.WorshipFlow;

const form = document.getElementById("profile-form");
const photoInput = document.getElementById("profile-photo-input");
const photoFileName = document.getElementById("profile-photo-file-name");

App.setupNameField(form.elements.nome);
App.setupPhoneField(form.elements.telefone);

photoInput.addEventListener("change", () => {
  photoFileName.hidden = !photoInput.files?.length;
});

function profilePhoto(user) {
  if (user?.fotoPerfil) {
    const type = user.fotoPerfilTipo || "image/png";
    return `<img src="data:${App.escapeHtml(type)};base64,${App.escapeHtml(user.fotoPerfil)}" alt="Foto de ${App.escapeHtml(user.nome)}" />`;
  }

  return `<span>${String(user?.nome || "WF").split(" ").filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join("") || "WF"}</span>`;
}

function roleLabel(perfil) {
  return perfil === "ADMIN" ? "Administrador" : "Usuário";
}

function renderProfile(user) {
  document.getElementById("profile-photo").innerHTML = profilePhoto(user);
  document.getElementById("profile-name").textContent = user.nome || "Usuario";
  document.getElementById("profile-email").textContent = user.email || "";
  document.getElementById("profile-role").textContent = roleLabel(user.perfil);

  const skills = App.formatSkills(user.habilidades || "").split(",").map((item) => item.trim()).filter(Boolean);
  document.getElementById("skills-list").innerHTML = skills.length
    ? skills.map((skill) => `<span>${App.escapeHtml(skill)}</span>`).join("")
    : '<div class="empty compact">Nenhuma habilidade cadastrada.</div>';

  const favorites = user.musicasFavoritas || [];
  document.getElementById("favorites-list").innerHTML = favorites.length
    ? favorites.map((musica) => `<article class="favorite-card"><span class="favorite-icon">${App.icon("star")}</span><div><strong>${App.escapeHtml(musica.titulo)}</strong><p>${App.escapeHtml(musica.artista || "Artista não informado")} ${musica.tonalidade ? `- Tom ${App.escapeHtml(musica.tonalidade)}` : ""}</p></div></article>`).join("")
    : '<div class="empty compact">Marque musicas como favoritas pelo icone de estrela na tela de Musicas.</div>';

  form.elements.nome.value = user.nome || "";
  form.elements.telefone.value = App.formatPhone(user.telefone || "");
  photoInput.value = "";
  photoFileName.hidden = true;
  App.setSelectedSkills(form, user.habilidades || "");
  document.getElementById("remove-photo-row").hidden = !user.fotoPerfil;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Nao foi possivel carregar a foto."));
    reader.readAsDataURL(file);
  });
}

async function payloadFromForm() {
  const formData = new FormData(form);
  const file = formData.get("foto");
  const payload = {
    nome: String(formData.get("nome") || "").trim().replace(/\s+/g, " "),
    telefone: App.phoneDigits(formData.get("telefone")),
    habilidades: App.selectedSkillsText(form),
    removerFoto: formData.get("removerFoto") === "true"
  };

  if (file?.size) {
    if (file.size > 1_000_000) throw new Error("A foto deve ter no maximo 1 MB.");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Use uma foto JPG, PNG ou WEBP.");
    const dataUrl = await readFileAsDataUrl(file);
    payload.fotoPerfil = dataUrl.split(",")[1];
    payload.fotoPerfilTipo = file.type;
    payload.removerFoto = false;
  }

  return payload;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const validName = App.validateNameField(form.elements.nome);
  const validPhone = App.validatePhoneField(form.elements.telefone);
  if (!validName || !validPhone || !form.reportValidity()) return;

  try {
    const response = await API.putData("/auth/me", await payloadFromForm());
    App.updateStoredUser(response.data);
    App.showToast(response.message || "Perfil atualizado com sucesso.");
    App.setupShell(response.data, "perfil");
    renderProfile(response.data);
  } catch (error) {
    App.showToast(error.message, "error");
  }
});

const cachedUser = App.getUser();
if (cachedUser) {
  App.setupShell(cachedUser, "perfil");
  renderProfile(cachedUser);
}

(async function syncProfile() {
  const user = await App.requireAuth();
  if (!user) return;
  App.setupShell(user, "perfil");
  renderProfile(user);
})();

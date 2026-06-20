const API = window.WorshipFlowApi;
const App = window.WorshipFlow;

const params = new URLSearchParams(location.search);
const token = params.get("token") || "";
const form = document.getElementById("redefinir-senha-form");

form.elements.token.value = token;

if (!token) {
  App.showToast("Link invalido. Solicite uma nova redefinicao.", "error");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = App.formToObject(form);

  if (!data.token) {
    App.showToast("Token de redefinicao ausente.", "error");
    return;
  }

  if (data.novaSenha !== data.confirmarNovaSenha) {
    App.showToast("As senhas informadas nao conferem.", "error");
    return;
  }

  try {
    const response = await API.postData("/auth/redefinir-senha", {
      token: data.token,
      novaSenha: data.novaSenha
    });
    App.showToast(response.message || "Senha redefinida com sucesso.");
    setTimeout(() => {
      location.href = "/pages/login.html";
    }, 800);
  } catch (error) {
    App.showToast(error.message, "error");
  }
});

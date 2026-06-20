const API = window.WorshipFlowApi;
const App = window.WorshipFlow;
const form = document.getElementById("cadastro-form");

function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

form.elements.telefone.addEventListener("input", (event) => {
  event.currentTarget.value = onlyDigits(event.currentTarget.value);
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  form.elements.telefone.value = onlyDigits(form.elements.telefone.value);

  try {
    const response = await API.postData("/auth/cadastro", App.formToObject(event.currentTarget));
    API.saveAuth(response);
    App.showToast(response.message || "Cadastro realizado com sucesso.");
    location.href = "/pages/dashboard.html";
  } catch (error) {
    App.showToast(error.message, "error");
  }
});

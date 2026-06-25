const API = window.WorshipFlowApi;
const App = window.WorshipFlow;
const form = document.getElementById("cadastro-form");

App.setupNameField(form.elements.nome);
App.setupEmailField(form.elements.email);
App.setupPhoneField(form.elements.telefone, { required: true });

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const validName = App.validateNameField(form.elements.nome);
  const validEmail = App.validateRegistrationEmail(form.elements.email);
  const validPhone = App.validatePhoneField(form.elements.telefone, { required: true });
  if (!validName || !validEmail || !validPhone || !form.reportValidity()) return;

  const data = App.formToObject(event.currentTarget);
  data.nome = String(data.nome || "").trim().replace(/\s+/g, " ");
  data.email = App.normalizeEmail(data.email);
  data.telefone = App.phoneDigits(data.telefone);

  try {
    const response = await API.postData("/auth/cadastro", data);
    API.saveAuth(response);
    App.showToast(response.message || "Cadastro realizado com sucesso.");
    location.href = "/pages/dashboard.html";
  } catch (error) {
    App.showToast(error.message, "error");
  }
});

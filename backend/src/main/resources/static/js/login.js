const API = window.WorshipFlowApi;
const App = window.WorshipFlow;

document.getElementById("login-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    const response = await API.postData("/auth/login", App.formToObject(event.currentTarget));
    API.saveAuth(response);
    App.showToast(response.message || "Login realizado com sucesso.");
    location.href = "/pages/dashboard.html";
  } catch (error) {
    App.showToast(error.message, "error");
  }
});

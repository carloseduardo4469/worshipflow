const API = window.WorshipFlowApi;
const App = window.WorshipFlow;

document.getElementById("esqueci-senha-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    const response = await API.postData("/auth/esqueci-senha", {
      email: new FormData(event.currentTarget).get("email")
    });
    App.showToast(response.message || "Verifique seu e-mail.");
    event.currentTarget.reset();
  } catch (error) {
    App.showToast(error.message, "error");
  }
});

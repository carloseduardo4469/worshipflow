const API = window.WorshipFlowApi;
const App = window.WorshipFlow;
const form = document.getElementById("esqueci-senha-form");
const feedback = document.getElementById("password-reset-feedback");
const submitButton = form.querySelector("button[type='submit']");

function setFeedback(message, type = "info", resetLink = "") {
  feedback.hidden = false;
  feedback.className = `auth-feedback auth-feedback-${type}`;
  feedback.innerHTML = `
    <strong>${App.escapeHtml(message)}</strong>
    ${resetLink ? `<a href="${App.escapeHtml(resetLink)}">Abrir link local de redefinicao</a>` : ""}
  `;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  feedback.hidden = true;
  submitButton.disabled = true;
  submitButton.textContent = "Enviando...";

  try {
    const response = await API.postData("/auth/esqueci-senha", {
      email: new FormData(event.currentTarget).get("email")
    });

    const data = response.data || {};
    if (data.resetLink) {
      setFeedback(response.message || "Link local de redefinicao gerado.", "success", data.resetLink);
    } else if (data.emailEnviado) {
      setFeedback("E-mail enviado. Verifique sua caixa de entrada e a pasta de spam.", "success");
    } else {
      setFeedback(response.message || "Se o e-mail estiver cadastrado, enviaremos um link de redefinicao.", "info");
    }

    App.showToast(response.message || "Solicitacao processada.");
    event.currentTarget.reset();
  } catch (error) {
    setFeedback(error.message || "Nao foi possivel enviar o link agora.", "error");
    App.showToast(error.message, "error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Enviar link";
  }
});

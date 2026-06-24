const CONTACT_RECIPIENTS = new Set([
  "lucasavilagodoi43@gmail.com",
  "caduwerneck42@gmail.com"
]);

const contactForm = document.querySelector("[data-contact-form]");
const contactStatus = document.querySelector("[data-contact-status]");
const contactRecipient = contactForm?.elements.destinatario;

function setContactRecipient(email) {
  const normalized = String(email || "").trim().toLowerCase();
  if (!contactRecipient || !CONTACT_RECIPIENTS.has(normalized)) return;
  contactRecipient.value = normalized;
}

function openContactSection(email) {
  setContactRecipient(email || "lucasavilagodoi43@gmail.com");
  const section = document.getElementById("contato");
  section?.scrollIntoView({ behavior: "smooth", block: "start" });
  window.setTimeout(() => contactForm?.elements.nome?.focus({ preventScroll: true }), 450);
}

document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-contact-recipient]");
  if (!trigger) return;
  event.preventDefault();
  openContactSection(trigger.dataset.contactRecipient);
  history.replaceState(null, "", "#contato");
});

contactForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(contactForm).entries());
  const confirmed = await App.confirmDialog({
    title: "Enviar mensagem?",
    message: `Confirme o envio da sua mensagem para ${payload.destinatario}.`,
    confirmText: "Enviar mensagem",
    cancelText: "Cancelar",
    iconName: "checkCircle"
  });
  if (!confirmed) return;

  const submitButton = contactForm.querySelector("button[type='submit']");
  const originalText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = "Enviando...";
  contactStatus.textContent = "";
  contactStatus.className = "contact-status";

  try {
    const response = await fetch("/api/contato", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || result?.success === false) {
      throw new Error(result?.message || "Não foi possível enviar a mensagem.");
    }

    if (result?.data?.abrirClienteEmail) {
      const subject = "Contato pelo WorshipFlow";
      const body = [
        `Nome: ${payload.nome}`,
        `E-mail para resposta: ${payload.email}`,
        "",
        "Mensagem:",
        payload.mensagem
      ].join("\n");
      contactStatus.textContent = "Seu aplicativo de e-mail foi aberto. Revise e envie a mensagem.";
      contactStatus.classList.add("is-success");
      window.location.href = `mailto:${payload.destinatario}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      return;
    }

    const selectedRecipient = contactRecipient.value;
    contactForm.reset();
    setContactRecipient(selectedRecipient);
    contactStatus.textContent = result?.message || "Mensagem enviada com sucesso.";
    contactStatus.classList.add("is-success");
  } catch (error) {
    contactStatus.textContent = error.message;
    contactStatus.classList.add("is-error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalText;
  }
});

if (location.hash === "#contato") {
  setContactRecipient("lucasavilagodoi43@gmail.com");
}

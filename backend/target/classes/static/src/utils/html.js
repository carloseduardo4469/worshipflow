export function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function toDatetimeLocal(value) {
  if (!value) return "";
  return value.slice(0, 16);
}

export function fromForm(form) {
  return Object.fromEntries(new FormData(form).entries());
}

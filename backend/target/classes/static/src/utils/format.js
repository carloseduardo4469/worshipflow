export function formatDateTime(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

export function countLabel(count, singular, plural) {
  return `${count} ${count === 1 ? singular : plural}`;
}

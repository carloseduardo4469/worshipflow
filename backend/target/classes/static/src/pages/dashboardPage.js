import { countLabel, formatDateTime } from "../utils/format.js";

export function dashboardPage({ musicos, musicas, eventos, escalas, apiOnline }) {
  const nextEvent = [...eventos].sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora))[0];

  return `
    <div class="page-stack">
      <section class="hero">
        <div>
          <span class="eyebrow">${apiOnline ? "API conectada" : "Modo sem conexão"}</span>
          <h1>Organize o louvor sem depender de planilhas soltas.</h1>
          <p>Este MVP já separa cadastro, repertório, eventos e escalas em uma base pronta para evoluir.</p>
        </div>
        <img src="../assets/stage-celebration.png" alt="Palco de celebração" loading="lazy" decoding="async" width="720" height="460" />
      </section>
      <section class="metric-grid">
        ${metric("Membros ativos", countLabel(musicos.length, "cadastro", "cadastros"))}
        ${metric("Músicas", countLabel(musicas.length, "item", "itens"))}
        ${metric("Eventos", countLabel(eventos.length, "agenda", "agendas"))}
        ${metric("Escalas", countLabel(escalas.length, "escala", "escalas"))}
      </section>
      <section class="grid two">
        <article class="panel">
          <h2>Próximo evento</h2>
          ${nextEvent ? `<p class="large">${nextEvent.titulo}</p><p>${formatDateTime(nextEvent.dataHora)} - ${nextEvent.local || "Local não informado"}</p>` : "<p>Nenhum evento cadastrado ainda.</p>"}
        </article>
        <article class="panel">
          <h2>Próximos passos</h2>
          <ul class="clean-list">
            <li>Completar perfis dos membros com instrumentos principais.</li>
            <li>Montar repertório em músicas.</li>
            <li>Criar evento e publicar uma escala.</li>
          </ul>
        </article>
      </section>
    </div>
  `;
}

function metric(label, value) {
  return `<article class="metric"><span>${label}</span><strong>${value}</strong></article>`;
}

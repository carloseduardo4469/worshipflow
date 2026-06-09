import { icon } from "../components/icons.js";
import { escapeHtml } from "../utils/html.js";

export function loginPage(mode = "login", token = "") {
  if (mode === "register") return registerView();
  if (mode === "forgot") return forgotView();
  if (mode === "reset") return resetView(token);

  return authShell(
    "right",
    `
      <section class="auth-form-panel">
        ${brandHeader("Entrar")}
        <form data-form="login" class="auth-form">
          <label>
            <span>E-mail</span>
            <input name="email" type="email" autocomplete="email" placeholder="Digite seu e-mail" required />
          </label>
          <label>
            <span>Senha</span>
            <input name="senha" type="password" autocomplete="current-password" placeholder="Digite sua senha" required />
          </label>
          <button class="button primary auth-submit" type="submit">${icon("chevron")}Entrar</button>
        </form>
        <div class="auth-links compact">
          <button type="button" data-auth-view="forgot">Esqueci minha senha</button>
        </div>
      </section>
    `,
    `
      <aside class="auth-hero-panel">
        <span class="auth-brand-mark">${icon("music")}</span>
        <h2>Bem-vindo ao WorshipFlow</h2>
        <p>Organize escalas, repertorios e equipes do ministerio de louvor em um unico ambiente.</p>
        <button class="button outline-light" type="button" data-auth-view="register">Criar cadastro</button>
      </aside>
    `
  );
}

function registerView() {
  return authShell(
    "left",
    `
      <aside class="auth-hero-panel">
        <span class="auth-brand-mark">${icon("music")}</span>
        <h2>Ja faz parte da equipe?</h2>
        <p>Entre com sua conta para acompanhar escalas, ensaios e repertorios.</p>
        <button class="button outline-light" type="button" data-auth-view="login">Entrar</button>
      </aside>
    `,
    `
      <section class="auth-form-panel">
        ${brandHeader("Criar conta")}
        <form data-form="register" class="auth-form auth-form-register">
          <label><span>Nome</span><input name="nome" autocomplete="name" placeholder="Nome completo" required /></label>
          <label><span>E-mail</span><input name="email" type="email" autocomplete="email" placeholder="Digite seu e-mail" required /></label>
          <label><span>Senha</span><input name="senha" type="password" autocomplete="new-password" minlength="8" placeholder="Minimo de 8 caracteres" required /></label>
          <label><span>Telefone</span><input name="telefone" type="tel" inputmode="tel" autocomplete="tel" maxlength="30" placeholder="Opcional" /></label>
          <label><span>Instrumento principal</span><input name="instrumentoPrincipal" maxlength="80" placeholder="Ex: violao, teclado, voz" required /></label>
          <label><span>Habilidades</span><textarea name="habilidades" maxlength="300" placeholder="Ex: violao, baixo, bateria"></textarea></label>
          <button class="button primary auth-submit" type="submit">${icon("save")}Cadastrar</button>
        </form>
      </section>
    `
  );
}

function forgotView() {
  return authShell(
    "right",
    `
      <section class="auth-form-panel auth-form-panel-narrow">
        ${brandHeader("Redefinir senha")}
        <p class="auth-subtitle">Informe seu e-mail para receber um link temporario.</p>
        <form data-form="forgot-password" class="auth-form">
          <label><span>E-mail</span><input name="email" type="email" autocomplete="email" placeholder="Digite seu e-mail" required /></label>
          <button class="button primary auth-submit" type="submit">${icon("chevron")}Enviar link</button>
        </form>
      </section>
    `,
    `
      <aside class="auth-hero-panel">
        <span class="auth-brand-mark">${icon("music")}</span>
        <h2>Lembrou sua senha?</h2>
        <p>Volte para o acesso principal e continue organizando o ministerio.</p>
        <button class="button outline-light" type="button" data-auth-view="login">Voltar para login</button>
      </aside>
    `
  );
}

function resetView(token) {
  if (!token) {
    return authShell(
      "right",
      `
        <section class="auth-form-panel auth-form-panel-narrow">
          ${brandHeader("Link invalido")}
          <p class="auth-subtitle">Solicite uma nova redefinicao de senha para gerar um link valido.</p>
          <div class="auth-links compact">
            <button type="button" data-auth-view="forgot">Solicitar novo link</button>
          </div>
        </section>
      `,
      `
        <aside class="auth-hero-panel">
          <span class="auth-brand-mark">${icon("music")}</span>
          <h2>Acesso protegido</h2>
          <p>Por seguranca, a troca de senha precisa de um token valido e temporario.</p>
          <button class="button outline-light" type="button" data-auth-view="login">Voltar para login</button>
        </aside>
      `
    );
  }

  return authShell(
    "right",
    `
      <section class="auth-form-panel auth-form-panel-narrow">
        ${brandHeader("Nova senha")}
        <p class="auth-subtitle">Cadastre uma nova senha para sua conta.</p>
        <form data-form="reset-password" class="auth-form">
          <input name="token" type="hidden" value="${escapeHtml(token)}" />
          <label><span>Nova senha</span><input name="novaSenha" type="password" autocomplete="new-password" minlength="8" placeholder="Minimo de 8 caracteres" required /></label>
          <label><span>Confirmar senha</span><input name="confirmarNovaSenha" type="password" autocomplete="new-password" minlength="8" placeholder="Repita a nova senha" required /></label>
          <button class="button primary auth-submit" type="submit">${icon("save")}Salvar senha</button>
        </form>
      </section>
    `,
    `
      <aside class="auth-hero-panel">
        <span class="auth-brand-mark">${icon("music")}</span>
        <h2>Seguranca restaurada</h2>
        <p>Atualize sua senha e retorne ao painel do WorshipFlow.</p>
      </aside>
    `
  );
}

function authShell(panelPosition, firstPanel, secondPanel) {
  return `
    <main class="login-page">
      <section class="auth-card auth-accent-${panelPosition}" aria-label="Acesso ao WorshipFlow">
        ${firstPanel}
        ${secondPanel}
      </section>
    </main>
  `;
}

function brandHeader(title) {
  return `
    <div class="auth-title">
      <span class="auth-logo">${icon("music")}</span>
      <h1>${title}</h1>
    </div>
  `;
}

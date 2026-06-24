package br.com.worshipflow.service;

import java.net.URI;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class AuthEmailService implements InitializingBean {

    private static final Logger LOGGER = LoggerFactory.getLogger(AuthEmailService.class);
    private static final int TEMPORARY_PASSWORD_BYTES = 48;
    private static final int MAX_RESPONSE_BODY_LOG_LENGTH = 500;
    private static final String BRAND_LOGO_CONTENT_ID = "worshipflow-logo";

    private final JavaMailSender mailSender;
    private final RestClient restClient;
    private final SecureRandom secureRandom = new SecureRandom();

    private final String provider;
    private final String from;
    private final String host;
    private final String username;
    private final String password;
    private final boolean smtpAuth;
    private final String logoUrl;
    private final String supabaseUrl;
    private final String supabaseAnonKey;
    private final String supabaseServiceRoleKey;

    public AuthEmailService(ObjectProvider<JavaMailSender> mailSender,
                            @Value("${app.password-reset.provider:auto}") String provider,
                            @Value("${app.mail.from:noreply@worshipflow.local}") String from,
                            @Value("${spring.mail.host:}") String host,
                            @Value("${spring.mail.username:}") String username,
                            @Value("${spring.mail.password:}") String password,
                            @Value("${spring.mail.properties.mail.smtp.auth:true}") boolean smtpAuth,
                            @Value("${app.brand.logo-url:}") String logoUrl,
                            @Value("${app.supabase.url:}") String supabaseUrl,
                            @Value("${app.supabase.anon-key:}") String supabaseAnonKey,
                            @Value("${app.supabase.service-role-key:}") String supabaseServiceRoleKey) {
        this.mailSender = mailSender.getIfAvailable();
        this.restClient = RestClient.builder().build();
        this.provider = provider;
        this.from = from;
        this.host = host;
        this.username = username;
        this.password = password;
        this.smtpAuth = smtpAuth;
        this.logoUrl = logoUrl;
        this.supabaseUrl = supabaseUrl;
        this.supabaseAnonKey = supabaseAnonKey;
        this.supabaseServiceRoleKey = supabaseServiceRoleKey;
    }

    @Override
    public void afterPropertiesSet() {
        LOGGER.info("Redefinicao de senha: provider={}, smtpHost={}, smtpFrom={}, smtpAuth={}, smtpUsernamePresente={}, smtpPasswordPresente={}, mailSenderDisponivel={}, supabaseUrlPresente={}, supabaseAnonKeyPresente={}, supabaseServiceRoleKeyPresente={}",
                selectedProvider(),
                safeValue(host),
                safeValue(from),
                smtpAuth,
                hasText(username),
                hasText(password),
                mailSender != null,
                hasText(supabaseUrl),
                hasText(supabaseAnonKey),
                hasText(supabaseServiceRoleKey));
    }

    public boolean enviarLinkRedefinicao(String destinatario, String nome, String link) {
        PasswordResetProvider selectedProvider = selectedProvider();

        if (selectedProvider == PasswordResetProvider.SUPABASE) {
            return enviarViaSupabaseAuth(destinatario, nome, link);
        }

        if (selectedProvider == PasswordResetProvider.SMTP) {
            return enviarViaSmtp(destinatario, nome, link);
        }

        if (isSmtpConfigured() && enviarViaSmtp(destinatario, nome, link)) {
            return true;
        }

        if (isSupabaseConfigured() && enviarViaSupabaseAuth(destinatario, nome, link)) {
            return true;
        }

        LOGGER.warn("Nenhum provedor de redefinicao de senha configurado para {}.", maskEmail(destinatario));
        return false;
    }

    private boolean enviarViaSmtp(String destinatario, String nome, String link) {
        if (mailSender == null) {
            LOGGER.warn("SMTP nao configurado: JavaMailSender indisponivel para {}.", maskEmail(destinatario));
            return false;
        }

        if (!isSmtpConfigured()) {
            LOGGER.warn("SMTP incompleto: host={}, from={}, usernamePresente={}, passwordPresente={}. Destinatario={}",
                    safeValue(host),
                    safeValue(from),
                    hasText(username),
                    hasText(password),
                    maskEmail(destinatario));
            return false;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(from);
            helper.setTo(destinatario);
            helper.setSubject("WorshipFlow - Redefinição de senha");
            helper.setText(buildPasswordResetText(nome, link), buildPasswordResetHtml(nome, link));
            if (shouldEmbedDefaultLogo()) {
                helper.addInline(
                        BRAND_LOGO_CONTENT_ID,
                        new ClassPathResource("static/assets/LogoWorshipFlowIcon.png"),
                        MediaType.IMAGE_PNG_VALUE);
            }
            mailSender.send(message);
            return true;
        } catch (MessagingException exception) {
            LOGGER.error("Falha ao montar email de redefinicao para {}.", maskEmail(destinatario), exception);
            return false;
        } catch (MailException exception) {
            LOGGER.error("Falha ao enviar email de redefinicao para {}.", maskEmail(destinatario), exception);
            return false;
        }
    }

    private String buildPasswordResetText(String nome, String link) {
        String saudacao = hasText(nome) ? nome.trim() : "membro do WorshipFlow";
        return """
                Olá, %s.

                Recebemos uma solicitação para redefinir a senha da sua conta no WorshipFlow.

                Para continuar com segurança, acesse o link abaixo e cadastre uma nova senha:
                %s

                Este link expira em 30 minutos por segurança.

                Se você não solicitou essa alteração, ignore este e-mail. Nenhuma mudança será feita na sua conta.

                WorshipFlow
                Gestão simples para ministérios de louvor.
                """.formatted(saudacao, link);
    }

    private String buildPasswordResetHtml(String nome, String link) {
        String saudacao = escapeHtml(hasText(nome) ? nome.trim() : "membro do WorshipFlow");
        String resetLink = escapeHtml(link);
        String resolvedLogoSource = escapeHtml(resolvedLogoSource());

        return """
                <!doctype html>
                <html lang="pt-BR">
                  <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Redefina sua senha no WorshipFlow</title>
                  </head>
                  <body style="margin:0;padding:0;background:#07111f;font-family:Arial,Helvetica,sans-serif;color:#eaf6ff;">
                    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">Use o link seguro para criar uma nova senha no WorshipFlow. Ele expira em 30 minutos.</div>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;background:#07111f;">
                      <tr>
                        <td align="center" style="padding:36px 16px;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;max-width:640px;border-collapse:separate;border-spacing:0;background:#0d1b2e;border:1px solid #1f3b58;border-radius:24px;overflow:hidden;">
                            <tr>
                              <td style="padding:28px;background:#081525;border-bottom:1px solid #1f3b58;">
                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                                  <tr>
                                    <td style="width:76px;vertical-align:middle;">
                                      <img src="${logoSource}" width="64" height="64" alt="WorshipFlow" style="display:block;width:64px;height:64px;border-radius:999px;background:#07111f;border:1px solid #2dd4e8;">
                                    </td>
                                    <td style="vertical-align:middle;padding-left:14px;">
                                      <p style="margin:0 0 6px;color:#22c8df;font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;">Acesso seguro</p>
                                      <h1 style="margin:0;color:#ffffff;font-size:28px;line-height:1.15;font-weight:900;">Redefinição de senha</h1>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:30px 28px 12px;">
                                <p style="margin:0 0 16px;color:#eaf6ff;font-size:17px;line-height:1.65;">Olá, <strong style="color:#ffffff;">${nome}</strong>.</p>
                                <p style="margin:0 0 18px;color:#b8c7d9;font-size:15px;line-height:1.75;">Recebemos uma solicitação para redefinir a senha da sua conta no WorshipFlow. Clique no botão abaixo para criar uma nova senha com segurança.</p>
                                <table role="presentation" cellspacing="0" cellpadding="0" style="margin:26px 0 22px;border-collapse:collapse;">
                                  <tr>
                                    <td bgcolor="#d7a927" style="border-radius:999px;">
                                      <a href="${resetLink}" style="display:inline-block;padding:15px 26px;color:#07111f;font-size:15px;font-weight:900;text-decoration:none;border-radius:999px;">Criar nova senha</a>
                                    </td>
                                  </tr>
                                </table>
                                <div style="margin:0 0 22px;padding:14px 16px;border:1px solid #25516f;border-radius:16px;background:#0a2137;">
                                  <p style="margin:0;color:#cfefff;font-size:13px;line-height:1.65;"><strong style="color:#ffffff;">Validade:</strong> este link expira em 30 minutos. Depois disso, será necessário solicitar outro e-mail de recuperação.</p>
                                </div>
                                <p style="margin:0 0 12px;color:#8fa4bc;font-size:13px;line-height:1.7;">Se o botão não funcionar, copie e cole este endereço no navegador:</p>
                                <p style="margin:0;padding:12px 14px;border-radius:14px;background:#07111f;border:1px solid #1f3b58;color:#7de7f7;font-size:12px;line-height:1.55;word-break:break-all;">${resetLink}</p>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:22px 28px 28px;">
                                <p style="margin:0;color:#8fa4bc;font-size:13px;line-height:1.7;">Se você não solicitou essa alteração, ignore este e-mail. Nenhuma mudança será feita na sua conta.</p>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:18px 28px;background:#081525;border-top:1px solid #1f3b58;">
                                <p style="margin:0;color:#b8c7d9;font-size:12px;line-height:1.6;">WorshipFlow · Gestão simples para ministérios de louvor.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </body>
                </html>
                """
                .replace("${logoSource}", resolvedLogoSource)
                .replace("${resetLink}", resetLink)
                .replace("${nome}", saudacao);
    }

    private boolean enviarViaSupabaseAuth(String destinatario, String nome, String link) {
        if (!isSupabaseConfigured()) {
            LOGGER.warn("Supabase Auth nao configurado: informe SUPABASE_URL e SUPABASE_ANON_KEY ou SUPABASE_SERVICE_ROLE_KEY. Destinatario={}",
                    maskEmail(destinatario));
            return false;
        }

        try {
            garantirUsuarioSupabase(destinatario, nome);

            URI recoverUri = UriComponentsBuilder.fromUriString(authApiBaseUrl() + "/recover")
                    .queryParam("redirect_to", link)
                    .build()
                    .encode()
                    .toUri();

            restClient.post()
                    .uri(recoverUri)
                    .headers(headers -> addSupabaseHeaders(headers, supabaseApiKey()))
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("email", destinatario))
                    .retrieve()
                    .toBodilessEntity();

            return true;
        } catch (RestClientResponseException exception) {
            LOGGER.error("Falha HTTP ao solicitar redefinicao pelo Supabase Auth para {}. Status={}, body={}",
                    destinatario,
                    exception.getStatusCode(),
                    safeResponseBody(exception),
                    exception);
            return false;
        } catch (RestClientException exception) {
            LOGGER.error("Falha ao solicitar redefinicao pelo Supabase Auth para {}.", destinatario, exception);
            return false;
        }
    }

    private void garantirUsuarioSupabase(String email, String nome) {
        if (!hasText(supabaseServiceRoleKey)) {
            return;
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("email", email);
        body.put("password", temporaryPassword());
        body.put("email_confirm", true);
        body.put("user_metadata", Map.of("name", hasText(nome) ? nome : email));

        try {
            restClient.post()
                    .uri(URI.create(authApiBaseUrl() + "/admin/users"))
                    .headers(headers -> addSupabaseHeaders(headers, supabaseServiceRoleKey))
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientResponseException exception) {
            if (isSupabaseUserAlreadyRegistered(exception)) {
                LOGGER.debug("Usuario ja existe no Supabase Auth: {}", email);
                return;
            }

            throw exception;
        }
    }

    private boolean isSmtpConfigured() {
        return hasText(host) && hasText(from) && (!smtpAuth || (hasText(username) && hasText(password)));
    }

    private boolean isSupabaseConfigured() {
        return hasText(supabaseUrl) && hasText(supabaseApiKey());
    }

    private String supabaseApiKey() {
        return hasText(supabaseAnonKey) ? supabaseAnonKey : supabaseServiceRoleKey;
    }

    private String authApiBaseUrl() {
        String normalized = supabaseUrl.trim().replaceAll("/+$", "");
        if (normalized.endsWith("/auth/v1")) {
            return normalized;
        }

        return normalized + "/auth/v1";
    }

    private String resolvedLogoSource() {
        if (hasText(logoUrl)) {
            return logoUrl.trim();
        }

        return "cid:" + BRAND_LOGO_CONTENT_ID;
    }

    private boolean shouldEmbedDefaultLogo() {
        return !hasText(logoUrl);
    }

    private void addSupabaseHeaders(HttpHeaders headers, String apiKey) {
        headers.set("apikey", apiKey);
        headers.setBearerAuth(apiKey);
    }

    private boolean isSupabaseUserAlreadyRegistered(RestClientResponseException exception) {
        String body = safeResponseBody(exception).toLowerCase(Locale.ROOT);
        return body.contains("already") || body.contains("registered") || body.contains("exists");
    }

    private String temporaryPassword() {
        byte[] bytes = new byte[TEMPORARY_PASSWORD_BYTES];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private PasswordResetProvider selectedProvider() {
        if (!hasText(provider)) {
            return PasswordResetProvider.AUTO;
        }

        try {
            return PasswordResetProvider.valueOf(provider.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            LOGGER.warn("Provider de redefinicao de senha invalido: {}. Usando AUTO.", provider);
            return PasswordResetProvider.AUTO;
        }
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private String safeValue(String value) {
        return hasText(value) ? value : "<vazio>";
    }

    private String escapeHtml(String value) {
        if (value == null) {
            return "";
        }

        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    private String maskEmail(String email) {
        if (!hasText(email)) {
            return "<vazio>";
        }

        int atIndex = email.indexOf('@');
        if (atIndex <= 1) {
            return "***";
        }

        return email.charAt(0) + "***" + email.substring(atIndex);
    }

    private String safeResponseBody(RestClientResponseException exception) {
        String body = exception.getResponseBodyAsString();
        if (!hasText(body)) {
            return "<vazio>";
        }

        String sanitized = body.replaceAll("\\s+", " ").trim();
        if (sanitized.length() <= MAX_RESPONSE_BODY_LOG_LENGTH) {
            return sanitized;
        }

        return sanitized.substring(0, MAX_RESPONSE_BODY_LOG_LENGTH) + "...";
    }

    private enum PasswordResetProvider {
        AUTO,
        SMTP,
        SUPABASE
    }
}

package br.com.worshipflow.service;

import java.net.URI;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
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

    private final JavaMailSender mailSender;
    private final RestClient restClient;
    private final SecureRandom secureRandom = new SecureRandom();

    private final String provider;
    private final String from;
    private final String host;
    private final String username;
    private final String password;
    private final boolean smtpAuth;
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

        if (isSupabaseConfigured() && enviarViaSupabaseAuth(destinatario, nome, link)) {
            return true;
        }

        if (isSmtpConfigured() && enviarViaSmtp(destinatario, nome, link)) {
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

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(destinatario);
        message.setSubject("Redefinicao de senha - WorshipFlow");
        message.setText("""
                Ola, %s.

                Para redefinir sua senha no WorshipFlow, acesse o link abaixo:
                %s

                Este link expira em 30 minutos. Se voce nao solicitou a redefinicao, ignore este email.
                """.formatted(nome, link));

        try {
            mailSender.send(message);
            return true;
        } catch (MailException exception) {
            LOGGER.error("Falha ao enviar email de redefinicao para {}.", maskEmail(destinatario), exception);
            return false;
        }
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

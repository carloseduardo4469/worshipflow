package br.com.worshipflow.service;

import br.com.worshipflow.dto.ContatoRequest;
import java.time.Duration;
import java.time.Instant;
import java.util.Arrays;
import java.util.Locale;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executor;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.task.TaskRejectedException;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class ContatoService {

    private static final Logger LOGGER = LoggerFactory.getLogger(ContatoService.class);
    private static final Duration RATE_WINDOW = Duration.ofMinutes(15);
    private static final int MAX_MESSAGES_PER_EMAIL = 3;
    private static final int MAX_MESSAGES_PER_IP = 5;

    private final JavaMailSender mailSender;
    private final String from;
    private final String smtpHost;
    private final Executor contactMailExecutor;
    private final Set<String> allowedRecipients;
    private final ConcurrentHashMap<String, RateWindow> rateWindows = new ConcurrentHashMap<>();

    public ContatoService(
            ObjectProvider<JavaMailSender> mailSender,
            @Value("${app.mail.from:noreply@worshipflow.local}") String from,
            @Value("${spring.mail.host:}") String smtpHost,
            @Value("${app.contact.recipients}") String recipients,
            @Qualifier("contactMailExecutor") Executor contactMailExecutor
    ) {
        this.mailSender = mailSender.getIfAvailable();
        this.from = from;
        this.smtpHost = smtpHost;
        this.contactMailExecutor = contactMailExecutor;
        this.allowedRecipients = Arrays.stream(recipients.split(","))
                .map(this::normalizeEmail)
                .filter(value -> !value.isBlank())
                .collect(Collectors.toUnmodifiableSet());
    }

    public boolean enviar(ContatoRequest request, String clientAddress) {
        if (request.website() != null && !request.website().isBlank()) {
            return true;
        }

        String senderEmail = normalizeEmail(request.email());
        String recipient = normalizeEmail(request.destinatario());
        if (!allowedRecipients.contains(recipient)) {
            throw new IllegalArgumentException("Destinatário não autorizado.");
        }

        if (!isMailConfigured()) {
            return false;
        }
        assertRateLimit("ip:" + normalizeClientAddress(clientAddress), MAX_MESSAGES_PER_IP);
        assertRateLimit("email:" + senderEmail, MAX_MESSAGES_PER_EMAIL);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setReplyTo(senderEmail);
        message.setTo(recipient);
        message.setSubject("Contato pelo WorshipFlow");
        message.setText("""
                Nova mensagem enviada pelo canal de contato do WorshipFlow.

                Nome: %s
                E-mail para resposta: %s

                Mensagem:
                %s
                """.formatted(request.nome().trim(), senderEmail, request.mensagem().trim()));

        try {
            contactMailExecutor.execute(() -> sendMessage(message, recipient));
            return true;
        } catch (TaskRejectedException exception) {
            throw new IllegalArgumentException("O canal de contato está ocupado. Aguarde alguns minutos e tente novamente.");
        }
    }

    private void sendMessage(SimpleMailMessage message, String recipient) {
        try {
            mailSender.send(message);
        } catch (MailException exception) {
            LOGGER.error("Falha ao enviar mensagem do canal de contato para {}.", maskEmail(recipient), exception);
        }
    }

    private boolean isMailConfigured() {
        return mailSender != null
                && smtpHost != null
                && !smtpHost.isBlank()
                && from != null
                && !from.isBlank();
    }

    private void assertRateLimit(String key, int maximumMessages) {
        Instant now = Instant.now();
        AtomicBoolean allowed = new AtomicBoolean(false);

        rateWindows.compute(key, (ignored, current) -> {
            if (current == null || Duration.between(current.startedAt(), now).compareTo(RATE_WINDOW) >= 0) {
                allowed.set(true);
                return new RateWindow(now, 1);
            }
            if (current.count() < maximumMessages) {
                allowed.set(true);
                return new RateWindow(current.startedAt(), current.count() + 1);
            }
            return current;
        });

        if (!allowed.get()) {
            throw new IllegalArgumentException("Muitas mensagens enviadas. Aguarde 15 minutos antes de tentar novamente.");
        }

        if (rateWindows.size() > 1000) {
            rateWindows.entrySet().removeIf(entry ->
                    Duration.between(entry.getValue().startedAt(), now).compareTo(RATE_WINDOW) >= 0
            );
        }
    }

    private String normalizeEmail(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeClientAddress(String clientAddress) {
        return clientAddress == null || clientAddress.isBlank() ? "unknown" : clientAddress.trim();
    }

    private String maskEmail(String email) {
        int atIndex = email.indexOf('@');
        return atIndex <= 1 ? "***" : email.charAt(0) + "***" + email.substring(atIndex);
    }

    private record RateWindow(Instant startedAt, int count) {
    }
}

package br.com.worshipflow.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import org.springframework.stereotype.Component;

@Component
public class AuthTokenService {

    private final SecureRandom secureRandom = new SecureRandom();

    public String generateToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public String hash(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encoded = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            StringBuilder builder = new StringBuilder(encoded.length * 2);
            for (byte item : encoded) {
                builder.append(String.format("%02x", item));
            }
            return builder.toString();
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("Algoritmo SHA-256 indisponível.", exception);
        }
    }
}

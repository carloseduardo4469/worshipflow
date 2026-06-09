package br.com.worshipflow;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class WorshipFlowApplication {

    public static void main(String[] args) {
        loadLocalEnv();
        SpringApplication.run(WorshipFlowApplication.class, args);
    }

    private static void loadLocalEnv() {
        Path currentDirectory = Path.of("").toAbsolutePath();
        List<Path> candidates = List.of(
                currentDirectory.resolve(".env"),
                currentDirectory.resolve("backend").resolve(".env")
        );

        for (Path candidate : candidates) {
            if (Files.isRegularFile(candidate)) {
                loadEnvFile(candidate);
            }
        }
    }

    private static void loadEnvFile(Path envFile) {
        try {
            for (String line : Files.readAllLines(envFile)) {
                applyEnvLine(line);
            }
        } catch (IOException exception) {
            throw new IllegalStateException("Nao foi possivel carregar o arquivo " + envFile, exception);
        }
    }

    private static void applyEnvLine(String line) {
        String trimmed = line.trim();
        if (trimmed.isBlank() || trimmed.startsWith("#")) {
            return;
        }

        int separatorIndex = trimmed.indexOf('=');
        if (separatorIndex <= 0) {
            return;
        }

        String key = trimmed.substring(0, separatorIndex).trim();
        String value = removeWrappingQuotes(trimmed.substring(separatorIndex + 1).trim());
        if (!key.matches("[A-Za-z_][A-Za-z0-9_]*")) {
            return;
        }

        if (System.getenv(key) == null && System.getProperty(key) == null) {
            System.setProperty(key, value);
        }
    }

    private static String removeWrappingQuotes(String value) {
        if (value.length() < 2) {
            return value;
        }

        char first = value.charAt(0);
        char last = value.charAt(value.length() - 1);
        if ((first == '"' && last == '"') || (first == '\'' && last == '\'')) {
            return value.substring(1, value.length() - 1);
        }

        return value;
    }
}

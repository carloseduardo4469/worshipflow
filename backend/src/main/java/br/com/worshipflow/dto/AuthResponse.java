package br.com.worshipflow.dto;

public record AuthResponse(
        String token,
        UsuarioResponse usuario
) {
}

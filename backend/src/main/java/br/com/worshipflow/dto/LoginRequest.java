package br.com.worshipflow.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "E-mail é obrigatório.")
        @Email(message = "Email invalido.")
        String email,

        @NotBlank(message = "Senha e obrigatoria.")
        String senha
) {
}

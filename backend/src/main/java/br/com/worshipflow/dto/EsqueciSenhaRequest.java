package br.com.worshipflow.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record EsqueciSenhaRequest(
        @NotBlank(message = "E-mail é obrigatório.")
        @Email(message = "Email invalido.")
        String email
) {
}

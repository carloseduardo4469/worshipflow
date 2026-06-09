package br.com.worshipflow.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RedefinirSenhaRequest(
        @NotBlank(message = "Token é obrigatório.")
        String token,

        @NotBlank(message = "Nova senha e obrigatoria.")
        @Size(min = 8, max = 80, message = "Senha deve ter entre 8 e 80 caracteres.")
        String novaSenha
) {
}

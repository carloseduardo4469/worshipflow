package br.com.worshipflow.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CadastroRequest(
        @NotBlank(message = "Nome é obrigatório.")
        @Size(max = 120, message = "Nome deve ter no máximo 120 caracteres.")
        @Pattern(regexp = "^[\\p{L}][\\p{L} .'-]{1,119}$", message = "Nome deve conter apenas letras e espaços.")
        String nome,

        @NotBlank(message = "E-mail é obrigatório.")
        @Email(message = "E-mail inválido.")
        @Size(max = 160, message = "E-mail deve ter no máximo 160 caracteres.")
        @Pattern(
                regexp = "^(?=.{1,160}$)(?=.{5,}@)(?!.*\\.\\.)[A-Za-z0-9][A-Za-z0-9._%+-]*[A-Za-z0-9]@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$",
                message = "E-mail deve ter formato válido e pelo menos 5 caracteres antes do @."
        )
        String email,

        @NotBlank(message = "Senha é obrigatória.")
        @Size(min = 8, max = 80, message = "Senha deve ter entre 8 e 80 caracteres.")
        String senha,

        @NotBlank(message = "Telefone é obrigatório.")
        @Size(min = 11, max = 11, message = "Telefone deve ter 11 dígitos com DDD.")
        @Pattern(regexp = "\\d{11}", message = "Telefone deve conter 11 números, incluindo DDD.")
        String telefone
) {
}

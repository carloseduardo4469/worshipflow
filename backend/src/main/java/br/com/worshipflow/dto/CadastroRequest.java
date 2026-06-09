package br.com.worshipflow.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CadastroRequest(
        @NotBlank(message = "Nome é obrigatório.")
        @Size(max = 120, message = "Nome deve ter no máximo 120 caracteres.")
        String nome,

        @NotBlank(message = "E-mail é obrigatório.")
        @Email(message = "Email invalido.")
        @Size(max = 160, message = "E-mail deve ter no máximo 160 caracteres.")
        String email,

        @NotBlank(message = "Senha e obrigatoria.")
        @Size(min = 8, max = 80, message = "Senha deve ter entre 8 e 80 caracteres.")
        String senha,

        @Size(max = 30, message = "Telefone deve ter no máximo 30 caracteres.")
        String telefone,

        @NotBlank(message = "Instrumento principal é obrigatório.")
        @Size(max = 80, message = "Instrumento deve ter no máximo 80 caracteres.")
        String instrumentoPrincipal,

        @Size(max = 300, message = "Habilidades devem ter no máximo 300 caracteres.")
        String habilidades
) {
}

package br.com.worshipflow.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CadastroRequest(
        @NotBlank(message = "Nome e obrigatorio.")
        @Size(max = 120, message = "Nome deve ter no maximo 120 caracteres.")
        String nome,

        @NotBlank(message = "E-mail e obrigatorio.")
        @Email(message = "Email invalido.")
        @Size(max = 160, message = "E-mail deve ter no maximo 160 caracteres.")
        String email,

        @NotBlank(message = "Senha e obrigatoria.")
        @Size(min = 8, max = 80, message = "Senha deve ter entre 8 e 80 caracteres.")
        String senha,

        @NotBlank(message = "Telefone e obrigatorio.")
        @Size(max = 30, message = "Telefone deve ter no maximo 30 caracteres.")
        @Pattern(regexp = "\\d*", message = "Telefone deve conter apenas numeros.")
        String telefone
) {
}

package br.com.worshipflow.dto;

import br.com.worshipflow.entity.PerfilUsuario;
import br.com.worshipflow.entity.StatusMinisterio;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UsuarioAdminRequest(
        @NotBlank(message = "Nome e obrigatorio.")
        @Size(max = 120, message = "Nome deve ter no maximo 120 caracteres.")
        @Pattern(regexp = "^[\\p{L}][\\p{L} .'-]{1,119}$", message = "Nome deve conter apenas letras e espacos.")
        String nome,

        @NotBlank(message = "E-mail e obrigatorio.")
        @Email(message = "Email invalido.")
        @Size(max = 160, message = "E-mail deve ter no maximo 160 caracteres.")
        String email,

        @Size(max = 11, message = "Telefone deve ter 11 digitos com DDD.")
        @Pattern(regexp = "^$|\\d{11}", message = "Telefone deve conter 11 numeros, incluindo DDD.")
        String telefone,

        PerfilUsuario perfil,
        StatusMinisterio statusMinisterio
) {
}

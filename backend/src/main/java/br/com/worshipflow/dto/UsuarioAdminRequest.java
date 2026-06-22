package br.com.worshipflow.dto;

import br.com.worshipflow.entity.PerfilUsuario;
import br.com.worshipflow.entity.StatusMinisterio;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UsuarioAdminRequest(
        @NotBlank(message = "Nome é obrigatório.")
        @Size(max = 120, message = "Nome deve ter no máximo 120 caracteres.")
        String nome,

        @NotBlank(message = "E-mail é obrigatório.")
        @Email(message = "Email invalido.")
        @Size(max = 160, message = "E-mail deve ter no máximo 160 caracteres.")
        String email,

        @Size(max = 30, message = "Telefone deve ter no máximo 30 caracteres.")
        String telefone,

        PerfilUsuario perfil,
        StatusMinisterio statusMinisterio
) {
}


package br.com.worshipflow.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AtualizarPerfilRequest(
        @NotBlank(message = "Nome é obrigatório.")
        @Size(max = 120, message = "Nome deve ter no máximo 120 caracteres.")
        String nome,

        @Size(max = 30, message = "Telefone deve ter no máximo 30 caracteres.")
        String telefone,

        @NotBlank(message = "Instrumento principal é obrigatório.")
        @Size(max = 80, message = "Instrumento deve ter no máximo 80 caracteres.")
        String instrumentoPrincipal,

        @Size(max = 300, message = "Habilidades devem ter no máximo 300 caracteres.")
        String habilidades,

        @Size(max = 1_400_000, message = "Foto deve ter no máximo 1 MB.")
        String fotoPerfil,

        @Size(max = 60, message = "Tipo da foto invalido.")
        String fotoPerfilTipo,

        Boolean removerFoto
) {
}

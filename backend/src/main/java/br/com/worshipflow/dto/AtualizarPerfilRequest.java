package br.com.worshipflow.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AtualizarPerfilRequest(
        @NotBlank(message = "Nome e obrigatorio.")
        @Size(max = 120, message = "Nome deve ter no maximo 120 caracteres.")
        String nome,

        @Size(max = 30, message = "Telefone deve ter no maximo 30 caracteres.")
        @Pattern(regexp = "\\d*", message = "Telefone deve conter apenas numeros.")
        String telefone,

        @Size(max = 300, message = "Habilidades devem ter no maximo 300 caracteres.")
        String habilidades,

        @Size(max = 1_400_000, message = "Foto deve ter no maximo 1 MB.")
        String fotoPerfil,

        @Size(max = 60, message = "Tipo da foto invalido.")
        String fotoPerfilTipo,

        Boolean removerFoto
) {
}

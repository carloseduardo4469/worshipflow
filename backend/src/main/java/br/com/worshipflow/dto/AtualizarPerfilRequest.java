package br.com.worshipflow.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AtualizarPerfilRequest(
        @NotBlank(message = "Nome e obrigatorio.")
        @Size(max = 120, message = "Nome deve ter no maximo 120 caracteres.")
        @Pattern(regexp = "^[\\p{L}][\\p{L} .'-]{1,119}$", message = "Nome deve conter apenas letras e espacos.")
        String nome,

        @Size(max = 11, message = "Telefone deve ter 11 digitos com DDD.")
        @Pattern(regexp = "^$|\\d{11}", message = "Telefone deve conter 11 numeros, incluindo DDD.")
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

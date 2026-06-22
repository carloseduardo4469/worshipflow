package br.com.worshipflow.dto;

public record EquipeResponse(
        Long id,
        String nome,
        String habilidades,
        String fotoPerfil,
        String fotoPerfilTipo
) {
}

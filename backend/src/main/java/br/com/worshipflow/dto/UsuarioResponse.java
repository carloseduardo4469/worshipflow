package br.com.worshipflow.dto;

import br.com.worshipflow.entity.PerfilUsuario;
import br.com.worshipflow.entity.StatusMinisterio;
import java.util.List;

public record UsuarioResponse(
        Long id,
        String nome,
        String email,
        PerfilUsuario perfil,
        String telefone,
        String instrumentoPrincipal,
        String habilidades,
        StatusMinisterio statusMinisterio,
        String fotoPerfil,
        String fotoPerfilTipo,
        List<MusicaResponse> musicasFavoritas
) {
}

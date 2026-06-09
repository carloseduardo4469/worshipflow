package br.com.worshipflow.dto;

import br.com.worshipflow.entity.StatusEscala;
import java.util.List;

public record EscalaResponse(
        Long id,
        String titulo,
        StatusEscala status,
        String observacoes,
        EventoResponse evento,
        List<UsuarioResponse> usuarios,
        List<MusicaResponse> musicas
) {
}

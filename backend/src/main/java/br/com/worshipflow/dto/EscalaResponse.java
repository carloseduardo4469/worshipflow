package br.com.worshipflow.dto;

import br.com.worshipflow.entity.StatusEscala;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public record EscalaResponse(
        Long id,
        String titulo,
        LocalDate dataEscala,
        StatusEscala status,
        String observacoes,
        List<UsuarioResponse> usuarios,
        Map<Long, String> funcoesUsuarios,
        List<MusicaResponse> musicas
) {
}

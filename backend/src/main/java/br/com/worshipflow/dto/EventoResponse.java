package br.com.worshipflow.dto;

import java.time.LocalDateTime;

public record EventoResponse(
        Long id,
        String titulo,
        String tipo,
        LocalDateTime dataHora,
        String local,
        String observacoes
) {
}

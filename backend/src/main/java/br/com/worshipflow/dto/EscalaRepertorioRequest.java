package br.com.worshipflow.dto;

import java.util.List;
import java.util.Map;

public record EscalaRepertorioRequest(
        List<Long> musicaIds,
        Map<Long, String> tonalidadesMusicas
) {
}

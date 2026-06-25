package br.com.worshipflow.dto;

import br.com.worshipflow.entity.StatusEscala;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public record EscalaRequest(
        @NotBlank(message = "Título é obrigatório.")
        @Size(max = 140, message = "Título deve ter no máximo 140 caracteres.")
        String titulo,

        @NotNull(message = "Data da escala é obrigatória.")
        @FutureOrPresent(message = "Data da escala deve ser hoje ou uma data futura.")
        LocalDate dataEscala,

        StatusEscala status,

        @Size(max = 600, message = "Observações devem ter no máximo 600 caracteres.")
        String observacoes,

        List<Long> usuarioIds,
        Map<Long, String> funcoesUsuarios,
        List<Long> musicaIds,
        Map<Long, String> tonalidadesMusicas
) {
}


package br.com.worshipflow.dto;

import br.com.worshipflow.entity.StatusEscala;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public record EscalaRequest(
        @NotBlank(message = "Titulo e obrigatorio")
        @Size(max = 140, message = "Titulo deve ter no maximo 140 caracteres")
        String titulo,

        LocalDate dataEscala,

        StatusEscala status,

        @Size(max = 600, message = "Observacoes devem ter no maximo 600 caracteres")
        String observacoes,

        List<Long> usuarioIds,
        Map<Long, String> funcoesUsuarios,
        List<Long> musicaIds
) {
}


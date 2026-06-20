package br.com.worshipflow.dto;

import br.com.worshipflow.entity.StatusEscala;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

public record EscalaRequest(
        @NotBlank(message = "Titulo e obrigatorio")
        @Size(max = 140, message = "Titulo deve ter no maximo 140 caracteres")
        String titulo,

        StatusEscala status,

        @Size(max = 600, message = "Observacoes devem ter no maximo 600 caracteres")
        String observacoes,

        List<Long> usuarioIds,
        List<Long> musicaIds
) {
}


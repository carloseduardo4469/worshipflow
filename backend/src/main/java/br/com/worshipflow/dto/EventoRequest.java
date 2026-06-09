package br.com.worshipflow.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public record EventoRequest(
        @NotBlank(message = "Titulo e obrigatorio")
        @Size(max = 140, message = "Titulo deve ter no maximo 140 caracteres")
        String titulo,

        @NotBlank(message = "Tipo é obrigatório")
        @Size(max = 60, message = "Tipo deve ter no máximo 60 caracteres")
        String tipo,

        @NotNull(message = "Data e horário sao obrigatorios")
        @FutureOrPresent(message = "Data do evento não pode estar no passado")
        LocalDateTime dataHora,

        @Size(max = 160, message = "Local deve ter no máximo 160 caracteres")
        String local,

        @Size(max = 600, message = "Observacoes devem ter no maximo 600 caracteres")
        String observacoes
) {
}


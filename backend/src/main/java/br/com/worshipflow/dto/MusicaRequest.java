package br.com.worshipflow.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MusicaRequest(
        @NotBlank(message = "Titulo e obrigatorio")
        @Size(max = 140, message = "Titulo deve ter no maximo 140 caracteres")
        String titulo,

        @Size(max = 120, message = "Artista deve ter no máximo 120 caracteres")
        String artista,

        @Size(max = 12, message = "Tonalidade deve ter no máximo 12 caracteres")
        String tonalidade,

        @Min(value = 30, message = "BPM minimo e 30")
        @Max(value = 240, message = "BPM máximo é 240")
        Integer bpm,

        @Size(max = 80, message = "Categoria deve ter no máximo 80 caracteres")
        String categoria,

        @Size(max = 500, message = "Link deve ter no máximo 500 caracteres")
        String linkCifra
) {
}


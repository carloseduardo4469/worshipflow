package br.com.worshipflow.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record MusicaRequest(
        @NotBlank(message = "Titulo e obrigatorio")
        @Size(max = 140, message = "Titulo deve ter no maximo 140 caracteres")
        String titulo,

        @NotBlank(message = "Artista e obrigatorio")
        @Size(max = 120, message = "Artista deve ter no maximo 120 caracteres")
        String artista,

        @NotBlank(message = "Tonalidade e obrigatoria")
        @Size(max = 12, message = "Tonalidade deve ter no maximo 12 caracteres")
        @Pattern(regexp = "^[A-G](#|b)?m?$", message = "Tonalidade deve ser um tom valido, como C, C#, Bm ou A#m")
        String tonalidade,

        @NotNull(message = "BPM e obrigatorio")
        @Min(value = 30, message = "BPM minimo e 30")
        @Max(value = 240, message = "BPM maximo e 240")
        Integer bpm,

        @Size(max = 500, message = "Link deve ter no maximo 500 caracteres")
        String linkCifra
) {
}

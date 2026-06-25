package br.com.worshipflow.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record MusicaRequest(
        @NotBlank(message = "Título é obrigatório.")
        @Size(max = 140, message = "Título deve ter no máximo 140 caracteres.")
        String titulo,

        @NotBlank(message = "Artista é obrigatório.")
        @Size(max = 120, message = "Artista deve ter no máximo 120 caracteres.")
        String artista,

        @NotBlank(message = "Tonalidade é obrigatória.")
        @Size(max = 12, message = "Tonalidade deve ter no máximo 12 caracteres.")
        @Pattern(regexp = "^[A-G](#|b)?m?$", message = "Tonalidade deve ser um tom válido, como C, C#, Bm ou A#m.")
        String tonalidade,

        @NotNull(message = "BPM é obrigatório.")
        @Min(value = 30, message = "BPM mínimo é 30.")
        @Max(value = 240, message = "BPM máximo é 240.")
        Integer bpm,

        @Size(max = 500, message = "Link deve ter no máximo 500 caracteres.")
        @Pattern(regexp = "^$|https?://.+", message = "Link da cifra deve iniciar com http ou https.")
        String linkCifra
) {
}

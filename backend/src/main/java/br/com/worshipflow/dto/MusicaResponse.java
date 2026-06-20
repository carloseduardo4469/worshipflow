package br.com.worshipflow.dto;

public record MusicaResponse(
        Long id,
        String titulo,
        String artista,
        String tonalidade,
        Integer bpm,
        String linkCifra
) {
}

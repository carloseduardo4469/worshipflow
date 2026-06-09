package br.com.worshipflow.dto;

public record RedefinicaoSenhaResponse(
        boolean emailEnviado,
        String resetLink
) {
}

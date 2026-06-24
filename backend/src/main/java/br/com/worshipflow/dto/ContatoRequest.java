package br.com.worshipflow.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ContatoRequest(
        @NotBlank(message = "Nome é obrigatório.")
        @Size(max = 100, message = "Nome deve ter no máximo 100 caracteres.")
        String nome,

        @NotBlank(message = "E-mail é obrigatório.")
        @Email(message = "Informe um e-mail válido.")
        @Size(max = 160, message = "E-mail deve ter no máximo 160 caracteres.")
        String email,

        @NotBlank(message = "Destinatário é obrigatório.")
        @Email(message = "Destinatário inválido.")
        String destinatario,

        @NotBlank(message = "Mensagem é obrigatória.")
        @Size(min = 10, max = 2000, message = "Mensagem deve ter entre 10 e 2000 caracteres.")
        String mensagem,

        @Size(max = 200, message = "Campo inválido.")
        String website
) {
}

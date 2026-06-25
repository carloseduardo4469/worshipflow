package br.com.worshipflow.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ContatoRequest(
        @NotBlank(message = "Nome e obrigatorio.")
        @Size(max = 100, message = "Nome deve ter no maximo 100 caracteres.")
        @Pattern(regexp = "^[\\p{L}][\\p{L} .'-]{1,99}$", message = "Nome deve conter apenas letras e espacos.")
        String nome,

        @NotBlank(message = "E-mail e obrigatorio.")
        @Email(message = "Informe um e-mail valido.")
        @Size(max = 160, message = "E-mail deve ter no maximo 160 caracteres.")
        String email,

        @NotBlank(message = "Destinatario e obrigatorio.")
        @Email(message = "Destinatario invalido.")
        String destinatario,

        @NotBlank(message = "Mensagem e obrigatoria.")
        @Size(min = 10, max = 2000, message = "Mensagem deve ter entre 10 e 2000 caracteres.")
        String mensagem,

        @Size(max = 200, message = "Campo invalido.")
        String website
) {
}

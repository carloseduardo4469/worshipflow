package br.com.worshipflow.controller;

import br.com.worshipflow.dto.ApiResponse;
import br.com.worshipflow.dto.ContatoRequest;
import br.com.worshipflow.dto.ContatoResponse;
import br.com.worshipflow.service.ContatoService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/contato")
public class ContatoController {

    private final ContatoService contatoService;

    public ContatoController(ContatoService contatoService) {
        this.contatoService = contatoService;
    }

    @PostMapping
    public ApiResponse<ContatoResponse> enviar(@Valid @RequestBody ContatoRequest request, HttpServletRequest httpRequest) {
        boolean enviado = contatoService.enviar(request, httpRequest.getRemoteAddr());
        ContatoResponse response = new ContatoResponse(enviado, !enviado);
        String message = enviado
                ? "Mensagem recebida e adicionada à fila de envio."
                : "Abra seu aplicativo de e-mail para concluir o envio.";
        return ApiResponse.ok(message, response);
    }
}

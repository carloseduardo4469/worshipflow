package br.com.worshipflow.controller;

import br.com.worshipflow.dto.ApiResponse;
import br.com.worshipflow.dto.EventoRequest;
import br.com.worshipflow.dto.EventoResponse;
import br.com.worshipflow.service.AuthService;
import br.com.worshipflow.service.EventoService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/eventos")
public class EventoController {

    private final EventoService eventoService;
    private final AuthService authService;

    public EventoController(EventoService eventoService, AuthService authService) {
        this.eventoService = eventoService;
        this.authService = authService;
    }

    @GetMapping
    public ApiResponse<List<EventoResponse>> listar(HttpServletRequest httpRequest) {
        authService.requireAdmin(httpRequest);
        return ApiResponse.ok("Eventos listados com sucesso.", eventoService.listar());
    }

    @GetMapping("/{id}")
    public ApiResponse<EventoResponse> buscar(@PathVariable("id") Long id, HttpServletRequest httpRequest) {
        authService.requireAdmin(httpRequest);
        return ApiResponse.ok("Evento encontrado com sucesso.", eventoService.buscar(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<EventoResponse> criar(@Valid @RequestBody EventoRequest request, HttpServletRequest httpRequest) {
        authService.requireAdmin(httpRequest);
        return ApiResponse.ok("Evento cadastrado com sucesso.", eventoService.criar(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<EventoResponse> atualizar(@PathVariable("id") Long id, @Valid @RequestBody EventoRequest request, HttpServletRequest httpRequest) {
        authService.requireAdmin(httpRequest);
        return ApiResponse.ok("Evento atualizado com sucesso.", eventoService.atualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> remover(@PathVariable("id") Long id, HttpServletRequest httpRequest) {
        authService.requireAdmin(httpRequest);
        eventoService.remover(id);
        return ApiResponse.ok("Evento removido com sucesso.", null);
    }
}

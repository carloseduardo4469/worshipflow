package br.com.worshipflow.controller;

import br.com.worshipflow.dto.ApiResponse;
import br.com.worshipflow.dto.MusicaRequest;
import br.com.worshipflow.dto.MusicaResponse;
import br.com.worshipflow.service.AuthService;
import br.com.worshipflow.service.MusicaService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/musicas")
public class MusicaController {

    private final MusicaService musicaService;
    private final AuthService authService;

    public MusicaController(MusicaService musicaService, AuthService authService) {
        this.musicaService = musicaService;
        this.authService = authService;
    }

    @GetMapping
    public ApiResponse<List<MusicaResponse>> listar(@RequestParam(value = "query", required = false) String query,
                                                    @RequestParam(value = "page", defaultValue = "0") int page,
                                                    @RequestParam(value = "size", defaultValue = "200") int size) {
        return ApiResponse.ok("Musicas listadas com sucesso.", musicaService.listar(query, page, size));
    }

    @GetMapping("/{id}")
    public ApiResponse<MusicaResponse> buscar(@PathVariable("id") Long id) {
        return ApiResponse.ok("Música encontrada com sucesso.", musicaService.buscar(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<MusicaResponse> criar(@Valid @RequestBody MusicaRequest request, HttpServletRequest httpRequest) {
        authService.getAuthenticatedUser(httpRequest);
        return ApiResponse.ok("Música cadastrada com sucesso.", musicaService.criar(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<MusicaResponse> atualizar(@PathVariable("id") Long id,
                                                 @Valid @RequestBody MusicaRequest request,
                                                 HttpServletRequest httpRequest) {
        authService.requireAdmin(httpRequest);
        return ApiResponse.ok("Música atualizada com sucesso.", musicaService.atualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> remover(@PathVariable("id") Long id, HttpServletRequest httpRequest) {
        authService.requireAdmin(httpRequest);
        musicaService.remover(id);
        return ApiResponse.ok("Música removida com sucesso.", null);
    }
}


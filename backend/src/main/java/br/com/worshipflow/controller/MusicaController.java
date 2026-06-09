package br.com.worshipflow.controller;

import br.com.worshipflow.dto.ApiResponse;
import br.com.worshipflow.dto.MusicaRequest;
import br.com.worshipflow.dto.MusicaResponse;
import br.com.worshipflow.service.MusicaService;
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
@RequestMapping("/api/musicas")
public class MusicaController {

    private final MusicaService musicaService;

    public MusicaController(MusicaService musicaService) {
        this.musicaService = musicaService;
    }

    @GetMapping
    public ApiResponse<List<MusicaResponse>> listar() {
        return ApiResponse.ok("Musicas listadas com sucesso.", musicaService.listar());
    }

    @GetMapping("/{id}")
    public ApiResponse<MusicaResponse> buscar(@PathVariable("id") Long id) {
        return ApiResponse.ok("Música encontrada com sucesso.", musicaService.buscar(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<MusicaResponse> criar(@Valid @RequestBody MusicaRequest request) {
        return ApiResponse.ok("Música cadastrada com sucesso.", musicaService.criar(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<MusicaResponse> atualizar(@PathVariable("id") Long id, @Valid @RequestBody MusicaRequest request) {
        return ApiResponse.ok("Música atualizada com sucesso.", musicaService.atualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> remover(@PathVariable("id") Long id) {
        musicaService.remover(id);
        return ApiResponse.ok("Música removida com sucesso.", null);
    }
}


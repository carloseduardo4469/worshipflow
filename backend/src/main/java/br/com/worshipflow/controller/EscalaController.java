package br.com.worshipflow.controller;

import br.com.worshipflow.dto.ApiResponse;
import br.com.worshipflow.dto.EscalaRequest;
import br.com.worshipflow.dto.EscalaResponse;
import br.com.worshipflow.entity.PerfilUsuario;
import br.com.worshipflow.entity.Usuario;
import br.com.worshipflow.service.AuthService;
import br.com.worshipflow.service.EscalaService;
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
@RequestMapping("/api/escalas")
public class EscalaController {

    private final EscalaService escalaService;
    private final AuthService authService;

    public EscalaController(EscalaService escalaService, AuthService authService) {
        this.escalaService = escalaService;
        this.authService = authService;
    }

    @GetMapping
    public ApiResponse<List<EscalaResponse>> listar(HttpServletRequest httpRequest,
                                                    @RequestParam(value = "page", defaultValue = "0") int page,
                                                    @RequestParam(value = "size", defaultValue = "200") int size) {
        Usuario usuario = authService.getAuthenticatedUser(httpRequest);
        List<EscalaResponse> escalas = isAdmin(usuario) ? escalaService.listar(page, size) : escalaService.listarVisiveis(page, size);
        return ApiResponse.ok("Escalas listadas com sucesso.", escalas);
    }

    @GetMapping("/{id}")
    public ApiResponse<EscalaResponse> buscar(@PathVariable("id") Long id, HttpServletRequest httpRequest) {
        Usuario usuario = authService.getAuthenticatedUser(httpRequest);
        EscalaResponse escala = isAdmin(usuario) ? escalaService.buscar(id) : escalaService.buscarVisivel(id);
        return ApiResponse.ok("Escala encontrada com sucesso.", escala);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<EscalaResponse> criar(@Valid @RequestBody EscalaRequest request, HttpServletRequest httpRequest) {
        authService.requireAdmin(httpRequest);
        return ApiResponse.ok("Escala cadastrada com sucesso.", escalaService.criar(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<EscalaResponse> atualizar(@PathVariable("id") Long id, @Valid @RequestBody EscalaRequest request, HttpServletRequest httpRequest) {
        authService.requireAdmin(httpRequest);
        return ApiResponse.ok("Escala atualizada com sucesso.", escalaService.atualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> remover(@PathVariable("id") Long id, HttpServletRequest httpRequest) {
        authService.requireAdmin(httpRequest);
        escalaService.remover(id);
        return ApiResponse.ok("Escala removida com sucesso.", null);
    }

    private boolean isAdmin(Usuario usuario) {
        return PerfilUsuario.ADMIN.equals(usuario.getPerfil());
    }
}

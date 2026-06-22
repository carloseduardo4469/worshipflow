package br.com.worshipflow.controller;

import br.com.worshipflow.dto.ApiResponse;
import br.com.worshipflow.dto.EquipeResponse;
import br.com.worshipflow.dto.UsuarioAdminRequest;
import br.com.worshipflow.dto.UsuarioResponse;
import br.com.worshipflow.service.AuthService;
import br.com.worshipflow.service.UsuarioService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final AuthService authService;

    public UsuarioController(UsuarioService usuarioService, AuthService authService) {
        this.usuarioService = usuarioService;
        this.authService = authService;
    }

    @GetMapping("/equipe")
    public ApiResponse<List<EquipeResponse>> listarEquipe(@RequestParam(value = "query", required = false) String query,
                                                          @RequestParam(value = "page", defaultValue = "0") int page,
                                                          @RequestParam(value = "size", defaultValue = "200") int size) {
        return ApiResponse.ok("Equipe listada com sucesso.", usuarioService.listarEquipe(query, page, size));
    }

    @GetMapping
    public ApiResponse<List<UsuarioResponse>> listar(HttpServletRequest request,
                                                     @RequestParam(value = "query", required = false) String query,
                                                     @RequestParam(value = "page", defaultValue = "0") int page,
                                                     @RequestParam(value = "size", defaultValue = "200") int size) {
        authService.requireAdmin(request);
        return ApiResponse.ok("Usuarios listados com sucesso.", usuarioService.listar(query, page, size));
    }

    @GetMapping("/{id}")
    public ApiResponse<UsuarioResponse> buscar(@PathVariable("id") Long id, HttpServletRequest request) {
        authService.requireAdmin(request);
        return ApiResponse.ok("Usuario encontrado com sucesso.", usuarioService.buscar(id));
    }

    @PutMapping("/{id}")
    public ApiResponse<UsuarioResponse> atualizar(@PathVariable("id") Long id,
                                                  @Valid @RequestBody UsuarioAdminRequest usuarioRequest,
                                                  HttpServletRequest request) {
        authService.requireAdmin(request);
        return ApiResponse.ok("Usuario atualizado com sucesso.", usuarioService.atualizar(id, usuarioRequest));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> excluir(@PathVariable("id") Long id, HttpServletRequest request) {
        authService.requireAdmin(request);
        usuarioService.excluir(id, request);
        return ApiResponse.ok("Usuario excluido com sucesso.", null);
    }
}


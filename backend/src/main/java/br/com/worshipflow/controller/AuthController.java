package br.com.worshipflow.controller;

import br.com.worshipflow.dto.ApiResponse;
import br.com.worshipflow.dto.AtualizarPerfilRequest;
import br.com.worshipflow.dto.AuthResponse;
import br.com.worshipflow.dto.CadastroRequest;
import br.com.worshipflow.dto.EsqueciSenhaRequest;
import br.com.worshipflow.dto.LoginRequest;
import br.com.worshipflow.dto.RedefinicaoSenhaResponse;
import br.com.worshipflow.dto.RedefinirSenhaRequest;
import br.com.worshipflow.dto.UsuarioResponse;
import br.com.worshipflow.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.net.URI;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/cadastro")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AuthResponse> cadastrar(@Valid @RequestBody CadastroRequest request) {
        return ApiResponse.ok("Cadastro realizado com sucesso.", authService.cadastrar(request));
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.ok("Login realizado com sucesso.", authService.login(request));
    }

    @PostMapping("/esqueci-senha")
    public ApiResponse<RedefinicaoSenhaResponse> solicitarRedefinicaoSenha(@Valid @RequestBody EsqueciSenhaRequest request) {
        RedefinicaoSenhaResponse response = authService.solicitarRedefinicaoSenha(request.email());
        String message = response.resetLink() != null
                ? "Link local de redefinicao gerado."
                : "Se o e-mail estiver cadastrado, enviaremos um link de redefinicao.";
        return ApiResponse.ok(message, response);
    }

    @PostMapping("/redefinir-senha")
    public ApiResponse<Void> redefinirSenha(@Valid @RequestBody RedefinirSenhaRequest request) {
        authService.redefinirSenha(request);
        return ApiResponse.ok("Senha redefinida com sucesso.", null);
    }

    @GetMapping("/redefinir-senha")
    public ResponseEntity<Void> abrirTelaRedefinicaoSenha(@RequestParam("token") String token) {
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(authService.buildResetPageLink(token)))
                .build();
    }

    @GetMapping("/me")
    public ApiResponse<UsuarioResponse> me(HttpServletRequest request) {
        return ApiResponse.ok("Usuario autenticado.", authService.me(request));
    }

    @PutMapping("/me")
    public ApiResponse<UsuarioResponse> atualizarPerfil(@Valid @RequestBody AtualizarPerfilRequest perfilRequest,
                                                        HttpServletRequest request) {
        return ApiResponse.ok("Perfil atualizado com sucesso.", authService.atualizarPerfil(request, perfilRequest));
    }

    @PostMapping("/favoritos/musicas/{musicaId}")
    public ApiResponse<UsuarioResponse> alternarMusicaFavorita(@PathVariable("musicaId") Long musicaId, HttpServletRequest request) {
        return ApiResponse.ok("Musica favorita atualizada.", authService.alternarMusicaFavorita(request, musicaId));
    }
}

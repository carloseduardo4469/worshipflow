package br.com.worshipflow.service;

import br.com.worshipflow.dto.AuthResponse;
import br.com.worshipflow.dto.AtualizarPerfilRequest;
import br.com.worshipflow.dto.CadastroRequest;
import br.com.worshipflow.dto.LoginRequest;
import br.com.worshipflow.dto.RedefinicaoSenhaResponse;
import br.com.worshipflow.dto.MusicaResponse;
import br.com.worshipflow.dto.RedefinirSenhaRequest;
import br.com.worshipflow.dto.UsuarioResponse;
import br.com.worshipflow.entity.Musica;
import br.com.worshipflow.entity.PerfilUsuario;
import br.com.worshipflow.entity.StatusMinisterio;
import br.com.worshipflow.entity.Usuario;
import br.com.worshipflow.repository.UsuarioRepository;
import br.com.worshipflow.security.AccessDeniedException;
import br.com.worshipflow.security.AuthTokenService;
import br.com.worshipflow.security.UnauthorizedException;
import jakarta.servlet.http.HttpServletRequest;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final String BEARER_PREFIX = "Bearer ";
    private static final int MAX_PROFILE_PHOTO_BASE64_LENGTH = 1_400_000;
    private static final int MAX_FAILED_LOGIN_ATTEMPTS = 5;
    private static final Duration LOGIN_BLOCK_DURATION = Duration.ofMinutes(10);

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthTokenService tokenService;
    private final AuthEmailService authEmailService;
    private final MusicaService musicaService;
    private final String frontendBaseUrl;
    private final boolean exposeResetLink;
    private final Map<String, LoginAttempt> loginAttempts = new ConcurrentHashMap<>();

    public AuthService(UsuarioRepository usuarioRepository,
                       PasswordEncoder passwordEncoder,
                       AuthTokenService tokenService,
                       AuthEmailService authEmailService,
                       MusicaService musicaService,
                       @Value("${app.frontend.base-url:http://localhost:8080}") String frontendBaseUrl,
                       @Value("${app.auth.expose-reset-link:false}") boolean exposeResetLink) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
        this.authEmailService = authEmailService;
        this.musicaService = musicaService;
        this.frontendBaseUrl = frontendBaseUrl;
        this.exposeResetLink = exposeResetLink;
    }

    @Transactional
    public AuthResponse cadastrar(CadastroRequest request) {
        String email = normalizeEmail(request.email());
        if (usuarioRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Já existe um usuário cadastrado com este e-mail.");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(request.nome().trim());
        usuario.setEmail(email);
        usuario.setSenhaHash(passwordEncoder.encode(request.senha()));
        usuario.setTelefone(normalizeOptionalText(request.telefone()));
        usuario.setPerfil(PerfilUsuario.USER);

        return autenticar(usuarioRepository.save(usuario));
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String email = normalizeEmail(request.email());
        assertLoginAllowed(email);
        Usuario usuario = usuarioRepository.findByEmail(email).orElse(null);

        if (usuario == null || !passwordEncoder.matches(request.senha(), usuario.getSenhaHash())) {
            registerFailedLogin(email);
            throw new IllegalArgumentException("Email ou senha invalidos.");
        }

        loginAttempts.remove(email);
        return autenticar(usuario);
    }

    @Transactional
    public RedefinicaoSenhaResponse solicitarRedefinicaoSenha(String emailInformado) {
        return usuarioRepository.findByEmail(normalizeEmail(emailInformado))
                .map(usuario -> {
                    String token = tokenService.generateToken();
                    String resetLink = buildResetLink(token);
                    usuario.setResetTokenHash(tokenService.hash(token));
                    usuario.setResetTokenExpiraEm(LocalDateTime.now().plusMinutes(30));

                    boolean emailEnviado = authEmailService.enviarLinkRedefinicao(usuario.getEmail(), usuario.getNome(), resetLink);
                    String linkExposto = !emailEnviado && exposeResetLink ? resetLink : null;
                    if (!emailEnviado && linkExposto == null) {
                        throw new IllegalStateException("Redefinicao de senha sem provedor configurado. Configure Supabase Auth ou SMTP direto para enviar o e-mail.");
                    }
                    return new RedefinicaoSenhaResponse(emailEnviado, linkExposto);
                })
                .orElseGet(() -> new RedefinicaoSenhaResponse(false, null));
    }

    @Transactional
    public void redefinirSenha(RedefinirSenhaRequest request) {
        Usuario usuario = usuarioRepository.findByResetTokenHash(tokenService.hash(request.token()))
                .orElseThrow(() -> new IllegalArgumentException("Token de redefinição inválido ou expirado."));

        if (usuario.getResetTokenExpiraEm() == null || usuario.getResetTokenExpiraEm().isBefore(LocalDateTime.now())) {
            limparResetToken(usuario);
            throw new IllegalArgumentException("Token de redefinição inválido ou expirado.");
        }

        usuario.setSenhaHash(passwordEncoder.encode(request.novaSenha()));
        limparResetToken(usuario);
        usuario.setApiTokenHash(null);
        usuario.setApiTokenExpiraEm(null);
    }

    @Transactional(readOnly = true)
    public Usuario getAuthenticatedUser(HttpServletRequest request) {
        String token = extractToken(request);
        Usuario usuario = usuarioRepository.findByApiTokenHash(tokenService.hash(token))
                .orElseThrow(() -> new UnauthorizedException("Sessao invalida ou expirada."));

        if (usuario.getApiTokenExpiraEm() == null || usuario.getApiTokenExpiraEm().isBefore(LocalDateTime.now())) {
            throw new UnauthorizedException("Sessao invalida ou expirada.");
        }

        return usuario;
    }

    @Transactional(readOnly = true)
    public UsuarioResponse me(HttpServletRequest request) {
        return toResponse(getAuthenticatedUser(request));
    }

    @Transactional
    public UsuarioResponse alternarMusicaFavorita(HttpServletRequest request, Long musicaId) {
        Usuario usuario = getAuthenticatedUser(request);
        Musica musica = musicaService.findById(musicaId);

        boolean removed = usuario.getMusicasFavoritas()
                .removeIf(favorita -> favorita.getId().equals(musica.getId()));

        if (!removed) {
            usuario.getMusicasFavoritas().add(musica);
        }

        return toResponse(usuario);
    }

    @Transactional
    public UsuarioResponse atualizarPerfil(HttpServletRequest request, AtualizarPerfilRequest perfilRequest) {
        Usuario usuario = getAuthenticatedUser(request);

        usuario.setNome(perfilRequest.nome().trim());
        usuario.setTelefone(normalizeOptionalText(perfilRequest.telefone()));
        usuario.setHabilidades(normalizeOptionalText(perfilRequest.habilidades()));

        if (Boolean.TRUE.equals(perfilRequest.removerFoto())) {
            usuario.setFotoPerfil(null);
            usuario.setFotoPerfilTipo(null);
        } else if (perfilRequest.fotoPerfil() != null && !perfilRequest.fotoPerfil().isBlank()) {
            validarFotoPerfil(perfilRequest.fotoPerfil(), perfilRequest.fotoPerfilTipo());
            usuario.setFotoPerfil(perfilRequest.fotoPerfil());
            usuario.setFotoPerfilTipo(perfilRequest.fotoPerfilTipo());
        }

        return toResponse(usuario);
    }

    public void requireAdmin(HttpServletRequest request) {
        Usuario usuario = getAuthenticatedUser(request);
        if (!isAdmin(usuario)) {
            throw new AccessDeniedException("Acesso permitido apenas para administradores.");
        }
    }

    public UsuarioResponse toResponse(Usuario usuario) {
        List<MusicaResponse> favoritas = usuario.getMusicasFavoritas().stream()
                .map(musicaService::toResponse)
                .toList();

        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getPerfil(),
                usuario.getTelefone(),
                usuario.getHabilidades(),
                usuario.getStatusMinisterio(),
                usuario.getFotoPerfil(),
                usuario.getFotoPerfilTipo(),
                favoritas
        );
    }

    public String buildResetPageLink(String token) {
        return normalizedFrontendBaseUrl() + "/pages/redefinir-senha.html?token=" + urlEncode(token);
    }

    private AuthResponse autenticar(Usuario usuario) {
        String token = tokenService.generateToken();
        usuario.setApiTokenHash(tokenService.hash(token));
        usuario.setApiTokenExpiraEm(LocalDateTime.now().plusHours(12));
        return new AuthResponse(token, toResponse(usuario));
    }

    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith(BEARER_PREFIX) || header.length() <= BEARER_PREFIX.length()) {
            throw new UnauthorizedException("Token de autenticacao não informado.");
        }
        return header.substring(BEARER_PREFIX.length()).trim();
    }

    private void limparResetToken(Usuario usuario) {
        usuario.setResetTokenHash(null);
        usuario.setResetTokenExpiraEm(null);
    }

    private String buildResetLink(String token) {
        return normalizedFrontendBaseUrl() + "/api/auth/redefinir-senha?token=" + urlEncode(token);
    }

    private String normalizedFrontendBaseUrl() {
        return frontendBaseUrl.replaceAll("/+$", "");
    }

    private String urlEncode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    private String normalizeOptionalText(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }

    private void validarFotoPerfil(String fotoPerfil, String fotoPerfilTipo) {
        if (fotoPerfil.length() > MAX_PROFILE_PHOTO_BASE64_LENGTH) {
            throw new IllegalArgumentException("Foto deve ter no máximo 1 MB.");
        }

        if (fotoPerfilTipo == null || !List.of("image/jpeg", "image/png", "image/webp").contains(fotoPerfilTipo)) {
            throw new IllegalArgumentException("Use uma foto JPG, PNG ou WEBP.");
        }
    }

    private boolean isAdmin(Usuario usuario) {
        return PerfilUsuario.ADMIN.equals(usuario.getPerfil());
    }

    private void assertLoginAllowed(String email) {
        purgeExpiredLoginAttempts();
        LoginAttempt attempt = loginAttempts.get(email);
        if (attempt != null && attempt.isBlocked()) {
            throw new AccessDeniedException("Muitas tentativas de login. Aguarde alguns minutos e tente novamente.");
        }
    }

    private void registerFailedLogin(String email) {
        loginAttempts.merge(email, LoginAttempt.first(), (current, ignored) -> current.next());
    }

    private void purgeExpiredLoginAttempts() {
        loginAttempts.entrySet().removeIf(entry -> entry.getValue().isExpired());
    }

    private record LoginAttempt(int failures, LocalDateTime lastFailureAt) {
        static LoginAttempt first() {
            return new LoginAttempt(1, LocalDateTime.now());
        }

        LoginAttempt next() {
            return new LoginAttempt(failures + 1, LocalDateTime.now());
        }

        boolean isBlocked() {
            return failures >= MAX_FAILED_LOGIN_ATTEMPTS
                    && lastFailureAt.plus(LOGIN_BLOCK_DURATION).isAfter(LocalDateTime.now());
        }

        boolean isExpired() {
            return lastFailureAt.plus(LOGIN_BLOCK_DURATION).isBefore(LocalDateTime.now());
        }
    }
}

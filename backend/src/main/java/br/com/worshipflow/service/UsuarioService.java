package br.com.worshipflow.service;

import br.com.worshipflow.dto.EquipeResponse;
import br.com.worshipflow.dto.UsuarioAdminRequest;
import br.com.worshipflow.dto.UsuarioResponse;
import br.com.worshipflow.entity.PerfilUsuario;
import br.com.worshipflow.entity.StatusMinisterio;
import br.com.worshipflow.entity.Usuario;
import br.com.worshipflow.exception.ResourceNotFoundException;
import br.com.worshipflow.repository.UsuarioRepository;
import jakarta.servlet.http.HttpServletRequest;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final AuthService authService;

    public UsuarioService(UsuarioRepository usuarioRepository, AuthService authService) {
        this.usuarioRepository = usuarioRepository;
        this.authService = authService;
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listar() {
        return listar(null, 0, 200);
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listar(String query, int page, int size) {
        Pageable pageable = PageRequest.of(safePage(page), safeSize(size), Sort.by("nome").ascending());
        List<Usuario> usuarios = hasText(query)
                ? usuarioRepository.findByNomeContainingIgnoreCaseOrEmailContainingIgnoreCase(
                        query.trim(),
                        query.trim(),
                        pageable
                ).getContent()
                : usuarioRepository.findAll(pageable).getContent();

        return usuarios.stream().map(authService::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public UsuarioResponse buscar(Long id) {
        return authService.toResponse(findById(id));
    }

    public UsuarioResponse toResponse(Usuario usuario) {
        return authService.toResponse(usuario);
    }

    @Transactional(readOnly = true)
    public List<EquipeResponse> listarEquipe() {
        return listarEquipe(null, 0, 200);
    }

    @Transactional(readOnly = true)
    public List<EquipeResponse> listarEquipe(String query, int page, int size) {
        Pageable pageable = PageRequest.of(safePage(page), safeSize(size), Sort.by("nome").ascending());
        return usuarioRepository.findByStatusMinisterio(StatusMinisterio.ATIVO, pageable).getContent().stream()
                .filter(usuario -> !hasText(query) || matchesEquipeQuery(usuario, query))
                .map(this::toEquipeResponse)
                .toList();
    }

    @Transactional
    public UsuarioResponse atualizar(Long id, UsuarioAdminRequest request) {
        Usuario usuario = findById(id);
        String email = normalizeEmail(request.email());

        if (usuarioRepository.existsByEmailAndIdNot(email, id)) {
            throw new IllegalArgumentException("Já existe um usuário cadastrado com este e-mail.");
        }

        usuario.setNome(request.nome().trim());
        usuario.setEmail(email);
        usuario.setTelefone(normalizeOptionalText(request.telefone()));
        usuario.setInstrumentoPrincipal(request.instrumentoPrincipal().trim());
        usuario.setHabilidades(normalizeOptionalText(request.habilidades()));
        usuario.setPerfil(request.perfil() == null ? PerfilUsuario.MEMBRO : request.perfil());
        usuario.setStatusMinisterio(request.statusMinisterio() == null ? StatusMinisterio.ATIVO : request.statusMinisterio());

        if (usuario.getStatusMinisterio() == StatusMinisterio.BLOQUEADO || usuario.getStatusMinisterio() == StatusMinisterio.DESLIGADO) {
            usuario.setApiTokenHash(null);
            usuario.setApiTokenExpiraEm(null);
        }

        return authService.toResponse(usuario);
    }

    @Transactional
    public void excluir(Long id, HttpServletRequest request) {
        Usuario usuarioAutenticado = authService.getAuthenticatedUser(request);
        Usuario usuario = findById(id);

        if (usuarioAutenticado.getId().equals(usuario.getId())) {
            throw new IllegalArgumentException("Você não pode excluir seu próprio usuário.");
        }

        usuarioRepository.delete(usuario);
    }

    Usuario findById(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario nao encontrado."));
    }

    List<Usuario> findAllByIds(List<Long> ids) {
        Set<Long> uniqueIds = new HashSet<>(ids);
        List<Usuario> usuarios = usuarioRepository.findAllById(uniqueIds);
        if (usuarios.size() != uniqueIds.size()) {
            throw new ResourceNotFoundException("Um ou mais usuarios nao foram encontrados.");
        }
        return usuarios;
    }

    private EquipeResponse toEquipeResponse(Usuario usuario) {
        return new EquipeResponse(
                usuario.getId(),
                usuario.getNome(),
                usuario.getInstrumentoPrincipal(),
                usuario.getHabilidades(),
                usuario.getFotoPerfil(),
                usuario.getFotoPerfilTipo()
        );
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    private String normalizeOptionalText(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private boolean matchesEquipeQuery(Usuario usuario, String query) {
        String normalizedQuery = query.trim().toLowerCase();
        return contains(usuario.getNome(), normalizedQuery)
                || contains(usuario.getInstrumentoPrincipal(), normalizedQuery)
                || contains(usuario.getHabilidades(), normalizedQuery);
    }

    private boolean contains(String value, String query) {
        return value != null && value.toLowerCase().contains(query);
    }

    private int safePage(int page) {
        return Math.max(page, 0);
    }

    private int safeSize(int size) {
        return Math.min(Math.max(size, 1), 200);
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}


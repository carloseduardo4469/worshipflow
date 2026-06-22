package br.com.worshipflow.service;

import br.com.worshipflow.dto.EscalaRequest;
import br.com.worshipflow.dto.EscalaResponse;
import br.com.worshipflow.entity.Escala;
import br.com.worshipflow.entity.StatusEscala;
import br.com.worshipflow.exception.ResourceNotFoundException;
import br.com.worshipflow.repository.EscalaRepository;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EscalaService {

    private final EscalaRepository escalaRepository;
    private final MusicaService musicaService;
    private final UsuarioService usuarioService;

    public EscalaService(
            EscalaRepository escalaRepository,
            MusicaService musicaService,
            UsuarioService usuarioService
    ) {
        this.escalaRepository = escalaRepository;
        this.musicaService = musicaService;
        this.usuarioService = usuarioService;
    }

    @Transactional(readOnly = true)
    public List<EscalaResponse> listar() {
        return listar(0, 200);
    }

    @Transactional(readOnly = true)
    public List<EscalaResponse> listar(int page, int size) {
        Pageable pageable = PageRequest.of(safePage(page), safeSize(size), Sort.by("id").descending());
        return escalaRepository.findAll(pageable).getContent().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<EscalaResponse> listarVisiveis() {
        return listarVisiveis(0, 200);
    }

    @Transactional(readOnly = true)
    public List<EscalaResponse> listarVisiveis(int page, int size) {
        Pageable pageable = PageRequest.of(safePage(page), safeSize(size), Sort.by("id").descending());
        return escalaRepository.findByStatusNot(StatusEscala.RASCUNHO, pageable).getContent().stream()
                .map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public EscalaResponse buscar(Long id) {
        return toResponse(findById(id));
    }

    @Transactional(readOnly = true)
    public EscalaResponse buscarVisivel(Long id) {
        Escala escala = findById(id);
        if (!isVisivelParaMembros(escala)) {
            throw new ResourceNotFoundException("Escala não encontrada.");
        }
        return toResponse(escala);
    }

    @Transactional
    public EscalaResponse criar(EscalaRequest request) {
        Escala escala = new Escala();
        aplicarDados(escala, request);
        return toResponse(escalaRepository.save(escala));
    }

    @Transactional
    public EscalaResponse atualizar(Long id, EscalaRequest request) {
        Escala escala = findById(id);
        aplicarDados(escala, request);
        return toResponse(escala);
    }

    @Transactional
    public void remover(Long id) {
        Escala escala = findById(id);
        escalaRepository.delete(escala);
    }

    private Escala findById(Long id) {
        return escalaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Escala não encontrada."));
    }

    private boolean isVisivelParaMembros(Escala escala) {
        return StatusEscala.RASCUNHO != escala.getStatus();
    }

    private EscalaResponse toResponse(Escala escala) {
        return new EscalaResponse(
                escala.getId(),
                escala.getTitulo(),
                escala.getDataEscala(),
                escala.getStatus(),
                escala.getObservacoes(),
                escala.getUsuarios().stream().map(usuarioService::toResponse).toList(),
                deserializeFuncoes(escala.getFuncoesUsuarios()),
                escala.getMusicas().stream().map(musicaService::toResponse).toList()
        );
    }

    private void aplicarDados(Escala escala, EscalaRequest request) {
        escala.setTitulo(request.titulo());
        escala.setDataEscala(request.dataEscala());
        escala.setStatus(request.status() == null ? StatusEscala.RASCUNHO : request.status());
        escala.setObservacoes(request.observacoes());

        List<Long> usuarioIds = request.usuarioIds() == null ? List.of() : request.usuarioIds();
        List<Long> musicaIds = request.musicaIds() == null ? List.of() : request.musicaIds();

        escala.setUsuarios(new HashSet<>(usuarioService.findAllByIds(usuarioIds)));
        escala.setFuncoesUsuarios(serializeFuncoes(request.funcoesUsuarios(), usuarioIds));

        escala.setMusicas(new HashSet<>(musicaService.findAllByIds(musicaIds)));
    }

    private String serializeFuncoes(Map<Long, String> funcoes, List<Long> usuarioIds) {
        if (funcoes == null || funcoes.isEmpty() || usuarioIds.isEmpty()) {
            return null;
        }

        Set<Long> selecionados = new HashSet<>(usuarioIds);
        StringBuilder builder = new StringBuilder();

        funcoes.forEach((usuarioId, funcao) -> {
            if (usuarioId == null || !selecionados.contains(usuarioId) || funcao == null || funcao.isBlank()) {
                return;
            }

            String encoded = Base64.getUrlEncoder()
                    .withoutPadding()
                    .encodeToString(funcao.trim().getBytes(StandardCharsets.UTF_8));

            if (!builder.isEmpty()) {
                builder.append(";");
            }
            builder.append(usuarioId).append(":").append(encoded);
        });

        return builder.isEmpty() ? null : builder.toString();
    }

    private Map<Long, String> deserializeFuncoes(String value) {
        Map<Long, String> funcoes = new LinkedHashMap<>();
        if (value == null || value.isBlank()) {
            return funcoes;
        }

        for (String entry : value.split(";")) {
            String[] parts = entry.split(":", 2);
            if (parts.length != 2) {
                continue;
            }

            try {
                Long usuarioId = Long.valueOf(parts[0]);
                String funcao = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
                if (!funcao.isBlank()) {
                    funcoes.put(usuarioId, funcao);
                }
            } catch (IllegalArgumentException ignored) {
                // Ignore old or malformed stored entries.
            }
        }

        return funcoes;
    }

    private int safePage(int page) {
        return Math.max(page, 0);
    }

    private int safeSize(int size) {
        return Math.min(Math.max(size, 1), 200);
    }
}


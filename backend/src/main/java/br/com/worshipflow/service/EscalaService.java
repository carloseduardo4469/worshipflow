package br.com.worshipflow.service;

import br.com.worshipflow.dto.EscalaRequest;
import br.com.worshipflow.dto.EscalaResponse;
import br.com.worshipflow.entity.Escala;
import br.com.worshipflow.entity.Musica;
import br.com.worshipflow.entity.StatusEscala;
import br.com.worshipflow.entity.Usuario;
import br.com.worshipflow.exception.ResourceNotFoundException;
import br.com.worshipflow.repository.EscalaRepository;
import java.util.HashSet;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EscalaService {

    private final EscalaRepository escalaRepository;
    private final EventoService eventoService;
    private final MusicaService musicaService;
    private final UsuarioService usuarioService;

    public EscalaService(
            EscalaRepository escalaRepository,
            EventoService eventoService,
            MusicaService musicaService,
            UsuarioService usuarioService
    ) {
        this.escalaRepository = escalaRepository;
        this.eventoService = eventoService;
        this.musicaService = musicaService;
        this.usuarioService = usuarioService;
    }

    @Transactional(readOnly = true)
    public List<EscalaResponse> listar() {
        return escalaRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<EscalaResponse> listarVisiveis() {
        return escalaRepository.findAll().stream()
                .filter(this::isVisivelParaMembros)
                .map(this::toResponse)
                .toList();
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
                escala.getStatus(),
                escala.getObservacoes(),
                eventoService.toResponse(escala.getEvento()),
                escala.getUsuarios().stream().map(usuarioService::toResponse).toList(),
                escala.getMusicas().stream().map(musicaService::toResponse).toList()
        );
    }

    private void aplicarDados(Escala escala, EscalaRequest request) {
        escala.setTitulo(request.titulo());
        escala.setStatus(request.status() == null ? StatusEscala.RASCUNHO : request.status());
        escala.setObservacoes(request.observacoes());
        escala.setEvento(eventoService.findById(request.eventoId()));

        List<Long> usuarioIds = request.usuarioIds() == null ? List.of() : request.usuarioIds();
        List<Long> musicaIds = request.musicaIds() == null ? List.of() : request.musicaIds();

        HashSet<Usuario> usuarios = new HashSet<>();
        usuarioIds.forEach(id -> usuarios.add(usuarioService.findById(id)));
        escala.setUsuarios(usuarios);

        HashSet<Musica> musicas = new HashSet<>();
        musicaIds.forEach(id -> musicas.add(musicaService.findById(id)));
        escala.setMusicas(musicas);
    }
}


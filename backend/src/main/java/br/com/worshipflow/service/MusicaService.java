package br.com.worshipflow.service;

import br.com.worshipflow.dto.MusicaRequest;
import br.com.worshipflow.dto.MusicaResponse;
import br.com.worshipflow.entity.Musica;
import br.com.worshipflow.exception.ResourceNotFoundException;
import br.com.worshipflow.repository.MusicaRepository;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MusicaService {

    private final MusicaRepository musicaRepository;

    public MusicaService(MusicaRepository musicaRepository) {
        this.musicaRepository = musicaRepository;
    }

    @Transactional(readOnly = true)
    public List<MusicaResponse> listar() {
        return listar(null, 0, 200);
    }

    @Transactional(readOnly = true)
    public List<MusicaResponse> listar(String query, int page, int size) {
        Pageable pageable = PageRequest.of(safePage(page), safeSize(size), Sort.by("titulo").ascending());
        List<Musica> musicas = hasText(query)
                ? musicaRepository.findByTituloContainingIgnoreCaseOrArtistaContainingIgnoreCaseOrTonalidadeContainingIgnoreCase(
                        query.trim(),
                        query.trim(),
                        query.trim(),
                        pageable
                ).getContent()
                : musicaRepository.findAll(pageable).getContent();

        return musicas.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public MusicaResponse buscar(Long id) {
        return toResponse(findById(id));
    }

    @Transactional
    public MusicaResponse criar(MusicaRequest request) {
        Musica musica = new Musica();
        aplicarDados(musica, request);
        return toResponse(musicaRepository.save(musica));
    }

    @Transactional
    public MusicaResponse atualizar(Long id, MusicaRequest request) {
        Musica musica = findById(id);
        aplicarDados(musica, request);
        return toResponse(musica);
    }

    @Transactional
    public void remover(Long id) {
        Musica musica = findById(id);
        musicaRepository.delete(musica);
    }

    Musica findById(Long id) {
        return musicaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Música não encontrada."));
    }

    List<Musica> findAllByIds(List<Long> ids) {
        Set<Long> uniqueIds = new HashSet<>(ids);
        List<Musica> musicas = musicaRepository.findAllById(uniqueIds);
        if (musicas.size() != uniqueIds.size()) {
            throw new ResourceNotFoundException("Uma ou mais musicas nao foram encontradas.");
        }
        return musicas;
    }

    MusicaResponse toResponse(Musica musica) {
        return new MusicaResponse(
                musica.getId(),
                musica.getTitulo(),
                musica.getArtista(),
                musica.getTonalidade(),
                musica.getBpm(),
                musica.getLinkCifra()
        );
    }

    private void aplicarDados(Musica musica, MusicaRequest request) {
        musica.setTitulo(request.titulo());
        musica.setArtista(request.artista());
        musica.setTonalidade(request.tonalidade());
        musica.setBpm(request.bpm());
        musica.setLinkCifra(request.linkCifra());
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


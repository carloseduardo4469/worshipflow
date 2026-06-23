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
import org.springframework.data.jpa.domain.Specification;
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
        return listar(null, null, 0, 200);
    }

    @Transactional(readOnly = true)
    public List<MusicaResponse> listar(String query, int page, int size) {
        return listar(query, null, page, size);
    }

    @Transactional(readOnly = true)
    public List<MusicaResponse> listar(String query, String tonalidade, int page, int size) {
        Pageable pageable = PageRequest.of(safePage(page), safeSize(size), Sort.by("titulo").ascending());
        String safeQuery = hasText(query) ? query.trim() : null;
        String safeTonalidade = hasText(tonalidade) ? normalizeTonalidade(tonalidade) : null;
        List<Musica> musicas = musicaRepository.findAll(buildSearchSpec(safeQuery, safeTonalidade), pageable).getContent();

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
        musica.setTitulo(request.titulo().trim());
        musica.setArtista(request.artista().trim());
        musica.setTonalidade(normalizeTonalidade(request.tonalidade()));
        musica.setBpm(request.bpm());
        musica.setLinkCifra(request.linkCifra());
    }

    private Specification<Musica> buildSearchSpec(String query, String tonalidade) {
        return (root, criteriaQuery, criteriaBuilder) -> {
            var predicate = criteriaBuilder.conjunction();

            if (hasText(query)) {
                String normalizedQuery = "%" + query.toLowerCase() + "%";
                var textPredicate = criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("titulo")), normalizedQuery),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("artista")), normalizedQuery),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("tonalidade")), normalizedQuery)
                );

                Integer bpm = parseInteger(query);
                if (bpm != null) {
                    textPredicate = criteriaBuilder.or(textPredicate, criteriaBuilder.equal(root.get("bpm"), bpm));
                }

                predicate = criteriaBuilder.and(predicate, textPredicate);
            }

            if (hasText(tonalidade)) {
                predicate = criteriaBuilder.and(
                        predicate,
                        criteriaBuilder.equal(criteriaBuilder.lower(root.get("tonalidade")), tonalidade.toLowerCase())
                );
            }

            return predicate;
        };
    }

    private Integer parseInteger(String value) {
        try {
            return Integer.valueOf(value);
        } catch (NumberFormatException exception) {
            return null;
        }
    }

    private String normalizeTonalidade(String tonalidade) {
        if (tonalidade == null || tonalidade.isBlank()) {
            return null;
        }

        String trimmed = tonalidade.trim();
        return trimmed.substring(0, 1).toUpperCase() + trimmed.substring(1);
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


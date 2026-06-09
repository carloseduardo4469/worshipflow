package br.com.worshipflow.service;

import br.com.worshipflow.dto.MusicaRequest;
import br.com.worshipflow.dto.MusicaResponse;
import br.com.worshipflow.entity.Musica;
import br.com.worshipflow.exception.ResourceNotFoundException;
import br.com.worshipflow.repository.MusicaRepository;
import java.util.List;
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
        return musicaRepository.findAll().stream().map(this::toResponse).toList();
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

    MusicaResponse toResponse(Musica musica) {
        return new MusicaResponse(
                musica.getId(),
                musica.getTitulo(),
                musica.getArtista(),
                musica.getTonalidade(),
                musica.getBpm(),
                musica.getCategoria(),
                musica.getLinkCifra()
        );
    }

    private void aplicarDados(Musica musica, MusicaRequest request) {
        musica.setTitulo(request.titulo());
        musica.setArtista(request.artista());
        musica.setTonalidade(request.tonalidade());
        musica.setBpm(request.bpm());
        musica.setCategoria(request.categoria());
        musica.setLinkCifra(request.linkCifra());
    }
}


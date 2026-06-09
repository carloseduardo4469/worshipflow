package br.com.worshipflow.service;

import br.com.worshipflow.dto.EventoRequest;
import br.com.worshipflow.dto.EventoResponse;
import br.com.worshipflow.entity.Evento;
import br.com.worshipflow.exception.ResourceNotFoundException;
import br.com.worshipflow.repository.EventoRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EventoService {

    private final EventoRepository eventoRepository;

    public EventoService(EventoRepository eventoRepository) {
        this.eventoRepository = eventoRepository;
    }

    @Transactional(readOnly = true)
    public List<EventoResponse> listar() {
        return eventoRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public EventoResponse buscar(Long id) {
        return toResponse(findById(id));
    }

    @Transactional
    public EventoResponse criar(EventoRequest request) {
        Evento evento = new Evento();
        aplicarDados(evento, request);
        return toResponse(eventoRepository.save(evento));
    }

    @Transactional
    public EventoResponse atualizar(Long id, EventoRequest request) {
        Evento evento = findById(id);
        aplicarDados(evento, request);
        return toResponse(evento);
    }

    @Transactional
    public void remover(Long id) {
        Evento evento = findById(id);
        eventoRepository.delete(evento);
    }

    Evento findById(Long id) {
        return eventoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evento não encontrado."));
    }

    EventoResponse toResponse(Evento evento) {
        return new EventoResponse(
                evento.getId(),
                evento.getTitulo(),
                evento.getTipo(),
                evento.getDataHora(),
                evento.getLocal(),
                evento.getObservacoes()
        );
    }

    private void aplicarDados(Evento evento, EventoRequest request) {
        evento.setTitulo(request.titulo());
        evento.setTipo(request.tipo());
        evento.setDataHora(request.dataHora());
        evento.setLocal(request.local());
        evento.setObservacoes(request.observacoes());
    }
}


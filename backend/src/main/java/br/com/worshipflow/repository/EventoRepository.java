package br.com.worshipflow.repository;

import br.com.worshipflow.entity.Evento;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventoRepository extends JpaRepository<Evento, Long> {
}

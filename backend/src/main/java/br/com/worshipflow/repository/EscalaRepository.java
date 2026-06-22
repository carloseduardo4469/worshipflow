package br.com.worshipflow.repository;

import br.com.worshipflow.entity.Escala;
import br.com.worshipflow.entity.StatusEscala;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface EscalaRepository extends JpaRepository<Escala, Long> {

    @Override
    @EntityGraph(attributePaths = {"usuarios", "musicas"})
    List<Escala> findAll();

    @Override
    @EntityGraph(attributePaths = {"usuarios", "musicas"})
    Page<Escala> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"usuarios", "musicas"})
    Page<Escala> findByStatusNot(StatusEscala status, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {"usuarios", "musicas"})
    Optional<Escala> findById(Long id);
}

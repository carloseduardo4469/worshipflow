package br.com.worshipflow.repository;

import br.com.worshipflow.entity.Escala;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface EscalaRepository extends JpaRepository<Escala, Long> {

    @Override
    @EntityGraph(attributePaths = {"evento", "usuarios", "musicas"})
    List<Escala> findAll();

    @Override
    @EntityGraph(attributePaths = {"evento", "usuarios", "musicas"})
    Optional<Escala> findById(Long id);
}

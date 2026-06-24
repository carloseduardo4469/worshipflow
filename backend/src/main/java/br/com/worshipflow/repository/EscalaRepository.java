package br.com.worshipflow.repository;

import br.com.worshipflow.entity.Escala;
import br.com.worshipflow.entity.StatusEscala;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.Collection;
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
    Page<Escala> findByStatusInAndDataEscalaGreaterThanEqual(
            Collection<StatusEscala> statuses,
            LocalDate dataEscala,
            Pageable pageable
    );

    @EntityGraph(attributePaths = {"usuarios", "musicas"})
    Page<Escala> findByStatusIn(Collection<StatusEscala> statuses, Pageable pageable);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            update Escala escala
               set escala.status = br.com.worshipflow.entity.StatusEscala.CONCLUIDA
             where escala.dataEscala < :hoje
               and escala.status in :statuses
            """)
    int concluirEscalasAnteriores(
            @Param("hoje") LocalDate hoje,
            @Param("statuses") Collection<StatusEscala> statuses
    );

    @Override
    @EntityGraph(attributePaths = {"usuarios", "musicas"})
    Optional<Escala> findById(Long id);
}

package br.com.worshipflow.repository;

import br.com.worshipflow.entity.Musica;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MusicaRepository extends JpaRepository<Musica, Long> {
    @Query("""
            select m
            from Musica m
            where (:query is null
                or lower(m.titulo) like lower(concat('%', :query, '%'))
                or lower(m.artista) like lower(concat('%', :query, '%'))
                or lower(m.tonalidade) like lower(concat('%', :query, '%'))
                or str(m.bpm) like concat('%', :query, '%'))
            and (:tonalidade is null or lower(m.tonalidade) = lower(:tonalidade))
            """)
    Page<Musica> search(@Param("query") String query,
                        @Param("tonalidade") String tonalidade,
                        Pageable pageable);
}

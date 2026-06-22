package br.com.worshipflow.repository;

import br.com.worshipflow.entity.Musica;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MusicaRepository extends JpaRepository<Musica, Long> {
    Page<Musica> findByTituloContainingIgnoreCaseOrArtistaContainingIgnoreCaseOrTonalidadeContainingIgnoreCase(
            String titulo,
            String artista,
            String tonalidade,
            Pageable pageable
    );
}

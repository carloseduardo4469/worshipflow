package br.com.worshipflow.repository;

import br.com.worshipflow.entity.Musica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface MusicaRepository extends JpaRepository<Musica, Long>, JpaSpecificationExecutor<Musica> {
}

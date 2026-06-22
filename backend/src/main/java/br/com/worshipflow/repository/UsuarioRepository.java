package br.com.worshipflow.repository;

import br.com.worshipflow.entity.Usuario;
import br.com.worshipflow.entity.StatusMinisterio;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);

    Optional<Usuario> findByApiTokenHash(String apiTokenHash);

    Optional<Usuario> findByResetTokenHash(String resetTokenHash);

    List<Usuario> findByStatusMinisterio(StatusMinisterio statusMinisterio);

    Page<Usuario> findByStatusMinisterio(StatusMinisterio statusMinisterio, Pageable pageable);

    Page<Usuario> findByNomeContainingIgnoreCaseOrEmailContainingIgnoreCase(String nome, String email, Pageable pageable);

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Long id);
}

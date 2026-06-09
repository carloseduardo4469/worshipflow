-- WorshipFlow - migracao definitiva de musicos para usuarios.
-- Objetivo:
-- 1) usuarios passa a ser a entidade unica de pessoa/membro;
-- 2) escala_usuarios substitui escala_musicos;
-- 3) musicos e escala_musicos sao removidas ao final.

SET NAMES utf8mb4;
SET time_zone = '-03:00';

USE `worshipflow`;

DROP PROCEDURE IF EXISTS add_column_if_missing;
DROP PROCEDURE IF EXISTS add_index_if_missing;
DROP PROCEDURE IF EXISTS drop_fk_if_exists;

DELIMITER $$

CREATE PROCEDURE add_column_if_missing(
  IN table_name_param varchar(64),
  IN column_name_param varchar(64),
  IN ddl_param text
)
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = table_name_param
      AND column_name = column_name_param
  ) THEN
    SET @ddl = ddl_param;
    PREPARE stmt FROM @ddl;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END$$

CREATE PROCEDURE add_index_if_missing(
  IN table_name_param varchar(64),
  IN index_name_param varchar(64),
  IN ddl_param text
)
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = table_name_param
      AND index_name = index_name_param
  ) THEN
    SET @ddl = ddl_param;
    PREPARE stmt FROM @ddl;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END$$

CREATE PROCEDURE drop_fk_if_exists(
  IN table_name_param varchar(64),
  IN fk_name_param varchar(64)
)
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema = DATABASE()
      AND table_name = table_name_param
      AND constraint_name = fk_name_param
      AND constraint_type = 'FOREIGN KEY'
  ) THEN
    SET @ddl = CONCAT('ALTER TABLE `', table_name_param, '` DROP FOREIGN KEY `', fk_name_param, '`');
    PREPARE stmt FROM @ddl;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END$$

DELIMITER ;

CALL add_column_if_missing('usuarios', 'telefone',
  'ALTER TABLE `usuarios` ADD COLUMN `telefone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `senha_hash`');

CALL add_column_if_missing('usuarios', 'instrumento_principal',
  'ALTER TABLE `usuarios` ADD COLUMN `instrumento_principal` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `telefone`');

CALL add_column_if_missing('usuarios', 'status_ministerio',
  'ALTER TABLE `usuarios` ADD COLUMN `status_ministerio` enum(''ATIVO'',''INATIVO'',''EM_PAUSA'',''DESLIGADO'',''BLOQUEADO'') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT ''ATIVO'' AFTER `habilidades`');

ALTER TABLE `usuarios`
  MODIFY `perfil` enum('ADMIN','LIDER','MUSICO','MEMBRO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MEMBRO';

-- Copia dados ministeriais dos musicos para usuarios ja existentes pelo email.
SET @has_musicos = (
  SELECT COUNT(*)
  FROM information_schema.tables
  WHERE table_schema = DATABASE()
    AND table_name = 'musicos'
);

SET @sync_existing_users = IF(
  @has_musicos > 0,
  'UPDATE `usuarios` u
   JOIN `musicos` m ON LOWER(TRIM(m.email)) = LOWER(TRIM(u.email))
   SET
     u.telefone = COALESCE(NULLIF(u.telefone, ''''), m.telefone),
     u.instrumento_principal = COALESCE(NULLIF(u.instrumento_principal, ''''), m.instrumento_principal),
     u.habilidades = COALESCE(NULLIF(u.habilidades, ''''), m.habilidades),
     u.status_ministerio = CASE m.status
       WHEN ''ATIVO'' THEN ''ATIVO''
       WHEN ''INATIVO'' THEN ''INATIVO''
       WHEN ''EM_PAUSA'' THEN ''EM_PAUSA''
       ELSE ''ATIVO''
     END,
     u.ministerio_id = COALESCE(u.ministerio_id, m.ministerio_id)',
  'SELECT 1'
);
PREPARE stmt FROM @sync_existing_users;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Cria usuarios bloqueados para musicos antigos sem conta.
-- Senha temporaria intencionalmente inutil em fluxo normal porque status_ministerio = BLOQUEADO.
SET @insert_missing_users = IF(
  @has_musicos > 0,
  'INSERT INTO `usuarios` (
      `nome`, `email`, `senha_hash`, `telefone`, `instrumento_principal`,
      `habilidades`, `status_ministerio`, `perfil`, `ministerio_id`
   )
   SELECT
      m.nome,
      LOWER(TRIM(m.email)),
      ''$2a$10$yyM2L5oUfqYV7ptiZvHwLO6PGaXPISN31BzvYkxMtt62Qzvswe/RS'',
      m.telefone,
      m.instrumento_principal,
      m.habilidades,
      ''BLOQUEADO'',
      ''MEMBRO'',
      m.ministerio_id
   FROM `musicos` m
   LEFT JOIN `usuarios` u ON LOWER(TRIM(u.email)) = LOWER(TRIM(m.email))
   WHERE u.id IS NULL',
  'SELECT 1'
);
PREPARE stmt FROM @insert_missing_users;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS `escala_usuarios` (
  `escala_id` bigint NOT NULL,
  `usuario_id` bigint NOT NULL,
  PRIMARY KEY (`escala_id`, `usuario_id`),
  KEY `fk_escala_usuarios_usuarios` (`usuario_id`),
  CONSTRAINT `fk_escala_usuarios_escalas` FOREIGN KEY (`escala_id`) REFERENCES `escalas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_escala_usuarios_usuarios` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migra vinculos de escala_musicos para escala_usuarios.
SET @has_escala_musicos = (
  SELECT COUNT(*)
  FROM information_schema.tables
  WHERE table_schema = DATABASE()
    AND table_name = 'escala_musicos'
);

SET @migrate_scale_users = IF(
  @has_escala_musicos > 0 AND @has_musicos > 0,
  'INSERT IGNORE INTO `escala_usuarios` (`escala_id`, `usuario_id`)
   SELECT em.escala_id, u.id
   FROM `escala_musicos` em
   JOIN `musicos` m ON m.id = em.musico_id
   JOIN `usuarios` u ON LOWER(TRIM(u.email)) = LOWER(TRIM(m.email))',
  'SELECT 1'
);
PREPARE stmt FROM @migrate_scale_users;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

CALL drop_fk_if_exists('escala_musicos', 'fk_escala_musicos_escalas');
CALL drop_fk_if_exists('escala_musicos', 'fk_escala_musicos_musicos');
CALL drop_fk_if_exists('musicos', 'fk_musicos_ministerios');

DROP TABLE IF EXISTS `escala_musicos`;
DROP TABLE IF EXISTS `musicos`;

CALL add_index_if_missing('usuarios', 'idx_usuarios_status_ministerio',
  'CREATE INDEX `idx_usuarios_status_ministerio` ON `usuarios` (`status_ministerio`)');

DROP PROCEDURE add_column_if_missing;
DROP PROCEDURE add_index_if_missing;
DROP PROCEDURE drop_fk_if_exists;

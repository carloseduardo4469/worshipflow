-- WorshipFlow - vinculo opcional entre musicos e usuarios para perfil publico da equipe.

SET NAMES utf8mb4;
SET time_zone = '-03:00';

USE `worshipflow`;

DROP PROCEDURE IF EXISTS add_column_if_missing;
DROP PROCEDURE IF EXISTS add_index_if_missing;

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

DELIMITER ;

CALL add_column_if_missing('musicos', 'usuario_id',
  'ALTER TABLE `musicos` ADD COLUMN `usuario_id` bigint DEFAULT NULL AFTER `ministerio_id`');

UPDATE `musicos` m
JOIN `usuarios` u ON LOWER(TRIM(u.email)) = LOWER(TRIM(m.email))
SET m.usuario_id = u.id
WHERE m.usuario_id IS NULL;

CALL add_index_if_missing('musicos', 'idx_musicos_usuario_id',
  'CREATE INDEX `idx_musicos_usuario_id` ON `musicos` (`usuario_id`)');

DROP PROCEDURE add_column_if_missing;
DROP PROCEDURE add_index_if_missing;

ALTER TABLE `escalas`
  DROP FOREIGN KEY `fk_escalas_eventos`;

ALTER TABLE `escalas`
  DROP INDEX `fk_escalas_eventos`;

ALTER TABLE `escalas`
  DROP COLUMN `evento_id`;

DROP TABLE `eventos`;

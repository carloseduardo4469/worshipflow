-- phpMyAdmin SQL Dump
-- version 4.9.0.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 26-Maio-2026 às 03:45
-- Versão do servidor: 10.4.6-MariaDB
-- versão do PHP: 7.2.22

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `worshipflow`
--

-- --------------------------------------------------------

--
-- Estrutura da tabela `escalas`
--

CREATE TABLE `escalas` (
  `id` bigint(20) NOT NULL,
  `titulo` varchar(140) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('CANCELADA','CONCLUIDA','PUBLICADA','RASCUNHO') COLLATE utf8mb4_unicode_ci NOT NULL,
  `observacoes` varchar(600) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `evento_id` bigint(20) NOT NULL,
  `ministerio_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `escalas`
--

INSERT INTO `escalas` (`id`, `titulo`, `status`, `observacoes`, `evento_id`, `ministerio_id`) VALUES
(1, 'Escala - Culto de Domingo', 'PUBLICADA', 'Passagem de som as 18:00.', 1, 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `escala_musicas`
--

CREATE TABLE `escala_musicas` (
  `escala_id` bigint(20) NOT NULL,
  `musica_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `escala_musicas`
--

INSERT INTO `escala_musicas` (`escala_id`, `musica_id`) VALUES
(1, 1),
(1, 2),
(1, 3);

-- --------------------------------------------------------

--
-- Estrutura da tabela `escala_musicos`
--

CREATE TABLE `escala_musicos` (
  `escala_id` bigint(20) NOT NULL,
  `musico_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `escala_musicos`
--

INSERT INTO `escala_musicos` (`escala_id`, `musico_id`) VALUES
(1, 1),
(1, 2),
(1, 3);

-- --------------------------------------------------------

--
-- Estrutura da tabela `eventos`
--

CREATE TABLE `eventos` (
  `id` bigint(20) NOT NULL,
  `titulo` varchar(140) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `data_hora` datetime(6) NOT NULL,
  `local` varchar(160) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `observacoes` varchar(600) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ministerio_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `eventos`
--

INSERT INTO `eventos` (`id`, `titulo`, `tipo`, `data_hora`, `local`, `observacoes`, `ministerio_id`) VALUES
(1, 'Culto de Domingo', 'Culto', '2026-06-07 19:00:00.000000', 'Templo principal', 'Chegada da equipe as 17:30.', 1),
(2, 'adad', 'aqwaw', '2222-02-22 22:22:00.000000', '22', '3242123123', NULL);

-- --------------------------------------------------------

--
-- Estrutura da tabela `ministerios`
--

CREATE TABLE `ministerios` (
  `id` bigint(20) NOT NULL,
  `nome` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `ministerios`
--

INSERT INTO `ministerios` (`id`, `nome`, `descricao`, `ativo`) VALUES
(1, 'Ministerio de Louvor', 'Equipe principal de louvor da igreja.', 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `musicas`
--

CREATE TABLE `musicas` (
  `id` bigint(20) NOT NULL,
  `titulo` varchar(140) COLLATE utf8mb4_unicode_ci NOT NULL,
  `artista` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tonalidade` varchar(12) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bpm` int(11) DEFAULT NULL,
  `categoria` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `link_cifra` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ministerio_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `musicas`
--

INSERT INTO `musicas` (`id`, `titulo`, `artista`, `tonalidade`, `bpm`, `categoria`, `link_cifra`, `ministerio_id`) VALUES
(1, 'Grande E O Senhor', 'Comunidade', 'G', 74, 'Adoracao', NULL, 1),
(2, 'Te Louvarei', 'Ministerio Local', 'D', 96, 'Celebracao', NULL, 1),
(3, 'Santo Para Sempre', 'Worship', 'A', 68, 'Adoracao', NULL, 1),
(4, 'adad', 'asdad', 'd', 44, 'adad', '', NULL);

-- --------------------------------------------------------

--
-- Estrutura da tabela `musicos`
--

CREATE TABLE `musicos` (
  `id` bigint(20) NOT NULL,
  `nome` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(160) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `instrumento_principal` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `habilidades` varchar(300) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('ATIVO','EM_PAUSA','INATIVO') COLLATE utf8mb4_unicode_ci NOT NULL,
  `ministerio_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `musicos`
--

INSERT INTO `musicos` (`id`, `nome`, `email`, `telefone`, `instrumento_principal`, `habilidades`, `status`, `ministerio_id`) VALUES
(1, 'Ana Silva', 'ana.silva@example.com', '(11) 90000-0001', 'Voz', 'Vocal principal, backing vocal', 'ATIVO', 1),
(2, 'Bruno Santos', 'bruno.santos@example.com', '(11) 90000-0002', 'Violao', 'Violao base, direcao musical', 'ATIVO', 1),
(3, 'Carla Lima', 'carla.lima@example.com', '(11) 90000-0003', 'Teclado', 'Pads, piano, synth', 'ATIVO', 1),
(4, 'asdasd', 'asdasdas@alpskdj', 'a21342423s', 'asdw', 'wadasda', 'ATIVO', NULL);

-- --------------------------------------------------------

--
-- Estrutura da tabela `repertorios`
--

CREATE TABLE `repertorios` (
  `id` bigint(20) NOT NULL,
  `nome` varchar(140) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ministerio_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `repertorios`
--

INSERT INTO `repertorios` (`id`, `nome`, `descricao`, `ministerio_id`) VALUES
(1, 'Repertorio Base', 'Musicas usadas com frequencia nos cultos.', 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `repertorio_musicas`
--

CREATE TABLE `repertorio_musicas` (
  `repertorio_id` bigint(20) NOT NULL,
  `musica_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `repertorio_musicas`
--

INSERT INTO `repertorio_musicas` (`repertorio_id`, `musica_id`) VALUES
(1, 1),
(1, 2),
(1, 3);

-- --------------------------------------------------------

--
-- Estrutura da tabela `usuarios`
--

CREATE TABLE `usuarios` (
  `id` bigint(20) NOT NULL,
  `nome` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `habilidades` varchar(300) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(160) COLLATE utf8mb4_unicode_ci NOT NULL,
  `senha_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `perfil` enum('ADMIN','LIDER','MEMBRO','MUSICO') COLLATE utf8mb4_unicode_ci NOT NULL,
  `reset_token_hash` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reset_token_expira_em` datetime(6) DEFAULT NULL,
  `api_token_hash` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `api_token_expira_em` datetime(6) DEFAULT NULL,
  `foto_perfil` longtext COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `foto_perfil_tipo` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ministerio_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `usuarios`
--

INSERT INTO `usuarios` (`id`, `nome`, `habilidades`, `email`, `senha_hash`, `perfil`, `reset_token_hash`, `reset_token_expira_em`, `api_token_hash`, `api_token_expira_em`, `foto_perfil`, `foto_perfil_tipo`, `ministerio_id`) VALUES
(1, 'Administrador', NULL, 'admin@worshipflow.local', '$2a$10$yyM2L5oUfqYV7ptiZvHwLO6PGaXPISN31BzvYkxMtt62Qzvswe/RS', 'ADMIN', NULL, NULL, NULL, NULL, NULL, NULL, 1),
(2, 'Carlos', NULL, 'caducesar18@gmail.com', '$2a$12$LPYHtXPHojkg6SsfSliPsuzJASCR82yzbp.iZyYNdFOZrzd5ZFDby', 'ADMIN', NULL, NULL, '1c13ddaaf8accebcd57e20f38e1a7c3a925169aaec5ed9d9f0097807aa4f9afc', '2026-05-26 09:52:49.000000', NULL, NULL, NULL),
(3, 'Carlos', NULL, 'caduwerneck42@gmail.com', '$2a$10$1dHhwa.g986vNoogq6FrE.6i2Wlz.MRAME9bwqs1x.7HcXve0ZGv6', 'MEMBRO', NULL, NULL, 'd8f2a557dfbfeb4f2f2de01d9423b9305311160adf0157210a16e5fc8c189091', '2026-05-26 10:40:25.000000', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estrutura da tabela `usuario_musicas_favoritas`
--

CREATE TABLE `usuario_musicas_favoritas` (
  `usuario_id` bigint(20) NOT NULL,
  `musica_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Índices para tabelas despejadas
--

--
-- Índices para tabela `escalas`
--
ALTER TABLE `escalas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_escalas_status` (`status`),
  ADD KEY `fk_escalas_eventos` (`evento_id`),
  ADD KEY `fk_escalas_ministerios` (`ministerio_id`);

--
-- Índices para tabela `escala_musicas`
--
ALTER TABLE `escala_musicas`
  ADD PRIMARY KEY (`escala_id`,`musica_id`),
  ADD KEY `fk_escala_musicas_musicas` (`musica_id`);

--
-- Índices para tabela `escala_musicos`
--
ALTER TABLE `escala_musicos`
  ADD PRIMARY KEY (`escala_id`,`musico_id`),
  ADD KEY `fk_escala_musicos_musicos` (`musico_id`);

--
-- Índices para tabela `eventos`
--
ALTER TABLE `eventos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_eventos_data_hora` (`data_hora`),
  ADD KEY `fk_eventos_ministerios` (`ministerio_id`);

--
-- Índices para tabela `ministerios`
--
ALTER TABLE `ministerios`
  ADD PRIMARY KEY (`id`);

--
-- Índices para tabela `musicas`
--
ALTER TABLE `musicas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_musicas_titulo` (`titulo`),
  ADD KEY `fk_musicas_ministerios` (`ministerio_id`);

--
-- Índices para tabela `musicos`
--
ALTER TABLE `musicos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_musicos_email` (`email`),
  ADD KEY `idx_musicos_status` (`status`),
  ADD KEY `fk_musicos_ministerios` (`ministerio_id`);

--
-- Índices para tabela `repertorios`
--
ALTER TABLE `repertorios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_repertorios_ministerios` (`ministerio_id`);

--
-- Índices para tabela `repertorio_musicas`
--
ALTER TABLE `repertorio_musicas`
  ADD PRIMARY KEY (`repertorio_id`,`musica_id`),
  ADD KEY `fk_repertorio_musicas_musicas` (`musica_id`);

--
-- Índices para tabela `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_usuarios_email` (`email`),
  ADD KEY `idx_usuarios_perfil` (`perfil`),
  ADD KEY `idx_usuarios_reset_token_hash` (`reset_token_hash`),
  ADD KEY `idx_usuarios_api_token_hash` (`api_token_hash`),
  ADD KEY `fk_usuarios_ministerios` (`ministerio_id`);

--
-- Índices para tabela `usuario_musicas_favoritas`
--
ALTER TABLE `usuario_musicas_favoritas`
  ADD PRIMARY KEY (`usuario_id`,`musica_id`),
  ADD KEY `fk_usuario_favoritos_musicas` (`musica_id`);

--
-- AUTO_INCREMENT de tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `escalas`
--
ALTER TABLE `escalas`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `eventos`
--
ALTER TABLE `eventos`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `ministerios`
--
ALTER TABLE `ministerios`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `musicas`
--
ALTER TABLE `musicas`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `musicos`
--
ALTER TABLE `musicos`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `repertorios`
--
ALTER TABLE `repertorios`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restrições para despejos de tabelas
--

--
-- Limitadores para a tabela `escalas`
--
ALTER TABLE `escalas`
  ADD CONSTRAINT `fk_escalas_eventos` FOREIGN KEY (`evento_id`) REFERENCES `eventos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_escalas_ministerios` FOREIGN KEY (`ministerio_id`) REFERENCES `ministerios` (`id`) ON DELETE SET NULL;

--
-- Limitadores para a tabela `escala_musicas`
--
ALTER TABLE `escala_musicas`
  ADD CONSTRAINT `fk_escala_musicas_escalas` FOREIGN KEY (`escala_id`) REFERENCES `escalas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_escala_musicas_musicas` FOREIGN KEY (`musica_id`) REFERENCES `musicas` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `escala_musicos`
--
ALTER TABLE `escala_musicos`
  ADD CONSTRAINT `fk_escala_musicos_escalas` FOREIGN KEY (`escala_id`) REFERENCES `escalas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_escala_musicos_musicos` FOREIGN KEY (`musico_id`) REFERENCES `musicos` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `eventos`
--
ALTER TABLE `eventos`
  ADD CONSTRAINT `fk_eventos_ministerios` FOREIGN KEY (`ministerio_id`) REFERENCES `ministerios` (`id`) ON DELETE SET NULL;

--
-- Limitadores para a tabela `musicas`
--
ALTER TABLE `musicas`
  ADD CONSTRAINT `fk_musicas_ministerios` FOREIGN KEY (`ministerio_id`) REFERENCES `ministerios` (`id`) ON DELETE SET NULL;

--
-- Limitadores para a tabela `musicos`
--
ALTER TABLE `musicos`
  ADD CONSTRAINT `fk_musicos_ministerios` FOREIGN KEY (`ministerio_id`) REFERENCES `ministerios` (`id`) ON DELETE SET NULL;

--
-- Limitadores para a tabela `repertorios`
--
ALTER TABLE `repertorios`
  ADD CONSTRAINT `fk_repertorios_ministerios` FOREIGN KEY (`ministerio_id`) REFERENCES `ministerios` (`id`) ON DELETE SET NULL;

--
-- Limitadores para a tabela `repertorio_musicas`
--
ALTER TABLE `repertorio_musicas`
  ADD CONSTRAINT `fk_repertorio_musicas_musicas` FOREIGN KEY (`musica_id`) REFERENCES `musicas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_repertorio_musicas_repertorios` FOREIGN KEY (`repertorio_id`) REFERENCES `repertorios` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `fk_usuarios_ministerios` FOREIGN KEY (`ministerio_id`) REFERENCES `ministerios` (`id`) ON DELETE SET NULL;

--
-- Limitadores para a tabela `usuario_musicas_favoritas`
--
ALTER TABLE `usuario_musicas_favoritas`
  ADD CONSTRAINT `fk_usuario_favoritos_musicas` FOREIGN KEY (`musica_id`) REFERENCES `musicas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_usuario_favoritos_usuarios` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

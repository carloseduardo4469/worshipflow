-- WorshipFlow - seed complementar de repertorio e usuarios
-- Objetivo: inserir 100 musicas reais de louvor e 100 usuarios ficticios.
-- Script idempotente: usa IDs fixos altos e INSERT IGNORE para evitar duplicidade ao reexecutar.
-- Senha padrao dos usuarios ficticios: Worship@123

SET NAMES utf8mb4;
SET @seed_ministerio_id := (SELECT `id` FROM `ministerios` ORDER BY `id` LIMIT 1);
SET @seed_senha_hash := '$2a$10$BrPoknQJkcr8m.CYeTBWiuyGM9/6W/Psc1Mx7d.poBxmA9EkHEdNO';

START TRANSACTION;

INSERT IGNORE INTO `musicas` (`id`, `titulo`, `artista`, `tonalidade`, `bpm`, `link_cifra`, `ministerio_id`) VALUES
(1001, 'Lugar Secreto', 'Gabriela Rocha', 'Am', 74, 'https://www.cifraclub.com.br/gabriela-rocha/lugar-secreto/', @seed_ministerio_id),
(1002, 'Ousado Amor', 'Isaias Saad', 'G', 72, 'https://www.cifraclub.com.br/isaias-saad/ousado-amor/', @seed_ministerio_id),
(1003, 'Preciso de Ti', 'Diante do Trono', 'A', 68, 'https://www.cifraclub.com.br/diante-do-trono/preciso-de-ti/', @seed_ministerio_id),
(1004, 'Galileu', 'Fernandinho', 'D', 74, 'https://www.cifraclub.com.br/fernandinho/galileu/', @seed_ministerio_id),
(1005, 'Santo Pra Sempre', 'Gabriel Guedes', 'Db', 72, 'https://www.cifraclub.com.br/gabriel-guedes/santo-pra-sempre/', @seed_ministerio_id),
(1006, 'Fe', 'Florianopolis House of Prayer', 'C#m', 78, 'https://www.cifraclub.com.br/florianopolis-house-of-prayer/fe/', @seed_ministerio_id),
(1007, 'Eu Navegarei', 'Gabriela Rocha', 'Em', 68, 'https://www.cifraclub.com.br/gabriela-rocha/eu-navegarei/', @seed_ministerio_id),
(1008, 'Ninguem Explica Deus', 'Preto No Branco', 'G', 72, 'https://www.cifraclub.com.br/preto-no-branco/ninguem-explica-deus/', @seed_ministerio_id),
(1009, 'A Ele a Gloria', 'Gabriela Rocha', 'G', 70, 'https://www.cifraclub.com.br/gabriela-rocha/a-ele-a-gloria/', @seed_ministerio_id),
(1010, 'Me Atraiu', 'Gabriela Rocha', 'E', 68, 'https://www.cifraclub.com.br/gabriela-rocha/me-atraiu/', @seed_ministerio_id),
(1011, 'Atos 2', 'Gabriela Rocha', 'D', 72, 'https://www.cifraclub.com.br/gabriela-rocha/atos-2/', @seed_ministerio_id),
(1012, 'Vida Aos Sepulcros', 'Gabriela Rocha', 'B', 76, 'https://www.cifraclub.com.br/gabriela-rocha/vida-aos-sepulcros/', @seed_ministerio_id),
(1013, 'Todavia Me Alegrarei', 'Samuel Messias', 'D', 82, 'https://www.cifraclub.com.br/samuel-messias/todavia-me-alegrarei/', @seed_ministerio_id),
(1014, 'Deus Provera', 'Gabriela Gomes', 'A', 72, 'https://www.cifraclub.com.br/gabriela-gomes/deus-provera/', @seed_ministerio_id),
(1015, 'Hey Pai', 'Isadora Pompeo', 'G', 78, 'https://www.cifraclub.com.br/isadora-pompeo/hey-pai/', @seed_ministerio_id),
(1016, 'Faz Chover', 'Fernandinho', 'D', 72, 'https://www.cifraclub.com.br/fernandinho/faz-chover/', @seed_ministerio_id),
(1017, 'Uma Nova Historia', 'Fernandinho', 'A', 76, 'https://www.cifraclub.com.br/fernandinho/uma-nova-historia/', @seed_ministerio_id),
(1018, 'Grandes Coisas', 'Fernandinho', 'G', 78, 'https://www.cifraclub.com.br/fernandinho/grandes-coisas/', @seed_ministerio_id),
(1019, 'Todas as Coisas', 'Fernandinho', 'D', 74, 'https://www.cifraclub.com.br/fernandinho/todas-as-coisas/', @seed_ministerio_id),
(1020, 'Teus Sonhos', 'Fernandinho', 'A', 72, 'https://www.cifraclub.com.br/fernandinho/teus-sonhos/', @seed_ministerio_id),
(1021, 'Yeshua', 'Fernandinho', 'Em', 68, 'https://www.cifraclub.com.br/fernandinho/yeshua/', @seed_ministerio_id),
(1022, 'Nada Alem do Sangue', 'Fernandinho', 'G', 70, 'https://www.cifraclub.com.br/fernandinho/nada-alem-do-sangue/', @seed_ministerio_id),
(1023, 'Caia Fogo', 'Fernandinho', 'D', 82, 'https://www.cifraclub.com.br/fernandinho/caia-fogo/', @seed_ministerio_id),
(1024, 'Unico', 'Fernandinho', 'C', 72, 'https://www.cifraclub.com.br/fernandinho/unico/', @seed_ministerio_id),
(1025, 'Ainda Que a Figueira', 'Fernandinho', 'G', 70, 'https://www.cifraclub.com.br/fernandinho/ainda-que-a-figueira/', @seed_ministerio_id),
(1026, 'Aclame Ao Senhor', 'Diante do Trono', 'A', 72, 'https://www.cifraclub.com.br/diante-do-trono/aclama-ao-senhor/', @seed_ministerio_id),
(1027, 'Aguas Purificadoras', 'Diante do Trono', 'G', 76, 'https://www.cifraclub.com.br/diante-do-trono/aguas-purificadoras/', @seed_ministerio_id),
(1028, 'Nos Bracos do Pai', 'Diante do Trono', 'E', 68, 'https://www.cifraclub.com.br/diante-do-trono/nos-bracos-do-pai/', @seed_ministerio_id),
(1029, 'Manancial', 'Diante do Trono', 'D', 70, 'https://www.cifraclub.com.br/diante-do-trono/manancial/', @seed_ministerio_id),
(1030, 'Quero Me Apaixonar', 'Diante do Trono', 'A', 72, 'https://www.cifraclub.com.br/diante-do-trono/quero-me-apaixonar/', @seed_ministerio_id),
(1031, 'Me Ama', 'Diante do Trono', 'C', 70, 'https://www.cifraclub.com.br/diante-do-trono/me-ama/', @seed_ministerio_id),
(1032, 'Escudo', 'Diante do Trono', 'G', 74, 'https://www.cifraclub.com.br/diante-do-trono/escudo/', @seed_ministerio_id),
(1033, 'Exaltado', 'Diante do Trono', 'A', 78, 'https://www.cifraclub.com.br/diante-do-trono/exaltado/', @seed_ministerio_id),
(1034, 'Tu Reinas', 'Diante do Trono', 'D', 76, 'https://www.cifraclub.com.br/diante-do-trono/tu-reinas/', @seed_ministerio_id),
(1035, 'Creio', 'Diante do Trono', 'G', 78, 'https://www.cifraclub.com.br/diante-do-trono/creio/', @seed_ministerio_id),
(1036, 'Ressuscita-me', 'Aline Barros', 'A', 72, 'https://www.cifraclub.com.br/aline-barros/ressuscita-me/', @seed_ministerio_id),
(1037, 'Sonda-me Usa-me', 'Aline Barros', 'D', 74, 'https://www.cifraclub.com.br/aline-barros/sonda-me-usa-me/', @seed_ministerio_id),
(1038, 'Casa do Pai', 'Aline Barros', 'G', 76, 'https://www.cifraclub.com.br/aline-barros/casa-do-pai/', @seed_ministerio_id),
(1039, 'Consagracao', 'Aline Barros', 'E', 82, 'https://www.cifraclub.com.br/aline-barros/consagracao/', @seed_ministerio_id),
(1040, 'Autor da Vida', 'Aline Barros', 'D', 76, 'https://www.cifraclub.com.br/aline-barros/autor-da-vida/', @seed_ministerio_id),
(1041, 'Recomecar', 'Aline Barros', 'A', 72, 'https://www.cifraclub.com.br/aline-barros/recomecar/', @seed_ministerio_id),
(1042, 'Santidade', 'Aline Barros', 'C', 70, 'https://www.cifraclub.com.br/aline-barros/santidade/', @seed_ministerio_id),
(1043, 'Caminho de Milagres', 'Aline Barros', 'D', 76, 'https://www.cifraclub.com.br/aline-barros/caminho-de-milagres/', @seed_ministerio_id),
(1044, 'Bem Mais Que Tudo', 'Aline Barros', 'G', 72, 'https://www.cifraclub.com.br/aline-barros/bem-mais-que-tudo/', @seed_ministerio_id),
(1045, 'Deus do Impossivel', 'Aline Barros', 'E', 70, 'https://www.cifraclub.com.br/aline-barros/deus-do-impossivel/', @seed_ministerio_id),
(1046, 'E Tudo Sobre Voce', 'Morada', 'E', 70, 'https://www.cifraclub.com.br/morada/e-tudo-sobre-voce/', @seed_ministerio_id),
(1047, 'Para Que Entre o Rei', 'Morada', 'D', 74, 'https://www.cifraclub.com.br/morada/para-que-entre-o-rei/', @seed_ministerio_id),
(1048, 'Uma Coisa', 'Morada', 'G', 68, 'https://www.cifraclub.com.br/morada/uma-coisa/', @seed_ministerio_id),
(1049, 'So Tu Es Santo', 'Morada', 'A', 72, 'https://www.cifraclub.com.br/morada/so-tu-es-santo/', @seed_ministerio_id),
(1050, 'Nao Temerei', 'Morada', 'C', 78, 'https://www.cifraclub.com.br/morada/nao-temerei/', @seed_ministerio_id),
(1051, 'Deixa Queimar', 'Morada', 'D', 80, 'https://www.cifraclub.com.br/morada/deixa-queimar/', @seed_ministerio_id),
(1052, 'Puro e Simples', 'Morada', 'G', 72, 'https://www.cifraclub.com.br/morada/puro-e-simples/', @seed_ministerio_id),
(1053, 'Ele E', 'Morada', 'E', 74, 'https://www.cifraclub.com.br/morada/ele-e/', @seed_ministerio_id),
(1054, 'Cordeiro e Leao', 'Morada', 'D', 78, 'https://www.cifraclub.com.br/morada/cordeiro-e-leao/', @seed_ministerio_id),
(1055, 'A Casa e Sua', 'Casa Worship', 'C', 72, 'https://www.cifraclub.com.br/casa-worship/a-casa-e-sua/', @seed_ministerio_id),
(1056, 'Era Eu', 'Casa Worship', 'G', 74, 'https://www.cifraclub.com.br/casa-worship/era-eu/', @seed_ministerio_id),
(1057, 'Yeshua', 'Casa Worship', 'Em', 68, 'https://www.cifraclub.com.br/casa-worship/yeshua/', @seed_ministerio_id),
(1058, 'Vento Impetuoso', 'Casa Worship', 'A', 78, 'https://www.cifraclub.com.br/casa-worship/vento-impetuoso/', @seed_ministerio_id),
(1059, 'Algo Novo', 'Kemuel', 'D', 76, 'https://www.cifraclub.com.br/kemuel/algo-novo/', @seed_ministerio_id),
(1060, 'O Teu Amor', 'Kemuel', 'G', 72, 'https://www.cifraclub.com.br/kemuel/o-teu-amor/', @seed_ministerio_id),
(1061, 'Que Amor E Esse', 'Luma Elpidio', 'G', 72, 'https://www.cifraclub.com.br/luma-elpidio/que-amor-e-esse/', @seed_ministerio_id),
(1062, 'Liberta-me de Mim', 'Luma Elpidio', 'E', 70, 'https://www.cifraclub.com.br/luma-elpidio/liberta-me-de-mim/', @seed_ministerio_id),
(1063, 'Sou Casa', 'Luma Elpidio', 'D', 74, 'https://www.cifraclub.com.br/luma-elpidio/sou-casa/', @seed_ministerio_id),
(1064, 'Bondade de Deus', 'Isaias Saad', 'G', 72, 'https://www.cifraclub.com.br/isaias-saad/bondade-de-deus/', @seed_ministerio_id),
(1065, 'Ruja o Leao', 'Talita Catanzaro', 'Em', 78, 'https://www.cifraclub.com.br/talita-catanzaro/ruja-o-leao/', @seed_ministerio_id),
(1066, 'Enche-me', 'Isaias Saad', 'A', 70, 'https://www.cifraclub.com.br/isaias-saad/enche-me/', @seed_ministerio_id),
(1067, 'Espirito Vem', 'Isaias Saad', 'D', 72, 'https://www.cifraclub.com.br/isaias-saad/espirito-vem/', @seed_ministerio_id),
(1068, 'De Dentro Pra Fora', 'Julia Vitoria', 'A', 76, 'https://www.cifraclub.com.br/julia-vitoria/de-dentro-pra-fora/', @seed_ministerio_id),
(1069, 'Alem do Rio Azul', 'Julia Vitoria', 'G', 72, 'https://www.cifraclub.com.br/julia-vitoria/alem-do-rio-azul/', @seed_ministerio_id),
(1070, 'Reina Sobre Mim', 'Nivea Soares', 'D', 74, 'https://www.cifraclub.com.br/nivea-soares/reina-sobre-mim/', @seed_ministerio_id),
(1071, 'Que Se Abram os Ceus', 'Nivea Soares', 'G', 76, 'https://www.cifraclub.com.br/nivea-soares/que-se-abram-os-ceus/', @seed_ministerio_id),
(1072, 'Teu Amor Nao Falha', 'Nivea Soares', 'A', 72, 'https://www.cifraclub.com.br/nivea-soares/teu-amor-nao-falha/', @seed_ministerio_id),
(1073, 'Vai Valer a Pena', 'Livres Para Adorar', 'G', 76, 'https://www.cifraclub.com.br/livres-para-adorar/vai-valer-a-pena/', @seed_ministerio_id),
(1074, 'Lindo Es', 'Livres Para Adorar', 'D', 72, 'https://www.cifraclub.com.br/livres-para-adorar/lindo-es/', @seed_ministerio_id),
(1075, 'Mais Perto', 'Livres Para Adorar', 'E', 70, 'https://www.cifraclub.com.br/livres-para-adorar/mais-perto/', @seed_ministerio_id),
(1076, 'Oh Quao Lindo Esse Nome E', 'Ana Nobrega', 'D', 72, 'https://www.cifraclub.com.br/ana-nobrega/quao-lindo-esse-nome-e/', @seed_ministerio_id),
(1077, 'Quando Ele Vem', 'Ana Nobrega', 'C', 70, 'https://www.cifraclub.com.br/ana-nobrega/quando-ele-vem/', @seed_ministerio_id),
(1078, 'Oceanos', 'Ana Nobrega', 'D', 68, 'https://www.cifraclub.com.br/ana-nobrega/oceanos/', @seed_ministerio_id),
(1079, 'Tu Es Bom', 'Ministerio Pedras Vivas', 'A', 78, 'https://www.cifraclub.com.br/ministerio-pedras-vivas/tu-es-bom/', @seed_ministerio_id),
(1080, 'Rompendo em Fe', 'Comunidade Evangelica de Maringa', 'E', 76, 'https://www.cifraclub.com.br/comunidade-evangelica-de-maringa/rompendo-em-fe/', @seed_ministerio_id),
(1081, 'O Escudo', 'Voz da Verdade', 'G', 74, 'https://www.cifraclub.com.br/voz-da-verdade/o-escudo/', @seed_ministerio_id),
(1082, 'Deus Cuida de Mim', 'Kleber Lucas', 'C', 72, 'https://www.cifraclub.com.br/kleber-lucas/deus-cuida-de-mim/', @seed_ministerio_id),
(1083, 'Aos Pes da Cruz', 'Kleber Lucas', 'D', 70, 'https://www.cifraclub.com.br/kleber-lucas/aos-pes-da-cruz/', @seed_ministerio_id),
(1084, 'Sobre a Graca', 'Paulo Cesar Baruk', 'A', 72, 'https://www.cifraclub.com.br/paulo-cesar-baruk/sobre-a-graca/', @seed_ministerio_id),
(1085, 'Ele Continua Sendo Bom', 'Paulo Cesar Baruk', 'G', 74, 'https://www.cifraclub.com.br/paulo-cesar-baruk/ele-continua-sendo-bom/', @seed_ministerio_id),
(1086, 'Aquieta Minhalma', 'Ministerio Zoe', 'D', 68, 'https://www.cifraclub.com.br/ministerio-zoe/aquieta-minhalma/', @seed_ministerio_id),
(1087, 'Ha Um Lugar', 'Heloisa Rosa', 'E', 70, 'https://www.cifraclub.com.br/heloisa-rosa/ha-um-lugar/', @seed_ministerio_id),
(1088, 'Jesus e o Caminho', 'Heloisa Rosa', 'G', 72, 'https://www.cifraclub.com.br/heloisa-rosa/jesus-e-o-caminho/', @seed_ministerio_id),
(1089, 'Grande e o Senhor', 'Adhemar de Campos', 'A', 76, 'https://www.cifraclub.com.br/adhemar-de-campos/grande-e-o-senhor/', @seed_ministerio_id),
(1090, 'Nosso General', 'Adhemar de Campos', 'Em', 78, 'https://www.cifraclub.com.br/adhemar-de-campos/nosso-general/', @seed_ministerio_id),
(1091, 'Ao Unico', 'Vencedores Por Cristo', 'D', 74, 'https://www.cifraclub.com.br/vencedores-por-cristo/ao-unico/', @seed_ministerio_id),
(1092, 'Deus Somente Deus', 'Vencedores Por Cristo', 'G', 70, 'https://www.cifraclub.com.br/vencedores-por-cristo/deus-somente-deus/', @seed_ministerio_id),
(1093, 'Raridade', 'Anderson Freire', 'G', 72, 'https://www.cifraclub.com.br/anderson-freire/raridade/', @seed_ministerio_id),
(1094, 'Acalma o Meu Coracao', 'Anderson Freire', 'C', 68, 'https://www.cifraclub.com.br/anderson-freire/acalma-o-meu-coracao/', @seed_ministerio_id),
(1095, 'Advogado Fiel', 'Bruna Karla', 'D', 70, 'https://www.cifraclub.com.br/bruna-karla/advogado-fiel/', @seed_ministerio_id),
(1096, 'Sou Humano', 'Bruna Karla', 'A', 72, 'https://www.cifraclub.com.br/bruna-karla/sou-humano/', @seed_ministerio_id),
(1097, '500 Graus', 'Cassiane', 'G', 84, 'https://www.cifraclub.com.br/cassiane/500-graus/', @seed_ministerio_id),
(1098, 'Com Muito Louvor', 'Cassiane', 'E', 82, 'https://www.cifraclub.com.br/cassiane/com-muito-louvor/', @seed_ministerio_id),
(1099, 'Deus e Deus', 'Delino Marcal', 'D', 72, 'https://www.cifraclub.com.br/delino-marcal/deus-e-deus/', @seed_ministerio_id),
(1100, 'O Segredo', 'Leandro Borges', 'C', 70, 'https://www.cifraclub.com.br/leandro-borges/o-segredo/', @seed_ministerio_id);

INSERT IGNORE INTO `usuarios` (
  `id`, `nome`, `habilidades`, `status_ministerio`, `email`, `senha_hash`, `telefone`,
  `instrumento_principal`, `perfil`, `reset_token_hash`, `reset_token_expira_em`,
  `api_token_hash`, `api_token_expira_em`, `foto_perfil`, `foto_perfil_tipo`, `ministerio_id`
)
SELECT
  2000 + seq.n AS `id`,
  CONCAT('Membro Worship ', LPAD(seq.n, 3, '0')) AS `nome`,
  CONCAT('Disponivel para escalas, ensaios e repertorio. Perfil seed ', LPAD(seq.n, 3, '0')) AS `habilidades`,
  'ATIVO' AS `status_ministerio`,
  CONCAT('membro', LPAD(seq.n, 3, '0'), '@worshipflow.local') AS `email`,
  @seed_senha_hash AS `senha_hash`,
  CONCAT('(11) 9', LPAD(70000000 + seq.n, 8, '0')) AS `telefone`,
  ELT(((seq.n - 1) % 12) + 1, 'Vocal', 'Violao', 'Guitarra', 'Teclado', 'Baixo', 'Bateria', 'Saxofone', 'Percussao', 'Backing Vocal', 'Violino', 'Cajon', 'Midias') AS `instrumento_principal`,
  CASE
    WHEN seq.n % 20 = 0 THEN 'LIDER'
    WHEN seq.n % 7 = 0 THEN 'MUSICO'
    ELSE 'MEMBRO'
  END AS `perfil`,
  NULL AS `reset_token_hash`,
  NULL AS `reset_token_expira_em`,
  NULL AS `api_token_hash`,
  NULL AS `api_token_expira_em`,
  NULL AS `foto_perfil`,
  NULL AS `foto_perfil_tipo`,
  @seed_ministerio_id AS `ministerio_id`
FROM (
  SELECT ones.n + (tens.n * 10) AS n
  FROM (
    SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5
    UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10
  ) AS ones
  CROSS JOIN (
    SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
    UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9
  ) AS tens
) AS seq
WHERE seq.n BETWEEN 1 AND 100;

ALTER TABLE `musicas` AUTO_INCREMENT = 1101;
ALTER TABLE `usuarios` AUTO_INCREMENT = 2101;

COMMIT;

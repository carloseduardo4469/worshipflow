create database if not exists worshipflow
  character set utf8mb4
  collate utf8mb4_unicode_ci;

use worshipflow;

create table if not exists ministerios (
  id bigint not null auto_increment,
  nome varchar(120) not null,
  descricao varchar(500),
  ativo boolean not null default true,
  primary key (id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists musicas (
  id bigint not null auto_increment,
  titulo varchar(140) not null,
  artista varchar(120),
  tonalidade varchar(12),
  bpm integer,
  link_cifra varchar(500),
  ministerio_id bigint,
  primary key (id),
  index idx_musicas_ministerio_id (ministerio_id),
  constraint fk_musicas_ministerios
    foreign key (ministerio_id) references ministerios(id)
    on delete set null
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists usuarios (
  id bigint not null auto_increment,
  nome varchar(120) not null,
  email varchar(160) not null,
  senha_hash varchar(255) not null,
  telefone varchar(30),
  instrumento_principal varchar(80),
  habilidades varchar(300),
  status_ministerio varchar(30) not null default 'ATIVO',
  perfil varchar(30) not null default 'MEMBRO',
  reset_token_hash varchar(128),
  reset_token_expira_em datetime,
  api_token_hash varchar(128),
  api_token_expira_em datetime,
  foto_perfil text,
  foto_perfil_tipo varchar(60),
  ministerio_id bigint,
  primary key (id),
  unique key uk_usuarios_email (email),
  index idx_usuarios_ministerio_id (ministerio_id),
  index idx_usuarios_status_ministerio (status_ministerio),
  constraint fk_usuarios_ministerios
    foreign key (ministerio_id) references ministerios(id)
    on delete set null
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists escalas (
  id bigint not null auto_increment,
  titulo varchar(140) not null,
  data_escala date,
  status varchar(30) not null default 'RASCUNHO',
  observacoes varchar(600),
  funcoes_usuarios varchar(2000),
  tonalidades_musicas varchar(2000),
  ministerio_id bigint,
  primary key (id),
  index idx_escalas_ministerio_id (ministerio_id),
  index idx_escalas_status_data (status, data_escala),
  constraint fk_escalas_ministerios
    foreign key (ministerio_id) references ministerios(id)
    on delete set null
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists repertorios (
  id bigint not null auto_increment,
  nome varchar(140) not null,
  descricao varchar(500),
  ministerio_id bigint,
  primary key (id),
  index idx_repertorios_ministerio_id (ministerio_id),
  constraint fk_repertorios_ministerios
    foreign key (ministerio_id) references ministerios(id)
    on delete set null
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists escala_musicas (
  escala_id bigint not null,
  musica_id bigint not null,
  primary key (escala_id, musica_id),
  index idx_escala_musicas_musica_id (musica_id),
  constraint fk_escala_musicas_escalas
    foreign key (escala_id) references escalas(id)
    on delete cascade,
  constraint fk_escala_musicas_musicas
    foreign key (musica_id) references musicas(id)
    on delete cascade
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists escala_usuarios (
  escala_id bigint not null,
  usuario_id bigint not null,
  primary key (escala_id, usuario_id),
  index idx_escala_usuarios_usuario_id (usuario_id),
  constraint fk_escala_usuarios_escalas
    foreign key (escala_id) references escalas(id)
    on delete cascade,
  constraint fk_escala_usuarios_usuarios
    foreign key (usuario_id) references usuarios(id)
    on delete cascade
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists repertorio_musicas (
  repertorio_id bigint not null,
  musica_id bigint not null,
  primary key (repertorio_id, musica_id),
  index idx_repertorio_musicas_musica_id (musica_id),
  constraint fk_repertorio_musicas_repertorios
    foreign key (repertorio_id) references repertorios(id)
    on delete cascade,
  constraint fk_repertorio_musicas_musicas
    foreign key (musica_id) references musicas(id)
    on delete cascade
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table if not exists usuario_musicas_favoritas (
  usuario_id bigint not null,
  musica_id bigint not null,
  primary key (usuario_id, musica_id),
  index idx_usuario_musicas_favoritas_musica_id (musica_id),
  constraint fk_usuario_musicas_favoritas_usuarios
    foreign key (usuario_id) references usuarios(id)
    on delete cascade,
  constraint fk_usuario_musicas_favoritas_musicas
    foreign key (musica_id) references musicas(id)
    on delete cascade
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

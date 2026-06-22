# WorshipFlow MVP

Aplicacao web para gestao de ministerio de louvor. O projeto foi reorganizado em frontend Vanilla JS e backend Java Spring Boot com PostgreSQL/Supabase.

## Arquitetura

- `backend/`: API REST Spring Boot em camadas (`controller`, `service`, `repository`, `entity`, `dto`, `config`, `exception`, `security`).
- `backend/src/main/resources/static/`: frontend mobile-first em HTML, CSS e JavaScript puro, servido pelo Spring Boot.
- `database/`: dump e scripts SQL incrementais para ambientes locais.

## Funcionalidades do MVP

- Login local com senha criptografada, token de sessao e protecao basica contra tentativas repetidas.
- Gestão de usuarios/membros, musicas e escalas.
- Respostas JSON padronizadas.
- Tema claro/escuro, toasts e estados de loading.
- Layout responsivo com sidebar no desktop e navegacao inferior no mobile.

## Banco modelado

Entidades iniciais:

- usuarios
- usuarios/membros
- escalas
- musicas
- ministerios
- repertorios

As escalas se relacionam com varios usuarios/membros e varias musicas.

## Como executar pelo Spring Boot

O frontend foi colocado dentro do proprio Spring Web. Voce nao precisa rodar `npm`, `node server.js` nem Docker para abrir a tela.

Requisito recomendado para o backend:

```text
JDK 21 LTS
```

Rode apenas o backend:

```bash
cd backend
mvn spring-boot:run
```

Depois acesse:

```text
http://localhost:8080
```

API:

```text
http://localhost:8080/api
```

Se estiver usando Eclipse, IntelliJ ou Spring Tools, abra a classe:

```text
backend/src/main/java/br/com/worshipflow/WorshipFlowApplication.java
```

E execute como aplicacao Java/Spring Boot.

## Banco configurado

O projeto esta configurado para usar PostgreSQL, pronto para Supabase:

```text
Banco padrao: postgres
Usuario padrao: postgres
Host local padrao: localhost
Porta padrao: 5432
SSL: require
```

Configuracao local padrao:

```bash
DB_URL=jdbc:postgresql://localhost:5432/postgres?sslmode=require
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=
DB_SSLMODE=require
JPA_DDL_AUTO=validate
```

## Supabase e importacao SQL

No Supabase, execute os scripts pelo SQL Editor nesta ordem:

```text
database/postgresql/001_schema.sql
database/postgresql/002_seed_current_data.sql
database/postgresql/003_seed_100_musicas_usuarios.sql
```

Tambem existe um arquivo consolidado, util para um banco limpo:

```text
database/postgresql/worshipflow-postgresql-full.sql
```

Depois configure o backend Spring Boot com os dados do seu banco Supabase:

```text
DB_URL=jdbc:postgresql://db.SEUPROJETO.supabase.co:5432/postgres?sslmode=require
DB_HOST=db.SEUPROJETO.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=sua-senha-do-banco
DB_SSLMODE=require
JPA_DDL_AUTO=validate
```

Use a senha do banco definida em Supabase > Project Settings > Database. Nao use a anon key como senha do banco.

## Envio de e-mail para redefinicao de senha

O fluxo de redefinicao gera um token local do WorshipFlow e envia um link temporario para `/api/auth/redefinir-senha?token=...`. Essa rota valida o formato do acesso e redireciona o navegador para `/pages/redefinir-senha.html?token=...`.

O provedor e definido por:

```text
PASSWORD_RESET_PROVIDER=auto
```

Valores aceitos:

- `supabase`: usa a API do Supabase Auth para disparar o e-mail pelo SMTP configurado no painel do Supabase.
- `smtp`: usa SMTP direto configurado no backend.
- `auto`: tenta Supabase quando configurado; caso contrario, tenta SMTP direto.

Configuracao recomendada com Supabase Auth:

```text
PASSWORD_RESET_PROVIDER=supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-publica-ou-anon
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role-opcional
FRONTEND_BASE_URL=http://localhost:8080
EXPOSE_RESET_LINK=false
```

`SUPABASE_SERVICE_ROLE_KEY` e opcional, mas recomendada no backend: ela permite criar/confirmar automaticamente um usuario espelho no Supabase Auth antes do envio. Sem ela, o e-mail so sera enviado se o e-mail ja existir no Supabase Auth.

Configuracao alternativa com SMTP direto:

```text
PASSWORD_RESET_PROVIDER=smtp
MAIL_HOST=smtp.seu-provedor.com
MAIL_PORT=587
MAIL_FROM=remetente-validado@seudominio.com
MAIL_USERNAME=usuario-smtp
MAIL_PASSWORD=senha-smtp
MAIL_SMTP_AUTH=true
MAIL_SMTP_STARTTLS=true
MAIL_SMTP_STARTTLS_REQUIRED=true
```

As chaves e senhas devem ficar em variaveis de ambiente ou em `backend/.env`. O arquivo `.env` local e carregado automaticamente ao iniciar a aplicacao e nao deve ser enviado para o Git.

## Endpoints principais

- `GET /api/usuarios`
- `GET /api/usuarios/equipe`
- `PUT /api/usuarios/{id}`
- `DELETE /api/usuarios/{id}`

O mesmo padrao vale para:

- `/api/musicas`
- `/api/escalas`

As listagens aceitam parametros opcionais de paginacao:

```text
?page=0&size=50
```

As listagens de usuarios e musicas tambem aceitam busca textual:

```text
?query=violao
```

## Decisoes importantes

- A regra de negocio fica nos services para manter controllers pequenos.
- DTOs protegem as entidades e concentram validacoes de entrada.
- Credenciais ficam em variaveis de ambiente, com valores locais apenas para desenvolvimento.
- O frontend nao usa framework para cumprir a proposta do TCC e manter o codigo acessivel.
- A autenticacao usa cadastro, login com senha criptografada, token de sessao e redefinicao de senha por link.

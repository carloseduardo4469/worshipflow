# WorshipFlow MVP

Aplicacao web para gestao de ministerio de louvor da igreja Bola de Neve Braganca Paulista.

O projeto usa:

- Backend Java Spring Boot.
- Frontend HTML, CSS e JavaScript puro servido pelo proprio Spring Boot.
- Banco de dados MySQL local pelo XAMPP.

Nao ha dependencia de Supabase, PostgreSQL ou H2 no caminho principal do projeto.

## Arquitetura

- `backend/`: API REST Spring Boot em camadas (`controller`, `service`, `repository`, `entity`, `dto`, `config`, `exception`, `security`).
- `backend/src/main/resources/static/`: frontend mobile-first servido pelo backend.
- `database/mysql/`: scripts SQL para MySQL/XAMPP.

## Requisitos

- JDK 21 LTS.
- Maven.
- XAMPP com MySQL ativo.

## Como executar

1. Abra o XAMPP.
2. Inicie o servico `MySQL`.
3. Rode o backend:

```bash
cd backend
..\mvn-local.cmd spring-boot:run
```

Para desenvolvimento com cache estatico desativado:

```bash
cd backend
..\mvn-local.cmd spring-boot:run "-Dspring-boot.run.profiles=dev"
```

Depois acesse:

```text
http://localhost:8080
```

API:

```text
http://localhost:8080/api
```

No VS Code, execute a classe:

```text
backend/src/main/java/br/com/worshipflow/WorshipFlowApplication.java
```

O MySQL do XAMPP precisa estar ativo antes de iniciar o backend.

## Banco configurado

Padrao local:

```text
Banco: worshipflow
Host: localhost
Porta: 3306
Usuario: root
Senha: vazia
Driver: com.mysql.cj.jdbc.Driver
```

Configuracao padrao do Spring:

```text
DB_URL=jdbc:mysql://localhost:3306/worshipflow?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=America/Sao_Paulo
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=worshipflow
DB_USERNAME=root
DB_PASSWORD=
JPA_DDL_AUTO=update
```

Com `createDatabaseIfNotExist=true`, o backend consegue criar o banco `worshipflow` automaticamente quando o usuario MySQL tem permissao. Mesmo assim, o servidor MySQL precisa estar rodando.

Se quiser configurar manualmente pelo phpMyAdmin, execute:

```text
database/mysql/001_schema.sql
```

## Primeiro administrador

O cadastro publico cria usuario comum. Para liberar acesso administrativo no ambiente local:

1. Cadastre o primeiro usuario pela tela do sistema.
2. No phpMyAdmin, execute o script:

```text
database/mysql/002_promover_primeiro_admin.sql
```

Antes de executar, altere o e-mail do script para o e-mail cadastrado.

## Variaveis locais

O arquivo `backend/.env` local e carregado automaticamente pela aplicacao, caso exista. Ele nao deve ser versionado.

Use `backend/.env.example` como referencia para alterar porta, credenciais do MySQL, CORS, URL do frontend e SMTP.

## Envio de e-mail para redefinicao de senha

O fluxo de redefinicao de senha usa SMTP direto.

Configuracao:

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

Sem SMTP configurado, o endpoint de esqueci senha nao consegue enviar e-mail.

## Endpoints principais

- `POST /api/auth/cadastro`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/usuarios`
- `GET /api/usuarios/equipe`
- `PUT /api/usuarios/{id}`
- `DELETE /api/usuarios/{id}`
- `GET /api/musicas`
- `POST /api/musicas`
- `GET /api/escalas`
- `POST /api/escalas`

As listagens aceitam parametros opcionais de paginacao:

```text
?page=0&size=50
```

As listagens de usuarios e musicas tambem aceitam busca textual:

```text
?query=violao
```

## Decisoes tecnicas

- A regra de negocio fica nos services para manter controllers pequenos.
- DTOs protegem as entidades e concentram validacoes de entrada.
- Credenciais ficam em variaveis de ambiente ou em `backend/.env`.
- O frontend nao usa framework para manter o MVP simples e adequado ao TCC.
- O banco local oficial do projeto e MySQL via XAMPP.
- `JPA_DDL_AUTO=update` e pratico para desenvolvimento; para producao, o correto e evoluir para migrations versionadas.

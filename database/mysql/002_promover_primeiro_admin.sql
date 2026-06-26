use worshipflow;

-- Execute depois de cadastrar seu primeiro usuario pela tela de cadastro.
-- Troque o e-mail abaixo pelo e-mail usado no cadastro.
update usuarios
   set perfil = 'ADMIN'
 where email = 'seu-email@exemplo.com';

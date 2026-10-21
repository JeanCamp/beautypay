# Como configurar autenticação no Supabase

## O que precisa ser feito no Supabase

O Supabase Auth já está configurado automaticamente quando você cria um projeto, mas você precisa verificar as configurações.

## Passo 1: Verificar configurações de autenticação

1. Acesse seu projeto no Supabase: https://supabase.com/dashboard
2. No menu lateral, clique em "Authentication"
3. Clique em "Providers"
4. Verifique se "Email" está habilitado
5. Se não estiver, clique em "Email" e habilite

## Passo 2: Configurar opções de email

Em "Authentication" → "Providers" → "Email":

1. **Confirm email**: Você pode desabilitar se quiser login direto sem confirmação (mais simples para testar)
2. **Secure email change**: Pode deixar desabilitado
3. **Double opt-in**: Desabilitar para login mais rápido

**Recomendação para teste:**
- Confirm email: OFF
- Secure email change: OFF
- Double opt-in: OFF

## Passo 3: Criar primeiro usuário

Você pode criar o primeiro usuário de duas formas:

**Opção 1 - Pelo próprio app:**
1. Acesse o app localmente: `npm run dev`
2. Vá em http://localhost:3000
3. Será redirecionado para /login
4. Clique em "Criar conta"
5. Cadastre a conta da sua namorada

**Opção 2 - Pelo Supabase Dashboard:**
1. No Supabase, vá em "Authentication" → "Users"
2. Clique em "Add user"
3. Preencha email e senha
4. Marque "Auto confirm user" para não precisar de confirmação por email

## Passo 4: Configurar variáveis de ambiente no Vercel

Ao hospedar no Vercel, você precisa adicionar as mesmas variáveis de ambiente:

1. No Vercel, vá em "Settings" → "Environment Variables"
2. Adicione:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://lzuqrogdyisxtlfgbgyy.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `sb_publishable_anFjTVfAn_f3bW000P-6ow_c0X4cGP8`
3. Clique em "Save"
4. Vá em "Deployments" → "Redeploy"

## Passo 5: Testar localmente

1. Execute `npm run dev`
2. Acesse http://localhost:3000
3. Será redirecionado para /login
4. Crie uma conta de teste
5. Faça login
6. Verifique se está funcionando

## Funcionalidades de autenticação implementadas

✅ Login com email e senha
✅ Registro de novos usuários
✅ Middleware para proteger rotas
✅ Redirecionamento automático
✅ Logout
✅ Nome do usuário obtido do metadata
✅ Proteção de rotas (middleware)

## Melhorias mobile implementadas

✅ Touch targets mínimos de 44px (melhor usabilidade)
✅ Tamanho de fonte 16px em inputs (evita zoom automático)
✅ -webkit-tap-highlight-color para feedback visual
✅ Scroll suave com -webkit-overflow-scrolling
✅ Antialiasing para melhor legibilidade
✅ Transições suaves
✅ user-select desabilitado em botões

## Fluxo de autenticação

1. Usuário acessa o app → Redirecionado para /login
2. Não tem conta → Vai para /register
3. Cadastra email/senha/nome → Cria conta no Supabase
4. Redirecionado para /login
5. Faz login → Salva sessão no Supabase
6. Redirecionado para / (dashboard)
7. Sessão válida → Acesso liberado
8. Clica em "Sair" → Faz logout → Redireciona para /login

## Próximo passo

Após configurar a autenticação no Supabase, teste localmente e depois hospede no Vercel com as variáveis de ambiente configuradas.

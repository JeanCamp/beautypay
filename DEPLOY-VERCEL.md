# Como hospedar no Vercel

## Pré-requisitos

- ✅ Conta no GitHub criada
- ✅ Repositório `beautypay` criado no GitHub
- ✅ Código enviado para o GitHub
- ✅ Projeto Supabase criado e configurado
- ✅ Autenticação Supabase configurada
- ✅ Variáveis de ambiente locais configuradas

## Passo 1: Criar conta no Vercel

1. Acesse: https://vercel.com
2. Clique em "Sign Up"
3. Clique em "Continue with GitHub"
4. Autorize o Vercel a acessar sua conta GitHub
5. Preencha os dados básicos (nome, email, etc.)

## Passo 2: Importar o projeto

1. No Vercel, clique em "Add New Project"
2. O repositório `beautypay` deve aparecer na lista
3. Clique em "Import" ao lado do repositório
4. Configure:
   - **Project Name**: `beautypay` (ou outro nome que preferir)
   - **Framework Preset**: Next.js (detecta automaticamente)
   - **Root Directory**: `./` (deixe padrão)
5. Clique em "Deploy"

## Passo 3: Configurar variáveis de ambiente

Após importar o projeto, você precisa configurar as variáveis de ambiente:

1. No projeto no Vercel, clique em "Settings" (ícone de engrenagem)
2. Clique em "Environment Variables"
3. Adicione as duas variáveis:

   **Variável 1:**
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://lzuqrogdyisxtlfgbgyy.supabase.co`
   - Environments: Production, Preview, Development (todas)
   - Clique em "Add"

   **Variável 2:**
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: `sb_publishable_anFjTVfAn_f3bW000P-6ow_c0X4cGP8`
   - Environments: Production, Preview, Development (todas)
   - Clique em "Add"

4. Clique em "Save"

## Passo 4: Redeploy com as variáveis

1. Clique em "Deployments" no menu lateral
2. Clique nos três pontos (...) ao lado do último deploy
3. Clique em "Redeploy"
4. Confirme clicando em "Redeploy"

## Passo 5: Acessar o site

Após o deploy terminar (3-5 minutos):

1. O Vercel mostrará uma URL como: `https://beautypay.vercel.app`
2. Clique na URL para acessar
3. Será redirecionado para /login
4. Crie uma conta ou faça login

## Passo 6: Configurar domínio personalizado (opcional)

Se quiser um domínio personalizado:

1. No Vercel, clique em "Settings" → "Domains"
2. Clique em "Add Domain"
3. Digite seu domínio (ex: `beautypay.com`)
4. Siga as instruções para configurar DNS

## Passo 7: Criar primeira conta

1. Acesse a URL do Vercel
2. Será redirecionado para /login
3. Clique em "Criar conta"
4. Cadastre a conta da sua namorada:
   - Nome: nome dela
   - Email: email dela
   - Senha: senha escolhida
5. Faça login
6. Comece a usar!

## Funcionalidades após o deploy

✅ Acesso de qualquer lugar (celular, PC, tablet)
✅ Dados sincronizados entre dispositivos
✅ Autenticação segura com Supabase
✅ Login/senha protegidos
✅ SSL/HTTPS automático
✅ CDN global para carregamento rápido
✅ Deploy automático ao fazer push no GitHub

## Como atualizar o app

1. Faça alterações no código local
2. Commit e push para o GitHub:
   ```bash
   git add .
   git commit -m "Descrição da alteração"
   git push
   ```
3. O Vercel detecta automaticamente e faz deploy
4. Aguarde 2-3 minutos
5. O site é atualizado automaticamente

## URLs importantes

- Vercel Dashboard: https://vercel.com/dashboard
- Projeto: https://vercel.com/[seu-usuario]/beautypay
- Site: https://beautypay.vercel.app
- Supabase Dashboard: https://supabase.com/dashboard

## Solução de problemas

**Erro de variáveis de ambiente:**
- Verifique se as variáveis estão configuradas em "Settings" → "Environment Variables"
- Redeploy após adicionar as variáveis

**Erro de autenticação:**
- Verifique se o Supabase Auth está habilitado
- Verifique se as credenciais estão corretas
- Confirme o email no Supabase se necessário

**Build falhando:**
- Verifique o log de deploy no Vercel
- Execute `npm run build` localmente para testar
- Verifique se não há erros de TypeScript

## Próximo passo

Após hospedar no Vercel, sua namorada pode:
1. Acessar de qualquer dispositivo
2. Criar conta e fazer login
3. Registrar atendimentos
4. Ver dados sincronizados
5. Usar no celular com melhor experiência mobile

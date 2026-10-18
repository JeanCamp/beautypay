# Como hospedar no Vercel (Gratuito)

## O que é Vercel?
Vercel é uma plataforma de hospedagem gratuita para sites Next.js. Após hospedar, o site fica disponível 24/7 e sua namorada pode acessar de qualquer lugar, sem precisar do computador ligado.

## Passo 1: Criar conta no GitHub (se não tiver)

1. Acesse: https://github.com
2. Clique em "Sign up"
3. Crie uma conta gratuita
4. Verifique o e-mail

## Passo 2: Criar repositório no GitHub

1. Faça login no GitHub
2. Clique no "+" no canto superior direito
3. Selecione "New repository"
4. Nome do repositório: `beautypay`
5. Marque "Public" (ou Private, também funciona)
6. Clique em "Create repository"

## Passo 3: Enviar código para o GitHub

### No computador, no terminal (na pasta do projeto):

```bash
git init
git add .
git commit -m "Initial commit - BeautyPay"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/beautypay.git
git push -u origin main
```

**Substitua `SEU-USUARIO` pelo seu usuário do GitHub**

## Passo 4: Criar conta no Vercel

1. Acesse: https://vercel.com
2. Clique em "Sign Up"
3. Selecione "Continue with GitHub"
4. Autorize o Vercel a acessar seu GitHub
5. Crie uma conta gratuita

## Passo 5: Conectar o repositório no Vercel

1. No Vercel, clique em "Add New Project"
2. Selecione o repositório `beautypay` na lista
3. Clique em "Import"
4. Configure o projeto:
   - Project Name: `beautypay` (ou outro nome)
   - Framework Preset: Next.js (deve detectar automaticamente)
   - Root Directory: `./` (deixe como está)
5. Clique em "Deploy"

## Passo 6: Aguardar o deploy

1. O Vercel vai compilar e deployar automaticamente
2. Aguarde alguns minutos (3-5 minutos)
3. Quando terminar, você verá uma URL como: `https://beautypay.vercel.app`

## Passo 7: Atualizações automáticas

Sempre que você fizer mudanças no código:

```bash
git add .
git commit -m "Descrição da mudança"
git push
```

O Vercel detecta automaticamente e faz o deploy da nova versão!

## Passo 8: Instalar no celular como PWA

Após hospedar no Vercel:

### Android (Chrome):
1. Acesse a URL do Vercel no celular
2. Menu → "Adicionar à tela inicial"
3. Confirme

### iPhone (Safari):
1. Acesse a URL do Vercel no iPhone
2. Botão compartilhar → "Adicionar à Tela de Início"
3. Confirme

## Vantagens de hospedar no Vercel:

✅ **Gratuito** - Sem custos mensais
✅ **Disponível 24/7** - Não precisa do computador ligado
✅ **Acesso de qualquer lugar** - Sua namorada usa onde estiver
✅ **HTTPS automático** - Segurança SSL gratuita
✅ **Deploy automático** - Atualiza com git push
✅ **Domínio personalizado** - Pode usar domínio próprio depois
✅ **Analytics** - Estatísticas de uso gratuitas

## Domínio personalizado (opcional)

Se quiser um domínio próprio (ex: `beautypay.com`):

1. No Vercel, vá em Settings → Domains
2. Clique em "Add Domain"
3. Digite seu domínio
4. Configure DNS no seu provedor de domínio
5. Vercel gera certificado SSL automaticamente

## Problemas comuns:

### Erro no deploy:
- Verifique se todos os arquivos foram commitados
- Verifique se o build funciona localmente: `npm run build`

### Build falhando:
- Execute `npm run build` localmente primeiro
- Corrija os erros antes de fazer push

### HTTPS não funcionando:
- Vercel gera automaticamente, espere alguns minutos após o primeiro deploy

## Resumo rápido:

1. Criar conta GitHub
2. Criar repositório `beautypay`
3. Enviar código: `git push`
4. Criar conta Vercel
5. Importar repositório no Vercel
6. Deploy automático
7. Usar a URL gerada no celular!

Se precisar de ajuda em algum passo, me avise!

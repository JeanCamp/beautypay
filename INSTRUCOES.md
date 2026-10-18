# 🎉 Controle de Comissões - Sistema Completo

## 📋 Como Executar o Sistema

### 1. Instalar Dependências
Abra o terminal na pasta `ControleComissoes` e execute:

```bash
npm install
```

### 2. Executar em Desenvolvimento
```bash
npm run dev
```

O sistema estará disponível em: **http://localhost:3000**

### 3. Primeiro Acesso
1. Abra o navegador em http://localhost:3000
2. Clique em "Cadastre-se"
3. Preencha nome, email e senha
4. Siga o assistente de configuração (5 passos)
5. Pronto! Comece a registrar atendimentos

## 🎯 Funcionalidades Principais

### ✅ Registro de Atendimentos
- Clique em "+ NOVO ATENDIMENTO"
- Selecione o serviço
- Informe o cliente (opcional)
- Confirme - a comissão é calculada automaticamente

### ✅ Dashboard
- **Hoje**: Atendimentos, faturamento, comissão, ticket médio
- **Período**: Semana, quinzena e mês
- **Alertas**: Notificações inteligentes

### ✅ Menu Lateral
- **Serviços**: Catálogo completo (45 serviços)
- **Histórico**: Todos os atendimentos com filtros
- **Fechar Dia**: Resumo diário e fechamento
- **Quinzena**: Controle de pagamentos
- **Relatórios**: Gráficos e estatísticas
- **Projeção**: Metas e estimativas

### ✅ Exportação
- **CSV**: Para Excel
- **Excel**: Formato .xlsx
- **PDF**: Relatórios profissionais

## 💾 Dados e Persistência

### Armazenamento
- **Local**: localStorage do navegador
- **Backup**: Dados persistem ao fechar navegador
- **Serviços**: 45 serviços pré-cadastrados
- **Atendimentos**: Salvos automaticamente

### Backup Manual
Para fazer backup dos dados:
1. Abra o DevTools (F12)
2. Vá em Application > Local Storage
3. Copie os dados das chaves:
   - `comissoes_services`
   - `comissoes_appointments`
   - `comissoes_day_closures`
   - `comissoes_fortnight_closures`

## 🎨 Interface

### Temas
- **Light Mode**: Padrão
- **Dark Mode**: Clique no ícone de lua/sol no header

### Responsivo
- **Desktop**: Layout completo
- **Mobile**: Interface otimizada para celular
- **Tablet**: Adaptável

## 📱 Uso em Celular

1. Acesse o IP da rede em vez de localhost
2. Exemplo: `http://SEU_IP:3000`
3. Funciona como um app nativo

## 🔧 Solução de Problemas

### Sistema não inicia
```bash
# Limpar cache e reinstalar
rm -rf node_modules
rm package-lock.json
npm install
npm run dev
```

### Dados perdidos
- Os dados ficam no localStorage do navegador
- Limpar o cache do navegador apaga os dados
- Sempre faça backup manual se necessário

### Porta 3000 ocupada
```bash
# Usar outra porta
npm run dev -- -p 3001
```

## 📊 Serviços Pré-Cadastrados

O sistema inicia com 45 serviços configurados:

**Cortes**: Corte bordado, Corte feminino, Corte franja  
**Escova**: Escova curta/média/longa/extra longa/modeladora  
**Secagem**: Curto, médio, longo, extra longo  
**Tratamentos**: Botox, Vinhoterapia, Hidratação, Plástica capilar  
**Coloração**: Luzes, Coloração, Retoque de raiz  
**Lavagem**: Diversos tipos de lavagem especial  
**E muito mais!**

## 🎯 Metas

O sistema permite configurar:
- Meta diária
- Meta semanal  
- Meta mensal
- Barras de progresso visuais
- Projeção automática

## 📈 Relatórios

- **Comissão por dia**: Gráfico de barras
- **Serviços mais realizados**: Ranking
- **Comissão por serviço**: Gráfico de pizza
- **Melhor dia**: Destaque automático
- **Média diária**: Cálculo automático

## 🔐 Segurança

- Senhas criptografadas
- Sessão protegida
- Dados locais (não enviados para nuvem)

## 📞 Suporte

Se precisar de ajuda:
1. Verifique o README.md completo
2. Confira se as dependências estão instaladas
3. Tente limpar o cache do navegador

---

**Sistema desenvolvido com Next.js 16, TypeScript, shadcn/ui**  
**Interface moderna e profissional para controle de comissões** 💜
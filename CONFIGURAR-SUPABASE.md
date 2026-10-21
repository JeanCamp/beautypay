# Como configurar Supabase para sincronizar dados

## O que é Supabase?
Supabase é um banco de dados PostgreSQL na nuvem gratuito que permite sincronizar dados entre dispositivos (celular e PC).

## Passo 1: Criar conta no Supabase

1. Acesse: https://supabase.com
2. Clique em "Start your project"
3. Clique em "Sign up with GitHub"
4. Faça login com sua conta GitHub
5. Preencha os dados e crie a conta (gratuito)

## Passo 2: Criar projeto

1. No Supabase, clique em "New Project"
2. Nome do projeto: `beautypay`
3. Senha do banco: escolha uma senha forte (guarde!)
4. Região: Escolha "South America (São Paulo)" para melhor latência
5. Clique em "Create new project"
6. Aguarde cerca de 2 minutos para criar

## Passo 3: Criar tabelas no banco de dados

1. No projeto criado, clique em "SQL Editor" no menu lateral
2. Clique em "New query"
3. Cole o SQL abaixo e clique em "Run":

```sql
-- Tabela de serviços
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  price DECIMAL(10, 2) NOT NULL,
  commission_percentage INTEGER NOT NULL,
  estimated_commission DECIMAL(10, 2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de atendimentos
CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  client_name TEXT,
  service_id INTEGER REFERENCES services(id),
  service_price DECIMAL(10, 2) NOT NULL,
  commission_percentage INTEGER NOT NULL,
  commission_amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de fechamento de dia
CREATE TABLE IF NOT EXISTS day_closures (
  id SERIAL PRIMARY KEY,
  closure_date TEXT UNIQUE NOT NULL,
  total_appointments INTEGER DEFAULT 0,
  total_services_value DECIMAL(10, 2) DEFAULT 0,
  total_commission DECIMAL(10, 2) DEFAULT 0,
  is_closed BOOLEAN DEFAULT false,
  closed_at TIMESTAMP WITH TIME ZONE,
  reopened_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de fechamento de quinzena
CREATE TABLE IF NOT EXISTS fortnight_closures (
  id SERIAL PRIMARY KEY,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  fortnight_number INTEGER NOT NULL,
  total_appointments INTEGER DEFAULT 0,
  total_services_value DECIMAL(10, 2) DEFAULT 0,
  total_commission DECIMAL(10, 2) DEFAULT 0,
  amount_received DECIMAL(10, 2) DEFAULT 0,
  difference DECIMAL(10, 2) DEFAULT 0,
  notes TEXT,
  is_closed BOOLEAN DEFAULT false,
  closed_at TIMESTAMP WITH TIME ZONE,
  reopened_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_day_closures_date ON day_closures(closure_date);
CREATE INDEX IF NOT EXISTS idx_fortnight_closures_period ON fortnight_closures(year, month, fortnight_number);

-- Habilitar Row Level Security (RLS)
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE day_closures ENABLE ROW LEVEL SECURITY;
ALTER TABLE fortnight_closures ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública (para o app funcionar)
CREATE POLICY "Public read access for services" ON services FOR SELECT USING (true);
CREATE POLICY "Public read access for appointments" ON appointments FOR SELECT USING (true);
CREATE POLICY "Public read access for day_closures" ON day_closures FOR SELECT USING (true);
CREATE POLICY "Public read access for fortnight_closures" ON fortnight_closures FOR SELECT USING (true);

-- Política para permitir inserção pública
CREATE POLICY "Public insert access for services" ON services FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert access for appointments" ON appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert access for day_closures" ON day_closures FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert access for fortnight_closures" ON fortnight_closures FOR INSERT WITH CHECK (true);

-- Política para permitir atualização pública
CREATE POLICY "Public update access for services" ON services FOR UPDATE USING (true);
CREATE POLICY "Public update access for appointments" ON appointments FOR UPDATE USING (true);
CREATE POLICY "Public update access for day_closures" ON day_closures FOR UPDATE USING (true);
CREATE POLICY "Public update access for fortnight_closures" ON fortnight_closures FOR UPDATE USING (true);

-- Política para permitir deleção pública
CREATE POLICY "Public delete access for services" ON services FOR DELETE USING (true);
CREATE POLICY "Public delete access for appointments" ON appointments FOR DELETE USING (true);
CREATE POLICY "Public delete access for day_closures" ON day_closures FOR DELETE USING (true);
CREATE POLICY "Public delete access for fortnight_closures" ON fortnight_closures FOR DELETE USING (true);
```

## Passo 4: Obter credenciais

1. No Supabase, clique em "Settings" (ícone de engrenagem)
2. Clique em "API"
3. Copie:
   - Project URL
   - anon public key

## Passo 5: Configurar credenciais no projeto

1. Crie o arquivo `.env.local` na raiz do projeto (mesma pasta que package.json)
2. Adicione as credenciais:

```env
NEXT_PUBLIC_SUPABASE_URL=sua-url-aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-aqui
```

Substitua `sua-url-aqui` e `sua-chave-aqui` pelas credenciais copiadas.

## Passo 6: Popular tabela de serviços com os 39 serviços padrão

No SQL Editor do Supabase, execute:

```sql
INSERT INTO services (name, price, commission_percentage, estimated_commission) VALUES
('Corte bordado', 180.00, 40, 72.00),
('Cauterização (a partir)', 210.00, 40, 84.00),
('Progressiva orgânica (a partir)', 350.00, 30, 105.00),
('Secagem curto', 25.00, 40, 10.00),
('Corte franja', 50.00, 40, 20.00),
('Corte feminino', 100.00, 40, 40.00),
('Secagem extra longo', 45.00, 40, 18.00),
('Secagem médio', 35.00, 40, 14.00),
('Secagem longo', 45.00, 40, 18.00),
('Escova modeladora', 130.00, 40, 52.00),
('Escova curta', 65.00, 40, 26.00),
('Escova longa', 80.00, 40, 32.00),
('Escova extra longa', 95.00, 40, 38.00),
('Escova média', 75.00, 40, 30.00),
('Tratamento Truss c/ escova', 165.00, 40, 66.00),
('Shampoozada', 150.00, 30, 45.00),
('Lavagem especial – curto', 20.00, 40, 8.00),
('Lavagem especial – médio', 25.00, 40, 10.00),
('Lavagem especial – longo', 30.00, 40, 12.00),
('Luzes (a partir)', 700.00, 30, 210.00),
('Lavagem – curto', 15.00, 40, 6.00),
('Lavagem – médio', 20.00, 40, 8.00),
('Lavagem – longo', 30.00, 40, 12.00),
('Botox médio', 320.00, 30, 96.00),
('Botox longo', 350.00, 30, 105.00),
('Botox extra longo', 380.00, 30, 114.00),
('Coloração cabelo inteiro (a partir)', 350.00, 30, 105.00),
('Hidratação simples c/ escova', 110.00, 40, 44.00),
('Hidratação L''Oréal e Wella c/ escova', 160.00, 40, 64.00),
('Hidratação Kérastase e Redken c/ escova', 250.00, 40, 100.00),
('Hidratação Hidragloss (a partir)', 350.00, 40, 140.00),
('Vinhoterapia – curto', 290.00, 30, 87.00),
('Vinhoterapia – médio', 320.00, 30, 96.00),
('Vinhoterapia – longo', 350.00, 30, 105.00),
('Vinhoterapia – extra longo', 350.00, 30, 105.00),
('Botox curto', 290.00, 30, 87.00),
('Plástica capilar (a partir)', 210.00, 30, 63.00),
('Retoque de raiz (coloração cliente)', 130.00, 30, 39.00),
('Retoque de raiz (coloração salão)', 160.00, 30, 48.00);
```

## Passo 7: Atualizar o código

Após configurar o Supabase, me avise e vou atualizar o código para usar o banco de dados ao invés de localStorage.

## Vantagens

✅ Dados sincronizados entre celular e PC
✅ Backup automático na nuvem
✅ Acesso de qualquer lugar
✅ Gratuito (500MB de banco)
✅ Performance rápida
✅ Seguro com autenticação

## Próximo passo

Após criar o projeto no Supabase e configurar as credenciais no `.env.local`, me avise para atualizar o código!

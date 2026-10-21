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

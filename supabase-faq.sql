-- Script para criar a tabela de FAQs para SEO/GEO

CREATE TABLE faqs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  product_type_id UUID REFERENCES product_types(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Ativar RLS
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- Política de leitura pública
CREATE POLICY "FAQs are public" ON faqs
  FOR SELECT USING (true);

-- Política de CRUD para usuários autenticados
CREATE POLICY "Users can manage faqs" ON faqs
  FOR ALL USING (auth.role() = 'authenticated');

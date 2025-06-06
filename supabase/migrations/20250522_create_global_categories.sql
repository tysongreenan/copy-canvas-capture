-- Create global_categories table
CREATE TABLE IF NOT EXISTS global_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE
);

-- Add category_id column to global_knowledge if not exists
ALTER TABLE global_knowledge
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES global_categories(id);

-- Tag existing documents with default 'general' category
INSERT INTO global_categories (name)
  VALUES ('general')
  ON CONFLICT (name) DO NOTHING;
UPDATE global_knowledge
  SET category_id = (SELECT id FROM global_categories WHERE name = 'general')
  WHERE category_id IS NULL;

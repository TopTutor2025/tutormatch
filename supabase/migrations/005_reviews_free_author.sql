-- Permette recensioni admin con nome libero (senza profilo studente)
ALTER TABLE reviews ALTER COLUMN student_id DROP NOT NULL;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS author_name TEXT;

-- ============================================================
-- TRACCIAMENTO PUBBLICITÀ (campagne Facebook)
-- Per ogni giorno l'admin inserisce: post fatti e contatti ricevuti.
-- I "clienti chiusi" sono calcolati automaticamente dalle iscrizioni
-- studenti (profiles.role = 'studente') e non sono memorizzati qui.
-- ============================================================
CREATE TABLE IF NOT EXISTS ad_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  posts INT NOT NULL DEFAULT 0,
  contacts INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ad_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin gestisce ad_tracking" ON ad_tracking
  FOR ALL USING (get_user_role(auth.uid()) = 'admin');

CREATE TRIGGER update_ad_tracking_updated_at
  BEFORE UPDATE ON ad_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

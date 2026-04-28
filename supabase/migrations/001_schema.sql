-- ============================================================
-- TUTORMATCH - Schema Database Completo
-- Esegui questo file nel SQL Editor di Supabase
-- ============================================================

-- Abilita estensioni
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- per geolocalizzazione

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE user_role AS ENUM ('studente', 'tutor', 'admin');
CREATE TYPE school_grade AS ENUM ('medie', 'superiori', 'universita');
CREATE TYPE lesson_mode AS ENUM ('online', 'presenza', 'entrambe');
CREATE TYPE slot_status AS ENUM ('disponibile', 'prenotato', 'completato', 'bloccato');
CREATE TYPE booking_status AS ENUM ('confermato', 'completato', 'cancellato');
CREATE TYPE subscription_type AS ENUM ('mensile', 'annuale');
CREATE TYPE subscription_status AS ENUM ('attivo', 'scaduto', 'cancellato');
CREATE TYPE payment_status AS ENUM ('in_elaborazione', 'pagato');

-- ============================================================
-- TABELLA CONFIGURAZIONE PREZZI
-- ============================================================
CREATE TABLE pricing_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_monthly DECIMAL(10,2) NOT NULL DEFAULT 14.99,
  subscription_annual DECIMAL(10,2) NOT NULL DEFAULT 99.99,
  hour_rate_medie DECIMAL(10,2) NOT NULL DEFAULT 10.00,
  hour_rate_superiori DECIMAL(10,2) NOT NULL DEFAULT 10.00,
  hour_rate_universita DECIMAL(10,2) NOT NULL DEFAULT 12.50,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO pricing_config (id) VALUES (uuid_generate_v4());

-- ============================================================
-- MATERIE
-- ============================================================
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Materie iniziali
INSERT INTO subjects (name) VALUES
  ('Matematica'), ('Fisica'), ('Chimica'), ('Biologia'),
  ('Italiano'), ('Latino'), ('Greco'), ('Storia'), ('Geografia'),
  ('Inglese'), ('Francese'), ('Spagnolo'), ('Tedesco'),
  ('Informatica'), ('Filosofia'), ('Arte'), ('Musica'),
  ('Economia'), ('Diritto'), ('Scienze');

-- ============================================================
-- PROFILI UTENTE (estende auth.users di Supabase)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PROFILI TUTOR (dati aggiuntivi)
-- ============================================================
CREATE TABLE tutor_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  bio TEXT,
  fiscal_code TEXT NOT NULL,
  iban TEXT NOT NULL,
  iban_confirmed BOOLEAN DEFAULT FALSE,
  lesson_mode lesson_mode NOT NULL DEFAULT 'online',
  address TEXT,
  city TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  is_active BOOLEAN DEFAULT TRUE,
  terms_accepted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MATERIE PER TUTOR (many-to-many)
-- ============================================================
CREATE TABLE tutor_subjects (
  tutor_id UUID REFERENCES tutor_profiles(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  PRIMARY KEY (tutor_id, subject_id)
);

-- ============================================================
-- GRADI SCOLASTICI PER TUTOR
-- ============================================================
CREATE TABLE tutor_grades (
  tutor_id UUID REFERENCES tutor_profiles(id) ON DELETE CASCADE,
  grade school_grade NOT NULL,
  PRIMARY KEY (tutor_id, grade)
);

-- ============================================================
-- PROFILI STUDENTE (dati aggiuntivi)
-- ============================================================
CREATE TABLE student_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  hour_credits_medie INT DEFAULT 0,
  hour_credits_superiori INT DEFAULT 0,
  hour_credits_universita INT DEFAULT 0,
  terms_accepted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ABBONAMENTI STUDENTI
-- ============================================================
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type subscription_type NOT NULL,
  status subscription_status NOT NULL DEFAULT 'attivo',
  price DECIMAL(10,2) NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STORICO ACQUISTO ORE
-- ============================================================
CREATE TABLE hour_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  grade school_grade NOT NULL,
  hours INT NOT NULL,
  price_per_hour DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SLOT CALENDARIO TUTOR
-- ============================================================
CREATE TABLE calendar_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tutor_id UUID NOT NULL REFERENCES tutor_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status slot_status NOT NULL DEFAULT 'bloccato',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tutor_id, date, start_time)
);

-- ============================================================
-- PRENOTAZIONI
-- ============================================================
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tutor_id UUID NOT NULL REFERENCES tutor_profiles(id) ON DELETE CASCADE,
  slot_id UUID NOT NULL REFERENCES calendar_slots(id),
  subject_id UUID NOT NULL REFERENCES subjects(id),
  grade school_grade NOT NULL,
  mode lesson_mode NOT NULL,
  topic TEXT NOT NULL,
  address TEXT,
  status booking_status NOT NULL DEFAULT 'confermato',
  meet_link TEXT,
  hours_used INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RECENSIONI
-- ============================================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tutor_id UUID NOT NULL REFERENCES tutor_profiles(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(booking_id)
);

-- ============================================================
-- PREFERITI STUDENTI
-- ============================================================
CREATE TABLE favorites (
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  tutor_id UUID REFERENCES tutor_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (student_id, tutor_id)
);

-- ============================================================
-- PAGAMENTI TUTOR (record mensili auto-generati)
-- ============================================================
CREATE TABLE tutor_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tutor_id UUID NOT NULL REFERENCES tutor_profiles(id) ON DELETE CASCADE,
  month INT NOT NULL CHECK (month >= 1 AND month <= 12),
  year INT NOT NULL,
  completed_lessons INT NOT NULL DEFAULT 0,
  total_hours DECIMAL(10,2) NOT NULL DEFAULT 0,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  status payment_status NOT NULL DEFAULT 'in_elaborazione',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tutor_id, month, year)
);

-- ============================================================
-- CHAT
-- ============================================================
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tutor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_support BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, tutor_id)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FUNZIONI E TRIGGER
-- ============================================================

-- Funzione: crea profilo automaticamente dopo registrazione
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, role, first_name, last_name, email, phone)
  VALUES (
    NEW.id,
    (NEW.raw_user_meta_data->>'role')::user_role,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.email,
    NEW.raw_user_meta_data->>'phone'
  );

  IF (NEW.raw_user_meta_data->>'role') = 'studente' THEN
    INSERT INTO student_profiles (id) VALUES (NEW.id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Funzione: scade abbonamenti automaticamente
CREATE OR REPLACE FUNCTION expire_subscriptions()
RETURNS VOID AS $$
BEGIN
  UPDATE subscriptions
  SET status = 'scaduto'
  WHERE status = 'attivo' AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione: genera record pagamento mensile tutor (chiamata da cron)
CREATE OR REPLACE FUNCTION generate_monthly_payments()
RETURNS VOID AS $$
DECLARE
  current_month INT := EXTRACT(MONTH FROM NOW() - INTERVAL '1 month');
  current_year INT := EXTRACT(YEAR FROM NOW() - INTERVAL '1 month');
  tutor_record RECORD;
  lesson_count INT;
  total_hrs DECIMAL;
  amount DECIMAL;
BEGIN
  FOR tutor_record IN SELECT id FROM tutor_profiles LOOP
    SELECT
      COUNT(*),
      SUM(b.hours_used),
      SUM(b.hours_used * CASE b.grade
        WHEN 'universita' THEN (SELECT hour_rate_universita FROM pricing_config LIMIT 1)
        ELSE (SELECT hour_rate_medie FROM pricing_config LIMIT 1)
      END) * 0.70 -- tutor prende 70%
    INTO lesson_count, total_hrs, amount
    FROM bookings b
    JOIN calendar_slots cs ON b.slot_id = cs.id
    WHERE b.tutor_id = tutor_record.id
      AND b.status = 'completato'
      AND EXTRACT(MONTH FROM cs.date) = current_month
      AND EXTRACT(YEAR FROM cs.date) = current_year;

    IF lesson_count > 0 THEN
      INSERT INTO tutor_payments (tutor_id, month, year, completed_lessons, total_hours, amount)
      VALUES (tutor_record.id, current_month, current_year, lesson_count, COALESCE(total_hrs, 0), COALESCE(amount, 0))
      ON CONFLICT (tutor_id, month, year) DO NOTHING;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione: aggiorna updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_tutor_profiles_updated_at BEFORE UPDATE ON tutor_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_calendar_slots_updated_at BEFORE UPDATE ON calendar_slots FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE hour_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_config ENABLE ROW LEVEL SECURITY;

-- Helper: controlla ruolo utente
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
  SELECT role::TEXT FROM profiles WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER;

-- PROFILES policies
CREATE POLICY "Utenti vedono il proprio profilo" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Tutor pubblici visibili" ON profiles FOR SELECT USING (role = 'tutor');
CREATE POLICY "Aggiorna proprio profilo" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin vede tutti" ON profiles FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- SUBJECTS policies
CREATE POLICY "Tutti vedono materie" ON subjects FOR SELECT USING (TRUE);
CREATE POLICY "Solo admin gestisce materie" ON subjects FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- TUTOR_PROFILES policies
CREATE POLICY "Tutti vedono profili tutor attivi" ON tutor_profiles FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Tutor aggiorna proprio profilo" ON tutor_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin gestisce tutti tutor" ON tutor_profiles FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- TUTOR_SUBJECTS policies
CREATE POLICY "Tutti vedono materie tutor" ON tutor_subjects FOR SELECT USING (TRUE);
CREATE POLICY "Tutor gestisce proprie materie" ON tutor_subjects FOR ALL USING (auth.uid() = tutor_id);
CREATE POLICY "Admin gestisce materie tutor" ON tutor_subjects FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- TUTOR_GRADES policies
CREATE POLICY "Tutti vedono gradi tutor" ON tutor_grades FOR SELECT USING (TRUE);
CREATE POLICY "Tutor gestisce propri gradi" ON tutor_grades FOR ALL USING (auth.uid() = tutor_id);
CREATE POLICY "Admin gestisce gradi tutor" ON tutor_grades FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- STUDENT_PROFILES policies
CREATE POLICY "Studente vede proprio profilo" ON student_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Studente aggiorna proprio profilo" ON student_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin gestisce studenti" ON student_profiles FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- SUBSCRIPTIONS policies
CREATE POLICY "Studente vede propri abbonamenti" ON subscriptions FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Studente crea abbonamento" ON subscriptions FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Admin gestisce abbonamenti" ON subscriptions FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- HOUR_PURCHASES policies
CREATE POLICY "Studente vede propri acquisti ore" ON hour_purchases FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Studente acquista ore" ON hour_purchases FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Admin gestisce acquisti ore" ON hour_purchases FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- CALENDAR_SLOTS policies
CREATE POLICY "Tutti vedono slot disponibili" ON calendar_slots FOR SELECT USING (TRUE);
CREATE POLICY "Tutor gestisce propri slot" ON calendar_slots FOR ALL USING (auth.uid() = tutor_id);
CREATE POLICY "Admin gestisce tutti gli slot" ON calendar_slots FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- BOOKINGS policies
CREATE POLICY "Studente vede proprie prenotazioni" ON bookings FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Tutor vede proprie prenotazioni" ON bookings FOR SELECT USING (auth.uid() = tutor_id);
CREATE POLICY "Studente crea prenotazioni" ON bookings FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Tutor aggiorna stato prenotazione" ON bookings FOR UPDATE USING (auth.uid() = tutor_id);
CREATE POLICY "Admin gestisce tutte le prenotazioni" ON bookings FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- REVIEWS policies
CREATE POLICY "Tutti vedono recensioni" ON reviews FOR SELECT USING (TRUE);
CREATE POLICY "Studente crea recensione" ON reviews FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Admin gestisce recensioni" ON reviews FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- FAVORITES policies
CREATE POLICY "Studente gestisce preferiti" ON favorites FOR ALL USING (auth.uid() = student_id);

-- TUTOR_PAYMENTS policies
CREATE POLICY "Tutor vede propri pagamenti" ON tutor_payments FOR SELECT USING (auth.uid() = tutor_id);
CREATE POLICY "Admin gestisce pagamenti" ON tutor_payments FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- CONVERSATIONS policies
CREATE POLICY "Utente vede proprie conversazioni" ON conversations FOR SELECT USING (auth.uid() = student_id OR auth.uid() = tutor_id);
CREATE POLICY "Studente crea conversazione" ON conversations FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Admin vede tutte le conversazioni" ON conversations FOR SELECT USING (get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Admin crea conversazioni" ON conversations FOR INSERT WITH CHECK (get_user_role(auth.uid()) = 'admin');

-- MESSAGES policies
CREATE POLICY "Partecipanti vedono messaggi" ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = conversation_id
    AND (c.student_id = auth.uid() OR c.tutor_id = auth.uid())
  )
);
CREATE POLICY "Partecipanti inviano messaggi" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Admin gestisce messaggi" ON messages FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- PRICING_CONFIG policies
CREATE POLICY "Tutti vedono prezzi" ON pricing_config FOR SELECT USING (TRUE);
CREATE POLICY "Solo admin modifica prezzi" ON pricing_config FOR UPDATE USING (get_user_role(auth.uid()) = 'admin');

-- ============================================================
-- INDICI per performance
-- ============================================================
CREATE INDEX idx_calendar_slots_tutor_date ON calendar_slots(tutor_id, date);
CREATE INDEX idx_bookings_student ON bookings(student_id);
CREATE INDEX idx_bookings_tutor ON bookings(tutor_id);
CREATE INDEX idx_bookings_slot ON bookings(slot_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX idx_subscriptions_student ON subscriptions(student_id, status);
CREATE INDEX idx_tutor_payments_tutor_month ON tutor_payments(tutor_id, year, month);
CREATE INDEX idx_reviews_tutor ON reviews(tutor_id);

-- ============================================================
-- REALTIME (abilita per chat)
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE calendar_slots;
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;

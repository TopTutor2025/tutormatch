-- ============================================================
-- PACCHETTO SPOT
-- Ore "spot" a 20€/h, pacchetto fisso da 15 ore (300€).
-- Valide per qualsiasi grado (medie/superiori/università) e
-- utilizzabili SENZA abbonamento attivo.
-- ============================================================

-- 1. Nuovo contatore ore spot sul profilo studente
ALTER TABLE student_profiles
  ADD COLUMN IF NOT EXISTS hour_credits_spot INT NOT NULL DEFAULT 0;

-- 2. Marca gli acquisti spot nello storico.
--    grade diventa nullable perché le ore spot non sono legate a un grado.
ALTER TABLE hour_purchases
  ADD COLUMN IF NOT EXISTS is_spot BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE hour_purchases
  ALTER COLUMN grade DROP NOT NULL;

-- 3. Sulle prenotazioni, segna se sono state usate ore spot.
--    Serve al trigger per sapere da quale contatore scalare.
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS used_spot BOOLEAN NOT NULL DEFAULT false;

-- 4. Riscrive la funzione di scalo ore: se used_spot scala da hour_credits_spot,
--    altrimenti dal campo del grado (comportamento attuale invariato).
CREATE OR REPLACE FUNCTION public.on_booking_deduct_hours()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE field TEXT;
BEGIN
  IF NEW.used_spot THEN
    field := 'hour_credits_spot';
  ELSE
    field := CASE NEW.grade
      WHEN 'medie' THEN 'hour_credits_medie'
      WHEN 'superiori' THEN 'hour_credits_superiori'
      ELSE 'hour_credits_universita'
    END;
  END IF;
  EXECUTE format('UPDATE public.student_profiles SET %I = GREATEST(%I - $1, 0) WHERE id = $2', field, field)
    USING NEW.hours_used, NEW.student_id;
  RETURN NEW;
END;
$function$;

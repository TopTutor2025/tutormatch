-- ============================================================
-- LEZIONE DI PROVA
-- Una sola lezione di prova per account, 15€, valida per ogni grado,
-- SOLO online (1 ora) e utilizzabile SENZA abbonamento.
-- ============================================================

-- 1. Credito prova + flag "già acquistata" (blocca il riacquisto a vita)
ALTER TABLE student_profiles
  ADD COLUMN IF NOT EXISTS hour_credits_trial INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS trial_purchased BOOLEAN NOT NULL DEFAULT false;

-- 2. Marca l'acquisto della prova nello storico
ALTER TABLE hour_purchases
  ADD COLUMN IF NOT EXISTS is_trial BOOLEAN NOT NULL DEFAULT false;

-- 3. Sulle prenotazioni, segna se è stata usata la lezione di prova
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS used_trial BOOLEAN NOT NULL DEFAULT false;

-- 4. Aggiorna lo scalo ore: priorità prova -> spot -> grado
CREATE OR REPLACE FUNCTION public.on_booking_deduct_hours()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE field TEXT;
BEGIN
  IF NEW.used_trial THEN
    field := 'hour_credits_trial';
  ELSIF NEW.used_spot THEN
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

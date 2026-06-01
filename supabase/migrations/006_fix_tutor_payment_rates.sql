-- Fix: tariffe compenso tutor hardcoded invece di leggere da pricing_config
-- I compensi tutor sono fissi: medie 10€/h, superiori 10€/h, università 12.50€/h
-- e non devono cambiare se l'admin aggiorna il prezzo delle ore per gli studenti.

-- 1. Aggiorna la funzione con tariffe fisse hardcoded
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
        WHEN 'universita' THEN 12.50
        WHEN 'superiori'  THEN 10.00
        ELSE                   10.00
      END)
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

-- 2. Corregge i record di maggio 2026 già generati con il calcolo errato
--    Ricalcola l'importo dalle prenotazioni reali con le tariffe corrette
UPDATE tutor_payments tp
SET amount = (
  SELECT COALESCE(SUM(b.hours_used * CASE b.grade
    WHEN 'universita' THEN 12.50
    WHEN 'superiori'  THEN 10.00
    ELSE                   10.00
  END), 0)
  FROM bookings b
  JOIN calendar_slots cs ON b.slot_id = cs.id
  WHERE b.tutor_id = tp.tutor_id
    AND b.status = 'completato'
    AND EXTRACT(MONTH FROM cs.date) = tp.month
    AND EXTRACT(YEAR FROM cs.date) = tp.year
)
WHERE tp.month = 5 AND tp.year = 2026;

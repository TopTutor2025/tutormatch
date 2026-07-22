-- ============================================================
-- Impedisce prenotazioni duplicate sullo stesso slot.
-- Le prenotazioni cancellate liberano lo slot, quindi il vincolo le esclude.
--
-- IMPORTANTE: eseguire PRIMA la pulizia dei doppioni esistenti
-- (vedi query di dedup fornita), altrimenti la creazione dell'indice fallisce.
-- ============================================================
CREATE UNIQUE INDEX IF NOT EXISTS uniq_bookings_slot_active
  ON bookings (slot_id)
  WHERE status <> 'cancellato';

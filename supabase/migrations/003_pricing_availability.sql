-- Aggiunge flag di disponibilità per i tipi di abbonamento
ALTER TABLE pricing_config
  ADD COLUMN IF NOT EXISTS mensile_enabled BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS annuale_enabled BOOLEAN NOT NULL DEFAULT true;

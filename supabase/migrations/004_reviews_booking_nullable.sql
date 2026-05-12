-- Rende booking_id nullable per permettere all'admin di creare recensioni senza una prenotazione
ALTER TABLE reviews ALTER COLUMN booking_id DROP NOT NULL;

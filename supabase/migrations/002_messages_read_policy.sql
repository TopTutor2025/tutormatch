-- Aggiunge policy UPDATE per permettere ai partecipanti di segnare i messaggi come letti
CREATE POLICY "Partecipanti segnano messaggi come letti" ON messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = conversation_id
      AND (c.student_id = auth.uid() OR c.tutor_id = auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = conversation_id
      AND (c.student_id = auth.uid() OR c.tutor_id = auth.uid())
  )
);

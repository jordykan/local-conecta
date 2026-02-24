-- ============================================
-- Fix: Allow users to read all messages in conversations they participate in
-- ============================================
-- The original policy only let users read messages they sent (sender_id = auth.uid()).
-- Messages sent TO them by business owners were invisible.
--
-- We use a SECURITY DEFINER function to check conversation participation
-- without hitting a circular RLS reference on the messages table.

-- Helper function: checks if the current user has sent at least one message
-- in the given conversation. SECURITY DEFINER bypasses RLS for this check.
CREATE OR REPLACE FUNCTION public.is_conversation_participant(conv_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM messages
    WHERE conversation_id = conv_id AND sender_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Replace the old policy
DROP POLICY IF EXISTS "messages_read_involved" ON messages;

CREATE POLICY "messages_read_involved" ON messages
  FOR SELECT USING (
    auth.uid() = sender_id
    OR business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
    OR public.is_conversation_participant(conversation_id)
);

-- ============================================
-- Fix: Allow users to mark messages as read
-- ============================================
-- The current UPDATE policy only allows business owners to update messages.
-- We need to allow ANY user to mark messages as READ (set read_at)
-- for messages they RECEIVED (not sent).

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "messages_update_business_owner" ON messages;

-- New policy: Allow business owners to update their business messages
CREATE POLICY "messages_update_business_owner" ON messages
  FOR UPDATE USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

-- New policy: Allow users to mark messages as read that they received
CREATE POLICY "messages_mark_as_read" ON messages
  FOR UPDATE USING (
    -- User is in the conversation (participant)
    public.is_conversation_participant(conversation_id)
    -- Message was NOT sent by them (they received it)
    AND sender_id != auth.uid()
  );

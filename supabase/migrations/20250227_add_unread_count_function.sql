-- Function to count unread messages for a user
CREATE OR REPLACE FUNCTION get_unread_count(user_uuid uuid)
RETURNS bigint AS $$
  SELECT COUNT(*)
  FROM messages
  WHERE
    -- Messages in conversations where user is NOT the business owner
    conversation_id IN (
      SELECT id FROM conversations
      WHERE user_id = user_uuid
    )
    AND sender_id != user_uuid  -- Not sent by the user
    AND read_at IS NULL;        -- Not read yet
$$ LANGUAGE sql SECURITY DEFINER;

-- Index for faster queries on unread messages
CREATE INDEX IF NOT EXISTS idx_messages_unread
ON messages(conversation_id, sender_id, read_at)
WHERE read_at IS NULL;

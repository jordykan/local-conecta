-- Migration: Enable Realtime and add read_at field for messages
-- Description: Prepares the messages table for real-time chat functionality

-- 1. Add read_at column to track when a message was read
ALTER TABLE messages
ADD COLUMN read_at timestamptz;

-- 2. Migrate existing is_read values to read_at
-- Set read_at to created_at for messages that are already marked as read
UPDATE messages
SET read_at = created_at
WHERE is_read = true AND read_at IS NULL;

-- 3. Create index for unread messages queries (recipient_id will be checked in app logic)
CREATE INDEX IF NOT EXISTS idx_messages_unread
ON messages(conversation_id, read_at)
WHERE read_at IS NULL;

-- 4. Create function to count unread messages for a user
CREATE OR REPLACE FUNCTION get_unread_count(user_uuid uuid)
RETURNS bigint AS $$
  SELECT COUNT(*)
  FROM messages
  WHERE
    -- Messages in conversations where user participated
    conversation_id IN (
      SELECT DISTINCT conversation_id
      FROM messages
      WHERE sender_id = user_uuid
    )
    -- Not sent by the user
    AND sender_id != user_uuid
    -- Not read yet
    AND read_at IS NULL;
$$ LANGUAGE sql SECURITY DEFINER;

-- 5. Create function to count unread messages for a business
CREATE OR REPLACE FUNCTION get_business_unread_count(business_uuid uuid)
RETURNS bigint AS $$
  SELECT COUNT(*)
  FROM messages m
  WHERE
    m.business_id = business_uuid
    -- Message was sent TO the business (not by business owner)
    AND m.sender_id NOT IN (
      SELECT owner_id FROM businesses WHERE id = business_uuid
    )
    -- Not read yet
    AND m.read_at IS NULL;
$$ LANGUAGE sql SECURITY DEFINER;

-- 6. Enable Realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- 7. Create a view for conversation metadata (optional, for easier querying)
CREATE OR REPLACE VIEW conversation_metadata AS
SELECT
  m.conversation_id,
  m.business_id,
  MAX(m.created_at) as last_message_at,
  COUNT(*) FILTER (WHERE m.read_at IS NULL) as unread_count
FROM messages m
GROUP BY m.conversation_id, m.business_id;

-- 8. Grant necessary permissions
GRANT SELECT ON conversation_metadata TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_count(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_business_unread_count(uuid) TO authenticated;

-- Note: To enable Realtime in Supabase Dashboard:
-- 1. Go to Database > Replication
-- 2. Enable replication for the 'messages' table
-- 3. Choose events: INSERT, UPDATE (we don't need DELETE for messages)

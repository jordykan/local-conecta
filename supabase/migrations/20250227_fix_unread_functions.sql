-- ============================================
-- Fix: Correct unread count functions
-- ============================================
-- The previous migration used a non-existent "conversations" table.
-- We use the approach from 004_realtime_messages.sql which works correctly.

-- Drop incorrect functions
DROP FUNCTION IF EXISTS get_unread_count(uuid);
DROP FUNCTION IF EXISTS get_business_unread_count(uuid);

-- Recreate correct function for user unread count
CREATE OR REPLACE FUNCTION get_unread_count(user_uuid uuid)
RETURNS bigint AS $$
  SELECT COUNT(*)
  FROM messages
  WHERE
    -- Messages in conversations where user participated (sent at least one message)
    conversation_id IN (
      SELECT DISTINCT conversation_id
      FROM messages
      WHERE sender_id = user_uuid
    )
    -- Not sent by the user (they received it)
    AND sender_id != user_uuid
    -- Not read yet
    AND read_at IS NULL;
$$ LANGUAGE sql SECURITY DEFINER;

-- Recreate function for business unread count
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_unread_count(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_business_unread_count(uuid) TO authenticated;

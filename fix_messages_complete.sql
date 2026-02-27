-- ============================================
-- COMPLETE FIX: Messages, Policies, and Functions
-- ============================================
-- This script fixes all issues with marking messages as read
-- and counting unread messages.
--
-- Execute this in Supabase SQL Editor

-- ============================================
-- 1. Fix UPDATE policies for messages
-- ============================================

-- Drop old policies
DROP POLICY IF EXISTS "messages_update_business_owner" ON messages;
DROP POLICY IF EXISTS "messages_mark_as_read" ON messages;

-- Single unified policy for marking messages as read
CREATE POLICY "messages_mark_as_read" ON messages
  FOR UPDATE USING (
    -- Message was NOT sent by current user (they received it)
    sender_id != auth.uid()
    AND (
      -- Case 1: Personal messages - user is in the conversation (participant)
      public.is_conversation_participant(conversation_id)
      OR
      -- Case 2: Business messages - user owns the business
      business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
    )
  );

-- ============================================
-- 2. Fix unread count functions
-- ============================================

-- Drop old functions
DROP FUNCTION IF EXISTS get_unread_count(uuid);
DROP FUNCTION IF EXISTS get_business_unread_count(uuid);

-- Function to count PERSONAL unread messages for a user
-- (excludes business messages to avoid double counting)
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
    AND read_at IS NULL
    -- IMPORTANT: Exclude business messages (to avoid double counting)
    AND business_id IS NULL;
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to count BUSINESS unread messages
-- (all messages to the business, regardless of personal participation)
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

-- ============================================
-- 3. Verify helper function exists
-- ============================================

-- Ensure is_conversation_participant function exists
CREATE OR REPLACE FUNCTION public.is_conversation_participant(conv_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM messages
    WHERE conversation_id = conv_id AND sender_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- Done! Test by:
-- 1. Opening a chat with unread messages
-- 2. Messages should be marked as read automatically
-- 3. Check console for [markAllAsRead] logs
-- ============================================

-- ============================================
-- DEBUG: Check unread count discrepancy
-- ============================================
-- Run this in Supabase SQL Editor to see what's being counted
--
-- Replace YOUR_USER_ID and YOUR_BUSINESS_ID with actual values

-- 1. Get your user ID (if you're logged in)
SELECT auth.uid() as my_user_id;

-- 2. Get your business ID (if you're a business owner)
SELECT id, name FROM businesses WHERE owner_id = auth.uid();

-- 3. Count personal unread messages
-- (messages in conversations where you participated, not sent by you, not read)
SELECT
  COUNT(*) as personal_unread_count,
  json_agg(json_build_object(
    'id', m.id,
    'conversation_id', m.conversation_id,
    'content', m.content,
    'sender_id', m.sender_id,
    'business_id', m.business_id,
    'created_at', m.created_at
  )) as personal_messages
FROM messages m
WHERE
  m.conversation_id IN (
    SELECT DISTINCT conversation_id
    FROM messages
    WHERE sender_id = auth.uid()
  )
  AND m.sender_id != auth.uid()
  AND m.read_at IS NULL;

-- 4. Count business unread messages
-- (Replace 'YOUR_BUSINESS_ID' with actual business ID from step 2)
SELECT
  COUNT(*) as business_unread_count,
  json_agg(json_build_object(
    'id', m.id,
    'conversation_id', m.conversation_id,
    'content', m.content,
    'sender_id', m.sender_id,
    'business_id', m.business_id,
    'created_at', m.created_at
  )) as business_messages
FROM messages m
WHERE
  m.business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  AND m.sender_id != auth.uid()
  AND m.read_at IS NULL;

-- 5. Check for DUPLICATES (messages counted in both categories)
-- These would be messages with a business_id where the owner also participated
SELECT
  COUNT(*) as duplicate_count,
  json_agg(json_build_object(
    'id', m.id,
    'conversation_id', m.conversation_id,
    'content', m.content,
    'business_id', m.business_id
  )) as duplicate_messages
FROM messages m
WHERE
  m.business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  AND m.sender_id != auth.uid()
  AND m.read_at IS NULL
  AND m.conversation_id IN (
    SELECT DISTINCT conversation_id
    FROM messages
    WHERE sender_id = auth.uid()
  );

-- 6. Expected total (without duplicates)
SELECT
  COUNT(DISTINCT m.id) as actual_unique_unread_count
FROM messages m
WHERE
  m.sender_id != auth.uid()
  AND m.read_at IS NULL
  AND (
    -- Personal messages
    m.conversation_id IN (
      SELECT DISTINCT conversation_id
      FROM messages
      WHERE sender_id = auth.uid()
    )
    OR
    -- Business messages
    m.business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

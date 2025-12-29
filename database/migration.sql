-- Migration script to add engagement metrics to existing twitter_posts table
-- Run this on your Supabase database to update the schema

-- Add new columns for engagement metrics
ALTER TABLE twitter_posts 
ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS retweet_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS metrics_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing records to have 0 for all metrics (if NULL)
UPDATE twitter_posts 
SET 
  comment_count = COALESCE(comment_count, 0),
  retweet_count = COALESCE(retweet_count, 0),
  like_count = COALESCE(like_count, 0),
  view_count = COALESCE(view_count, 0)
WHERE 
  comment_count IS NULL 
  OR retweet_count IS NULL 
  OR like_count IS NULL 
  OR view_count IS NULL;

-- Create indexes for efficient sorting
CREATE INDEX IF NOT EXISTS idx_twitter_posts_comment_count ON twitter_posts(comment_count DESC);
CREATE INDEX IF NOT EXISTS idx_twitter_posts_retweet_count ON twitter_posts(retweet_count DESC);
CREATE INDEX IF NOT EXISTS idx_twitter_posts_like_count ON twitter_posts(like_count DESC);
CREATE INDEX IF NOT EXISTS idx_twitter_posts_view_count ON twitter_posts(view_count DESC);

-- Verify the migration
SELECT 
  COUNT(*) as total_posts,
  COUNT(CASE WHEN comment_count = 0 THEN 1 END) as posts_with_zero_comments,
  COUNT(CASE WHEN retweet_count = 0 THEN 1 END) as posts_with_zero_retweets,
  COUNT(CASE WHEN like_count = 0 THEN 1 END) as posts_with_zero_likes,
  COUNT(CASE WHEN view_count = 0 THEN 1 END) as posts_with_zero_views
FROM twitter_posts;

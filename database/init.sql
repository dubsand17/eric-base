-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建Twitter帖子表
CREATE TABLE IF NOT EXISTS twitter_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  content TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  tweet_created_at TIMESTAMP WITH TIME ZONE,
  tweet_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- 互动指标
  comment_count INTEGER DEFAULT 0,
  retweet_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  metrics_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_twitter_posts_created_at ON twitter_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_twitter_posts_tweet_created_at ON twitter_posts(tweet_created_at DESC);
CREATE INDEX IF NOT EXISTS idx_twitter_posts_comment_count ON twitter_posts(comment_count DESC);
CREATE INDEX IF NOT EXISTS idx_twitter_posts_retweet_count ON twitter_posts(retweet_count DESC);
CREATE INDEX IF NOT EXISTS idx_twitter_posts_like_count ON twitter_posts(like_count DESC);
CREATE INDEX IF NOT EXISTS idx_twitter_posts_view_count ON twitter_posts(view_count DESC);

-- 启用行级安全策略（可选）
ALTER TABLE twitter_posts ENABLE ROW LEVEL SECURITY;

-- 创建允许所有用户读取的策略
CREATE POLICY "Allow public read access" ON twitter_posts
  FOR SELECT USING (true);

-- 创建允许插入的策略（用于API）
CREATE POLICY "Allow insert access" ON twitter_posts
  FOR INSERT WITH CHECK (true); 
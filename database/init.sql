-- 创建Twitter帖子表
CREATE TABLE IF NOT EXISTS twitter_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  tweet_created_at TIMESTAMP WITH TIME ZONE,
  tweet_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_twitter_posts_created_at ON twitter_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_twitter_posts_tweet_created_at ON twitter_posts(tweet_created_at DESC);

-- 启用行级安全策略（可选）
ALTER TABLE twitter_posts ENABLE ROW LEVEL SECURITY;

-- 创建允许所有用户读取的策略
CREATE POLICY "Allow public read access" ON twitter_posts
  FOR SELECT USING (true);

-- 创建允许插入的策略（用于API）
CREATE POLICY "Allow insert access" ON twitter_posts
  FOR INSERT WITH CHECK (true); 
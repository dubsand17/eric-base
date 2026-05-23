-- Migration: 添加推文分组功能
-- post_groups 表 + twitter_posts.group_id 外键

-- 创建分组表
CREATE TABLE IF NOT EXISTS post_groups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT,
  cover_image TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_post_groups_updated ON post_groups(updated_at DESC);

-- twitter_posts 加 group_id 外键
ALTER TABLE twitter_posts
ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES post_groups(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_twitter_posts_group ON twitter_posts(group_id);

-- RLS 策略
ALTER TABLE post_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON post_groups
  FOR SELECT USING (true);

CREATE POLICY "Allow insert access" ON post_groups
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update access" ON post_groups
  FOR UPDATE USING (true);

-- 验证
SELECT 'post_groups table created' AS status,
  (SELECT COUNT(*) FROM post_groups) AS group_count;

SELECT 'group_id column added' AS status,
  (SELECT COUNT(*) FROM twitter_posts WHERE group_id IS NOT NULL) AS grouped_posts;

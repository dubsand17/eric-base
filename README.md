# Twitter Content Showcase

一个清爽的Twitter内容展示网站，采用瀑布流布局，参考read.cv的设计风格。

## 功能特点

- 🎨 清爽的卡片式设计
- 📱 响应式瀑布流布局
- 🖼️ 支持多图片展示
- ⚡ 基于Next.js 14构建
- 🗄️ 使用Supabase免费数据库
- 🔌 Chrome扩展采集工具

## 技术栈

- **前端**: Next.js 14, React, TypeScript, Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: Supabase (PostgreSQL)
- **部署**: Vercel
- **采集工具**: Chrome Extension

## 快速开始

### 1. 环境设置

```bash
# 克隆项目
git clone <your-repo-url>
cd twitter-content-showcase

# 安装依赖
npm install
```

### 2. 数据库设置

1. 访问 [Supabase](https://supabase.com) 创建免费账户
2. 创建新项目
3. 在SQL编辑器中运行以下SQL创建表：

```sql
CREATE TABLE twitter_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  tweet_id TEXT NOT NULL,
  username TEXT NOT NULL,
  profile_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_twitter_posts_created_at ON twitter_posts(created_at DESC);
CREATE INDEX idx_twitter_posts_tweet_id ON twitter_posts(tweet_id);
```

4. 获取项目URL和API密钥
5. 创建 `.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 本地开发

```bash
npm run dev
```

访问 http://localhost:3000

### 4. Chrome扩展设置

1. 打开Chrome扩展管理页面 (`chrome://extensions/`)
2. 启用"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择 `chrome-extension` 文件夹
5. 在 `popup.js` 中更新 `YOUR_VERCEL_URL` 为你的实际部署URL

### 5. 部署到Vercel

1. 将代码推送到GitHub
2. 在 [Vercel](https://vercel.com) 中导入项目
3. 添加环境变量：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. 部署完成

## 使用方法

1. 在Twitter上浏览想要采集的推文
2. 点击Chrome扩展图标
3. 点击"采集当前推文"
4. 内容会自动保存到数据库并显示在网站上

## 项目结构

```
├── app/                    # Next.js 13+ App Router
│   ├── api/               # API路由
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 主页面
├── components/            # React组件
│   ├── TwitterCard.tsx    # 推文卡片组件
│   └── MasonryGrid.tsx    # 瀑布流布局组件
├── lib/                   # 工具库
│   └── supabase.ts        # Supabase配置
├── chrome-extension/      # Chrome扩展
│   ├── manifest.json      # 扩展配置
│   ├── popup.html         # 弹出窗口
│   ├── popup.js           # 弹出窗口逻辑
│   └── content.js         # 内容脚本
└── README.md              # 项目说明
```

## 自定义

- 修改 `tailwind.config.js` 调整颜色主题
- 编辑 `components/TwitterCard.tsx` 自定义卡片样式
- 调整 `app/globals.css` 中的瀑布流布局

## 许可证

MIT 
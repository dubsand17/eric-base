# Twitter 互动数据更新脚本

这个目录包含用于批量更新 Twitter 互动数据的脚本。

## 脚本说明

### `scrape-metrics.js` - Puppeteer 爬虫 ⭐

使用 Puppeteer 自动化浏览器从 Twitter 页面抓取真实的互动数据。

**前置要求：**
```bash
npm install puppeteer dotenv
```

**使用方法：**
```bash
node scripts/scrape-metrics.js [选项]
```

**选项：**
- `--limit <数量>` - 限制更新的推文数量
- `--older-than <天数>` - 只更新指标超过 X 天未更新的推文
- `--recent-days <天数>` - 只更新最近 X 天内发布的推文
- `--id <推文ID>` - 更新指定 ID 的单条推文
- `--dry-run` - 预览模式，显示将要更新的内容但不实际修改
- `--headless <true|false>` - 是否使用无头模式运行浏览器（默认：true）

**使用示例：**

```bash
# 测试模式：预览前 5 条推文
node scripts/scrape-metrics.js --limit 5 --dry-run

# 更新单条推文
node scripts/scrape-metrics.js --id 22f94b52-a7e2-4a73-9239-ab39cb80b44f

# 更新最近 7 天的推文
node scripts/scrape-metrics.js --recent-days 7

# 更新 7 天前的旧数据
node scripts/scrape-metrics.js --older-than 7

# 更新前 50 条最旧的推文
node scripts/scrape-metrics.js --limit 50

# 可视化模式运行（调试用）
node scripts/scrape-metrics.js --limit 5 --headless false
```

**功能特性：**
- ✅ 使用无头浏览器抓取真实数据
- ✅ 提取评论、转发、点赞和观看量
- ✅ 自动更新 `metrics_updated_at` 时间戳
- ✅ 显示进度和汇总统计
- ✅ 优雅处理错误
- ✅ 请求间自动延迟避免限流
- ✅ 支持预览模式
- ✅ 支持单条推文更新
- ✅ 支持按时间范围筛选

**输出示例：**
```
🚀 Twitter Metrics Scraper (Puppeteer)
Options: { limit: 5, olderThanDays: null, recentDays: null, postId: null, dryRun: false, headless: true }

🌐 Launching browser...
✅ Browser ready

📥 Fetching posts from database...
✅ Found 5 posts to process

[1/5]
📝 Processing: abc-123-def
  Content: 这是一条示例推文...
  URL: https://x.com/user/status/123456
  Current: 10💬 20🔄 30❤️ 1000👁
  🌐 Navigating to: https://x.com/user/status/123456
  New:     15💬 25🔄 45❤️ 1500👁
  ✅ Updated successfully

...

==================================================
📊 Summary
==================================================
Total posts processed: 5
✅ Successfully updated: 4
   - With changes: 3
   - No changes: 1
⏭️  Skipped: 1
❌ Failed: 0
```

---

## 重要提示

### 限流问题

Twitter 可能会对自动化爬虫进行限流或封禁。为了降低风险：

1. **使用延迟** - 脚本在请求之间包含 2 秒延迟
2. **限制批量大小** - 不要一次性更新所有推文
3. **使用 `--older-than`** - 只更新过期的数据
4. **考虑使用 Twitter API** - 生产环境建议使用官方 API

### Twitter API 替代方案

对于更稳定的解决方案，可以考虑使用 Twitter API：

**优点：**
- ✅ 更可靠
- ✅ 更快速
- ✅ 不会被封禁
- ✅ 官方支持

**缺点：**
- ❌ 需要 API 凭证
- ❌ 可能有速率限制
- ❌ 完整访问可能需要付费

---

## 定时更新

可以使用 cron（Linux/Mac）或任务计划程序（Windows）定期运行这些脚本。

### Cron 示例（Linux/Mac）

```bash
# 编辑 crontab
crontab -e

# 添加此行以在每天凌晨 2 点运行
0 2 * * * cd /path/to/eric-base && node scripts/scrape-metrics.js --older-than 1 >> /var/log/twitter-metrics.log 2>&1
```

### GitHub Actions 示例

创建 `.github/workflows/update-metrics.yml`：

```yaml
name: Update Twitter Metrics

on:
  schedule:
    # 每天 UTC 时间 2 点运行
    - cron: '0 2 * * *'
  workflow_dispatch: # 允许手动触发

jobs:
  update-metrics:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm install puppeteer
      - run: node scripts/scrape-metrics.js --older-than 1
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
```

---

## 故障排除

### Puppeteer 安装问题

如果 Puppeteer 安装失败：

```bash
# 安装依赖（Ubuntu/Debian）
sudo apt-get install -y \
  gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 \
  libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 \
  libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 \
  libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 \
  libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 \
  libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates \
  fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget

# 然后安装 Puppeteer
npm install puppeteer
```

### Twitter 封禁请求

如果 Twitter 封禁你的请求：

1. 尝试非无头模式运行：`--headless false`
2. 增加请求间延迟时间
3. 使用住宅代理
4. 考虑改用 Twitter API

### 数据库连接问题

确保环境变量已设置：

```bash
export NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

或创建 `.env.local` 文件（脚本会自动加载）：

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 常见使用场景

### 1. 首次运行 - 更新所有数据
```bash
# 分批更新，避免一次性处理太多
node scripts/scrape-metrics.js --limit 50
# 完成后再运行
node scripts/scrape-metrics.js --limit 50
# 重复直到所有数据更新完成
```

### 2. 日常维护 - 只更新旧数据
```bash
# 每天运行一次，更新 7 天前的数据
node scripts/scrape-metrics.js --older-than 7
```

### 3. 更新最新推文
```bash
# 更新最近 3 天的推文
node scripts/scrape-metrics.js --recent-days 3
```

### 4. 调试单条推文
```bash
# 更新特定推文查看详细输出
node scripts/scrape-metrics.js --id <推文ID> --headless false
```

---

## 性能建议

1. **首次运行**：使用 `--limit` 分批处理，每批 50-100 条
2. **日常更新**：使用 `--older-than 7` 只更新一周前的数据
3. **最新数据**：使用 `--recent-days 3` 更新最近的推文
4. **单条调试**：使用 `--id` 测试特定推文

---

## 贡献

欢迎改进这些脚本！一些想法：

- 添加 Twitter API 支持
- 实现失败请求的重试逻辑
- 添加进度条
- 导出结果到 CSV
- 完成时发送通知
- 添加更多过滤选项

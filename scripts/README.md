# Twitter Metrics Update Scripts

This directory contains scripts for batch updating Twitter engagement metrics.

## Scripts

### 1. `update-metrics.js` - Basic Template

A template script that shows the structure for batch updating metrics. **Note:** This script doesn't actually scrape Twitter - it's a starting point for you to implement your own solution.

**Usage:**
```bash
node scripts/update-metrics.js [options]
```

**Options:**
- `--limit <number>` - Limit the number of posts to update
- `--older-than <days>` - Only update posts where metrics are older than X days
- `--dry-run` - Show what would be updated without making changes

**Example:**
```bash
# Dry run for the 10 oldest posts
node scripts/update-metrics.js --limit 10 --dry-run

# Update posts older than 7 days
node scripts/update-metrics.js --older-than 7
```

---

### 2. `scrape-metrics.js` - Puppeteer Scraper ⭐

An advanced script that uses Puppeteer to actually scrape engagement metrics from Twitter pages.

**Prerequisites:**
```bash
npm install puppeteer
```

**Usage:**
```bash
node scripts/scrape-metrics.js [options]
```

**Options:**
- `--limit <number>` - Limit the number of posts to update
- `--older-than <days>` - Only update posts where metrics are older than X days
- `--dry-run` - Show what would be updated without making changes
- `--headless <true|false>` - Run browser in headless mode (default: true)

**Examples:**
```bash
# Test with 5 posts in visible browser mode
node scripts/scrape-metrics.js --limit 5 --headless false

# Dry run to see what would be updated
node scripts/scrape-metrics.js --limit 10 --dry-run

# Update all posts older than 7 days
node scripts/scrape-metrics.js --older-than 7

# Update the 50 oldest posts
node scripts/scrape-metrics.js --limit 50
```

**Features:**
- ✅ Uses headless browser to scrape real metrics
- ✅ Extracts comments, retweets, likes, and views
- ✅ Updates `metrics_updated_at` timestamp
- ✅ Shows progress and summary
- ✅ Handles errors gracefully
- ✅ Respects rate limiting with delays
- ✅ Supports dry-run mode

**Output Example:**
```
🚀 Twitter Metrics Scraper (Puppeteer)
Options: { limit: 5, olderThanDays: null, dryRun: false, headless: true }

🌐 Launching browser...
✅ Browser ready

📥 Fetching posts from database...
✅ Found 5 posts to process

[1/5]
📝 Processing: abc-123-def
  Content: This is an example tweet...
  URL: https://twitter.com/user/status/123456
  Current: 10💬 20🔄 30❤️ 1000👁
  🌐 Navigating to: https://twitter.com/user/status/123456
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

## Important Notes

### Rate Limiting

Twitter may rate limit or block automated scraping. To minimize this:

1. **Use delays** - The scripts include 2-second delays between requests
2. **Limit batch size** - Don't try to update all posts at once
3. **Use `--older-than`** - Only update stale metrics
4. **Consider Twitter API** - For production use, consider using the official Twitter API

### Twitter API Alternative

For a more robust solution, consider using the Twitter API:

1. Sign up for Twitter Developer account
2. Get API credentials
3. Use the Twitter API v2 to fetch tweet metrics
4. Modify the scripts to use the API instead of scraping

**Benefits:**
- ✅ More reliable
- ✅ Faster
- ✅ No risk of being blocked
- ✅ Official support

**Drawbacks:**
- ❌ Requires API credentials
- ❌ May have rate limits
- ❌ May require paid tier for full access

---

## Scheduling Updates

You can schedule these scripts to run periodically using cron (Linux/Mac) or Task Scheduler (Windows).

### Cron Example (Linux/Mac)

```bash
# Edit crontab
crontab -e

# Add this line to run daily at 2 AM
0 2 * * * cd /path/to/eric-base && node scripts/scrape-metrics.js --older-than 1 >> /var/log/twitter-metrics.log 2>&1
```

### GitHub Actions Example

Create `.github/workflows/update-metrics.yml`:

```yaml
name: Update Twitter Metrics

on:
  schedule:
    # Run daily at 2 AM UTC
    - cron: '0 2 * * *'
  workflow_dispatch: # Allow manual trigger

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

## Troubleshooting

### Puppeteer Installation Issues

If Puppeteer fails to install:

```bash
# Install dependencies (Ubuntu/Debian)
sudo apt-get install -y \
  gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 \
  libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 \
  libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 \
  libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 \
  libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 \
  libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates \
  fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget

# Then install Puppeteer
npm install puppeteer
```

### Twitter Blocking Requests

If Twitter blocks your requests:

1. Try running in non-headless mode: `--headless false`
2. Add longer delays between requests
3. Use residential proxies
4. Consider using Twitter API instead

### Database Connection Issues

Make sure your environment variables are set:

```bash
export NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

Or create a `.env.local` file and use `dotenv`:

```bash
npm install dotenv
```

Then add to the top of the script:
```javascript
import 'dotenv/config'
```

---

## Contributing

Feel free to improve these scripts! Some ideas:

- Add support for Twitter API
- Implement retry logic for failed requests
- Add progress bars
- Export results to CSV
- Send notifications on completion
- Add more filtering options

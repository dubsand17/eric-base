/**
 * Advanced Twitter Metrics Scraper using Puppeteer
 * 
 * This script uses a headless browser to scrape engagement metrics from Twitter.
 * 
 * Prerequisites:
 *   npm install puppeteer dotenv
 * 
 * Usage:
 *   node scripts/scrape-metrics.js
 * 
 * Options:
 *   --limit <number>       Limit the number of posts to update
 *   --older-than <days>    Only update posts where metrics are older than X days
 *   --recent-days <days>   Only update posts created in the last X days
 *   --id <post_id>         Update a specific post by ID
 *   --dry-run              Show what would be updated without making changes
 *   --headless             Run browser in headless mode (default: true)
 */

import { createClient } from '@supabase/supabase-js'
import puppeteer from 'puppeteer'
import dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Parse command line arguments
const args = process.argv.slice(2)
const options = {
    limit: null,
    olderThanDays: null,
    recentDays: null,
    postId: null,
    dryRun: false,
    headless: true
}

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--limit' && args[i + 1]) {
        options.limit = parseInt(args[i + 1])
        i++
    } else if (args[i] === '--older-than' && args[i + 1]) {
        options.olderThanDays = parseInt(args[i + 1])
        i++
    } else if (args[i] === '--recent-days' && args[i + 1]) {
        options.recentDays = parseInt(args[i + 1])
        i++
    } else if (args[i] === '--id' && args[i + 1]) {
        options.postId = args[i + 1]
        i++
    } else if (args[i] === '--dry-run') {
        options.dryRun = true
    } else if (args[i] === '--headless') {
        options.headless = args[i + 1] !== 'false'
        i++
    }
}

console.log('🚀 Twitter Metrics Scraper (Puppeteer)')
console.log('Options:', options)
console.log('')

let browser = null

/**
 * Extract engagement metrics from Twitter page using Puppeteer
 */
async function scrapeMetricsFromTwitter(page, tweetUrl) {
    try {
        console.log(`  🌐 Navigating to: ${tweetUrl}`)

        // Navigate to the tweet
        await page.goto(tweetUrl, {
            waitUntil: 'networkidle2',
            timeout: 30000
        })

        // Wait for the tweet to load
        await page.waitForSelector('article[data-testid="tweet"]', { timeout: 10000 })

        // Extract metrics using the same logic as the Chrome extension
        const metrics = await page.evaluate(() => {
            const tweetElement = document.querySelector('article[data-testid="tweet"]')
            if (!tweetElement) return null

            const result = {
                comment_count: 0,
                retweet_count: 0,
                like_count: 0,
                view_count: 0
            }

            try {
                // Extract comment count
                const replyButton = tweetElement.querySelector('[data-testid="reply"]')
                if (replyButton) {
                    const replyText = replyButton.getAttribute('aria-label') || ''
                    const replyMatch = replyText.match(/(\d+)/)
                    if (replyMatch) {
                        result.comment_count = parseInt(replyMatch[1].replace(/,/g, ''), 10) || 0
                    }
                }

                // Extract retweet count
                const retweetButton = tweetElement.querySelector('[data-testid="retweet"]')
                if (retweetButton) {
                    const retweetText = retweetButton.getAttribute('aria-label') || ''
                    const retweetMatch = retweetText.match(/(\d+)/)
                    if (retweetMatch) {
                        result.retweet_count = parseInt(retweetMatch[1].replace(/,/g, ''), 10) || 0
                    }
                }

                // Extract like count
                const likeButton = tweetElement.querySelector('[data-testid="like"]')
                if (likeButton) {
                    const likeText = likeButton.getAttribute('aria-label') || ''
                    const likeMatch = likeText.match(/(\d+)/)
                    if (likeMatch) {
                        result.like_count = parseInt(likeMatch[1].replace(/,/g, ''), 10) || 0
                    }
                }

                // Extract view count - try multiple methods
                // Method 1: Look for "XXK Views" or "XXM Views" text pattern (most common location)
                let viewFound = false
                const allText = tweetElement.innerText || tweetElement.textContent || ''
                const viewPatterns = [
                    /(\d+\.?\d*)\s*([KMB])\s*Views?/i,  // "40K Views"
                    /(\d+\.?\d*)\s*([KMB])\s*次查看/i,   // Chinese
                    /(\d+,?\d*)\s*Views?/i,              // "40,000 Views"
                ]

                for (const pattern of viewPatterns) {
                    const match = allText.match(pattern)
                    if (match) {
                        console.log('  [Debug] Found view count with pattern:', match[0])
                        let count = parseFloat(match[1].replace(/,/g, ''))
                        const suffix = match[2] ? match[2].toUpperCase() : ''
                        if (suffix === 'K') count *= 1000
                        else if (suffix === 'M') count *= 1000000
                        else if (suffix === 'B') count *= 1000000000
                        result.view_count = Math.floor(count)
                        viewFound = true
                        break
                    }
                }

                // Method 2: Look for analytics link (fallback)
                if (!viewFound) {
                    let viewElements = tweetElement.querySelectorAll('a[href*="/analytics"]')
                    if (viewElements.length > 0) {
                        const viewText = viewElements[0].textContent || ''
                        console.log('  [Debug] View text from analytics link:', viewText)
                        const viewMatch = viewText.match(/([\d.,]+)\s*([KMB]?)/i)
                        if (viewMatch) {
                            let count = parseFloat(viewMatch[1].replace(/,/g, ''))
                            const suffix = viewMatch[2].toUpperCase()
                            if (suffix === 'K') count *= 1000
                            else if (suffix === 'M') count *= 1000000
                            else if (suffix === 'B') count *= 1000000000
                            result.view_count = Math.floor(count)
                            viewFound = true
                        }
                    }
                }

                // Method 3: Look for specific span elements (last resort)
                if (!viewFound) {
                    const viewSpans = tweetElement.querySelectorAll('span')
                    for (const span of viewSpans) {
                        const text = span.textContent || ''
                        if (/\d+[KMB]?\s*(views?|次查看)/i.test(text)) {
                            console.log('  [Debug] View text from span:', text)
                            const viewMatch = text.match(/([\d.,]+)\s*([KMB]?)/i)
                            if (viewMatch) {
                                let count = parseFloat(viewMatch[1].replace(/,/g, ''))
                                const suffix = viewMatch[2] ? viewMatch[2].toUpperCase() : ''
                                if (suffix === 'K') count *= 1000
                                else if (suffix === 'M') count *= 1000000
                                else if (suffix === 'B') count *= 1000000000
                                result.view_count = Math.floor(count)
                                break
                            }
                        }
                    }
                }

                console.log('  [Debug] Extracted metrics:', result)
            } catch (error) {
                console.error('Error extracting metrics:', error)
            }

            return result
        })

        if (!metrics) {
            console.log(`  ⚠️  Could not extract metrics from page`)
            return null
        }

        return metrics
    } catch (error) {
        console.error(`  ❌ Error scraping: ${error.message}`)
        return null
    }
}

/**
 * Update metrics for a single post
 */
async function updatePostMetrics(page, post) {
    console.log(`\n📝 Processing: ${post.id}`)
    console.log(`  Content: ${post.content.substring(0, 50)}...`)
    console.log(`  URL: ${post.tweet_url || 'No URL'}`)
    console.log(`  Current: ${post.comment_count}💬 ${post.retweet_count}🔄 ${post.like_count}❤️ ${post.view_count}👁`)

    if (!post.tweet_url) {
        console.log(`  ⏭️  Skipping: No tweet URL`)
        return { success: false, reason: 'no_url' }
    }

    // Fetch new metrics
    const newMetrics = await scrapeMetricsFromTwitter(page, post.tweet_url)

    if (!newMetrics) {
        console.log(`  ⏭️  Skipping: Could not fetch metrics`)
        return { success: false, reason: 'fetch_failed' }
    }

    console.log(`  New:     ${newMetrics.comment_count}💬 ${newMetrics.retweet_count}🔄 ${newMetrics.like_count}❤️ ${newMetrics.view_count}👁`)

    // Check if metrics changed
    const hasChanges =
        newMetrics.comment_count !== post.comment_count ||
        newMetrics.retweet_count !== post.retweet_count ||
        newMetrics.like_count !== post.like_count ||
        newMetrics.view_count !== post.view_count

    if (!hasChanges) {
        console.log(`  ℹ️  No changes detected`)
    }

    if (options.dryRun) {
        console.log(`  🔍 DRY RUN: Would update metrics`)
        return { success: true, dryRun: true, hasChanges }
    }

    // Update in database
    const { error } = await supabase
        .from('twitter_posts')
        .update({
            comment_count: newMetrics.comment_count,
            retweet_count: newMetrics.retweet_count,
            like_count: newMetrics.like_count,
            view_count: newMetrics.view_count,
            metrics_updated_at: new Date().toISOString()
        })
        .eq('id', post.id)

    if (error) {
        console.log(`  ❌ Update failed: ${error.message}`)
        return { success: false, reason: 'update_failed', error }
    }

    console.log(`  ✅ Updated successfully`)
    return { success: true, hasChanges }
}

/**
 * Main function
 */
async function main() {
    // Launch browser
    console.log('🌐 Launching browser...')
    browser = await puppeteer.launch({
        headless: options.headless ? 'new' : false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    const page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 800 })

    // Set user agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')

    console.log('✅ Browser ready\n')


    // Build query
    let query = supabase
        .from('twitter_posts')
        .select('*')
        .not('tweet_url', 'is', null)

    // Filter by specific post ID if specified
    if (options.postId) {
        query = query.eq('id', options.postId)
        console.log(`🎯 Updating specific post: ${options.postId}`)
    } else {
        // Only apply other filters if not filtering by ID
        query = query.order('metrics_updated_at', { ascending: true })

        // Filter by recent posts if specified
        if (options.recentDays) {
            const cutoffDate = new Date()
            cutoffDate.setDate(cutoffDate.getDate() - options.recentDays)
            query = query.gte('tweet_created_at', cutoffDate.toISOString())
            console.log(`📅 Only updating posts from the last ${options.recentDays} days`)
        }

        // Filter by age if specified
        if (options.olderThanDays) {
            const cutoffDate = new Date()
            cutoffDate.setDate(cutoffDate.getDate() - options.olderThanDays)
            query = query.lt('metrics_updated_at', cutoffDate.toISOString())
            console.log(`📅 Only updating posts older than ${options.olderThanDays} days`)
        }

        // Apply limit if specified
        if (options.limit) {
            query = query.limit(options.limit)
            console.log(`🔢 Limiting to ${options.limit} posts`)
        }
    }

    // Fetch posts
    console.log('📥 Fetching posts from database...')
    const { data: posts, error } = await query

    if (error) {
        console.error('❌ Error fetching posts:', error)
        await browser.close()
        process.exit(1)
    }

    console.log(`✅ Found ${posts.length} posts to process\n`)

    if (posts.length === 0) {
        console.log('✨ No posts to update!')
        await browser.close()
        return
    }

    // Process each post
    const results = {
        total: posts.length,
        success: 0,
        failed: 0,
        skipped: 0,
        noChanges: 0
    }

    for (let i = 0; i < posts.length; i++) {
        const post = posts[i]
        console.log(`\n[${i + 1}/${posts.length}]`)

        const result = await updatePostMetrics(page, post)

        if (result.success) {
            results.success++
            if (!result.hasChanges) {
                results.noChanges++
            }
        } else if (result.reason === 'no_url' || result.reason === 'fetch_failed') {
            results.skipped++
        } else {
            results.failed++
        }

        // Add a delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000))
    }

    // Close browser
    await browser.close()

    // Print summary
    console.log('\n' + '='.repeat(50))
    console.log('📊 Summary')
    console.log('='.repeat(50))
    console.log(`Total posts processed: ${results.total}`)
    console.log(`✅ Successfully updated: ${results.success}`)
    console.log(`   - With changes: ${results.success - results.noChanges}`)
    console.log(`   - No changes: ${results.noChanges}`)
    console.log(`⏭️  Skipped: ${results.skipped}`)
    console.log(`❌ Failed: ${results.failed}`)

    if (options.dryRun) {
        console.log('\n🔍 This was a DRY RUN - no changes were made')
    }
}

// Handle cleanup on exit
process.on('SIGINT', async () => {
    console.log('\n\n⚠️  Interrupted by user')
    if (browser) {
        await browser.close()
    }
    process.exit(0)
})

// Run the script
main().catch(async (error) => {
    console.error('❌ Fatal error:', error)
    if (browser) {
        await browser.close()
    }
    process.exit(1)
})

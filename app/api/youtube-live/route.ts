import { NextResponse } from 'next/server'

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY
const MAIN_CHANNEL_ID = 'UC0h5WHVgdGyBk5cbB8XiUxw' // 百万Eric主频道
const LIVE_CHANNEL_ID = 'UC3bAlqe4dwupxrJ9xCzYKdA' // 百万Eric直播频道

export const runtime = 'edge'

// 30秒缓存
let cache: { isLive: boolean; liveUrl?: string; timestamp: number } | null = null
const CACHE_DURATION = 30 * 1000 // 30秒

export async function GET(request: Request) {
    try {
        // 检查缓存
        if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
            return NextResponse.json({
                isLive: cache.isLive,
                liveUrl: cache.liveUrl,
                cached: true
            })
        }

        if (!YOUTUBE_API_KEY) {
            return NextResponse.json({
                isLive: false,
                error: 'YouTube API key not configured'
            })
        }

        // 检查单个频道的直播状态
        const checkChannel = async (channelId: string) => {
            const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=live&type=video&key=${YOUTUBE_API_KEY}`
            const response = await fetch(url)
            const data = await response.json()

            if (!response.ok) {
                console.error(`YouTube API Error for ${channelId}:`, data)
                return null
            }

            return data
        }

        // 检查直播频道，如果没有则检查主频道
        let data = await checkChannel(LIVE_CHANNEL_ID)
        if (!data || !data.items || data.items.length === 0) {
            data = await checkChannel(MAIN_CHANNEL_ID)
        }

        const isLive = data && data.items && data.items.length > 0
        const liveUrl = isLive ? `https://www.youtube.com/watch?v=${data.items[0].id.videoId}` : undefined

        // 更新缓存
        cache = {
            isLive,
            liveUrl,
            timestamp: Date.now()
        }

        return NextResponse.json({
            isLive,
            liveUrl,
            cached: false
        })

    } catch (error) {
        console.error('YouTube Live Check Error:', error)
        return NextResponse.json({
            isLive: false,
            error: 'Failed to check live status'
        })
    }
}

import { NextResponse } from 'next/server'

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY
const MAIN_CHANNEL_ID = 'UC0h5WHVgdGyBk5cbB8XiUxw' // 百万Eric主频道
const LIVE_CHANNEL_ID = 'UC3bAlqe4dwupxrJ9xCzYKdA' // 百万Eric直播频道

export const runtime = 'edge'

// 缓存配置
let cache: { isLive: boolean; liveUrl?: string; videoTitle?: string; detectionMethod?: string; timestamp: number } | null = null
const CACHE_DURATION = 5 * 60 * 1000 // 5分钟缓存（降低API调用频率）
const QUOTA_EXCEEDED_CACHE_DURATION = 60 * 60 * 1000 // 配额超限时使用1小时缓存

// 配额超限标记
let quotaExceeded = false
let quotaExceededTime: number | null = null

export async function GET(request: Request) {
    try {
        // 解析URL参数
        const { searchParams } = new URL(request.url)
        const specificVideoId = searchParams.get('videoId') // 可选的视频ID参数

        // 如果配额超限且在1小时内，直接返回缓存或默认值
        if (quotaExceeded && quotaExceededTime && Date.now() - quotaExceededTime < QUOTA_EXCEEDED_CACHE_DURATION) {
            if (cache) {
                return NextResponse.json({
                    isLive: cache.isLive,
                    liveUrl: cache.liveUrl,
                    videoTitle: cache.videoTitle,
                    detectionMethod: cache.detectionMethod,
                    cached: true,
                    quotaExceeded: true
                })
            }
            // 如果没有缓存，返回默认值
            return NextResponse.json({
                isLive: false,
                cached: false,
                quotaExceeded: true
            })
        }

        // 如果没有指定特定视频ID，检查缓存
        if (!specificVideoId && cache && Date.now() - cache.timestamp < CACHE_DURATION) {
            return NextResponse.json({
                isLive: cache.isLive,
                liveUrl: cache.liveUrl,
                videoTitle: cache.videoTitle,
                detectionMethod: cache.detectionMethod,
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
                // 检查是否是配额超限错误
                if (data.error?.code === 403 && data.error?.errors?.[0]?.reason === 'quotaExceeded') {
                    console.warn(`YouTube API quota exceeded for ${channelId}`)
                    quotaExceeded = true
                    quotaExceededTime = Date.now()
                    return 'QUOTA_EXCEEDED'
                }
                console.error(`YouTube API Error for ${channelId}:`, data)
                return null
            }

            console.log(`Channel ${channelId} search result:`, {
                itemCount: data.items?.length || 0,
                items: data.items?.map((item: any) => ({
                    videoId: item.id.videoId,
                    title: item.snippet.title
                }))
            })

            return data
        }

        // 检查特定视频ID是否正在直播
        const checkVideoById = async (videoId: string) => {
            const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`
            const response = await fetch(url)
            const data = await response.json()

            if (!response.ok) {
                // 检查是否是配额超限错误
                if (data.error?.code === 403 && data.error?.errors?.[0]?.reason === 'quotaExceeded') {
                    console.warn(`YouTube API quota exceeded for video ${videoId}`)
                    quotaExceeded = true
                    quotaExceededTime = Date.now()
                    return 'QUOTA_EXCEEDED'
                }
                console.error(`YouTube API Error for video ${videoId}:`, data)
                return null
            }

            // 检查视频是否存在且正在直播
            if (data.items && data.items.length > 0) {
                const video = data.items[0]
                const liveBroadcastContent = video.snippet?.liveBroadcastContent

                console.log(`Video ${videoId} status:`, {
                    title: video.snippet?.title,
                    channelId: video.snippet?.channelId,
                    channelTitle: video.snippet?.channelTitle,
                    liveBroadcastContent,
                    isLive: liveBroadcastContent === 'live'
                })

                if (liveBroadcastContent === 'live') {
                    return {
                        videoId,
                        title: video.snippet?.title,
                        channelId: video.snippet?.channelId,
                        channelTitle: video.snippet?.channelTitle,
                        isLive: true
                    }
                }
            } else {
                console.log(`Video ${videoId} not found or has no data`)
            }

            return null
        }

        let isLive = false
        let liveUrl: string | undefined
        let videoTitle: string | undefined
        let detectionMethod: string | undefined

        // 如果提供了特定的视频ID，优先检查它
        if (specificVideoId) {
            console.log(`Checking specific video ID: ${specificVideoId}`)
            const videoData = await checkVideoById(specificVideoId)

            if (videoData === 'QUOTA_EXCEEDED') {
                // 配额超限，返回缓存或默认值
                if (cache) {
                    return NextResponse.json({
                        isLive: cache.isLive,
                        liveUrl: cache.liveUrl,
                        videoTitle: cache.videoTitle,
                        detectionMethod: cache.detectionMethod,
                        cached: true,
                        quotaExceeded: true
                    })
                }
                return NextResponse.json({
                    isLive: false,
                    quotaExceeded: true
                })
            }

            if (videoData && videoData.isLive) {
                isLive = true
                liveUrl = `https://www.youtube.com/watch?v=${videoData.videoId}`
                videoTitle = videoData.title
                detectionMethod = 'video_id_param'

                console.log(`✓ Found live stream via video ID parameter: ${videoTitle}`)
            }
        }

        // 如果通过视频ID没有找到，或者没有提供视频ID，则检查频道
        if (!isLive) {
            console.log('Checking channels for live streams...')

            // 方法1: 检查直播频道，如果没有则检查主频道
            let data = await checkChannel(LIVE_CHANNEL_ID)

            if (data === 'QUOTA_EXCEEDED') {
                // 配额超限，返回缓存或默认值
                if (cache) {
                    return NextResponse.json({
                        isLive: cache.isLive,
                        liveUrl: cache.liveUrl,
                        videoTitle: cache.videoTitle,
                        detectionMethod: cache.detectionMethod,
                        cached: true,
                        quotaExceeded: true
                    })
                }
                return NextResponse.json({
                    isLive: false,
                    quotaExceeded: true
                })
            }

            if (!data || !data.items || data.items.length === 0) {
                data = await checkChannel(MAIN_CHANNEL_ID)

                if (data === 'QUOTA_EXCEEDED') {
                    // 配额超限，返回缓存或默认值
                    if (cache) {
                        return NextResponse.json({
                            isLive: cache.isLive,
                            liveUrl: cache.liveUrl,
                            videoTitle: cache.videoTitle,
                            detectionMethod: cache.detectionMethod,
                            cached: true,
                            quotaExceeded: true
                        })
                    }
                    return NextResponse.json({
                        isLive: false,
                        quotaExceeded: true
                    })
                }
            }

            if (data && data.items && data.items.length > 0) {
                isLive = true
                liveUrl = `https://www.youtube.com/watch?v=${data.items[0].id.videoId}`
                videoTitle = data.items[0].snippet?.title
                detectionMethod = 'channel'

                console.log(`✓ Found live stream via channel: ${videoTitle}`)
            } else {
                console.log('✗ No live streams found via channel detection')
            }
        }

        // 只有在没有使用特定视频ID参数时才更新缓存
        if (!specificVideoId) {
            cache = {
                isLive,
                liveUrl,
                videoTitle,
                detectionMethod,
                timestamp: Date.now()
            }
            // 重置配额超限标记（API调用成功）
            quotaExceeded = false
            quotaExceededTime = null
        }

        return NextResponse.json({
            isLive,
            liveUrl,
            videoTitle,
            detectionMethod,
            cached: false
        })

    } catch (error) {
        console.error('YouTube Live Check Error:', error)
        // 出错时返回缓存数据
        if (cache) {
            return NextResponse.json({
                isLive: cache.isLive,
                liveUrl: cache.liveUrl,
                videoTitle: cache.videoTitle,
                detectionMethod: cache.detectionMethod,
                cached: true,
                error: 'API error, using cached data'
            })
        }
        return NextResponse.json({
            isLive: false,
            error: 'Failed to check live status'
        })
    }
}

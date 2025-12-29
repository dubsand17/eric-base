import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// CORS headers for Chrome extension
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// CDN caching headers for Vercel/Edge
const cacheHeaders = {
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
  // Some CDNs respect these explicit headers too
  'CDN-Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
  'Vercel-CDN-Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
}

// 仅使用 Supabase，移除临时内存存储

export async function OPTIONS(request: NextRequest) {
  return new Response(null, { status: 200, headers: { ...corsHeaders } })
}

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase 未配置，请设置 NEXT_PUBLIC_SUPABASE_URL 与 NEXT_PUBLIC_SUPABASE_ANON_KEY' }, { status: 500, headers: { ...corsHeaders } })
    }
    const body = await request.json()
    const { content, images, tweet_created_at, tweet_url, comment_count, retweet_count, like_count, view_count } = body

    // Debug: 打印接收到的数据
    console.log('📥 POST /api/posts - 接收到的数据:')
    console.log('  评论:', comment_count)
    console.log('  转发:', retweet_count)
    console.log('  点赞:', like_count)
    console.log('  观看:', view_count)

    const insertData = {
      id: crypto.randomUUID(),
      content,
      images: images || [],  // 确保是数组，Supabase 会自动转换为 jsonb
      tweet_created_at,
      tweet_url,
      comment_count: comment_count || 0,
      retweet_count: retweet_count || 0,
      like_count: like_count || 0,
      view_count: view_count || 0,
      metrics_updated_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    }

    console.log('💾 准备插入的数据:', insertData)

    const { data, error } = await supabase
      .from('twitter_posts')
      .insert([insertData])
      .select()

    if (error) {
      console.error('❌ 数据库插入错误:', error)
      return NextResponse.json({ error: error.message }, { status: 400, headers: { ...corsHeaders } })
    }

    console.log('✅ 插入成功:', data[0])
    return NextResponse.json(data[0], { headers: { ...corsHeaders } })
  } catch (error) {
    console.error('API错误:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: { ...corsHeaders } })
  }
}

export async function GET(request: NextRequest) {
  try {
    // 获取分页参数
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '30')
    const q = searchParams.get('q')?.trim() || ''
    const from = searchParams.get('from') || ''
    const to = searchParams.get('to') || ''
    const random = searchParams.get('random') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offsetParam = parseInt(searchParams.get('offset') || '0')
    const sortBy = searchParams.get('sortBy') || 'date' // date, comments, retweets, likes, views
    const sortOrder = searchParams.get('sortOrder') || 'desc' // asc, desc

    if (!supabase) {
      return NextResponse.json({ error: 'Supabase 未配置，请设置 NEXT_PUBLIC_SUPABASE_URL 与 NEXT_PUBLIC_SUPABASE_ANON_KEY' }, { status: 500, headers: corsHeaders })
    }

    // 随机模式
    if (random) {
      // 获取总数
      const { count, error: countError } = await supabase
        .from('twitter_posts')
        .select('*', { count: 'exact', head: true })

      if (countError) {
        return NextResponse.json({ error: countError.message }, { status: 400, headers: { ...corsHeaders, ...cacheHeaders } })
      }

      // 使用随机 offset 策略（性能更好）
      const totalCount = count || 0
      const maxOffset = Math.max(0, totalCount - limit)
      const randomOffset = offsetParam > 0 ? offsetParam : Math.floor(Math.random() * (maxOffset + 1))

      const { data, error } = await supabase
        .from('twitter_posts')
        .select('*')
        .range(randomOffset, randomOffset + limit - 1)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400, headers: corsHeaders })
      }

      // 打乱返回的数据
      const shuffledData = data?.sort(() => Math.random() - 0.5) || []

      return NextResponse.json({
        data: shuffledData,
        pagination: {
          total: totalCount,
          page: 1,
          pageSize: limit,
          totalPages: 1
        }
      }, { headers: { ...corsHeaders, ...cacheHeaders } })
    }

    // 计算偏移量
    const offset = (page - 1) * pageSize

    // 确定排序字段
    let orderColumn = 'tweet_created_at'
    if (sortBy === 'comments') orderColumn = 'comment_count'
    else if (sortBy === 'retweets') orderColumn = 'retweet_count'
    else if (sortBy === 'likes') orderColumn = 'like_count'
    else if (sortBy === 'views') orderColumn = 'view_count'

    const ascending = sortOrder === 'asc'

    // 使用 Supabase 数据库
    // 获取总数
    let baseCount = supabase.from('twitter_posts').select('*', { count: 'exact', head: true })
    if (q) baseCount = baseCount.ilike('content', `%${q}%`)
    if (from) baseCount = baseCount.gte('tweet_created_at', from)
    if (to) baseCount = baseCount.lte('tweet_created_at', to)
    const { count, error: countError } = await baseCount

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 400, headers: { ...corsHeaders, ...cacheHeaders } })
    }

    // 获取分页数据
    let baseQuery = supabase
      .from('twitter_posts')
      .select('*')
      .order(orderColumn, { ascending })
    if (q) baseQuery = baseQuery.ilike('content', `%${q}%`)
    if (from) baseQuery = baseQuery.gte('tweet_created_at', from)
    if (to) baseQuery = baseQuery.lte('tweet_created_at', to)
    const { data, error } = await baseQuery.range(offset, offset + pageSize - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400, headers: corsHeaders })
    }

    return NextResponse.json({
      data,
      pagination: {
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize)
      }
    }, { headers: { ...corsHeaders, ...cacheHeaders } })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: { ...corsHeaders, ...cacheHeaders } })
  }
}
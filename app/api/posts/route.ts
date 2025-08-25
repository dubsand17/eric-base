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
    const { content, images, tweet_created_at, tweet_url } = body

    const { data, error } = await supabase
      .from('twitter_posts')
      .insert([
        {
          content,
          images,
          tweet_created_at,
          tweet_url,
          created_at: new Date().toISOString()
        }
      ])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400, headers: { ...corsHeaders } })
    }

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
    
    // 计算偏移量
    const offset = (page - 1) * pageSize
    
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase 未配置，请设置 NEXT_PUBLIC_SUPABASE_URL 与 NEXT_PUBLIC_SUPABASE_ANON_KEY' }, { status: 500, headers: corsHeaders })
    }
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
      .order('tweet_created_at', { ascending: false })
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
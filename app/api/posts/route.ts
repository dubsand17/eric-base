import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// CORS headers for Chrome extension
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// 临时内存存储（开发测试用）
let memoryPosts: any[] = []

export async function OPTIONS(request: NextRequest) {
  return new Response(null, { status: 200, headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, images, tweet_created_at, tweet_url } = body

    // 如果有Supabase配置，使用数据库
    if (supabase) {
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
        return NextResponse.json({ error: error.message }, { status: 400, headers: corsHeaders })
      }

      return NextResponse.json(data[0], { headers: corsHeaders })
    } 
    // 否则使用内存存储（临时方案）
    else {
      const newPost = {
        id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content,
        images: images || [],
        tweet_created_at,
        tweet_url,
        created_at: new Date().toISOString()
      }

      memoryPosts.unshift(newPost) // 添加到开头
      
      // 限制内存中最多保存50条记录
      if (memoryPosts.length > 50) {
        memoryPosts = memoryPosts.slice(0, 50)
      }

      console.log('保存到内存存储:', {
        id: newPost.id,
        content: content.substring(0, 50) + '...',
        images: images?.length || 0
      })

      return NextResponse.json(newPost, { headers: corsHeaders })
    }
  } catch (error) {
    console.error('API错误:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders })
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
    
    // 如果有Supabase配置，使用数据库
    if (supabase) {
      // 获取总数
      let baseCount = supabase.from('twitter_posts').select('*', { count: 'exact', head: true })
      if (q) baseCount = baseCount.ilike('content', `%${q}%`)
      if (from) baseCount = baseCount.gte('tweet_created_at', from)
      if (to) baseCount = baseCount.lte('tweet_created_at', to)
      const { count, error: countError } = await baseCount
      
      if (countError) {
        return NextResponse.json({ error: countError.message }, { status: 400, headers: corsHeaders })
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
      }, { headers: corsHeaders })
    } 
    // 否则返回内存存储的数据
    else {
      // 过滤内存数据
      let filtered = memoryPosts as any[]
      if (q) {
        const lower = q.toLowerCase()
        filtered = filtered.filter(p => (p.content || '').toLowerCase().includes(lower))
      }
      if (from) filtered = filtered.filter(p => p.tweet_created_at >= from)
      if (to) filtered = filtered.filter(p => p.tweet_created_at <= to)
      const total = filtered.length
      const paginatedPosts = filtered
        .sort((a, b) => (b.tweet_created_at || '').localeCompare(a.tweet_created_at || ''))
        .slice(offset, offset + pageSize)
      
      return NextResponse.json({
        data: paginatedPosts,
        pagination: {
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize)
        }
      }, { headers: corsHeaders })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders })
  }
}
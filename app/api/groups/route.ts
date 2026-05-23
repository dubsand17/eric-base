import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders })
}

export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase 未配置' },
        { status: 500, headers: corsHeaders }
      )
    }

    // 获取所有分组 + 每组推文计数和最新时间
    const { data: groups, error } = await supabase
      .from('post_groups')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400, headers: corsHeaders })
    }

    // 获取每个分组的推文计数和最新推文时间
    const groupIds = (groups || []).map(g => g.id)
    let postCounts: Record<string, { count: number; latest: string | null }> = {}

    if (groupIds.length > 0) {
      const { data: posts, error: postsError } = await supabase
        .from('twitter_posts')
        .select('group_id, tweet_created_at')
        .in('group_id', groupIds)

      if (!postsError && posts) {
        for (const post of posts) {
          if (!post.group_id) continue
          if (!postCounts[post.group_id]) {
            postCounts[post.group_id] = { count: 0, latest: null }
          }
          postCounts[post.group_id].count++
          if (!postCounts[post.group_id].latest || post.tweet_created_at > postCounts[post.group_id].latest!) {
            postCounts[post.group_id].latest = post.tweet_created_at
          }
        }
      }
    }

    const result = (groups || []).map(g => ({
      ...g,
      post_count: postCounts[g.id]?.count || 0,
      latest_post_at: postCounts[g.id]?.latest || null,
    }))

    return NextResponse.json({ data: result }, { headers: corsHeaders })
  } catch (error) {
    console.error('GET /api/groups error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase 未配置' },
        { status: 500, headers: corsHeaders }
      )
    }

    const body = await request.json()
    const { cover_image, title } = body

    if (!cover_image) {
      return NextResponse.json(
        { error: 'cover_image 是必填字段' },
        { status: 400, headers: corsHeaders }
      )
    }

    const { data, error } = await supabase
      .from('post_groups')
      .insert([{
        id: crypto.randomUUID(),
        cover_image,
        title: title || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400, headers: corsHeaders })
    }

    return NextResponse.json(data[0], { status: 201, headers: corsHeaders })
  } catch (error) {
    console.error('POST /api/groups error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders })
  }
}

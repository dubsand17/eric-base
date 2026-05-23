import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders })
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase 未配置' },
        { status: 500, headers: corsHeaders }
      )
    }

    const { id } = params

    // 获取分组信息
    const { data: group, error: groupError } = await supabase
      .from('post_groups')
      .select('*')
      .eq('id', id)
      .single()

    if (groupError || !group) {
      return NextResponse.json(
        { error: '分组不存在' },
        { status: 404, headers: corsHeaders }
      )
    }

    // 获取该分组下的所有推文
    const { data: posts, error: postsError } = await supabase
      .from('twitter_posts')
      .select('*')
      .eq('group_id', id)
      .order('tweet_created_at', { ascending: false })

    if (postsError) {
      return NextResponse.json({ error: postsError.message }, { status: 400, headers: corsHeaders })
    }

    return NextResponse.json({
      group,
      posts: posts || [],
    }, { headers: corsHeaders })
  } catch (error) {
    console.error('GET /api/groups/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase 未配置' },
        { status: 500, headers: corsHeaders }
      )
    }

    const { id } = params
    const body = await request.json()
    const { title, cover_image } = body

    const updateData: Record<string, any> = { updated_at: new Date().toISOString() }
    if (title !== undefined) updateData.title = title
    if (cover_image !== undefined) updateData.cover_image = cover_image

    const { data, error } = await supabase
      .from('post_groups')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400, headers: corsHeaders })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: '分组不存在' }, { status: 404, headers: corsHeaders })
    }

    return NextResponse.json(data[0], { headers: corsHeaders })
  } catch (error) {
    console.error('PUT /api/groups/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders })
  }
}

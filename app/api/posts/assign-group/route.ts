import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase 未配置' }, { status: 500, headers: corsHeaders })
    }

    const { post_id, group_id } = await request.json()

    if (!post_id || !group_id) {
      return NextResponse.json({ error: 'post_id 和 group_id 必填' }, { status: 400, headers: corsHeaders })
    }

    const { error } = await supabase
      .from('twitter_posts')
      .update({ group_id })
      .eq('id', post_id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400, headers: corsHeaders })
    }

    // 更新分组的 updated_at
    await supabase
      .from('post_groups')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', group_id)

    return NextResponse.json({ success: true }, { headers: corsHeaders })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders })
  }
}

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export interface TwitterPost {
  id: string
  content: string
  images: string[]
  created_at: string
  tweet_created_at?: string
  tweet_url?: string
  group_id?: string | null
  comment_count?: number
  retweet_count?: number
  like_count?: number
  view_count?: number
  metrics_updated_at?: string
}

export interface PostGroup {
  id: string
  title: string | null
  cover_image: string
  created_at: string
  updated_at: string
  post_count?: number
  latest_post_at?: string | null
} 
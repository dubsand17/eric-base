import MasonryGrid from '@/components/MasonryGrid'
import { supabase } from '@/lib/supabase'
import { samplePosts } from '@/lib/sample-data'
import EmptyState from '@/components/EmptyState'
import ThemeToggle from '@/components/ThemeToggle'
import LoadingGrid from '@/components/LoadingGrid'
import ErrorState from '@/components/ErrorState'

async function fetchPosts() {
  try {
    // 如果有Supabase配置，直接使用
    if (supabase) {
      const { data: posts, error } = await supabase
        .from('twitter_posts')
        .select('*')
        .order('tweet_created_at', { ascending: false })

      if (error) {
        throw error
      }
      return posts || []
    } 
    // 否则从API获取（包括内存存储的数据）
    else {
      const response = await fetch('http://localhost:3000/api/posts', {
        cache: 'no-store' // 确保获取最新数据
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts')
      }
      
      const posts = await response.json()
      return posts || []
    }
  } catch (error) {
    console.error('Error fetching posts:', error)
    return null
  }
}

export default async function Home() {
  const posts = await fetchPosts()

  if (posts === null) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <ThemeToggle />
        <ErrorState error="获取数据失败，请检查服务器连接" />
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <ThemeToggle />
        <EmptyState />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ThemeToggle />
      <MasonryGrid posts={posts} />
    </div>
  )
} 
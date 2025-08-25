export const revalidate = 60
import HomeClient from '@/components/HomeClient'
import { supabase, type TwitterPost } from '@/lib/supabase'

interface PaginationData {
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export default async function Home() {
  const page = 1
  const pageSize = 30
  if (!supabase) {
    return <HomeClient initialPosts={[]} initialPagination={{ total: 0, page, pageSize, totalPages: 0 }} />
  }

  // 统计总数
  let count = 0
  {
    const { count: c } = await supabase
      .from('twitter_posts')
      .select('*', { count: 'exact', head: true })
    count = c || 0
  }

  // 首屏数据
  let data: TwitterPost[] = []
  {
    const { data: rows } = await supabase
      .from('twitter_posts')
      .select('*')
      .order('tweet_created_at', { ascending: false })
      .range(0, pageSize - 1)
    data = (rows || []) as TwitterPost[]
  }

  const pagination: PaginationData = {
    total: count,
    page,
    pageSize,
    totalPages: Math.ceil(count / pageSize)
  }

  return <HomeClient initialPosts={data} initialPagination={pagination} />
}
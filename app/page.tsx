import HomeClient from '@/components/HomeClient'

export default function Home() {
  return <HomeClient initialPosts={[]} initialPagination={{ total: 0, page: 1, pageSize: 30, totalPages: 0 }} />
}
import HomeView from '@/components/features/home/HomeView'

export default function Home() {
  return <HomeView initialPosts={[]} initialPagination={{ total: 0, page: 1, pageSize: 30, totalPages: 0 }} />
}
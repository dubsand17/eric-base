import { supabase } from '@/lib/supabase'
import WanderView from '@/components/features/wander/WanderView'
import { TwitterPost } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

async function getRandomPosts(): Promise<{ posts: TwitterPost[], total: number }> {
    if (!supabase) {
        return { posts: [], total: 0 }
    }

    try {
        // 获取总数
        const { count } = await supabase
            .from('twitter_posts')
            .select('*', { count: 'exact', head: true })

        const totalCount = count || 0

        // 获取随机的 50 条数据
        const limit = 50
        const maxOffset = Math.max(0, totalCount - limit)
        const randomOffset = Math.floor(Math.random() * (maxOffset + 1))

        const { data, error } = await supabase
            .from('twitter_posts')
            .select('*')
            .range(randomOffset, randomOffset + limit - 1)

        if (error) {
            console.error('Error fetching random posts:', error)
            return { posts: [], total: 0 }
        }

        // 打乱数据
        const shuffledData = (data || []).sort(() => Math.random() - 0.5)

        return { posts: shuffledData, total: totalCount }
    } catch (error) {
        console.error('Error in getRandomPosts:', error)
        return { posts: [], total: 0 }
    }
}

export default async function WanderPage() {
    const { posts, total } = await getRandomPosts()

    if (posts.length === 0) {
        return (
            <div className="min-h-screen bg-terminal-bg-light dark:bg-terminal-bg-dark flex items-center justify-center">
                <div className="text-center">
                    <p className="text-terminal-text-secondary-light dark:text-terminal-text-secondary-dark text-lg mb-4">
                        暂无内容可供漫步
                    </p>
                    <a
                        href="/"
                        className="text-terminal-accent-light dark:text-terminal-accent-dark hover:underline"
                    >
                        返回主页
                    </a>
                </div>
            </div>
        )
    }

    return <WanderView initialPosts={posts} totalCount={total} />
}

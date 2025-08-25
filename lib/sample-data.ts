import { TwitterPost } from './supabase'

export const samplePosts: TwitterPost[] = [
  {
    id: '1',
    content: '市场分析：当前周期显示明显的结构性变化。关键支撑位在$0.65，阻力位在$0.72。成交量放大表明机构资金正在进场，建议关注突破确认信号。',
    images: [
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71'
    ],
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    tweet_created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    tweet_url: 'https://x.com/CycleStudies/status/1959513594334417117'
  },
  {
    id: '2',
    content: '技术指标更新：RSI从超卖区域反弹，MACD金叉形成。短期趋势转向乐观，但需要关注量能配合。关键时间窗口在接下来的48小时内。',
    images: [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71'
    ],
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    tweet_created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    tweet_url: 'https://x.com/CycleStudies/status/1959428105053090123'
  },
  {
    id: '3',
    content: '周期分析：当前处于第四阶段调整期，历史数据显示类似模式通常持续3-5个交易日。建议保持耐心，等待明确的趋势确认信号。',
    images: [
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3'
    ],
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    tweet_created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    tweet_url: 'https://x.com/CycleStudies/status/1959256031663710555'
  },
  {
    id: '4',
    content: '市场情绪指标显示恐慌情绪正在消退，贪婪指数从25回升至35。这通常预示着短期反弹的可能性增加。关注关键阻力位的突破情况。',
    images: [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3'
    ],
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    tweet_created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    tweet_url: 'https://x.com/CycleStudies/status/1959150825462202405'
  },
  {
    id: '5',
    content: '长期趋势分析：基于历史数据模型，当前市场结构符合典型的积累阶段特征。机构资金流入增加，散户恐慌情绪缓解。建议关注大额交易流向。',
    images: [
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71'
    ],
    created_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    tweet_created_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    tweet_url: 'https://x.com/CycleStudies/status/1959000000000000000'
  }
] 
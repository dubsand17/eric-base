/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        twitter: {
          blue: '#1DA1F2',
          dark: '#14171A',
        },
        // Calm UI 配色方案 - 低对比度、状态可感知
        terminal: {
          // 主背景 - 降低极端对比
          bg: {
            light: '#f0f2f5',      // 日间：从极浅灰 #f8f9fa 调整为稍深的灰，减少亮度
            dark: '#1c1f26',       // 夜间：从 #1a1d23 稍微提亮，减少极端黑色
          },
          // 次级背景（卡片、面板）- 减少玻璃效果强度
          surface: {
            light: 'rgba(255, 255, 255, 0.75)',      // 日间：降低透明度
            dark: 'rgba(35, 38, 45, 0.75)',          // 夜间：深蓝灰卡片，稍微提亮
          },
          // 层级表面 - 用于明确层级关系
          elevated: {
            1: {
              light: 'rgba(255, 255, 255, 0.85)',
              dark: 'rgba(40, 43, 50, 0.85)',
            },
            2: {
              light: 'rgba(255, 255, 255, 0.95)',
              dark: 'rgba(40, 43, 50, 0.95)',
            },
            3: {
              light: 'rgba(255, 255, 255, 1)',
              dark: 'rgba(45, 48, 55, 1)',
            },
          },
          // 选中/激活状态背景
          surfaceActive: {
            light: 'rgba(240, 242, 245, 0.9)',      // 日间：稍深的灰
            dark: 'rgba(50, 53, 60, 0.9)',          // 夜间：中灰蓝
          },
          // 边框 - 极细边框，减少视觉重量
          border: {
            light: 'rgba(0, 0, 0, 0.06)',           // 日间：更淡的边框
            dark: 'rgba(255, 255, 255, 0.08)',      // 夜间：微弱白边
          },
          borderHover: {
            light: 'rgba(0, 0, 0, 0.12)',
            dark: 'rgba(255, 255, 255, 0.15)',
          },
          // 强调色 - 降低饱和度的金色系，仅用于关键操作
          accent: {
            light: '#b8985f',      // 日间：低饱和金色
            dark: '#d4af37',       // 夜间：中等金色
          },
          accentHover: {
            light: '#a68850',
            dark: '#c19d28',
          },
          accentActive: {
            light: '#8f7341',
            dark: '#b08d20',
          },
          // 次要操作色 - 中性
          secondary: {
            light: '#6b7280',
            dark: '#9ca3af',
          },
          // 成功（买入/涨）- 柔和绿色而非霓虹
          success: {
            DEFAULT: '#059669',    // 柔和翠绿
            light: '#059669',
            dark: '#10b981',
            muted: {
              light: 'rgba(5, 150, 105, 0.08)',
              dark: 'rgba(16, 185, 129, 0.12)',
            },
          },
          // 错误（卖出/跌）- 柔和红色而非霓虹
          error: {
            DEFAULT: '#dc2626',    // 柔和红
            light: '#dc2626',
            dark: '#ef4444',
            muted: {
              light: 'rgba(220, 38, 38, 0.08)',
              dark: 'rgba(239, 68, 68, 0.12)',
            },
          },
          // 警告色 - 琥珀色
          warning: {
            DEFAULT: '#d97706',
            light: '#d97706',
            dark: '#f59e0b',
            muted: {
              light: 'rgba(217, 119, 6, 0.08)',
              dark: 'rgba(245, 158, 11, 0.12)',
            },
          },
          // 信息色 - 蓝色
          info: {
            DEFAULT: '#0284c7',
            light: '#0284c7',
            dark: '#0ea5e9',
            muted: {
              light: 'rgba(2, 132, 199, 0.08)',
              dark: 'rgba(14, 165, 233, 0.12)',
            },
          },
          // 文本层级 - 更细致的灰度体系
          text: {
            primary: {
              light: '#111827',    // 日间：深灰，更高对比度
              dark: '#f9fafb',     // 夜间：几乎白色
            },
            secondary: {
              light: '#4b5563',    // 日间：中灰
              dark: '#d1d5db',     // 夜间：浅灰
            },
            tertiary: {
              light: '#6b7280',    // 日间：浅灰
              dark: '#9ca3af',     // 夜间：中灰
            },
            muted: {
              light: '#9ca3af',    // 日间：静音灰
              dark: '#6b7280',     // 夜间：暗灰
            },
            disabled: {
              light: '#d1d5db',
              dark: '#4b5563',
            }
          },
          // 状态颜色 - 用于明确组件状态
          state: {
            hover: {
              light: 'rgba(0, 0, 0, 0.04)',
              dark: 'rgba(255, 255, 255, 0.06)',
            },
            active: {
              light: 'rgba(0, 0, 0, 0.08)',
              dark: 'rgba(255, 255, 255, 0.1)',
            },
            focus: {
              light: 'rgba(184, 152, 95, 0.2)',
              dark: 'rgba(212, 175, 55, 0.25)',
            },
          }
        }
      },
      // Motion design tokens - 自然流畅的动画
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',      // 轻微回弹
        'soft-out': 'cubic-bezier(0.16, 1, 0.3, 1)',        // 柔和缓出
        'gentle': 'cubic-bezier(0.25, 0.1, 0.25, 1)',       // 平缓
        'snappy': 'cubic-bezier(0.4, 0, 0.2, 1)',           // 快速响应
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '250ms',
        'slow': '350ms',
        'slower': '500ms',
      },
      // 阴影层级 - subtle 而非强烈
      boxShadow: {
        'soft-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'soft': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.03)',
        'soft-md': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.03)',
        'soft-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.03)',
        'soft-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03)',
        'glow-accent': '0 0 0 3px rgba(184, 152, 95, 0.1)',
        'glow-success': '0 0 0 3px rgba(5, 150, 105, 0.1)',
        'glow-error': '0 0 0 3px rgba(220, 38, 38, 0.1)',
      },
    },
  },
  plugins: [],
  variants: {
    extend: {
      display: ['image-only-mode']
    },
  },
}
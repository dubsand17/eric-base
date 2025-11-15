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
        // 磨砂玻璃风格配色方案 Frosted Glass Design (基于 Ben Issen 设计)
        terminal: {
          // 主背景色
          bg: {
            light: '#f5f5f5',      // 日间：浅灰背景
            dark: '#363636',       // 夜间：深灰背景 (rgb(54, 54, 54))
          },
          // 次级背景（卡片、面板）- 磨砂玻璃效果
          surface: {
            light: 'rgba(255, 255, 255, 0.85)',      // 日间：半透明白色
            dark: 'rgba(46, 46, 46, 0.85)',       // 夜间：深灰卡片 (rgb(46, 46, 46))
          },
          // 选中/激活状态背景
          surfaceActive: {
            light: 'rgba(245, 245, 245, 0.9)',      // 日间：稍深的灰
            dark: 'rgba(71, 71, 71, 0.9)',       // 夜间：中灰 (rgb(71, 71, 71))
          },
          // 边框 - 细边框
          border: {
            light: 'rgba(0, 0, 0, 0.1)',      // 日间：淡黑色边框
            dark: 'rgba(117, 117, 117, 0.5)',       // 夜间：中灰边框 (rgba(117, 117, 117, 0.5))
          },
          // 强调色 - 黄金色
          accent: {
            light: '#d4af37',      // 日间：经典金色
            dark: '#ffd700',       // 夜间：标准金色（更亮）
          },
          // 涨（买入）- 绿色
          up: {
            DEFAULT: '#238636',    // 日间：深绿
            light: '#238636',
            dark: '#3fb950',
            glow: 'rgba(35, 134, 54, 0.3)',
          },
          // 跌（卖出）- 红色
          down: {
            DEFAULT: '#da3633',    // 红色
            light: '#da3633',
            dark: '#f85149',
            glow: 'rgba(218, 54, 51, 0.3)',
          },
          // 信息色
          info: {
            light: '#d4af37',      // 金色
            dark: '#ffd700',
          },
          // 警告色
          warning: {
            light: '#d29922',      // 橙色
            dark: '#d29922',
          },
          // 文本
          text: {
            primary: {
              light: '#1f2328',    // 日间：深灰文字
              dark: '#e0e0e0',     // 夜间：浅灰文字 (rgb(224, 224, 224))
            },
            secondary: {
              light: '#656d76',    // 日间：中灰文字
              dark: '#bdbdbd',     // 夜间：中灰文字 (rgb(189, 189, 189))
            },
            muted: {
              light: '#8b949e',    // 日间：浅灰文字
              dark: '#999999',     // 夜间：深灰文字 (rgb(153, 153, 153))
            }
          }
        }
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
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
        // 交易终端配色方案 - 赛博朋克风格 Cyberpunk Trading Terminal
        terminal: {
          // 主背景色
          bg: {
            light: '#e4e8ed',      // 日间：金属灰蓝
            dark: '#0a0d12',       // 夜间：深空黑
          },
          // 次级背景（卡片、面板）
          surface: {
            light: '#f8f9fb',      // 日间：银白金属
            dark: '#12161d',       // 夜间：碳纤维黑
          },
          // 边框 - 金属质感
          border: {
            light: '#b8c5d6',      // 日间：银色金属边框
            dark: '#1e2732',       // 夜间：钛合金灰
          },
          // 强调色 - 电子蓝/霓虹青
          accent: {
            light: '#0ea5e9',      // 日间：电子蓝（更鲜艳）
            dark: '#00d9ff',       // 夜间：霓虹青（高亮度）
          },
          // 涨（买入）- 霓虹绿
          up: {
            DEFAULT: '#059669',    // 日间：深绿（更高可读性）
            light: '#5affcd',
            dark: '#00ff9f',
            glow: 'rgba(0, 255, 159, 0.6)',
          },
          // 跌（卖出）- 霓虹红
          down: {
            DEFAULT: '#ff0055',    // 霓虹红/粉
            light: '#ff5588',
            dark: '#d9003d',
            glow: 'rgba(255, 0, 85, 0.6)',
          },
          // 信息色
          info: {
            light: '#3b82f6',      // 蓝色
            dark: '#60a5fa',
          },
          // 警告色
          warning: {
            light: '#f59e0b',      // 橙色
            dark: '#fbbf24',
          },
          // 文本
          text: {
            primary: {
              light: '#1a2332',
              dark: '#e6edf3',
            },
            secondary: {
              light: '#4b5d75',
              dark: '#8b949e',
            },
            muted: {
              light: '#6b7b8f',
              dark: '#6e7681',
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
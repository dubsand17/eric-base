'use client'

import React, { useEffect, useRef, memo } from 'react'

interface TradingViewWidgetProps {
  symbol: string
  interval?: string
  theme?: 'light' | 'dark'
}

function TradingViewWidget({ symbol, interval = '60', theme = 'light' }: TradingViewWidgetProps) {
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!container.current) return

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    script.type = 'text/javascript'
    script.async = true
    
    const config = {
      autosize: true,
      symbol: symbol,
      interval: interval,
      timezone: 'Etc/UTC',
      theme: theme,
      style: '1',
      locale: 'zh_CN',
      allow_symbol_change: true,
      calendar: false,
      support_host: 'https://cn.tradingview.com',
      hide_side_toolbar: true,
      hide_top_toolbar: false,
      hide_legend: false,
      hide_volume: false,
      save_image: true,
      backgroundColor: theme === 'dark' ? '##181C25' : '#ffffff',
      gridColor: theme === 'dark' ? 'rgba(46, 46, 46, 0.3)' : 'rgba(46, 46, 46, 0.06)',
      withdateranges: false,
      studies: [],
      watchlist: [],
      compareSymbols: []
    }

    script.innerHTML = JSON.stringify(config)
    container.current.appendChild(script)

    return () => {
      // 清理脚本
      if (container.current && script.parentNode === container.current) {
        container.current.removeChild(script)
      }
    }
  }, [symbol, interval, theme])

  // 清理符号,用于 URL
  const symbolForUrl = symbol.replace(':', '-')

  return (
    <div className="tradingview-widget-container w-full h-full" ref={container} style={{ height: '100%', width: '100%' }}>
      <div className="tradingview-widget-container__widget" style={{ height: 'calc(100% - 32px)', width: '100%' }}></div>
      <div className="tradingview-widget-copyright">
        <a href={`https://cn.tradingview.com/symbols/${symbolForUrl}/`} rel="noopener nofollow" target="_blank">
          <span className="blue-text">在 TradingView 查看 {symbol}</span>
        </a>
        <span className="trademark"> · TradingView 提供</span>
      </div>
    </div>
  )
}

export default memo(TradingViewWidget)


'use client'

import React, { useEffect, useRef, memo } from 'react'

interface TradingChartProps {
  symbol: string
  interval?: string
  theme?: 'light' | 'dark'
}

function TradingChart({ symbol, interval = '60', theme = 'light' }: TradingChartProps) {
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!container.current) return

    // 清空容器，强制 TradingView 重新初始化
    container.current.innerHTML = ''
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
      backgroundColor: theme === 'dark' ? '#181C25' : '#ffffff',
      gridColor: theme === 'dark' ? 'rgba(46, 46, 46, 0.3)' : 'rgba(46, 46, 46, 0.06)',
      withdateranges: false,
      studies: [],
      watchlist: [],
      compareSymbols: []
    }

    script.innerHTML = JSON.stringify(config)

    // 重建内部容器结构
    const widgetDiv = document.createElement('div')
    widgetDiv.className = 'tradingview-widget-container__widget'
    widgetDiv.style.cssText = 'height: calc(100% - 18px); width: 100%;'

    const copyrightDiv = document.createElement('div')
    copyrightDiv.className = 'tradingview-widget-copyright'
    const symbolForUrlLocal = symbol.replace(':', '-')
    copyrightDiv.innerHTML = `
      <a href="https://cn.tradingview.com/symbols/${symbolForUrlLocal}/" rel="noopener nofollow" target="_blank">
        <span class="blue-text">在 TradingView 查看 ${symbol}</span>
      </a>
      <span class="trademark"> · TradingView 提供</span>
    `

    container.current.appendChild(widgetDiv)
    container.current.appendChild(copyrightDiv)
    container.current.appendChild(script)

    return () => {
      // 清理
      if (container.current) container.current.innerHTML = ''
    }
  }, [symbol, interval, theme])

  // 清理符号,用于 URL
  const symbolForUrl = symbol.replace(':', '-')

  return (
    <div className="tradingview-widget-container w-full h-full" ref={container} style={{ height: '100%', width: '100%' }}>
      <div className="tradingview-widget-container__widget" style={{ height: 'calc(100% - 18px)', width: '100%' }}></div>
      <div className="tradingview-widget-copyright" style={{ paddingTop: '4px', paddingBottom: '4px' }}>
        <a href={`https://cn.tradingview.com/symbols/${symbolForUrl}/`} rel="noopener nofollow" target="_blank">
          <span className="blue-text">在 TradingView 查看 {symbol}</span>
        </a>
        <span className="trademark"> · TradingView 提供</span>
      </div>
    </div>
  )
}

export default memo(TradingChart)


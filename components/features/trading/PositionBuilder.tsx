'use client'

import { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Calculator, Triangle, TrendUp } from 'phosphor-react'

type PositionMode = 'pyramid' | 'dca' | null

// 金字塔建仓参数
interface PyramidParams {
  maxPrice: number | string
  minPrice: number | string
  orderCount: number | string
  totalInvestment: number | string
  currentPrice: number | string
  maxLossPercent: number | string
  lowestPrice: number | string
}

// DCA建仓参数
interface DCAParams {
  totalInvestment: number | string
  buyTimes: number | string
  triggerInterval: number | string
  maxLossPercent: number | string
  entryPrice: number | string
  currentPrice: number | string
  lowestPrice: number | string
}

interface OrderResult {
  order: number
  entryPrice: number
  orderSize: number
  orderValue: number
  cumulativeInvestment: number
  averagePrice: number
  isExecutable: boolean // 是否可以成交（当前价格已达到或低于该订单价格）
}

export default function PositionBuilder() {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<PositionMode>('pyramid') // 默认进入金字塔模式

  // Prevent layout shift when modal opens by compensating for scrollbar
  useEffect(() => {
    if (open) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

      // Apply to body
      document.body.style.paddingRight = `${scrollbarWidth}px`
      document.body.style.overflow = 'hidden'

      // Apply to all fixed position elements to prevent shift
      const fixedElements = document.querySelectorAll('[style*="position: fixed"], [class*="fixed"]')
      fixedElements.forEach((el) => {
        if (el instanceof HTMLElement) {
          el.style.paddingRight = `${scrollbarWidth}px`
        }
      })
    } else {
      document.body.style.paddingRight = ''
      document.body.style.overflow = ''

      // Remove padding from fixed elements
      const fixedElements = document.querySelectorAll('[style*="position: fixed"], [class*="fixed"]')
      fixedElements.forEach((el) => {
        if (el instanceof HTMLElement) {
          el.style.paddingRight = ''
        }
      })
    }

    return () => {
      document.body.style.paddingRight = ''
      document.body.style.overflow = ''
    }
  }, [open])

  // 金字塔参数
  const [pyramidParams, setPyramidParams] = useState<PyramidParams>({
    maxPrice: 3.3,
    minPrice: 2.5,
    orderCount: 5,
    totalInvestment: 1000,
    currentPrice: 2.5,
    maxLossPercent: 10,
    lowestPrice: ""
  })

  // DCA参数
  const [dcaParams, setDCAParams] = useState<DCAParams>({
    totalInvestment: 5000,
    buyTimes: 3,
    triggerInterval: 1,
    maxLossPercent: 10,
    entryPrice: 268,
    currentPrice: 270,
    lowestPrice: ""
  })

  // 计算金字塔建仓结果
  const calculatePyramid = (): { orders: OrderResult[], pnl: number, lossPercent: number, exceeded: boolean, totalQuantity: number, totalInvestment: number, averagePrice: number } => {
    const maxPrice = Number(pyramidParams.maxPrice) || 0
    const minPrice = Number(pyramidParams.minPrice) || 0
    const orderCount = Number(pyramidParams.orderCount) || 1
    const totalInvestment = Number(pyramidParams.totalInvestment) || 0
    const currentPrice = Number(pyramidParams.currentPrice) || 0
    const maxLossPercent = Number(pyramidParams.maxLossPercent) || 0
    const lowestPrice = Number(pyramidParams.lowestPrice) || 0
    const orders: OrderResult[] = []
    const priceStep = (maxPrice - minPrice) / (orderCount - 1)

    // 计算每层投资额比例（金字塔从上到下递增）
    const weights: number[] = []
    for (let i = 0; i < orderCount; i++) {
      weights.push(i + 1)
    }
    const totalWeight = weights.reduce((sum, w) => sum + w, 0)

    let cumulativeInvestment = 0
    let totalQuantity = 0

    for (let i = 0; i < orderCount; i++) {
      const entryPrice = maxPrice - (i * priceStep)
      const orderValue = (weights[i] / totalWeight) * totalInvestment
      const orderSize = orderValue / entryPrice
      cumulativeInvestment += orderValue
      totalQuantity += orderSize
      const averagePrice = cumulativeInvestment / totalQuantity

      // 判断是否可以成交：只与最低价格有关，只要订单价格 >= 最低价格就可以成交（与当前价格无关）
      const isExecutable = lowestPrice === 0 || entryPrice >= lowestPrice

      orders.push({
        order: i + 1,
        entryPrice: Number(entryPrice.toFixed(2)),
        orderSize: Number(orderSize.toFixed(8)),
        orderValue: Number(orderValue.toFixed(2)),
        cumulativeInvestment: Number(cumulativeInvestment.toFixed(2)),
        averagePrice: Number(averagePrice.toFixed(8)),
        isExecutable
      })
    }

    // 只统计可成交订单的 PNL 和盈亏比例
    const executableOrders = orders.filter(o => o.isExecutable)
    const executableInvestment = executableOrders.reduce((sum, o) => sum + o.orderValue, 0)
    const executableQuantity = executableOrders.reduce((sum, o) => sum + o.orderSize, 0)
    const averagePrice = executableQuantity > 0 ? executableInvestment / executableQuantity : 0
    const pnl = executableQuantity > 0 ? (currentPrice * executableQuantity) - executableInvestment : 0
    const lossPercent = executableInvestment === 0 ? 0 : (pnl / executableInvestment) * 100
    const exceeded = lossPercent < 0 && Math.abs(lossPercent) > maxLossPercent
    return { orders, pnl, lossPercent, exceeded, totalQuantity: executableQuantity, totalInvestment: executableInvestment, averagePrice }
  }

  // 计算DCA建仓结果
  const calculateDCA = (): { orders: OrderResult[], pnl: number, lossPercent: number, exceeded: boolean, totalQuantity: number, totalInvestment: number, averagePrice: number } => {
    const totalInvestment = Number(dcaParams.totalInvestment) || 0
    const buyTimes = Number(dcaParams.buyTimes) || 1
    const triggerInterval = Number(dcaParams.triggerInterval) || 0
    const entryPrice = Number(dcaParams.entryPrice) || 0
    const currentPrice = Number(dcaParams.currentPrice) || 0
    const maxLossPercent = Number(dcaParams.maxLossPercent) || 0
    const lowestPrice = Number(dcaParams.lowestPrice) || 0
    const orders: OrderResult[] = []
    const orderValue = totalInvestment / buyTimes

    let cumulativeInvestment = 0
    let totalQuantity = 0

    for (let i = 0; i < buyTimes; i++) {
      const priceDropPercent = i * triggerInterval
      const entryPriceForOrder = entryPrice * (1 - priceDropPercent / 100)
      const orderSize = orderValue / entryPriceForOrder
      cumulativeInvestment += orderValue
      totalQuantity += orderSize
      const averagePrice = cumulativeInvestment / totalQuantity

      // 判断是否可以成交：只与最低价格有关，只要订单价格 >= 最低价格就可以成交（与当前价格无关）
      const isExecutable = lowestPrice === 0 || entryPriceForOrder >= lowestPrice

      orders.push({
        order: i + 1,
        entryPrice: Number(entryPriceForOrder.toFixed(4)),
        orderSize: Number(orderSize.toFixed(8)),
        orderValue: Number(orderValue.toFixed(2)),
        cumulativeInvestment: Number(cumulativeInvestment.toFixed(2)),
        averagePrice: Number(averagePrice.toFixed(6)),
        isExecutable
      })
    }

    // 只统计可成交订单的 PNL 和盈亏比例
    const executableOrders = orders.filter(o => o.isExecutable)
    const executableInvestment = executableOrders.reduce((sum, o) => sum + o.orderValue, 0)
    const executableQuantity = executableOrders.reduce((sum, o) => sum + o.orderSize, 0)
    const averagePrice = executableQuantity > 0 ? executableInvestment / executableQuantity : 0
    const pnl = executableQuantity > 0 ? (currentPrice * executableQuantity) - executableInvestment : 0
    const lossPercent = executableInvestment === 0 ? 0 : (pnl / executableInvestment) * 100
    const exceeded = lossPercent < 0 && Math.abs(lossPercent) > maxLossPercent

    return { orders, pnl, lossPercent, exceeded, totalQuantity: executableQuantity, totalInvestment: executableInvestment, averagePrice }
  }

  const pyramidResults = mode === 'pyramid' ? calculatePyramid() : null
  const dcaResults = mode === 'dca' ? calculateDCA() : null

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          className="h-9 w-9 rounded-lg border border-terminal-border-light dark:border-terminal-border-dark glass-light dark:glass-dark text-sm text-terminal-text-primary-light dark:text-terminal-text-primary-dark hover:border-terminal-borderHover-light dark:hover:border-terminal-borderHover-dark hover:shadow-soft flex items-center justify-center transition-all-gentle active:scale-95"
          aria-label="建仓计算器"
          title="建仓计算器"
        >
          <Calculator className="w-4 h-4" weight="duotone" />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-4xl max-h-[90vh] border border-terminal-border-light dark:border-terminal-border-dark bg-white dark:bg-[#16181d] shadow-soft-xl rounded-2xl z-50 flex flex-col overflow-hidden">


          {/* Sticky Top Bar with Tabs and Close Button */}
          <div className="sticky top-0 px-4 pt-4 pb-3 bg-white dark:bg-[#16181d] border-b border-terminal-border-light dark:border-terminal-border-dark z-10">
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
              {/* Close Button - Left */}
              <Dialog.Close asChild>
                <button
                  aria-label="关闭"
                  className="h-11 w-11 rounded-lg border border-terminal-border-light dark:border-terminal-border-dark bg-white dark:bg-[#16181d] shadow-soft-md flex items-center justify-center text-terminal-text-primary-light dark:text-terminal-text-primary-dark hover:border-terminal-borderHover-light dark:hover:border-terminal-borderHover-dark hover:shadow-soft transition-all-gentle active:scale-95"
                >
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>

              {/* Tab Navigation - Center */}
              <div className="flex justify-center">
                <div className="flex gap-2 p-1 bg-terminal-surface-light dark:bg-terminal-surface-dark rounded-lg border border-terminal-border-light dark:border-terminal-border-dark shadow-soft-md max-w-md">
                  <button
                    onClick={() => setMode('pyramid')}
                    className="px-4 py-2 rounded-md text-sm font-medium text-terminal-text-secondary-light dark:text-terminal-text-secondary-dark hover:bg-terminal-state-hover-light dark:hover:bg-terminal-state-hover-dark transition-all-gentle"
                  >
                    <Triangle className="w-4 h-4 inline-block mr-1.5" weight="duotone" />
                    金字塔建仓
                  </button>
                  <button
                    onClick={() => setMode('dca')}
                    className="px-4 py-2 rounded-md text-sm font-medium text-terminal-text-secondary-light dark:text-terminal-text-secondary-dark hover:bg-terminal-state-hover-light dark:hover:bg-terminal-state-hover-dark transition-all-gentle"
                  >
                    <TrendUp className="w-4 h-4 inline-block mr-1.5" weight="duotone" />
                    DCA建仓
                  </button>
                </div>
              </div>

              {/* Empty space for balance - Right */}
              <div className="w-11"></div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">


            {/* 金字塔建仓 */}
            {mode === 'pyramid' && (
              <div className="space-y-6">
                {/* Tab Navigation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-terminal-text-primary-light dark:text-terminal-text-primary-dark mb-2">
                      建仓最高价
                    </label>
                    <input
                      type="number"
                      value={pyramidParams.maxPrice}
                      onChange={(e) => setPyramidParams({ ...pyramidParams, maxPrice: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-terminal-border-light dark:border-terminal-border-dark bg-white dark:bg-[#16181d] text-sm text-terminal-text-primary-light dark:text-terminal-text-primary-dark focus:outline-none focus:border-terminal-accent-light dark:focus:border-terminal-accent-dark focus:shadow-glow-accent transition-all-gentle"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-terminal-text-primary-light dark:text-terminal-text-primary-dark mb-2">
                      建仓最低价
                    </label>
                    <input
                      type="number"
                      value={pyramidParams.minPrice}
                      onChange={(e) => setPyramidParams({ ...pyramidParams, minPrice: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-terminal-border-light dark:border-terminal-border-dark bg-white dark:bg-[#16181d] text-sm text-terminal-text-primary-light dark:text-terminal-text-primary-dark focus:outline-none focus:border-terminal-accent-light dark:focus:border-terminal-accent-dark focus:shadow-glow-accent transition-all-gentle"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-terminal-text-primary-light dark:text-terminal-text-primary-dark mb-2">
                      订单数量
                    </label>
                    <input
                      type="number"
                      value={pyramidParams.orderCount}
                      onChange={(e) => setPyramidParams({ ...pyramidParams, orderCount: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-terminal-border-light dark:border-terminal-border-dark bg-white dark:bg-[#16181d] text-sm text-terminal-text-primary-light dark:text-terminal-text-primary-dark focus:outline-none focus:border-terminal-accent-light dark:focus:border-terminal-accent-dark focus:shadow-glow-accent transition-all-gentle"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-terminal-text-primary-light dark:text-terminal-text-primary-dark mb-2">
                      总投资额
                    </label>
                    <input
                      type="number"
                      value={pyramidParams.totalInvestment}
                      onChange={(e) => setPyramidParams({ ...pyramidParams, totalInvestment: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-terminal-border-light dark:border-terminal-border-dark bg-white dark:bg-[#16181d] text-sm text-terminal-text-primary-light dark:text-terminal-text-primary-dark focus:outline-none focus:border-terminal-accent-light dark:focus:border-terminal-accent-dark focus:shadow-glow-accent transition-all-gentle"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-terminal-text-primary-light dark:text-terminal-text-primary-dark mb-2">
                      最大亏损比例(%)
                    </label>
                    <input
                      type="number"
                      value={pyramidParams.maxLossPercent}
                      onChange={(e) => setPyramidParams({ ...pyramidParams, maxLossPercent: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-terminal-border-light dark:border-terminal-border-dark bg-white dark:bg-[#16181d] text-sm text-terminal-text-primary-light dark:text-terminal-text-primary-dark focus:outline-none focus:border-terminal-accent-light dark:focus:border-terminal-accent-dark focus:shadow-glow-accent transition-all-gentle"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-terminal-text-primary-light dark:text-terminal-text-primary-dark mb-2">
                      当前价格
                    </label>
                    <input
                      type="number"
                      value={pyramidParams.currentPrice}
                      onChange={(e) => setPyramidParams({ ...pyramidParams, currentPrice: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-terminal-border-light dark:border-terminal-border-dark bg-white dark:bg-[#16181d] text-sm text-terminal-text-primary-light dark:text-terminal-text-primary-dark focus:outline-none focus:border-terminal-accent-light dark:focus:border-terminal-accent-dark focus:shadow-glow-accent transition-all-gentle"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-terminal-text-primary-light dark:text-terminal-text-primary-dark mb-2">
                      最低价（建仓后）
                    </label>
                    <input
                      type="number"
                      value={pyramidParams.lowestPrice}
                      onChange={(e) => setPyramidParams({ ...pyramidParams, lowestPrice: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-terminal-border-light dark:border-terminal-border-dark bg-white dark:bg-[#16181d] text-sm text-terminal-text-primary-light dark:text-terminal-text-primary-dark focus:outline-none focus:border-terminal-accent-light dark:focus:border-terminal-accent-dark focus:shadow-glow-accent transition-all-gentle"
                      placeholder="建仓后的价格最低点"
                    />
                  </div>

                  <div className="flex items-end gap-3">
                    <div className={`flex-1 h-10 px-3 rounded-lg border flex items-center justify-between ${pyramidResults && pyramidResults.pnl >= 0 ? 'border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20' : 'border-rose-500/30 bg-rose-50 dark:bg-rose-950/20'}`}>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">PNL</span>
                      <span className={`text-sm font-bold ${pyramidResults && pyramidResults.pnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {pyramidResults ? pyramidResults.pnl.toFixed(2) : '0.00'}
                      </span>
                    </div>
                    <div className={`h-10 px-3 rounded-lg border flex items-center gap-2 ${pyramidResults ? (pyramidResults.lossPercent >= 0 ? 'border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300' : 'border-rose-500/50 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300') : 'border-terminal-border-light dark:border-terminal-border-dark'}`}>
                      <span className="text-xs font-medium whitespace-nowrap">盈亏</span>
                      <span className={`text-sm font-bold ${pyramidResults ? (pyramidResults.lossPercent >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400') : ''}`}>
                        {pyramidResults ? `${pyramidResults.lossPercent >= 0 ? '+' : ''}${pyramidResults.lossPercent.toFixed(2)}%` : '—'}
                      </span>
                      <span className="text-xs font-medium whitespace-nowrap text-rose-600 dark:text-rose-400">
                        阈值 -{Number(pyramidParams.maxLossPercent) || 0}%
                        {pyramidResults && pyramidResults.averagePrice > 0 && (
                          <span className="ml-1">({(pyramidResults.averagePrice * (1 - (Number(pyramidParams.maxLossPercent) || 0) / 100)).toFixed(2)})</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 结果表格 */}
                {pyramidResults && (
                  <div className="mt-6 -mx-6 px-6 overflow-x-auto">
                    <div className="min-w-[600px]">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-white dark:bg-[#16181d] z-10">
                          <tr className="border-b border-terminal-border-light dark:border-terminal-border-dark">
                            <th className="text-left py-3 px-2 font-medium text-terminal-text-primary-light dark:text-terminal-text-primary-dark bg-white dark:bg-[#16181d]">订单顺序</th>
                            <th className="text-right py-3 px-2 font-medium text-terminal-text-primary-light dark:text-terminal-text-primary-dark bg-white dark:bg-[#16181d]">开仓价格</th>
                            <th className="text-right py-3 px-2 font-medium text-terminal-text-primary-light dark:text-terminal-text-primary-dark bg-white dark:bg-[#16181d]">订单大小</th>
                            <th className="text-right py-3 px-2 font-medium text-terminal-text-primary-light dark:text-terminal-text-primary-dark bg-white dark:bg-[#16181d]">订单价值</th>
                            <th className="text-right py-3 px-2 font-medium text-terminal-text-primary-light dark:text-terminal-text-primary-dark bg-white dark:bg-[#16181d]">累计投资</th>
                            <th className="text-right py-3 px-2 font-medium text-terminal-text-primary-light dark:text-terminal-text-primary-dark bg-white dark:bg-[#16181d]">平均价格</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pyramidResults.orders.map((order) => (
                            <tr
                              key={order.order}
                              className={`border-b border-terminal-border-light/30 dark:border-terminal-border-dark/50 hover:bg-terminal-accent-light/5 dark:hover:bg-terminal-accent-dark/5 ${order.isExecutable ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-l-2 border-l-emerald-500 dark:border-l-emerald-400' : ''
                                }`}
                            >
                              <td className="py-3 px-2 text-terminal-text-primary-light dark:text-terminal-text-primary-dark">
                                <div className="flex items-center gap-2">
                                  {order.order}
                                  {order.isExecutable && (
                                    <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/20 dark:bg-emerald-400/20 text-emerald-700 dark:text-emerald-300 font-medium">
                                      可成交
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-2 text-right text-terminal-text-primary-light dark:text-terminal-text-primary-dark">{order.entryPrice}</td>
                              <td className="py-3 px-2 text-right text-terminal-text-primary-light dark:text-terminal-text-primary-dark">{order.orderSize}</td>
                              <td className="py-3 px-2 text-right text-terminal-text-primary-light dark:text-terminal-text-primary-dark">{order.orderValue}</td>
                              <td className="py-3 px-2 text-right text-terminal-text-primary-light dark:text-terminal-text-primary-dark">{order.cumulativeInvestment}</td>
                              <td className="py-3 px-2 text-right text-terminal-text-primary-light dark:text-terminal-text-primary-dark">{order.averagePrice}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* DCA建仓 */}
            {mode === 'dca' && (
              <div className="space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-terminal-text-primary-light dark:text-terminal-text-primary-dark mb-2">
                      总投入金额
                    </label>
                    <input
                      type="number"
                      value={dcaParams.totalInvestment}
                      onChange={(e) => setDCAParams({ ...dcaParams, totalInvestment: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-terminal-border-light dark:border-terminal-border-dark bg-white dark:bg-[#16181d] text-sm text-terminal-text-primary-light dark:text-terminal-text-primary-dark focus:outline-none focus:border-terminal-accent-light dark:focus:border-terminal-accent-dark focus:shadow-glow-accent transition-all-gentle"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-terminal-text-primary-light dark:text-terminal-text-primary-dark mb-2">
                      总加仓次数
                    </label>
                    <input
                      type="number"
                      value={dcaParams.buyTimes}
                      onChange={(e) => setDCAParams({ ...dcaParams, buyTimes: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-terminal-border-light dark:border-terminal-border-dark bg-white dark:bg-[#16181d] text-sm text-terminal-text-primary-light dark:text-terminal-text-primary-dark focus:outline-none focus:border-terminal-accent-light dark:focus:border-terminal-accent-dark focus:shadow-glow-accent transition-all-gentle"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-terminal-text-primary-light dark:text-terminal-text-primary-dark mb-2">
                      触发间隔(%)
                    </label>
                    <input
                      type="number"
                      value={dcaParams.triggerInterval}
                      onChange={(e) => setDCAParams({ ...dcaParams, triggerInterval: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-terminal-border-light dark:border-terminal-border-dark bg-white dark:bg-[#16181d] text-sm text-terminal-text-primary-light dark:text-terminal-text-primary-dark focus:outline-none focus:border-terminal-accent-light dark:focus:border-terminal-accent-dark focus:shadow-glow-accent transition-all-gentle"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-terminal-text-primary-light dark:text-terminal-text-primary-dark mb-2">
                      最大亏损比例(%)
                    </label>
                    <input
                      type="number"
                      value={dcaParams.maxLossPercent}
                      onChange={(e) => setDCAParams({ ...dcaParams, maxLossPercent: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-terminal-border-light dark:border-terminal-border-dark bg-white dark:bg-[#16181d] text-sm text-terminal-text-primary-light dark:text-terminal-text-primary-dark focus:outline-none focus:border-terminal-accent-light dark:focus:border-terminal-accent-dark focus:shadow-glow-accent transition-all-gentle"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-terminal-text-primary-light dark:text-terminal-text-primary-dark mb-2">
                      入场价格
                    </label>
                    <input
                      type="number"
                      value={dcaParams.entryPrice}
                      onChange={(e) => setDCAParams({ ...dcaParams, entryPrice: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-terminal-border-light dark:border-terminal-border-dark bg-white dark:bg-[#16181d] text-sm text-terminal-text-primary-light dark:text-terminal-text-primary-dark focus:outline-none focus:border-terminal-accent-light dark:focus:border-terminal-accent-dark focus:shadow-glow-accent transition-all-gentle"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-terminal-text-primary-light dark:text-terminal-text-primary-dark mb-2">
                      当前价格
                    </label>
                    <input
                      type="number"
                      value={dcaParams.currentPrice}
                      onChange={(e) => setDCAParams({ ...dcaParams, currentPrice: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-terminal-border-light dark:border-terminal-border-dark bg-white dark:bg-[#16181d] text-sm text-terminal-text-primary-light dark:text-terminal-text-primary-dark focus:outline-none focus:border-terminal-accent-light dark:focus:border-terminal-accent-dark focus:shadow-glow-accent transition-all-gentle"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-terminal-text-primary-light dark:text-terminal-text-primary-dark mb-2">
                      最低价（建仓后）
                    </label>
                    <input
                      type="number"
                      value={dcaParams.lowestPrice}
                      onChange={(e) => setDCAParams({ ...dcaParams, lowestPrice: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-terminal-border-light dark:border-terminal-border-dark bg-white dark:bg-[#16181d] text-sm text-terminal-text-primary-light dark:text-terminal-text-primary-dark focus:outline-none focus:border-terminal-accent-light dark:focus:border-terminal-accent-dark focus:shadow-glow-accent transition-all-gentle"
                      placeholder="建仓后的价格最低点"
                    />
                  </div>

                  <div className="flex items-end gap-3">
                    <div className={`flex-1 h-10 px-3 rounded-lg border flex items-center justify-between ${dcaResults && dcaResults.pnl >= 0 ? 'border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20' : 'border-rose-500/30 bg-rose-50 dark:bg-rose-950/20'}`}>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">PNL</span>
                      <span className={`text-sm font-bold ${dcaResults && dcaResults.pnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {dcaResults ? dcaResults.pnl.toFixed(2) : '0.00'}
                      </span>
                    </div>
                    <div className={`h-10 px-3 rounded-lg border flex items-center gap-2 ${dcaResults ? (dcaResults.lossPercent >= 0 ? 'border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300' : 'border-rose-500/50 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300') : 'border-terminal-border-light dark:border-terminal-border-dark'}`}>
                      <span className="text-xs font-medium whitespace-nowrap">盈亏</span>
                      <span className={`text-sm font-bold ${dcaResults ? (dcaResults.lossPercent >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400') : ''}`}>
                        {dcaResults ? `${dcaResults.lossPercent >= 0 ? '+' : ''}${dcaResults.lossPercent.toFixed(2)}%` : '—'}
                      </span>
                      <span className="text-xs font-medium whitespace-nowrap text-rose-600 dark:text-rose-400">
                        阈值 -{Number(dcaParams.maxLossPercent) || 0}%
                        {dcaResults && dcaResults.averagePrice > 0 && (
                          <span className="ml-1">({(dcaResults.averagePrice * (1 - (Number(dcaParams.maxLossPercent) || 0) / 100)).toFixed(2)})</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 额外信息 */}
                {dcaResults && (() => {
                  const executableOrders = dcaResults.orders.filter(o => o.isExecutable)
                  const lastExecutableOrder = executableOrders[executableOrders.length - 1]
                  return (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30">
                      <div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">最后买入价格</div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{lastExecutableOrder?.entryPrice || '—'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">当前价格</div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{Number(dcaParams.currentPrice).toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">可成交数量</div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {dcaResults.totalQuantity.toFixed(6)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">平均价格</div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {lastExecutableOrder ? (dcaResults.totalInvestment / dcaResults.totalQuantity).toFixed(6) : '—'}
                        </div>
                      </div>
                    </div>
                  )
                })()}

                {/* 结果表格 */}
                {dcaResults && (
                  <div className="mt-6 -mx-6 px-6 overflow-x-auto">
                    <div className="min-w-[600px]">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-white dark:bg-[#16181d] z-10">
                          <tr className="border-b border-terminal-border-light dark:border-terminal-border-dark">
                            <th className="text-left py-3 px-2 font-medium text-terminal-text-primary-light dark:text-terminal-text-primary-dark bg-white dark:bg-[#16181d]">订单顺序</th>
                            <th className="text-right py-3 px-2 font-medium text-terminal-text-primary-light dark:text-terminal-text-primary-dark bg-white dark:bg-[#16181d]">开仓价格</th>
                            <th className="text-right py-3 px-2 font-medium text-terminal-text-primary-light dark:text-terminal-text-primary-dark bg-white dark:bg-[#16181d]">订单大小</th>
                            <th className="text-right py-3 px-2 font-medium text-terminal-text-primary-light dark:text-terminal-text-primary-dark bg-white dark:bg-[#16181d]">订单价值</th>
                            <th className="text-right py-3 px-2 font-medium text-terminal-text-primary-light dark:text-terminal-text-primary-dark bg-white dark:bg-[#16181d]">累计投资</th>
                            <th className="text-right py-3 px-2 font-medium text-terminal-text-primary-light dark:text-terminal-text-primary-dark bg-white dark:bg-[#16181d]">平均价格</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dcaResults.orders.map((order) => (
                            <tr
                              key={order.order}
                              className={`border-b border-terminal-border-light/30 dark:border-terminal-border-dark/50 hover:bg-terminal-accent-light/5 dark:hover:bg-terminal-accent-dark/5 ${order.isExecutable ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-l-2 border-l-emerald-500 dark:border-l-emerald-400' : ''
                                }`}
                            >
                              <td className="py-3 px-2 text-terminal-text-primary-light dark:text-terminal-text-primary-dark">
                                <div className="flex items-center gap-2">
                                  {order.order}
                                  {order.isExecutable && (
                                    <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/20 dark:bg-emerald-400/20 text-emerald-700 dark:text-emerald-300 font-medium">
                                      可成交
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-2 text-right text-terminal-text-primary-light dark:text-terminal-text-primary-dark">{order.entryPrice}</td>
                              <td className="py-3 px-2 text-right text-terminal-text-primary-light dark:text-terminal-text-primary-dark">{order.orderSize}</td>
                              <td className="py-3 px-2 text-right text-terminal-text-primary-light dark:text-terminal-text-primary-dark">{order.orderValue}</td>
                              <td className="py-3 px-2 text-right text-terminal-text-primary-light dark:text-terminal-text-primary-dark">{order.cumulativeInvestment}</td>
                              <td className="py-3 px-2 text-right text-terminal-text-primary-light dark:text-terminal-text-primary-dark">{order.averagePrice}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal >
    </Dialog.Root >
  )
}

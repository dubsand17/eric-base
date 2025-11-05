'use client'

import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import * as Tooltip from '@radix-ui/react-tooltip'
import { TrendingUp, X } from 'lucide-react'

type PositionMode = 'pyramid' | 'dca' | null

// 金字塔建仓参数
interface PyramidParams {
  maxPrice: number | string
  minPrice: number | string
  orderCount: number | string
  totalInvestment: number | string
  currentPrice: number | string
}

// DCA建仓参数
interface DCAParams {
  totalInvestment: number | string
  buyTimes: number | string
  triggerInterval: number | string
  maxLossPercent: number | string
  entryPrice: number | string
  currentPrice: number | string
}

interface OrderResult {
  order: number
  entryPrice: number
  orderSize: number
  orderValue: number
  cumulativeInvestment: number
  averagePrice: number
}

export default function PositionBuilder() {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<PositionMode>(null)
  
  // 金字塔参数
  const [pyramidParams, setPyramidParams] = useState<PyramidParams>({
    maxPrice: 3.3,
    minPrice: 2.5,
    orderCount: 5,
    totalInvestment: 1000,
    currentPrice: 2.5
  })
  
  // DCA参数
  const [dcaParams, setDCAParams] = useState<DCAParams>({
    totalInvestment: 5000,
    buyTimes: 3,
    triggerInterval: 1,
    maxLossPercent: 10,
    entryPrice: 268,
    currentPrice: 270
  })
  
  // 计算金字塔建仓结果
  const calculatePyramid = (): { orders: OrderResult[], pnl: number } => {
    const maxPrice = Number(pyramidParams.maxPrice) || 0
    const minPrice = Number(pyramidParams.minPrice) || 0
    const orderCount = Number(pyramidParams.orderCount) || 1
    const totalInvestment = Number(pyramidParams.totalInvestment) || 0
    const currentPrice = Number(pyramidParams.currentPrice) || 0
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
      
      orders.push({
        order: i + 1,
        entryPrice: Number(entryPrice.toFixed(2)),
        orderSize: Number(orderSize.toFixed(8)),
        orderValue: Number(orderValue.toFixed(2)),
        cumulativeInvestment: Number(cumulativeInvestment.toFixed(2)),
        averagePrice: Number(averagePrice.toFixed(8))
      })
    }
    
    const pnl = (currentPrice * totalQuantity) - totalInvestment
    return { orders, pnl }
  }
  
  // 计算DCA建仓结果
  const calculateDCA = (): { orders: OrderResult[], pnl: number } => {
    const totalInvestment = Number(dcaParams.totalInvestment) || 0
    const buyTimes = Number(dcaParams.buyTimes) || 1
    const triggerInterval = Number(dcaParams.triggerInterval) || 0
    const entryPrice = Number(dcaParams.entryPrice) || 0
    const currentPrice = Number(dcaParams.currentPrice) || 0
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
      
      orders.push({
        order: i + 1,
        entryPrice: Number(entryPriceForOrder.toFixed(4)),
        orderSize: Number(orderSize.toFixed(8)),
        orderValue: Number(orderValue.toFixed(2)),
        cumulativeInvestment: Number(cumulativeInvestment.toFixed(2)),
        averagePrice: Number(averagePrice.toFixed(6))
      })
    }
    
    const pnl = (currentPrice * totalQuantity) - totalInvestment
    
    return { orders, pnl }
  }
  
  const pyramidResults = mode === 'pyramid' ? calculatePyramid() : null
  const dcaResults = mode === 'dca' ? calculateDCA() : null
  
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <Dialog.Trigger asChild>
            <button
              className="h-9 px-3 rounded-xl border-2 border-terminal-border-light dark:border-terminal-border-dark bg-terminal-surface-light dark:bg-terminal-surface-dark text-sm text-terminal-text-primary-light dark:text-terminal-text-primary-dark hover:border-terminal-accent-light dark:hover:border-terminal-accent-dark flex items-center gap-2 transition"
              aria-label="建仓计算器"
            >
              <TrendingUp className="w-4 h-4" />
              <span className="hidden md:inline">建仓</span>
            </button>
          </Dialog.Trigger>
        </Tooltip.Trigger>
        <Tooltip.Content sideOffset={8} className="rounded-md border-2 border-terminal-border-light dark:border-terminal-border-dark bg-terminal-surface-light dark:bg-terminal-surface-dark px-2 py-1 text-xs text-terminal-text-primary-light dark:text-terminal-text-primary-dark shadow-lg">
          建仓计算器
          <Tooltip.Arrow className="fill-terminal-surface-light dark:fill-terminal-surface-dark" />
        </Tooltip.Content>
      </Tooltip.Root>
      
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 data-[state=open]:animate-in data-[state=closed]:animate-out z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-4xl max-h-[90vh] border-2 border-terminal-border-light dark:border-terminal-border-dark bg-terminal-surface-light dark:bg-terminal-surface-dark shadow-[0_10px_50px_rgba(0,0,0,0.5)] dark:shadow-[0_10px_50px_rgba(6,182,212,0.3)] rounded-2xl data-[state=open]:animate-in data-[state=closed]:animate-out z-50 flex flex-col overflow-hidden">
          <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b-2 border-terminal-border-light dark:border-terminal-border-dark bg-terminal-bg-light dark:bg-terminal-bg-dark">
            <Dialog.Title className="text-lg font-semibold text-terminal-text-primary-light dark:text-terminal-text-primary-dark">
              建仓计算器
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                aria-label="关闭"
                className="h-8 w-8 rounded-lg border-2 border-terminal-border-light dark:border-terminal-border-dark bg-terminal-surface-light dark:bg-terminal-surface-dark flex items-center justify-center text-terminal-text-primary-light dark:text-terminal-text-primary-dark hover:border-terminal-accent-light dark:hover:border-terminal-accent-dark transition"
              >
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            {/* 模式选择 */}
            {!mode && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setMode('pyramid')}
                  className="relative p-8 rounded-2xl border-2 border-terminal-border-light dark:border-terminal-border-dark bg-terminal-surface-light dark:bg-terminal-surface-dark hover:border-terminal-accent-light dark:hover:border-terminal-accent-dark transition-all group overflow-hidden shadow-lg"
                >
                  {/* Accent line */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-terminal-accent-light to-terminal-accent-light/50 dark:from-terminal-accent-dark dark:to-terminal-accent-dark/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative">
                    <div className="text-3xl mb-3">📊</div>
                    <h3 className="text-lg font-semibold text-terminal-text-primary-light dark:text-terminal-text-primary-dark mb-2">金字塔建仓</h3>
                    <p className="text-sm text-terminal-text-secondary-light dark:text-terminal-text-secondary-dark leading-relaxed">
                      在价格区间内分批建仓，价格越低买入越多
                    </p>
                  </div>
                </button>
                
                <button
                  onClick={() => setMode('dca')}
                  className="relative p-8 rounded-2xl border-2 border-terminal-border-light dark:border-terminal-border-dark bg-terminal-surface-light dark:bg-terminal-surface-dark hover:border-terminal-accent-light dark:hover:border-terminal-accent-dark transition-all group overflow-hidden shadow-lg"
                >
                  {/* Accent line */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-terminal-accent-light to-terminal-accent-light/50 dark:from-terminal-accent-dark dark:to-terminal-accent-dark/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative">
                    <div className="text-3xl mb-3">💰</div>
                    <h3 className="text-lg font-semibold text-terminal-text-primary-light dark:text-terminal-text-primary-dark mb-2">DCA 建仓</h3>
                    <p className="text-sm text-terminal-text-secondary-light dark:text-terminal-text-secondary-dark leading-relaxed">
                      定投策略，按触发间隔分批买入固定金额
                    </p>
                  </div>
                </button>
              </div>
            )}
            
            {/* 金字塔建仓 */}
            {mode === 'pyramid' && (
              <div className="space-y-6">
                <button
                  onClick={() => setMode(null)}
                  className="text-sm text-terminal-accent-light dark:text-terminal-accent-dark hover:underline"
                >
                  ← 返回选择
                </button>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-terminal-text-primary-light dark:text-terminal-text-primary-dark mb-2">
                      最高价格
                    </label>
                    <input
                      type="number"
                      value={pyramidParams.maxPrice}
                      onChange={(e) => setPyramidParams({ ...pyramidParams, maxPrice: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border-2 border-terminal-border-light dark:border-terminal-border-dark bg-terminal-bg-light dark:bg-terminal-bg-dark text-sm text-terminal-text-primary-light dark:text-terminal-text-primary-dark focus:outline-none focus:ring-2 focus:ring-terminal-accent-light/50 dark:focus:ring-terminal-accent-dark/50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-terminal-text-primary-light dark:text-terminal-text-primary-dark mb-2">
                      最低价格
                    </label>
                    <input
                      type="number"
                      value={pyramidParams.minPrice}
                      onChange={(e) => setPyramidParams({ ...pyramidParams, minPrice: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border-2 border-terminal-border-light dark:border-terminal-border-dark bg-terminal-bg-light dark:bg-terminal-bg-dark text-sm text-terminal-text-primary-light dark:text-terminal-text-primary-dark focus:outline-none focus:ring-2 focus:ring-terminal-accent-light/50 dark:focus:ring-terminal-accent-dark/50"
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
                      className="w-full h-10 px-3 rounded-lg border-2 border-terminal-border-light dark:border-terminal-border-dark bg-terminal-bg-light dark:bg-terminal-bg-dark text-sm text-terminal-text-primary-light dark:text-terminal-text-primary-dark focus:outline-none focus:ring-2 focus:ring-terminal-accent-light/50 dark:focus:ring-terminal-accent-dark/50"
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
                      className="w-full h-10 px-3 rounded-lg border-2 border-terminal-border-light dark:border-terminal-border-dark bg-terminal-bg-light dark:bg-terminal-bg-dark text-sm text-terminal-text-primary-light dark:text-terminal-text-primary-dark focus:outline-none focus:ring-2 focus:ring-terminal-accent-light/50 dark:focus:ring-terminal-accent-dark/50"
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
                      className="w-full h-10 px-3 rounded-lg border-2 border-terminal-border-light dark:border-terminal-border-dark bg-terminal-bg-light dark:bg-terminal-bg-dark text-sm text-terminal-text-primary-light dark:text-terminal-text-primary-dark focus:outline-none focus:ring-2 focus:ring-terminal-accent-light/50 dark:focus:ring-terminal-accent-dark/50"
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <div className={`w-full h-10 px-3 rounded-lg border flex items-center justify-between ${pyramidResults && pyramidResults.pnl >= 0 ? 'border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20' : 'border-rose-500/30 bg-rose-50 dark:bg-rose-950/20'}`}>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">PNL</span>
                      <span className={`text-sm font-bold ${pyramidResults && pyramidResults.pnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {pyramidResults ? pyramidResults.pnl.toFixed(2) : '0.00'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* 结果表格 */}
                {pyramidResults && (
                  <div className="mt-6 -mx-6 px-6 overflow-x-auto">
                    <div className="min-w-[600px]">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-terminal-surface-light dark:bg-terminal-surface-dark z-10">
                          <tr className="border-b-2 border-terminal-border-light dark:border-terminal-border-dark">
                            <th className="text-left py-3 px-2 font-medium text-terminal-text-primary-light dark:text-terminal-text-primary-dark bg-terminal-surface-light dark:bg-terminal-surface-dark">订单顺序</th>
                            <th className="text-right py-3 px-2 font-medium text-terminal-text-primary-light dark:text-terminal-text-primary-dark bg-terminal-surface-light dark:bg-terminal-surface-dark">开仓价格</th>
                            <th className="text-right py-3 px-2 font-medium text-terminal-text-primary-light dark:text-terminal-text-primary-dark bg-terminal-surface-light dark:bg-terminal-surface-dark">订单大小</th>
                            <th className="text-right py-3 px-2 font-medium text-terminal-text-primary-light dark:text-terminal-text-primary-dark bg-terminal-surface-light dark:bg-terminal-surface-dark">订单价值</th>
                            <th className="text-right py-3 px-2 font-medium text-terminal-text-primary-light dark:text-terminal-text-primary-dark bg-terminal-surface-light dark:bg-terminal-surface-dark">累计投资</th>
                            <th className="text-right py-3 px-2 font-medium text-terminal-text-primary-light dark:text-terminal-text-primary-dark bg-terminal-surface-light dark:bg-terminal-surface-dark">平均价格</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pyramidResults.orders.map((order) => (
                            <tr key={order.order} className="border-b border-terminal-border-light/30 dark:border-terminal-border-dark/50 hover:bg-terminal-accent-light/5 dark:hover:bg-terminal-accent-dark/5">
                              <td className="py-3 px-2 text-terminal-text-primary-light dark:text-terminal-text-primary-dark">{order.order}</td>
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
                <button
                  onClick={() => setMode(null)}
                  className="text-sm text-terminal-accent-light dark:text-terminal-accent-dark hover:underline"
                >
                  ← 返回选择
                </button>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-terminal-text-primary-light dark:text-terminal-text-primary-dark mb-2">
                      总投入金额
                    </label>
                    <input
                      type="number"
                      value={dcaParams.totalInvestment}
                      onChange={(e) => setDCAParams({ ...dcaParams, totalInvestment: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border-2 border-terminal-border-light dark:border-terminal-border-dark bg-terminal-bg-light dark:bg-terminal-bg-dark text-sm text-terminal-text-primary-light dark:text-terminal-text-primary-dark focus:outline-none focus:ring-2 focus:ring-terminal-accent-light/50 dark:focus:ring-terminal-accent-dark/50"
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
                      className="w-full h-10 px-3 rounded-lg border-2 border-terminal-border-light dark:border-terminal-border-dark bg-terminal-bg-light dark:bg-terminal-bg-dark text-sm text-terminal-text-primary-light dark:text-terminal-text-primary-dark focus:outline-none focus:ring-2 focus:ring-terminal-accent-light/50 dark:focus:ring-terminal-accent-dark/50"
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
                      className="w-full h-10 px-3 rounded-lg border-2 border-terminal-border-light dark:border-terminal-border-dark bg-terminal-bg-light dark:bg-terminal-bg-dark text-sm text-terminal-text-primary-light dark:text-terminal-text-primary-dark focus:outline-none focus:ring-2 focus:ring-terminal-accent-light/50 dark:focus:ring-terminal-accent-dark/50"
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
                      className="w-full h-10 px-3 rounded-lg border-2 border-terminal-border-light dark:border-terminal-border-dark bg-terminal-bg-light dark:bg-terminal-bg-dark text-sm text-terminal-text-primary-light dark:text-terminal-text-primary-dark focus:outline-none focus:ring-2 focus:ring-terminal-accent-light/50 dark:focus:ring-terminal-accent-dark/50"
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
                      className="w-full h-10 px-3 rounded-lg border-2 border-terminal-border-light dark:border-terminal-border-dark bg-terminal-bg-light dark:bg-terminal-bg-dark text-sm text-terminal-text-primary-light dark:text-terminal-text-primary-dark focus:outline-none focus:ring-2 focus:ring-terminal-accent-light/50 dark:focus:ring-terminal-accent-dark/50"
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
                      className="w-full h-10 px-3 rounded-lg border-2 border-terminal-border-light dark:border-terminal-border-dark bg-terminal-bg-light dark:bg-terminal-bg-dark text-sm text-terminal-text-primary-light dark:text-terminal-text-primary-dark focus:outline-none focus:ring-2 focus:ring-terminal-accent-light/50 dark:focus:ring-terminal-accent-dark/50"
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <div className={`w-full h-10 px-3 rounded-lg border flex items-center justify-between ${dcaResults && dcaResults.pnl >= 0 ? 'border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20' : 'border-rose-500/30 bg-rose-50 dark:bg-rose-950/20'}`}>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">PNL</span>
                      <span className={`text-sm font-bold ${dcaResults && dcaResults.pnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {dcaResults ? dcaResults.pnl.toFixed(2) : '0.00'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* 额外信息 */}
                {dcaResults && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30">
                    <div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">最后买入价格</div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{dcaResults.orders[dcaResults.orders.length - 1]?.entryPrice}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">当前价格</div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{Number(dcaParams.currentPrice).toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">总买入数量</div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {dcaResults.orders.reduce((sum, o) => sum + o.orderSize, 0).toFixed(6)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">平均价格</div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {dcaResults.orders[dcaResults.orders.length - 1]?.averagePrice}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* 结果表格 */}
                {dcaResults && (
                  <div className="mt-6 -mx-6 px-6 overflow-x-auto">
                    <div className="min-w-[600px]">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-terminal-surface-light dark:bg-terminal-surface-dark z-10">
                          <tr className="border-b-2 border-terminal-border-light dark:border-terminal-border-dark">
                            <th className="text-left py-3 px-2 font-medium text-terminal-text-primary-light dark:text-terminal-text-primary-dark bg-terminal-surface-light dark:bg-terminal-surface-dark">订单顺序</th>
                            <th className="text-right py-3 px-2 font-medium text-terminal-text-primary-light dark:text-terminal-text-primary-dark bg-terminal-surface-light dark:bg-terminal-surface-dark">开仓价格</th>
                            <th className="text-right py-3 px-2 font-medium text-terminal-text-primary-light dark:text-terminal-text-primary-dark bg-terminal-surface-light dark:bg-terminal-surface-dark">订单大小</th>
                            <th className="text-right py-3 px-2 font-medium text-terminal-text-primary-light dark:text-terminal-text-primary-dark bg-terminal-surface-light dark:bg-terminal-surface-dark">订单价值</th>
                            <th className="text-right py-3 px-2 font-medium text-terminal-text-primary-light dark:text-terminal-text-primary-dark bg-terminal-surface-light dark:bg-terminal-surface-dark">累计投资</th>
                            <th className="text-right py-3 px-2 font-medium text-terminal-text-primary-light dark:text-terminal-text-primary-dark bg-terminal-surface-light dark:bg-terminal-surface-dark">平均价格</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dcaResults.orders.map((order) => (
                            <tr key={order.order} className="border-b border-terminal-border-light/30 dark:border-terminal-border-dark/50 hover:bg-terminal-accent-light/5 dark:hover:bg-terminal-accent-dark/5">
                              <td className="py-3 px-2 text-terminal-text-primary-light dark:text-terminal-text-primary-dark">{order.order}</td>
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
      </Dialog.Portal>
    </Dialog.Root>
  )
}

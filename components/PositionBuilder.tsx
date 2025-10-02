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
              className="h-9 px-3 rounded-xl border border-black/10 dark:border-white/10 bg-white/30 dark:bg-white/5 backdrop-blur-md text-sm text-gray-700 dark:text-gray-200 hover:bg-white/40 dark:hover:bg-white/10 flex items-center gap-2 transition"
              aria-label="建仓计算器"
            >
              <TrendingUp className="w-4 h-4" />
              <span className="hidden lg:inline">建仓</span>
            </button>
          </Dialog.Trigger>
        </Tooltip.Trigger>
        <Tooltip.Content sideOffset={8} className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-xs text-gray-700 dark:text-gray-200 shadow">
          建仓计算器
          <Tooltip.Arrow className="fill-white dark:fill-gray-800" />
        </Tooltip.Content>
      </Tooltip.Root>
      
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-4xl max-h-[90vh] border border-white/20 dark:border-white/10 bg-white/95 dark:bg-[#0b0f14]/95 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.35)] rounded-2xl data-[state=open]:animate-in data-[state=closed]:animate-out z-50 flex flex-col overflow-hidden">
          <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/10 bg-white/80 dark:bg-[#0b0f14]/80 backdrop-blur-md">
            <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              建仓计算器
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                aria-label="关闭"
                className="h-8 w-8 rounded-full border border-black/10 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-md flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-white/10 transition"
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
                  className="relative p-8 rounded-2xl border border-black/10 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-xl hover:bg-white/60 dark:hover:bg-white/10 transition-all group overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)]"
                >
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5 dark:from-violet-400/10 dark:to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Sheen effect */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent dark:from-white/5 pointer-events-none" />
                  
                  <div className="relative">
                    <div className="text-3xl mb-3">📊</div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">金字塔建仓</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      在价格区间内分批建仓，价格越低买入越多
                    </p>
                  </div>
                </button>
                
                <button
                  onClick={() => setMode('dca')}
                  className="relative p-8 rounded-2xl border border-black/10 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-xl hover:bg-white/60 dark:hover:bg-white/10 transition-all group overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)]"
                >
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 dark:from-blue-400/10 dark:to-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Sheen effect */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent dark:from-white/5 pointer-events-none" />
                  
                  <div className="relative">
                    <div className="text-3xl mb-3">💰</div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">DCA 建仓</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
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
                  className="text-sm text-violet-600 dark:text-violet-400 hover:underline"
                >
                  ← 返回选择
                </button>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      最高价格
                    </label>
                    <input
                      type="number"
                      value={pyramidParams.maxPrice}
                      onChange={(e) => setPyramidParams({ ...pyramidParams, maxPrice: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-md text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      最低价格
                    </label>
                    <input
                      type="number"
                      value={pyramidParams.minPrice}
                      onChange={(e) => setPyramidParams({ ...pyramidParams, minPrice: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-md text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      订单数量
                    </label>
                    <input
                      type="number"
                      value={pyramidParams.orderCount}
                      onChange={(e) => setPyramidParams({ ...pyramidParams, orderCount: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-md text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      总投资额
                    </label>
                    <input
                      type="number"
                      value={pyramidParams.totalInvestment}
                      onChange={(e) => setPyramidParams({ ...pyramidParams, totalInvestment: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-md text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      当前价格
                    </label>
                    <input
                      type="number"
                      value={pyramidParams.currentPrice}
                      onChange={(e) => setPyramidParams({ ...pyramidParams, currentPrice: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-md text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
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
                        <thead className="sticky top-0 bg-white dark:bg-[#0b0f14] z-10">
                          <tr className="border-b-2 border-gray-300 dark:border-white/20">
                            <th className="text-left py-3 px-2 font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#0b0f14]">订单顺序</th>
                            <th className="text-right py-3 px-2 font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#0b0f14]">开仓价格</th>
                            <th className="text-right py-3 px-2 font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#0b0f14]">订单大小</th>
                            <th className="text-right py-3 px-2 font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#0b0f14]">订单价值</th>
                            <th className="text-right py-3 px-2 font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#0b0f14]">累计投资</th>
                            <th className="text-right py-3 px-2 font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#0b0f14]">平均价格</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pyramidResults.orders.map((order) => (
                            <tr key={order.order} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5">
                              <td className="py-3 px-2 text-gray-900 dark:text-gray-100">{order.order}</td>
                              <td className="py-3 px-2 text-right text-gray-900 dark:text-gray-100">{order.entryPrice}</td>
                              <td className="py-3 px-2 text-right text-gray-900 dark:text-gray-100">{order.orderSize}</td>
                              <td className="py-3 px-2 text-right text-gray-900 dark:text-gray-100">{order.orderValue}</td>
                              <td className="py-3 px-2 text-right text-gray-900 dark:text-gray-100">{order.cumulativeInvestment}</td>
                              <td className="py-3 px-2 text-right text-gray-900 dark:text-gray-100">{order.averagePrice}</td>
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
                  className="text-sm text-violet-600 dark:text-violet-400 hover:underline"
                >
                  ← 返回选择
                </button>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      总投入金额
                    </label>
                    <input
                      type="number"
                      value={dcaParams.totalInvestment}
                      onChange={(e) => setDCAParams({ ...dcaParams, totalInvestment: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-md text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      总加仓次数
                    </label>
                    <input
                      type="number"
                      value={dcaParams.buyTimes}
                      onChange={(e) => setDCAParams({ ...dcaParams, buyTimes: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-md text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      触发间隔(%)
                    </label>
                    <input
                      type="number"
                      value={dcaParams.triggerInterval}
                      onChange={(e) => setDCAParams({ ...dcaParams, triggerInterval: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-md text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      最大亏损比例(%)
                    </label>
                    <input
                      type="number"
                      value={dcaParams.maxLossPercent}
                      onChange={(e) => setDCAParams({ ...dcaParams, maxLossPercent: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-md text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      入场价格
                    </label>
                    <input
                      type="number"
                      value={dcaParams.entryPrice}
                      onChange={(e) => setDCAParams({ ...dcaParams, entryPrice: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-md text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      当前价格
                    </label>
                    <input
                      type="number"
                      value={dcaParams.currentPrice}
                      onChange={(e) => setDCAParams({ ...dcaParams, currentPrice: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-md text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        <thead className="sticky top-0 bg-white dark:bg-[#0b0f14] z-10">
                          <tr className="border-b-2 border-gray-300 dark:border-white/20">
                            <th className="text-left py-3 px-2 font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#0b0f14]">订单顺序</th>
                            <th className="text-right py-3 px-2 font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#0b0f14]">开仓价格</th>
                            <th className="text-right py-3 px-2 font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#0b0f14]">订单大小</th>
                            <th className="text-right py-3 px-2 font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#0b0f14]">订单价值</th>
                            <th className="text-right py-3 px-2 font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#0b0f14]">累计投资</th>
                            <th className="text-right py-3 px-2 font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#0b0f14]">平均价格</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dcaResults.orders.map((order) => (
                            <tr key={order.order} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5">
                              <td className="py-3 px-2 text-gray-900 dark:text-gray-100">{order.order}</td>
                              <td className="py-3 px-2 text-right text-gray-900 dark:text-gray-100">{order.entryPrice}</td>
                              <td className="py-3 px-2 text-right text-gray-900 dark:text-gray-100">{order.orderSize}</td>
                              <td className="py-3 px-2 text-right text-gray-900 dark:text-gray-100">{order.orderValue}</td>
                              <td className="py-3 px-2 text-right text-gray-900 dark:text-gray-100">{order.cumulativeInvestment}</td>
                              <td className="py-3 px-2 text-right text-gray-900 dark:text-gray-100">{order.averagePrice}</td>
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

'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { X, ZoomIn, ZoomOut, RotateCw, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import TypewriterText from './TypewriterText'

interface ImageModalProps {
  isOpen: boolean
  imageUrl: string
  images?: string[]
  content?: string
  tweetUrl?: string
  tweetCreatedAt?: string
  onClose: () => void
}

export default function ImageModal({ isOpen, imageUrl, images = [], content, tweetUrl, tweetCreatedAt, onClose }: ImageModalProps) {
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // 获取当前图片列表，如果没有传入images则使用单个imageUrl
  const imageList = images.length > 0 ? images : [imageUrl]
  const currentImage = imageList[currentImageIndex] || imageUrl

  // 用于处理触摸手势的状态
  const [touchStartDistance, setTouchStartDistance] = useState<number | null>(null)
  const [touchStartPosition, setTouchStartPosition] = useState<{x: number, y: number} | null>(null)
  const [lastTapTime, setLastTapTime] = useState(0)

  // 打开时仅重置一次并对齐起始索引，避免翻页时被重置回第一张
  useEffect(() => {
    if (!isOpen) return
    setScale(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
    setIsLoading(true)
    const index = imageList.findIndex(img => img === imageUrl)
    setCurrentImageIndex(index >= 0 ? index : 0)
  }, [isOpen, imageUrl])

  // 事件监听：键盘（移除滚轮缩放）
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
      if (e.key === 'ArrowLeft' && currentImageIndex > 0) {
        handlePrevImage()
      }
      if (e.key === 'ArrowRight' && currentImageIndex < imageList.length - 1) {
        handleNextImage()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose, currentImageIndex, imageList.length])

  // 鼠标事件处理
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }
  
  // 触摸事件处理
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault() // 防止页面滚动
    
    // 检测双击
    const now = Date.now()
    if (now - lastTapTime < 300) { // 300ms内的两次点击视为双击
      // 双击时切换缩放
      if (scale > 1) {
        setScale(1)
        setPosition({ x: 0, y: 0 })
      } else {
        setScale(2)
      }
      setLastTapTime(0) // 重置，避免连续触发
      return
    }
    setLastTapTime(now)
    
    // 单指触摸 - 拖动
    if (e.touches.length === 1 && scale > 1) {
      setIsDragging(true)
      setTouchStartPosition({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      })
    }
    
    // 双指触摸 - 缩放
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const distance = Math.sqrt(dx * dx + dy * dy)
      setTouchStartDistance(distance)
    }
  }
  
  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault() // 防止页面滚动
    
    // 单指拖动
    if (e.touches.length === 1 && touchStartPosition && scale > 1) {
      setPosition({
        x: e.touches[0].clientX - touchStartPosition.x,
        y: e.touches[0].clientY - touchStartPosition.y
      })
    }
    
    // 双指缩放
    if (e.touches.length === 2 && touchStartDistance !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      // 计算缩放比例变化
      const delta = distance / touchStartDistance
      const newScale = Math.max(0.5, Math.min(3, scale * delta))
      
      setScale(newScale)
      setTouchStartDistance(distance) // 更新起始距离，使缩放更平滑
    }
  }
  
  const handleTouchEnd = () => {
    setIsDragging(false)
    setTouchStartDistance(null)
    setTouchStartPosition(null)
  }

  const handleZoomIn = () => {
    setScale(prev => Math.min(3, prev + 0.25))
  }

  const handleZoomOut = () => {
    setScale(prev => Math.max(0.5, prev - 0.25))
  }

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1)
      setScale(1)
      setRotation(0)
      setPosition({ x: 0, y: 0 })
      setIsLoading(true)
    }
  }

  const handleNextImage = () => {
    if (currentImageIndex < imageList.length - 1) {
      setCurrentImageIndex(prev => prev + 1)
      setScale(1)
      setRotation(0)
      setPosition({ x: 0, y: 0 })
      setIsLoading(true)
    }
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(currentImage)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `image-${Date.now()}.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('下载失败:', error)
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black bg-opacity-40 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-6">
          {/* 中心容器 - Linear风格 */}
          <div className="w-[95%] md:w-[90%] h-[95%] md:h-[90%] bg-white dark:bg-[#0d1117] rounded-lg overflow-hidden shadow-xl border border-gray-200/60 dark:border-gray-800/60 flex flex-col md:flex-row" role="dialog" aria-modal="true">
        {/* 左侧内容区域 - 在移动端变为顶部区域 */}
        <div className="w-full md:w-1/3 h-auto md:h-full bg-gray-50 dark:bg-[#161b22] p-3 md:p-5 overflow-y-auto border-b md:border-b-0 md:border-r border-gray-200/60 dark:border-gray-800/60 max-h-[30vh] md:max-h-none">
          <div className="max-w-md mx-auto">
            {/* 关闭按钮 + ESC 提示 */}
            <div className="mb-5 flex items-center gap-2">
              <Dialog.Close asChild>
                <button
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                  title="关闭"
                  aria-label="关闭"
                >
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
              <span className="text-[11px] text-gray-400 dark:text-gray-500 select-none">ESC</span>
            </div>

            {/* 推文内容 */}
            {content && (
              <div className="mb-5">
                <h3 className="text-gray-900 dark:text-white text-lg font-semibold mb-3">百万Eric</h3>
                <TypewriterText
                  text={content}
                  speed={100}
                  className="text-gray-700 dark:text-gray-300 text-base leading-relaxed"
                />
              </div>
            )}

            {/* 时间信息 */}
            {tweetCreatedAt && (
              <div className="mb-4">
                <p className="text-gray-500 dark:text-gray-400 text-xs">
                  发布时间: {new Date(tweetCreatedAt).toLocaleString('zh-CN')}
                </p>
              </div>
            )}

            {/* 原文链接 */}
            {tweetUrl && (
              <div className="mb-5">
                <a
                  href={tweetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors text-xs font-medium"
                >
                  <span>查看原文</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}

            {/* 图片信息 */}
            {imageList.length > 1 && (
              <div className="mb-4">
                <p className="text-gray-500 dark:text-gray-400 text-xs mb-3 font-medium">
                  图片 {currentImageIndex + 1} / {imageList.length}
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={handlePrevImage}
                    disabled={currentImageIndex === 0}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-xs font-medium"
                  >
                    上一张
                  </button>
                  <button
                    onClick={handleNextImage}
                    disabled={currentImageIndex === imageList.length - 1}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-xs font-medium"
                  >
                    下一张
                  </button>
                </div>
              </div>
            )}


          </div>
        </div>

        {/* 右侧图片区域 - 在移动端变为底部区域 */}
        <div 
          className="flex-1 flex flex-col bg-white dark:bg-black min-h-0"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* 图片展示区域 */}
          <div className="flex-1 flex items-center justify-center relative">
            {/* 图片导航按钮 */}
            {imageList.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  disabled={currentImageIndex === 0}
                  className="absolute left-4 z-20 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNextImage}
                  disabled={currentImageIndex === imageList.length - 1}
                  className="absolute right-4 z-20 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* 图片容器 */}
            <div 
              className="relative max-w-full max-h-full cursor-grab active:cursor-grabbing z-0"
              style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
                cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
              }}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* 加载指示器 */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                </div>
              )}
              
              <div 
                className="relative transition-transform duration-200 ease-out"
                style={{
                  transform: `scale(${scale}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center'
                }}
              >
                <Image
                  src={currentImage}
                  alt={`图片 ${currentImageIndex + 1}`}
                  width={800}
                  height={600}
                  className="object-contain max-w-[90vw] md:max-w-[60vw] max-h-[70vh] md:max-h-[80vh] w-auto h-auto"
                  onLoad={() => setIsLoading(false)}
                  onError={() => setIsLoading(false)}
                  priority
                  unoptimized
                />
              </div>
            </div>
          </div>

          {/* 图片下方操作按钮 */}
          <div className="h-16 md:h-20 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 flex items-center justify-center pb-1 md:pb-2">
            <div className="flex items-center justify-center space-x-3">
              <button
                onClick={handleZoomOut}
                className="p-2 rounded-md transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                title="缩小"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-gray-700 dark:text-gray-400 text-xs px-3 min-w-[50px] text-center bg-gray-100 dark:bg-gray-800 rounded-md py-1.5 font-medium">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-2 rounded-md transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                title="放大"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleRotate}
                className="p-2 rounded-md transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                title="旋转"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <button
                onClick={handleDownload}
                className="p-2 bg-violet-600 hover:bg-violet-700 text-white rounded-md transition-colors"
                title="下载"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
)
}
'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { X, ZoomIn, ZoomOut, RotateCw, Download, ChevronLeft, ChevronRight } from 'lucide-react'

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

    const handleWheel = (e: WheelEvent) => {
      if (!isOpen) return
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.1 : 0.1
      setScale(prev => Math.max(0.5, Math.min(3, prev + delta)))
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.addEventListener('wheel', handleWheel, { passive: false })
      document.body.style.overflow = 'hidden'
      // 重置状态
      setScale(1)
      setRotation(0)
      setPosition({ x: 0, y: 0 })
      setIsLoading(true)
      // 找到当前图片在列表中的索引
      const index = imageList.findIndex(img => img === imageUrl)
      setCurrentImageIndex(index >= 0 ? index : 0)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('wheel', handleWheel)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose, imageUrl, imageList, currentImageIndex])

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

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 bg-black bg-opacity-95 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      {/* 左右布局容器 */}
      <div className="flex h-full">
        {/* 左侧内容区域 */}
        <div className="w-1/3 bg-gray-900 bg-opacity-90 p-6 overflow-y-auto">
          <div className="max-w-md mx-auto">
            {/* 关闭按钮 */}
            <button
              onClick={onClose}
              className="mb-4 p-2 text-white hover:text-gray-300 transition-colors rounded-full bg-black bg-opacity-30"
              title="关闭"
            >
              <X className="w-6 h-6" />
            </button>

            {/* 推文内容 */}
            {content && (
              <div className="mb-6">
                <h3 className="text-white text-xl font-medium mb-3">百万Eric</h3>
                <p className="text-gray-200 text-lg leading-relaxed whitespace-pre-wrap">
                  {content}
                </p>
              </div>
            )}

            {/* 时间信息 */}
            {tweetCreatedAt && (
              <div className="mb-4">
                <p className="text-gray-400 text-base">
                  发布时间: {new Date(tweetCreatedAt).toLocaleString('zh-CN')}
                </p>
              </div>
            )}

            {/* 原文链接 */}
            {tweetUrl && (
              <div className="mb-6">
                <a
                  href={tweetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <span className="text-base">查看原文</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}

            {/* 图片信息 */}
            {imageList.length > 1 && (
              <div className="mb-4">
                <p className="text-gray-400 text-sm mb-2">
                  图片 {currentImageIndex + 1} / {imageList.length}
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={handlePrevImage}
                    disabled={currentImageIndex === 0}
                    className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                  >
                    上一张
                  </button>
                  <button
                    onClick={handleNextImage}
                    disabled={currentImageIndex === imageList.length - 1}
                    className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                  >
                    下一张
                  </button>
                </div>
              </div>
            )}


          </div>
        </div>

        {/* 右侧图片区域 */}
        <div 
          className="flex-1 flex flex-col"
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
                  className="absolute left-4 z-10 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNextImage}
                  disabled={currentImageIndex === imageList.length - 1}
                  className="absolute right-4 z-10 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* 图片容器 */}
            <div 
              className="relative max-w-full max-h-full cursor-grab active:cursor-grabbing"
              style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
                cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
              }}
              onMouseDown={handleMouseDown}
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
                  className="object-contain max-w-[60vw] max-h-[80vh] w-auto h-auto"
                  onLoad={() => setIsLoading(false)}
                  onError={() => setIsLoading(false)}
                  priority
                  unoptimized
                />
              </div>
            </div>
          </div>

          {/* 图片下方操作按钮 */}
          <div className="p-6 bg-gray-900 bg-opacity-90 relative">
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={handleZoomOut}
                className="p-3 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors"
                title="缩小"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <span className="text-white text-sm px-4 min-w-[60px] text-center bg-gray-700 rounded-full py-2">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-3 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors"
                title="放大"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                onClick={handleRotate}
                className="p-3 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors"
                title="旋转"
              >
                <RotateCw className="w-5 h-5" />
              </button>
              <button
                onClick={handleDownload}
                className="p-3 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors"
                title="下载"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
            
          </div>
        </div>
      </div>

    </div>
  )
} 
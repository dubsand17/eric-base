import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Twitter Content Showcase',
  description: 'A curated collection of Twitter content',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh" className="dark">
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900 transition-colors duration-200`}>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
} 
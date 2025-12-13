import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '百萬Eric',
  description: 'A curated collection of Eric trade base knowledge',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh" className="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var d=document.documentElement;var t=localStorage.getItem('theme');if(t==='light'){d.classList.remove('dark');}else{d.classList.add('dark');}var dm=localStorage.getItem('display-mode');if(dm==='full-content'){d.classList.remove('image-only-mode');}else{d.classList.add('image-only-mode');}}catch(e){}`
          }}
        />
      </head>
      <body className={`${inter.className} bg-[#f5f5f5] dark:bg-[#363636] transition-colors duration-200`}>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
} 
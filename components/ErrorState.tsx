export default function ErrorState({ error }: { error: string }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="relative w-full max-w-xl">
        {/* 背景装饰 */}
        <div className="pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-gradient-to-b from-white/40 via-transparent to-transparent dark:from-white/10 blur-xl" />

        {/* Glass Card */}
        <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-xl p-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-500/15 to-orange-500/15 text-rose-600 dark:text-rose-300">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100 mb-2">加载失败</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 break-words">{error}</p>

          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-md px-3 py-1.5 text-xs text-gray-800 hover:bg-white/50 dark:text-gray-200 dark:hover:bg-white/10 transition"
          >
            重新加载
          </button>
        </div>
      </div>
    </div>
  )
}
 
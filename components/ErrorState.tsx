export default function ErrorState({ error }: { error: string }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="relative w-full max-w-xl animate-fade-in-up">
        <div className="rounded-2xl border border-terminal-error-light/20 dark:border-terminal-error-dark/25 glass-light dark:glass-dark shadow-soft-lg p-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl border border-terminal-error-light/20 dark:border-terminal-error-dark/25 bg-terminal-error-muted-light dark:bg-terminal-error-muted-dark text-terminal-error-light dark:text-terminal-error-dark">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold tracking-tight text-terminal-text-primary-light dark:text-terminal-text-primary-dark mb-2">加载失败</h3>
          <p className="text-sm text-terminal-text-secondary-light dark:text-terminal-text-secondary-dark mb-5 break-words">{error}</p>

          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-full border border-terminal-border-light dark:border-terminal-border-dark glass-light dark:glass-dark px-3 py-1.5 text-xs text-terminal-text-primary-light dark:text-terminal-text-primary-dark hover:border-terminal-borderHover-light dark:hover:border-terminal-borderHover-dark hover:shadow-soft transition-all-gentle active:scale-95"
          >
            重新加载
          </button>
        </div>
      </div>
    </div>
  )
}
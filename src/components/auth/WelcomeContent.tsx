export function WelcomeContent() {
  return (
    <>
      <div className="mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 via-orange-100 to-rose-100 flex items-center justify-center shadow-lg">
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-amber-600/80" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 3v2M12 19v2M5.64 5.64l1.41 1.41M16.95 16.95l1.41 1.41M3 12h2M19 12h2M5.64 18.36l1.41-1.41M16.95 7.05l1.41-1.41" />
          </svg>
        </div>
      </div>
      <h1 className="text-4xl font-light tracking-tight mb-4 text-gray-900">
        欢迎回来
      </h1>
      <p className="text-lg max-w-md text-gray-600">
        登录您的账户，继续探索 AI 创作的无限可能
      </p>
    </>
  );
}

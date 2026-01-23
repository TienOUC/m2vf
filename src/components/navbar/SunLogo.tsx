'use client';

export const SunLogo = () => {
  return (
    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-100 via-orange-100 to-rose-100 flex items-center justify-center relative overflow-hidden shadow-sm">
      <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 text-amber-600/80" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 3v2M12 19v2M5.64 5.64l1.41 1.41M16.95 16.95l1.41 1.41M3 12h2M19 12h2M5.64 18.36l1.41-1.41M16.95 7.05l1.41-1.41" />
      </svg>
    </div>
  );
};

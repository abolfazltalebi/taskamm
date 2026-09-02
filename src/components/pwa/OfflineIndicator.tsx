import React, { useEffect, useState } from 'react';
import { WifiOff, CheckCircle2 } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBackOnline(true);
      const timer = setTimeout(() => setShowBackOnline(false), 3500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBackOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showBackOnline) return null;

  if (showBackOnline) {
    return (
      <div 
        id="online-success-toast"
        className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl bg-emerald-600/95 backdrop-blur-md px-4 py-2.5 text-xs font-medium text-white shadow-xl shadow-emerald-950/40 border border-emerald-400/30 transition-all animate-bounce"
      >
        <CheckCircle2 className="w-4 h-4 text-emerald-200" />
        <span>اتصال اینترنت برقرار شد — همه داده‌ها امن و همگام هستند.</span>
      </div>
    );
  }

  return (
    <div 
      id="offline-warning-toast"
      className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 rounded-xl bg-slate-900/95 backdrop-blur-md px-4 py-2.5 text-xs font-medium text-amber-300 shadow-2xl shadow-black/60 border border-amber-500/30"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
      </span>
      <WifiOff className="w-4 h-4 text-amber-400" />
      <span>حالت آفلاین — ذخیره‌سازی محلی فعال است و هیچ دادهای از بین نمیرود.</span>
    </div>
  );
};

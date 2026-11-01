import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [reconnecting, setReconnecting] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setReconnecting(true);
      setTimeout(() => {
        setIsOnline(true);
        setReconnecting(false);
      }, 1000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleManualRetry = () => {
    setReconnecting(true);
    setTimeout(() => {
      if (navigator.onLine) {
        setIsOnline(true);
      }
      setReconnecting(false);
    }, 1200);
  };

  if (isOnline && !reconnecting) return null;

  return (
    <div className="bg-amber-500 text-amber-950 px-4 py-2 text-xs font-semibold flex items-center justify-between sticky top-0 z-50 shadow-md transition-all">
      <div className="flex items-center space-x-2">
        {reconnecting ? (
          <RefreshCw className="w-4 h-4 animate-spin text-amber-900" />
        ) : (
          <WifiOff className="w-4 h-4 text-amber-900" />
        )}
        <span>
          {reconnecting
            ? 'Reconnecting to ManaMart neighborhood server...'
            : 'No Internet Connection. Showing cached neighborhood data.'}
        </span>
      </div>
      <button
        onClick={handleManualRetry}
        disabled={reconnecting}
        className="px-2.5 py-1 bg-amber-900 text-white rounded-lg text-[11px] font-bold hover:bg-black transition-colors"
      >
        {reconnecting ? 'Checking...' : 'Retry'}
      </button>
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { pwaService } from '../../lib/pwaService';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(pwaService.isOnline());
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const unsubscribe = pwaService.onNetworkChange((online) => {
      setIsOnline(online);
      setShowNotification(true);
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    });

    return unsubscribe;
  }, []);

  if (!showNotification) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
      <div className={`${
        isOnline 
          ? 'bg-green-500' 
          : 'bg-orange-500'
      } text-white rounded-lg shadow-2xl px-4 py-3 flex items-center gap-3`}>
        {isOnline ? (
          <>
            <Wifi className="w-5 h-5" />
            <span className="font-semibold">Back Online</span>
          </>
        ) : (
          <>
            <WifiOff className="w-5 h-5" />
            <span className="font-semibold">Offline Mode - Cached data available</span>
          </>
        )}
      </div>
    </div>
  );
};

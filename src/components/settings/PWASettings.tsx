import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Bell, 
  Download, 
  Wifi, 
  Camera, 
  HardDrive,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { pwaService } from '../../lib/pwaService';
import { pushNotificationService } from '../../lib/pushNotificationService';
import { offlineDataService } from '../../lib/offlineDataService';

export const PWASettings: React.FC = () => {
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [cameraSupported, setCameraSupported] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [cacheStatus, setCacheStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    checkPWAStatus();
    
    const unsubscribe = pwaService.onNetworkChange((online) => {
      setIsOnline(online);
    });

    return unsubscribe;
  }, []);

  const checkPWAStatus = async () => {
    setIsInstalled(pwaService.isInstalled());
    setCanInstall(pwaService.canInstall());
    setNotificationPermission(pushNotificationService.getPermissionStatus());
    setCameraSupported(await pwaService.checkCameraSupport());
    setCacheStatus(await offlineDataService.getCacheStatus());
  };

  const handleInstall = async () => {
    const success = await pwaService.showInstallPrompt();
    if (success) {
      await checkPWAStatus();
    }
  };

  const handleEnableNotifications = async () => {
    const success = await pushNotificationService.initialize();
    if (success) {
      await checkPWAStatus();
      await pushNotificationService.sendTestNotification();
    }
  };

  const handleDisableNotifications = async () => {
    await pushNotificationService.unsubscribe();
    await checkPWAStatus();
  };

  const handleRequestCamera = async () => {
    const granted = await pwaService.requestCameraPermission();
    if (granted) {
      await checkPWAStatus();
    }
  };

  const handleClearCache = async () => {
    if (confirm('Clear all offline data? You will need internet to reload data.')) {
      await offlineDataService.clearAllCache();
      await checkPWAStatus();
    }
  };

  const StatusIcon: React.FC<{ status: boolean | 'warning' }> = ({ status }) => {
    if (status === true) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else if (status === 'warning') {
      return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
    return <XCircle className="w-5 h-5 text-gray-400" />;
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Smartphone className="w-6 h-6 text-green-600" />
          PWA Settings
        </h2>

        {/* Installation Status */}
        <div className="space-y-4">
          <div className="border-b pb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-gray-600" />
                <div>
                  <h3 className="font-semibold">App Installation</h3>
                  <p className="text-sm text-gray-600">
                    {isInstalled 
                      ? 'App is installed on your device' 
                      : 'Install app for better experience'}
                  </p>
                </div>
              </div>
              <StatusIcon status={isInstalled} />
            </div>
            {!isInstalled && canInstall && (
              <button
                onClick={handleInstall}
                className="w-full mt-2 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
              >
                Install App
              </button>
            )}
          </div>

          {/* Notifications */}
          <div className="border-b pb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-gray-600" />
                <div>
                  <h3 className="font-semibold">Push Notifications</h3>
                  <p className="text-sm text-gray-600">
                    {notificationPermission === 'granted'
                      ? 'Enabled - Receive weather alerts and updates'
                      : 'Enable to receive important farming alerts'}
                  </p>
                </div>
              </div>
              <StatusIcon status={notificationPermission === 'granted'} />
            </div>
            {notificationPermission === 'default' && (
              <button
                onClick={handleEnableNotifications}
                className="w-full mt-2 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Enable Notifications
              </button>
            )}
            {notificationPermission === 'granted' && (
              <button
                onClick={handleDisableNotifications}
                className="w-full mt-2 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Disable Notifications
              </button>
            )}
          </div>

          {/* Camera Access */}
          <div className="border-b pb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Camera className="w-5 h-5 text-gray-600" />
                <div>
                  <h3 className="font-semibold">Camera Access</h3>
                  <p className="text-sm text-gray-600">
                    {cameraSupported
                      ? 'Camera available for disease detection'
                      : 'Camera not detected on this device'}
                  </p>
                </div>
              </div>
              <StatusIcon status={cameraSupported} />
            </div>
            {cameraSupported && (
              <button
                onClick={handleRequestCamera}
                className="w-full mt-2 bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors"
              >
                Test Camera Access
              </button>
            )}
          </div>

          {/* Network Status */}
          <div className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wifi className="w-5 h-5 text-gray-600" />
                <div>
                  <h3 className="font-semibold">Network Status</h3>
                  <p className="text-sm text-gray-600">
                    {isOnline ? 'Connected to internet' : 'Offline - Using cached data'}
                  </p>
                </div>
              </div>
              <StatusIcon status={isOnline ? true : 'warning'} />
            </div>
          </div>

          {/* Offline Data Cache */}
          <div className="pb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <HardDrive className="w-5 h-5 text-gray-600" />
                <div>
                  <h3 className="font-semibold">Offline Data Cache</h3>
                  <p className="text-sm text-gray-600">
                    Cached data available for offline use
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 ml-8 mb-3">
              {Object.entries(cacheStatus).map(([key, cached]) => (
                <div key={key} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{key.replace(/_/g, ' ')}</span>
                  <StatusIcon status={cached} />
                </div>
              ))}
            </div>

            <button
              onClick={handleClearCache}
              className="w-full mt-2 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
            >
              Clear All Cache
            </button>
          </div>
        </div>
      </div>

      {/* PWA Features Info */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
        <h3 className="font-bold text-lg mb-3">PWA Features</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-green-500 font-bold">✓</span>
            <span>Works offline with cached field data, weather, and prices</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 font-bold">✓</span>
            <span>Receive push notifications for weather alerts and price changes</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 font-bold">✓</span>
            <span>Camera access for disease detection</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 font-bold">✓</span>
            <span>Faster loading with cached assets</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 font-bold">✓</span>
            <span>Full-screen app experience</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

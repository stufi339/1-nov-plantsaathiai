// Push Notification Service - Manages push notifications for farming alerts

import { pwaService } from './pwaService';
import { supabase } from './supabase';
import { getNotificationMessage, getActionText } from './notificationMessages';

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
  }>;
}

class PushNotificationService {
  private subscription: PushSubscription | null = null;

  /**
   * Initialize push notifications
   */
  async initialize(): Promise<boolean> {
    try {
      // Request permission
      const permission = await pwaService.requestNotificationPermission();
      
      if (permission !== 'granted') {
        console.warn('Notification permission denied');
        return false;
      }

      // Subscribe to push
      this.subscription = await pwaService.subscribeToPush();
      
      if (this.subscription) {
        // Save subscription to backend
        await this.saveSubscription(this.subscription);
        console.log('✅ Push notifications initialized');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Push notification initialization failed:', error);
      return false;
    }
  }

  /**
   * Save push subscription to backend
   */
  private async saveSubscription(subscription: PushSubscription): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('No user logged in');
        return;
      }

      // Save to Supabase
      await supabase.from('push_subscriptions').upsert({
        user_id: user.id,
        subscription: subscription.toJSON(),
        updated_at: new Date().toISOString()
      });

      console.log('✅ Push subscription saved');
    } catch (error) {
      console.error('Failed to save push subscription:', error);
    }
  }

  /**
   * Send weather alert notification
   */
  async sendWeatherAlert(alert: {
    type: 'rain' | 'frost' | 'heatwave' | 'storm';
    severity: 'low' | 'medium' | 'high';
    location: string;
    language?: 'en' | 'hi' | 'bn';
  }): Promise<void> {
    const icons = {
      rain: '🌧️',
      frost: '❄️',
      heatwave: '🌡️',
      storm: '⛈️'
    };

    const language = alert.language || 'en';
    const message = getNotificationMessage('weather', alert.type, alert.severity, language);

    await pwaService.showNotification(`${icons[alert.type]} Weather Alert`, {
      body: message,
      tag: `weather-${alert.type}`,
      data: { type: 'weather', alert },
      requireInteraction: alert.severity === 'high',
      vibrate: alert.severity === 'high' ? [200, 100, 200, 100, 200] : [200, 100, 200],
      actions: [
        { 
          action: 'view-weather', 
          title: getActionText('viewForecast', language)
        },
        { 
          action: 'dismiss', 
          title: getActionText('dismiss', language)
        }
      ]
    });
  }

  /**
   * Send mandi price alert notification
   */
  async sendPriceAlert(alert: {
    commodity: string;
    currentPrice: number;
    previousPrice: number;
    change: number;
    market: string;
    language?: 'en' | 'hi' | 'bn';
  }): Promise<void> {
    const trend = alert.change > 0 ? '📈' : '📉';
    const changePercent = Math.abs((alert.change / alert.previousPrice) * 100).toFixed(1);
    const language = alert.language || 'en';
    
    // Use witty message for significant changes
    let message: string;
    if (Math.abs(alert.change) > 15) {
      message = alert.change > 0 
        ? getNotificationMessage('price', 'high', 'medium', language)
        : getNotificationMessage('price', 'low', 'medium', language);
    } else if (alert.change > 0) {
      message = getNotificationMessage('price', 'spike', 'medium', language);
    } else {
      message = `₹${alert.currentPrice}/quintal (${changePercent}% change) at ${alert.market}`;
    }

    await pwaService.showNotification(`${trend} ${alert.commodity}`, {
      body: message,
      tag: `price-${alert.commodity}`,
      data: { type: 'price', alert },
      actions: [
        { 
          action: 'view-prices', 
          title: getActionText('viewPrices', language)
        },
        { 
          action: 'dismiss', 
          title: getActionText('dismiss', language)
        }
      ]
    });
  }

  /**
   * Send crop care reminder notification
   */
  async sendCropReminder(reminder: {
    fieldName: string;
    cropName: string;
    task: 'fertilizer' | 'spray' | 'irrigation' | 'weeding' | string;
    dueDate: string;
    language?: 'en' | 'hi' | 'bn';
  }): Promise<void> {
    const language = reminder.language || 'en';
    
    // Use witty message for common tasks
    const taskMessages = {
      fertilizer: getNotificationMessage('reminder', 'fertilizer', 'medium', language),
      spray: getNotificationMessage('reminder', 'spray', 'medium', language),
      irrigation: getNotificationMessage('reminder', 'irrigation', 'medium', language),
      weeding: getNotificationMessage('reminder', 'weeding', 'medium', language)
    };

    const message = taskMessages[reminder.task] || 
                   `${reminder.task} for ${reminder.cropName} in ${reminder.fieldName}`;

    await pwaService.showNotification(`🌾 ${reminder.fieldName}`, {
      body: message,
      tag: `reminder-${reminder.fieldName}`,
      data: { type: 'reminder', reminder },
      requireInteraction: true,
      actions: [
        { 
          action: 'mark-done', 
          title: getActionText('markDone', language)
        },
        { 
          action: 'snooze', 
          title: getActionText('snooze', language)
        }
      ]
    });
  }

  /**
   * Send field monitoring alert notification
   */
  async sendFieldAlert(alert: {
    fieldName: string;
    alertType: 'ndvi_drop' | 'disease_detected' | 'irrigation_needed' | 'pest_warning';
    severity: 'low' | 'medium' | 'high';
    language?: 'en' | 'hi' | 'bn';
  }): Promise<void> {
    const icons = {
      ndvi_drop: '📊',
      disease_detected: '🦠',
      irrigation_needed: '💧',
      pest_warning: '🐛'
    };

    const language = alert.language || 'en';
    
    // Get witty message based on alert type
    let message: string;
    if (alert.alertType === 'ndvi_drop') {
      message = getNotificationMessage('field', 'ndviDrop', alert.severity, language);
    } else if (alert.alertType === 'irrigation_needed') {
      message = getNotificationMessage('field', 'irrigation', alert.severity, language);
    } else if (alert.alertType === 'pest_warning') {
      message = getNotificationMessage('pest', 'nearby', 'medium', language);
    } else {
      message = getNotificationMessage('disease', 'detected', alert.severity, language);
    }

    await pwaService.showNotification(
      `${icons[alert.alertType]} ${alert.fieldName}`,
      {
        body: message,
        tag: `field-${alert.alertType}`,
        data: { type: 'field', alert },
        requireInteraction: alert.severity === 'high',
        vibrate: alert.severity === 'high' ? [200, 100, 200, 100, 200] : [200, 100, 200],
        actions: [
          { 
            action: 'view-field', 
            title: getActionText('viewField', language)
          },
          { 
            action: 'get-advice', 
            title: getActionText('getAdvice', language)
          }
        ]
      }
    );
  }

  /**
   * Send disease detection result notification
   */
  async sendDiseaseDetectionResult(result: {
    disease: string;
    confidence: number;
    severity: 'low' | 'medium' | 'high';
    treatment: string;
    language?: 'en' | 'hi' | 'bn';
  }): Promise<void> {
    const language = result.language || 'en';
    const message = result.disease 
      ? getNotificationMessage('disease', 'detected', result.severity, language)
      : getNotificationMessage('disease', 'healthy', 'medium', language);

    await pwaService.showNotification('🔬 Disease Check', {
      body: message,
      tag: 'disease-detection',
      data: { type: 'disease', result },
      requireInteraction: result.disease !== null,
      actions: result.disease ? [
        { 
          action: 'view-treatment', 
          title: getActionText('viewTreatment', language)
        },
        { 
          action: 'dismiss', 
          title: getActionText('dismiss', language)
        }
      ] : []
    });
  }

  /**
   * Send satellite data update notification
   */
  async sendSatelliteDataUpdate(update: {
    fieldName: string;
    dataType: string;
    message: string;
  }): Promise<void> {
    await pwaService.showNotification('🛰️ Satellite Data Updated', {
      body: `New ${update.dataType} data available for ${update.fieldName}`,
      tag: 'satellite-update',
      data: { type: 'satellite', update }
    });
  }

  /**
   * Schedule daily farming tips notification
   */
  async scheduleDailyTip(tip: string): Promise<void> {
    await pwaService.showNotification('💡 Daily Farming Tip', {
      body: tip,
      tag: 'daily-tip',
      data: { type: 'tip', tip }
    });
  }

  /**
   * Check notification permission status
   */
  getPermissionStatus(): NotificationPermission {
    return Notification.permission;
  }

  /**
   * Check if notifications are supported
   */
  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(): Promise<boolean> {
    try {
      const success = await pwaService.unsubscribeFromPush();
      
      if (success) {
        // Remove from backend
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('user_id', user.id);
        }

        this.subscription = null;
        console.log('✅ Unsubscribed from push notifications');
      }

      return success;
    } catch (error) {
      console.error('Unsubscribe failed:', error);
      return false;
    }
  }

  /**
   * Test notification
   */
  async sendTestNotification(): Promise<void> {
    await pwaService.showNotification('🎉 Test Notification', {
      body: 'Push notifications are working correctly!',
      tag: 'test',
      data: { type: 'test' }
    });
  }
}

export const pushNotificationService = new PushNotificationService();

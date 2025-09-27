"use client";

import { useEffect, useState } from 'react';
import { clientApi } from '@/trpc/react';
import { toast } from 'sonner';
import { usePlatform } from './use-platform';

// Check if we're in a Capacitor environment
const isCapacitor = () => {
  if (typeof window === 'undefined') return false;
  return !!(window as any).Capacitor;
};

// Check if we're on a native platform
const isNativePlatform = () => {
  if (typeof window === 'undefined') return false;
  if (!isCapacitor()) return false;
  const platform = (window as any).Capacitor?.getPlatform?.();
  return platform === 'ios' || platform === 'android';
};

export function usePushNotifications() {
  const [isInitialized, setIsInitialized] = useState(false);
  const { mutate: updatePushToken } = clientApi.user.updatePushToken.useMutation();
  const platform = usePlatform();

  const initialize = async () => {
    // Early return for web platform or non-native environment
    if (platform === 'web' || !isNativePlatform()) {
      console.log('Push notifications not available on web platform');
      return;
    }

    try {
      // Only import on native platforms
      const { PushNotifications } = await import('@capacitor/push-notifications');
      
      const result = await PushNotifications.requestPermissions();
      if (result.receive === 'granted') {
        await PushNotifications.register();
      } else {
        toast.warning('Push notifications permission not granted.');
      }
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      // Only show error on native platforms
      if (isNativePlatform()) {
        toast.error('Failed to initialize push notifications.');
      }
    }
  };

  useEffect(() => {
    // Early return for web platform or non-native environment
    if (isInitialized || platform === 'web' || !isNativePlatform()) return;

    const setupListeners = async () => {
      try {
        const { PushNotifications } = await import('@capacitor/push-notifications');
        
        PushNotifications.addListener('registration', (token: any) => {
          console.log('Push registration success, token:', token.value);
          updatePushToken({ token: token.value });
        });

        PushNotifications.addListener('registrationError', (error: any) => {
          console.error('Error on registration:', error);
          toast.error('Push notification registration error.');
        });

        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('Push received:', notification);
          toast.info(notification.title || 'New Notification', {
            description: notification.body,
          });
        });

        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
          console.log('Push action performed:', notification);
          // Here you can add logic to navigate to a specific page
        });
      } catch (error) {
        console.error('Failed to setup push notification listeners:', error);
      }
    };

    setupListeners();
    setIsInitialized(true);
  }, [isInitialized, updatePushToken, platform]);

  return { initialize };
}

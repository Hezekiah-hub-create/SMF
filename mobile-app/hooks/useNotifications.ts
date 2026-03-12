import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Only import expo-notifications on non-web platforms or when window/localStorage is present
const isWeb = Platform.OS === 'web';
const isNode = typeof window === 'undefined';
const isAndroidExpoGo = Platform.OS === 'android' && Constants.appOwnership === 'expo';

let Notifications: any = null;
if (!isNode && !isWeb && !isAndroidExpoGo) {
  try {
    // We use require instead of import to avoid side-effects on platforms where it's not supported (like Android Expo Go)
    Notifications = require('expo-notifications');
    
    if (Notifications && Notifications.setNotificationHandler) {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
    }
  } catch (e) {
    console.warn('[Notifications] Failed to load expo-notifications:', e);
  }
}

export const useNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  const [notification, setNotification] = useState<any>(null);
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    if (!Notifications) return;

    registerForPushNotificationsAsync().then(token => {
      if (token) setExpoPushToken(token);
    });

    notificationListener.current = Notifications.addNotificationReceivedListener((notif: any) => {
      setNotification(notif);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response: any) => {
      console.log(response);
    });

    return () => {
      if (notificationListener.current) notificationListener.current.remove();
      if (responseListener.current) responseListener.current.remove();
    };
  }, []);

  return { expoPushToken, notification };
};

async function registerForPushNotificationsAsync() {
  if (!Notifications || isNode) return;
  
  // Check if we're in Expo Go on Android (removed support in SDK 53)
  if (Platform.OS === 'android' && Constants.appOwnership === 'expo') {
    console.warn('[Notifications] Push notifications are not supported in Expo Go on Android. Use a development build.');
    return;
  }

  let token;

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.warn('Failed to get push token for push notification!');
      return;
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
    if (!projectId) {
      console.warn('Project ID not found in expo config, push notifications might fail in production.');
    }
    
    token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    console.log('[PushNotification] Token:', token);
  } catch (e: any) {
    console.warn('[PushNotification] Could not get token (possibly network or Expo Go limitation):', e?.message || e);
  }

  return token;
}

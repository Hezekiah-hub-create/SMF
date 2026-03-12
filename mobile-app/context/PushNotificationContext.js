import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from './AuthContext';

const PushNotificationContext = createContext({});

export const PushNotificationProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [expoPushToken, setExpoPushToken] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);

  const requestPermissions = useCallback(async () => {
    try {
      const Notifications = require('expo-notifications');
      const { status } = await Notifications.getPermissionsAsync();
      if (status === 'granted') {
        setNotificationPermission('granted');
        return true;
      }
      const newStatus = await Notifications.requestPermissionsAsync();
      setNotificationPermission(newStatus.status);
      return newStatus.status === 'granted';
    } catch (error) {
      console.log('Notifications not available:', error.message);
      setNotificationPermission('unavailable');
      return false;
    }
  }, []);

  const registerForPushNotifications = useCallback(async () => {
    try {
      const Notifications = require('expo-notifications');
      const hasPermission = await requestPermissions();
      if (!hasPermission) return null;

      const pushToken = await Notifications.getExpoPushTokenAsync({
        projectId: 'smf-feedback-app',
      });
      
      setExpoPushToken(pushToken);
      
      if (pushToken && pushToken.data) {
        await SecureStore.setItemAsync('pushToken', pushToken.data);
      }
      
      if (token && pushToken && pushToken.data) {
        try {
          const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';
          await fetch(API_BASE_URL + '/users/push-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + token,
            },
            body: JSON.stringify({ pushToken: pushToken.data }),
          });
        } catch (e) {
          console.log('Could not register push token');
        }
      }
      
      return pushToken;
    } catch (error) {
      console.log('Push registration failed:', error.message);
      return null;
    }
  }, [requestPermissions, token]);

  useEffect(() => {
    let isMounted = true;
    let subscriptions = [];

    const setup = async () => {
      try {
        const Notifications = require('expo-notifications');
        setIsAvailable(true);
        
        await registerForPushNotifications();
        
        if (!isMounted) return;

        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
          }),
        });

        const receivedSub = Notifications.addNotificationReceivedListener(function() {});
        const responseSub = Notifications.addNotificationResponseReceivedListener(function(response) {
          var data = response.notification.request.content.data;
          if (data && data.feedbackId) {
            console.log('Navigate to feedback:', data.feedbackId);
          }
        });
        
        subscriptions = [receivedSub, responseSub];
      } catch (error) {
        console.log('Push setup skipped:', error.message);
        setIsAvailable(false);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    if (user) {
      setup();
    } else {
      setIsLoading(false);
    }

    return function cleanup() {
      isMounted = false;
      subscriptions.forEach(function(sub) { if (sub && sub.remove) sub.remove(); });
    };
  }, [user, token, registerForPushNotifications]);

  var value = {
    expoPushToken: expoPushToken,
    notificationPermission: notificationPermission,
    isLoading: isLoading,
    registerForPushNotifications: registerForPushNotifications,
    clearPushToken: function() { return Promise.resolve(); },
    requestPermissions: requestPermissions,
    isAvailable: isAvailable,
  };

  return React.createElement(PushNotificationContext.Provider, { value: value }, children);
};

export function usePushNotifications() {
  var context = useContext(PushNotificationContext);
  if (!context) {
    return {
      expoPushToken: null,
      notificationPermission: null,
      isLoading: false,
      registerForPushNotifications: function() { return Promise.resolve(null); },
      clearPushToken: function() { return Promise.resolve(); },
      requestPermissions: function() { return Promise.resolve(false); },
      isAvailable: false,
    };
  }
  return context;
}

export default PushNotificationContext;

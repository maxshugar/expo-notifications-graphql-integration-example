import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import React, { ReactNode, createContext, useContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

interface NotificationContextType {
  expoPushToken: string | undefined;
  hasUnreadNotifications: boolean;
  permissionGranted: boolean;
  setHasUnreadNotifications: React.Dispatch<React.SetStateAction<boolean>>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>(undefined);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const notificationListener: any = useRef();
  const responseListener: any = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setHasUnreadNotifications(true);
    });
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      setHasUnreadNotifications(true);
    });
    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  async function registerForPushNotificationsAsync(): Promise<string | undefined> {
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    let token;
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        setPermissionGranted(false);
        return undefined;
      }
      setPermissionGranted(true);
      token = (await Notifications.getExpoPushTokenAsync({ projectId: Constants.expoConfig?.extra?.eas.projectId })).data;
    } else {
      alert('Must use physical device for Push Notifications');
    }

    return token;
  }

  return (
    <NotificationContext.Provider value={{
      expoPushToken,
      hasUnreadNotifications,
      permissionGranted,
      setHasUnreadNotifications,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export async function schedulePushNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "You've got mail! 📬",
      body: 'Here is the notification body',
      data: { data: 'goes here' },
    },
    trigger: { seconds: 2 },
  });
}
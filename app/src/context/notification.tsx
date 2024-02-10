import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import React, { ReactNode, createContext, useContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

// Define the type for our context's value
interface NotificationContextType {
  expoPushToken: string | undefined;
  hasUnreadNotifications: boolean;
  setHasUnreadNotifications: React.Dispatch<React.SetStateAction<boolean>>;
}

// Create the context with a default undefined value
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Props type for the provider component
interface NotificationProviderProps {
  children: ReactNode;
}

// Adjusting the NotificationProvider component to fix the type issue
export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>(undefined);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const notificationListener: any = useRef();
  const responseListener: any = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    // Assign listeners to refs
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      setHasUnreadNotifications(true);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response received:', response);
      setHasUnreadNotifications(true);
    });

    // Cleanup
    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);


  const context = {
    expoPushToken,
    hasUnreadNotifications,
    setHasUnreadNotifications
  }

  // Ensure that the function explicitly returns a ReactNode by using parentheses to implicitly return the JSX
  return (
    <NotificationContext.Provider value={context}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use the notification context
export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Helper function to register for notifications and get the token
async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  let token;
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    alert('Failed to get push token for push notification!');
    return undefined;
  }
  token = (await Notifications.getExpoPushTokenAsync({ projectId: Constants.expoConfig?.extra?.eas.projectId })).data;

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

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
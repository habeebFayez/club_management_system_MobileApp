import {createContext, useContext,useEffect, useState} from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import {Alert, Linking, Platform} from 'react-native';

const NotificationContext = createContext();

export const NotificationProvider = ({children}) => {
    const [expoPushToken, setExpoPushToken] = useState(null);
    const [refreshData, setRefreshData] = useState(Date.now());


    const registerForPushNotificationsAsync = async () => {
        try {
            if (!Device.isDevice) {
                alert('Must use physical device for Push Notifications');
                return;
            }

            const {status: existingStatus} = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const {status} = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                Alert.alert(
                    'Permission Required',
                    'Please enable push notifications in settings.',
                    [
                        {text: 'Cancel', style: 'cancel'},
                        {text: 'Open Settings', onPress: () => Linking.openSettings()},
                    ]
                );
                return;
            }

            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#FF231F7C',
                });
            }

            const {data: token} = await Notifications.getExpoPushTokenAsync();
            setExpoPushToken(token);

        } catch (error) {
            console.error('Push notification registration failed:', error);
            return;
        }
    };

    useEffect(() => {
        const subscription = Notifications.addNotificationReceivedListener(notification => {
            console.log('Notification received! Refreshing data...',Date.now());
            setRefreshData(Date.now())
        });
        return () => {
            subscription.remove();

        };
    }, []);
    return (
        <NotificationContext.Provider value={{
            expoPushToken,refreshData,setRefreshData,registerForPushNotificationsAsync}}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);

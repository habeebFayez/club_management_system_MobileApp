import axios from 'axios';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import {clearNotificationToken} from "./ConstantsApiCalls";

let isLoggingOut = false;
let isOffline = false;
let isShowingConnectionAlert = false;


// network listener
NetInfo.addEventListener(state => {
    isOffline = !state.isConnected;
});

const instance = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL,
    timeout: 30000, //  (30 seconds)
});

// Request interceptor to handle offline state
instance.interceptors.request.use(
    async config => {
        if (isOffline) {
            // Return cached data or throw a specific offline error
            return Promise.reject({
                response: { status: 'offline' },
                message: 'No internet connection available'
            });
        }
        return config;
    },
    error => Promise.reject(error)
);

// Response interceptor for errors
instance.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        // Connection timeout or network error
        if ((error.code === 'ECONNABORTED' || !error.response) && !isShowingConnectionAlert) {
            isShowingConnectionAlert = true;

            Alert.alert(
                "Connection Problem",
                "We're having trouble connecting to our servers. Please check your internet connection and try again.",
                [{
                    text: "OK",
                    onPress: () => {
                        // Reset flag when user dismisses the alert
                        isShowingConnectionAlert = false;
                    }
                }]
            );
            setTimeout(() => {
                isShowingConnectionAlert = false;
            }, 10000);


            return Promise.reject(error);
        }

        // Handle authentication errors
        const results = await AsyncStorage.getItem('jwt').catch(err => {
            console.log(err);
            return null;
        });

        if (
            error.response &&
            error.response.status === 401 &&
            results !== null &&
            !isLoggingOut
        ) {
            isLoggingOut = true;

            Alert.alert(
                "Session Expired",
                "Your session has expired. Please log in again.",
                [{
                    text: "Logout",
                    onPress: async () => {
                        await handleLogout();
                        isLoggingOut = false;
                    }
                }]
            );
        }

        return Promise.reject(error);
    }
);

// Modify handleLogout to use function parameters instead of useContext
const handleLogout = async () => {
    try {
        // Get the stored data
        const storedJwt = await AsyncStorage.getItem('jwt');
        const userDataString = await AsyncStorage.getItem('userData');
        const userData = userDataString ? JSON.parse(userDataString) : null;

        // Clear backend notification token if possible
        if (storedJwt && userData) {
            try {
                await clearNotificationToken(storedJwt, userData);
            } catch (e) {
                console.log("Error clearing notification token:", e);
            }
        }

        // Clear local storage
        await AsyncStorage.removeItem('jwt');
        await AsyncStorage.removeItem('userData');

        // Redirect to login (this would need to be handled at the component level)
        console.log("Logged out successfully");
    } catch (error) {
        console.log("Logout Error: ", error);
    }
};

export default instance;
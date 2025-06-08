import {createContext, useContext, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useRouter} from 'expo-router';
import ajax from '../Api/fetchServise';
import AlertMassage from "../component/AlertMassage";
import useAsyncStorage from "../util/useAsyncStorage";
import {clearNotificationToken} from "../api/ConstantsApiCalls";

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [userToken, setUserToken] = useState(null);
    const [jwt, setJwt, isLoaded] = useAsyncStorage(null, "@jwt");

    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const [alertErrMassage, setAlertErrMassage] = useState(null);
    const [massageKey, setMassageKey] = useState(false);
    const parseJwt = (token) => {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map((char) => {
            return '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    };
    useEffect(() => {
        const loadAuth = async () => {
            try {
                if (jwt) {
                    const isValid = await ajax(
                        `${process.env.EXPO_PUBLIC_API_URL}/api/auth/validate?token=${jwt}`,
                        "GET",
                        jwt
                    );
                    if (isValid) {

                    } else {
                        await AsyncStorage.removeItem('@jwt');
                        router.replace('login');
                    }
                } else {
                    router.replace('login');
                }
            } catch (error) {
                console.error('Auth load error:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadAuth();

    }, []);


    const login = async (token) => {
        await AsyncStorage.setItem('@jwt', token);
        setUser({token});
    };

    const logout = async () => {
        await AsyncStorage.removeItem('@jwt');
        clearNotificationToken(storedJwt, user);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{user, login, logout, isLoading}}>
            <AlertMassage errorMessage={alertErrMassage} MassageKey={massageKey} background={'white'}/>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
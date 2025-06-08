import {useEffect, useState} from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

function useAsyncStorage(defaultValue, key) {
    const [value, setValue] = useState(defaultValue);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load initial value from storage if exists *********************************************
    useEffect(() => {
        const loadData = async () => {
            try {
                const storedValue = await AsyncStorage.getItem(key);
                if (storedValue !== null) {
                    setValue(JSON.parse(storedValue));
                }
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setIsLoaded(true);
            }
        };

        loadData();
    }, [key]);

    // Save value to storage whenever it changes ******************************************************
    useEffect(() => {
        const saveData = async () => {
            if (!isLoaded) return;
            try {
                await AsyncStorage.setItem(key, JSON.stringify(value));
            } catch (error) {
                console.error('Error saving data:', error);
            }
        };

        saveData();
    }, [value, key, isLoaded]);


    return [value, setValue, isLoaded];
}

export default useAsyncStorage;

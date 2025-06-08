// ThemeContext.js
import React, {createContext, useEffect, useState} from 'react';
import {darkTheme, lightTheme} from '../constants/theme';
import AsyncStorage from "@react-native-async-storage/async-storage";

export const ThemeContext = createContext();

export const ThemeProvider = ({children}) => {
    const [theme, setTheme] = useState(darkTheme);
    const toggleTheme = async () => {
        const newTheme = theme.type === 'dark' ? lightTheme() : darkTheme();
        setTheme(newTheme);
        try {
            await AsyncStorage.setItem('theme', JSON.stringify(newTheme));
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    };
    useEffect(() => {
        const loadTheme = async () => {
            try {
                const storedTheme = await AsyncStorage.getItem('theme');
                if (storedTheme) {
                    const parsedTheme = JSON.parse(storedTheme);
                    setTheme(parsedTheme.type === 'dark' ? darkTheme : lightTheme);
                }
            } catch (error) {
                console.error('Error loading theme:', error);
            }
        };
        loadTheme();
    }, []);
    // useEffect(() => {
    //     const subscription = Appearance.addChangeListener(({ colorScheme }) => {
    //         const systemTheme = colorScheme === 'dark' ? darkTheme : lightTheme;
    //         console.log("System theme :" ,systemTheme)
    //         setTheme(systemTheme);
    //     });
    //
    //     return () => subscription.remove();
    // }, []);

    return (
        <ThemeContext.Provider value={{theme, toggleTheme}}>
            {children}
        </ThemeContext.Provider>
    );
};
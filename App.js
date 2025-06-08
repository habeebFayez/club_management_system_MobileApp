import React from 'react';
import {ThemeProvider} from "./contexts/ThemeContext";
import MainApp from "./MainApp";
import {NotificationProvider} from "./contexts/NotificationsContext";
import {SafeAreaProvider} from "react-native-safe-area-context";
import {GestureHandlerRootView} from "react-native-gesture-handler";

export default function App() {


    return (
        <GestureHandlerRootView style={{flex: 1}}>

        <SafeAreaProvider   >
            <NotificationProvider>
                <ThemeProvider>
                    <MainApp/>
                </ThemeProvider>
            </NotificationProvider>
        </SafeAreaProvider>
        </GestureHandlerRootView>

    );
}
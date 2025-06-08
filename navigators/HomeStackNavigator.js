import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Home from "../app/allUsersView/home/home";
import Notification from "../app/allUsersView/home/Notification";
import React, {useContext} from "react";
import Search from "../app/allUsersView/home/Search";
import ClubProfile from "../app/allUsersView/Clubs/ClubProfile";
import EventFullView from "../app/allUsersView/home/EventFullView";
import {ThemeContext} from "../contexts/ThemeContext";


const HomeStack = createNativeStackNavigator();

export default function HomeStackNavigator() {
    const {theme} = useContext(ThemeContext);
    return (
        <HomeStack.Navigator
            screenOptions={{
                gestureEnabled: true,
                headerShown: false,
                fullScreenGestureEnabled: true,
                contentStyle: {
                    backgroundColor: theme.colors.white,
                }
            }}
            initialRouteName={'HomeScreen'}>
            <HomeStack.Screen name="HomeScreen" component={Home}/>
            <HomeStack.Screen name="ClubProfile" component={ClubProfile}/>
            <HomeStack.Screen name="EventFullView" component={EventFullView}/>
            <HomeStack.Screen name="Notification" component={Notification}/>
            <HomeStack.Screen name="Search" component={Search}
                              options={{
                                  animation: "none",

                              }}/>
        </HomeStack.Navigator>
    );
}


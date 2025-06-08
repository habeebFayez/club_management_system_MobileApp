import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Notification from "../app/allUsersView/home/Notification";
import React from "react";
import Search from "../app/allUsersView/home/Search";
import ClubProfile from "../app/allUsersView/Clubs/ClubProfile";
import EventFullView from "../app/allUsersView/home/EventFullView";
import Dashboard from "../app/admin/dashboard";


const DashboardStack = createNativeStackNavigator();

export default function DashboardStackNavigator() {

    return (
        <DashboardStack.Navigator
            screenOptions={{
                gestureEnabled: true,
                headerShown: false,
                fullScreenGestureEnabled: true,
            }}
            initialRouteName={'DashboardScreen'}>
            <DashboardStack.Screen name="DashboardScreen" component={Dashboard}/>
            <DashboardStack.Screen name="ClubProfile" component={ClubProfile}/>
            <DashboardStack.Screen name="EventFullView" component={EventFullView}/>
            <DashboardStack.Screen name="Notification" component={Notification}/>
            <DashboardStack.Screen name="Search" component={Search}
                                   options={{
                                       animation: "none",

                                   }}/>
        </DashboardStack.Navigator>
    );
}


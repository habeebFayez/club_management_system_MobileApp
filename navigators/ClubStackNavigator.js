import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Clubs from "../app/allUsersView/Clubs/clubs";
import Notification from "../app/allUsersView/home/Notification";
import React from "react";
import Search from "../app/allUsersView/home/Search";
import ClubProfile from "../app/allUsersView/Clubs/ClubProfile";
import EventFullView from "../app/allUsersView/home/EventFullView";


const ClubStack = createNativeStackNavigator();

export default function ClubStackNavigator() {

    return (
        <ClubStack.Navigator
            screenOptions={{
                gestureEnabled: true,
                headerShown: false,
                fullScreenGestureEnabled: true,
            }}
            initialRouteName={'ClubsScreen'}>
            <ClubStack.Screen name="ClubsScreen" component={Clubs}/>
            <ClubStack.Screen name="ClubProfile" component={ClubProfile}/>
            <ClubStack.Screen name="Notification" component={Notification}/>
            <ClubStack.Screen name="EventFullView" component={EventFullView}/>
            <ClubStack.Screen name="Search" component={Search}
                              options={{
                                  animation: "none",

                              }}/>

        </ClubStack.Navigator>
    );
}


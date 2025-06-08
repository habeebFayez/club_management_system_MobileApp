import {StyleSheet} from 'react-native'
import React from 'react'
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import ClubProfile from "../app/allUsersView/Clubs/ClubProfile";
import EventFullView from "../app/allUsersView/home/EventFullView";
import Notification from "../app/allUsersView/home/Notification";
import Search from "../app/allUsersView/home/Search";
import Calendar from "../app/allUsersView/Calendar/calendar";

const CalendarStack = createNativeStackNavigator();

const CalendarStackNavigator = () => {
    return (
        <CalendarStack.Navigator
            screenOptions={{
                gestureEnabled: true,
                headerShown: false,
                fullScreenGestureEnabled: true,
            }}
            initialRouteName={'CalendarScreen'}>
            <CalendarStack.Screen name="CalendarScreen" component={Calendar}/>
            <CalendarStack.Screen name="ClubProfile" component={ClubProfile}/>
            <CalendarStack.Screen name="EventFullView" component={EventFullView}/>
            <CalendarStack.Screen name="Notification" component={Notification}/>
            <CalendarStack.Screen name="Search" component={Search}
                                  options={{
                                      animation: "none",

                                  }}/>
        </CalendarStack.Navigator>
    )
}
export default CalendarStackNavigator
const styles = StyleSheet.create({})

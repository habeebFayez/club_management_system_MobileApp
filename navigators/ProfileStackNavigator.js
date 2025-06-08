import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Profile from '../app/allUsersView/profile/profile';
import ClubProfile from "../app/allUsersView/Clubs/ClubProfile";
import EventFullView from "../app/allUsersView/home/EventFullView";

const ProfileStack = createNativeStackNavigator();

const ProfileStackNavigator = () => {
    return (
        <ProfileStack.Navigator
            screenOptions={{
                gestureEnabled: true,
                headerShown: false,
                fullScreenGestureEnabled: true,
            }}
            initialRouteName={'ProfileScreen'}>
            <ProfileStack.Screen name="ProfileScreen" component={Profile}/>
            <ProfileStack.Screen name="ClubProfile" component={ClubProfile}/>
            <ProfileStack.Screen name="EventFullView" component={EventFullView}/>

        </ProfileStack.Navigator>
    );
};

export default ProfileStackNavigator;


import React, {useContext, useEffect, useState} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {StyleSheet, Text, View} from "react-native";
import {getUserRole, widthPercentage} from "../helpers/common";
import CustomTabButton from "../component/CustomTabButton";
import AnimatedTabIcon from "../component/AnimatedTabIcon";
import {useScroll} from '../contexts/ScrollContext';
import HomeStackNavigator from "./HomeStackNavigator";
import ClubStackNavigator from "./ClubStackNavigator";
import ProfileStackNavigator from "./ProfileStackNavigator";
import {CredentialsContext} from "../contexts/CredentialsContext";
import DashboardStackNavigator from "./DashboardStackNavigator";
import CalendarStackNavigator from "./CalendarStackNavigator";
import {ThemeContext} from "../contexts/ThemeContext";

const Tab = createBottomTabNavigator();
const BottomTabNavigator = () => {
    const {theme} = useContext(ThemeContext);
    const styles = createStyles(theme);
    const {user} = useContext(CredentialsContext);
    const {isTabBarVisible} = useScroll();
    const [userRole, setUserRole] = useState(null);
    useEffect(() => {
        const role = getUserRole(user);
        setUserRole(role);
    }, [user]);
    return (

        <Tab.Navigator
            initialRouteName="Home"
            screenOptions={({route}) => ({
                tabBarIcon: ({color, focused}) => (
                    <AnimatedTabIcon route={route.name} color={color} focused={focused}/>
                ),
                headerShown: false,
                tabBarBackground: () => (
                    <View style={[styles.tabBarBackground,]}/>
                ),
                tabBarButton: (props) =>
                    <CustomTabButton {...props} />,
                tabBarLabel: ({focused}) => (focused ? null :
                    <Text style={styles.barLabelText}>{route.name}</Text>),
                tabBarStyle: [styles.tabBarContainer, {
                    display: isTabBarVisible ? 'flex' : 'none',
                    // transform: [{ TranslateYTransform: isTabBarVisible ? '0%' : '100%' }], for SDK 53 didnt work
                    opacity: isTabBarVisible ? 1 : 0,
                }],
                tabBarActiveBackgroundColor: theme.colors.primaryDark,
                tabBarInactiveTintColor: theme.colors.primaryDark,
                tabBarActiveTintColor: theme.colors.link,
                tabBarItemStyle: {backgroundColor: 'transparent'},
            })}
        >
            <Tab.Screen name="Clubs" component={ClubStackNavigator}/>
            <Tab.Screen name="Calendar" component={CalendarStackNavigator}/>
            <Tab.Screen name="Home" component={HomeStackNavigator}/>
            {userRole ?
                (userRole === 'MANAGER' || userRole === 'ADMIN') &&
                <Tab.Screen name="Dashboard" component={DashboardStackNavigator}/>
                :
                null}
            <Tab.Screen name="Profile" component={ProfileStackNavigator}/>


        </Tab.Navigator>
    );
};

export default BottomTabNavigator;

const createStyles = (theme) => StyleSheet.create({
    tabBarContainer: {
        position: 'absolute',
        bottom: 10,
        height: 65,
        paddingTop: 10,
        width: widthPercentage(95),
        borderColor: 'rgba(255,255,255,0)',
        borderRadius: 200,
        shadowColor: "#006d9c",
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 0.25,
        shadowRadius: 10,
        borderWidth: 0,

    },
    tabBarBackground: {
        position: 'absolute',
        top: 0,
        left: 20,
        right: 0,
        bottom: 0,
        borderWidth: 1,
        borderColor: theme.colors.gray1,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.white,
        borderRadius: 100,
    },
    barLabelText: {
        fontSize: 10,
        overflow: 'hidden',
        textAlign: 'center',
        color: theme.colors.primaryDark,
        fontWeight: 'bold',
    }
});
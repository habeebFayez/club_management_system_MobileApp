import {useSafeAreaInsets} from 'react-native-safe-area-context';
import React, {useContext,useCallback, useEffect, useRef, useState} from 'react';
import {Animated, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {HugeiconsIcon} from "@hugeicons/react-native";
import {Notification02Icon, SearchIcon,} from "@hugeicons/core-free-icons";
import {CredentialsContext} from "../contexts/CredentialsContext";
import {PopoverContext} from "../contexts/PopoverContext";
import {getUserRole, widthPercentage} from "../helpers/common";
import {getAllAdminNotifications, getAllClubNotifications} from "../api/ConstantsApiCalls";
import {ThemeContext} from "../contexts/ThemeContext";
import {useNotification} from "../contexts/NotificationsContext";


export default function ScreenWrapper({
                                          children,
                                          background = 'white',
                                          isVisible,
                                          pageTitle,
                                          refreshing,
                                          navigation,
                                          onRefresh
                                      }) {
    const {theme} = useContext(ThemeContext);
    const styles = createStyles(theme);
    const { refreshData} = useNotification();

    //contexts control        *************************************************************************************************
    const {storedJwt, user} = useContext(CredentialsContext);
    const {openSuccessMassage, openAlertMassage,} = useContext(PopoverContext);
    //date control        *************************************************************************************************
    const today = new Date();
    const todayDate = today.toISOString().split('T')[0]
    const monthAgoDate = new Date();
    monthAgoDate.setDate(today.getDate() - 30);
    const monthAgoDateISO = monthAgoDate.toISOString().split('T')[0];


    const [userRole, setUserRole] = useState(getUserRole(user));
    const [notificationsNumber, setNotificationsNumber] = useState(0);
    const [onNotificationOpen, setOnNotificationOpen] = useState(false);

    useEffect(() => {

        if (user) {
            (async () => {
                try {
                    const [adminResponse, managerResponse] = await Promise.all([
                        getAllAdminNotifications(user.userID, user, storedJwt, openSuccessMassage, openAlertMassage),
                        getAllClubNotifications(user.userID, user, storedJwt, openSuccessMassage, openAlertMassage)
                    ]);

                    const extractNotifications = (response) => [
                        ...(response?.notificationClub || []),
                        ...(response?.notificationEvent || []),
                        ...(response?.notificationUser || [])
                    ];

                    // Merge all notifications   *********************************************************
                    const allNotifications = [
                        ...extractNotifications(adminResponse),
                        ...extractNotifications(managerResponse)
                    ];

                    // Deduplicate based on notificationID *********************************************************
                    const uniqueNotificationsMap = new Map();
                    allNotifications.forEach((notif) => {
                        uniqueNotificationsMap.set(notif.notificationID, notif);
                    });
                    const uniqueNotifications = Array.from(uniqueNotificationsMap.values());

                    // Filter by creation date and unread *********************************************************
                    const filteredNotifications = uniqueNotifications.filter(
                        (notification) =>
                            !(notification.creationDate < monthAgoDateISO) &&
                            !notification.readStatus
                    );
                    setNotificationsNumber(filteredNotifications.length);
                } catch (error) {
                    console.error("Error fetching notifications", error);
                    openAlertMassage("Something went wrong please try to close the app and open it again.");
                }
            })();
        } else {
            setUserRole(getUserRole(user));
        }
    }, [isVisible,onNotificationOpen, refreshData, storedJwt, user, userRole, refreshing, navigation]);


    const {top} = useSafeAreaInsets();
    const paddingTop = top !== 0 ? top : 60;
    // Animated value starts at 0 (fully visible)
    const translateY = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(translateY, {
            toValue: isVisible ? 0 : -75,
            duration: pageTitle === 'Dashboard' ? 0 : 250,
            useNativeDriver: true,
        }).start();

    }, [isVisible]);

    useEffect(() => {
        if (!userRole) {
            getUserRole(user);
        }
    }, [user, refreshing,refreshData,onNotificationOpen, navigation, storedJwt]);
    const onNotificationPress = useCallback(() => {
        setOnNotificationOpen(prev => !prev);
    }, []);


    return (

        isVisible &&
        <Animated.View style={[styles.headerContainer, {transform: [{translateY}]}]}>
            <View style={styles.header}>
                {/*Search bar                                                ----------------------------------------------------------*/}

                <TouchableOpacity
                    style={styles.search}
                    onPress={() => navigation.navigate("Search", {backTitle: pageTitle})}

                >
                    <HugeiconsIcon
                        icon={SearchIcon}
                        size={26}
                        strokeWidth={1}
                        color={theme.colors.cyan1}
                    />
                </TouchableOpacity>

                {/*Title                                                ----------------------------------------------------------*/}
                <View style={styles.headerTitleContaner}>
                    <Text style={styles.headerTitle}>{pageTitle} </Text>
                </View>
                {/* Notification                                                ----------------------------------------------------------*/}
                <TouchableOpacity
                    style={styles.notification}
                    onPress={() => navigation.navigate("Notification", {backTitle: pageTitle,onNotificationPress:onNotificationPress})}
                >
                    <HugeiconsIcon
                        icon={Notification02Icon}
                        size={26}
                        strokeWidth={1}
                        color={notificationsNumber > 0 ? theme.colors.red : theme.colors.cyan1}
                    />
                    {notificationsNumber > 0 &&
                        <Text style={styles.notificationsNumber}>
                            {notificationsNumber > 99 ? '99' : notificationsNumber}
                        </Text>}


                </TouchableOpacity>

            </View>

        </Animated.View>
    );
}

const createStyles = (theme) => StyleSheet.create({
    headerContainer: {
        position: 'absolute',
        paddingTop: 5,
        top: 0,
        left: 0,
        right: 0,
        height: 40,
        backgroundColor: theme.colors.white,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
        shadowColor: '#006d9c',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.09,
        shadowRadius: 5,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.gray1,
    },
    header: {
        backgroundColor: theme.colors.white,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitleContaner: {
        width: widthPercentage(80),
        justifyContent: 'center',
        alignItems: 'center',

    },
    headerTitle: {
        fontWeight: theme.fonts.semibold,
        fontSize: 18,
        color: theme.colors.text,

    },

    notification: {
        // right:-120

    },
    notificationsNumber: {
        position: 'absolute',
        width: 14,
        height: 14,
        textAlign: 'center',
        fontWeight: 'bold',
        color: 'white',
        alignSelf: 'flex-end',
        padding: 1,
        backgroundColor: theme.colors.red,
        borderRadius: 14,
        fontSize: 9
    },
    search: {
        // left:-120
    },

});

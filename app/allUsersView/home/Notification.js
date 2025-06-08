import {Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import React, {useCallback, useContext, useEffect, useState} from 'react'
import {getUserRole, heightPercentage} from "../../../helpers/common";

import {useScroll} from "../../../contexts/ScrollContext";
import AnimatedSwipeNavigator from "../../../navigators/AnimatedSwipeNavigator";
import {CLUB_DEFAULT_IMAGE} from "../../../constants/DefaultConstants";
import {
    getAllAdminNotifications,
    getAllClubNotifications,
    markAdminNotificationAsRead,
    markClubNotificationAsRead,
    markEventNotificationAsRead
} from "../../../api/ConstantsApiCalls";
import {CredentialsContext} from "../../../contexts/CredentialsContext";
import {PopoverContext} from "../../../contexts/PopoverContext";
import Loading from "../../../component/Loading";
import {ThemeContext} from "../../../contexts/ThemeContext";
import {useNotification} from "../../../contexts/NotificationsContext";

const Notification = ({route, navigation}) => {
    const {theme} = useContext(ThemeContext);
    const styles = createStyles(theme);
    const { refreshData} = useNotification();

    const [refreshing, setRefreshing] = useState(false);
    const {setTabBarVisibility, isTabBarVisible} = useScroll();
    const {backTitle,onNotificationPress} = route.params ||{};
    const [sortedNotifications, setSortedNotifications] = useState([]);
    const {storedJwt, user} = useContext(CredentialsContext);
    const {
        openSuccessMassage,
        openAlertMassage,
    } = useContext(PopoverContext);
//date control        *************************************************************************************************
    const today = new Date();
    const todayDate = today.toISOString().split('T')[0]
    const monthAgoDate = new Date();
    monthAgoDate.setDate(today.getDate() - 30);
    const monthAgoDateISO = monthAgoDate.toISOString().split('T')[0];
    const [userRole, setUserRole] = useState(getUserRole(user));
    const [allNotifications, setAllNotifications] = useState([]);

    const [isLoading, setIsLoading] = useState(false);


    useEffect(() => {
        if (userRole && user) {
            (async () => {
                setIsLoading(true)
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

                    const allNotifications = [
                        ...extractNotifications(adminResponse),
                        ...extractNotifications(managerResponse)
                    ];
                    // Deduplicate based on notificationID *********************************************************
                    const uniqueNotificationsMap = new Map();
                    allNotifications.forEach((notification) => {
                        uniqueNotificationsMap.set(notification.notificationID, notification);
                    });
                    const uniqueNotifications = Array.from(uniqueNotificationsMap.values());

                    // Filter by creation date and unread *********************************************************

                    const filteredNotifications = uniqueNotifications.filter(
                        (notification) => !(notification.creationDate < monthAgoDateISO)
                    );
                    setAllNotifications(filteredNotifications);
                } catch (error) {
                    console.error("Error filtering  notifications", error);
                    openAlertMassage("Something went wrong please try to close the app and open it again.");
                }
                setIsLoading(false)

            })();
        }
    }, [storedJwt,refreshData, user, refreshing, navigation]);

    //BottomTabNavigator Hiding when triggering Notification page       *********************************************************************
    useEffect(() => {
        const parent = navigation.getParent();
        setTabBarVisibility(false);
        return () => {
            setTabBarVisibility(true);
        };
    }, [navigation]);
    // sorting Notification from new to old  *************************************************************
    useEffect(() => {
        setSortedNotifications([...allNotifications]
            .sort((a, b) => {
                if (a.readStatus !== b.readStatus) {
                    return a.readStatus ? 1 : -1;
                }
                return new Date(b.creationDate) - new Date(a.creationDate);
            })
        );

    }, [allNotifications]);


    // Refresh handler (pull-to-refresh)                                        **********************************************************************
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 1500);
    }, []);
    //Read EVENTS admin Notification btn  Call API  **********************************************************
    const handelUserNotificationClick = (notification) => {
        if (!(notification.readStatus)) {
            (async () => {
                const response = await markAdminNotificationAsRead(notification.notificationID, storedJwt, openAlertMassage);
                if (response && !notification.notificationType.includes('DELETING')) {
                    onNotificationPress?.();
                    navigation.navigate('EventFullView',
                        {
                            post: notification.event,
                            backTitle: 'Notifications',
                            rejectionReason: notification.notificationMessage
                        });
                    onRefresh();
                } else {

                    onNotificationPress?.();
                    onRefresh();
                }
            })();
        } else {
            if (!notification.notificationType.includes('DELETING')) {
                onNotificationPress?.();

                navigation.navigate('EventFullView',
                    {
                        post: notification.event,
                        backTitle: 'Notifications',
                        rejectionReason: notification.notificationMessage
                    });
                onRefresh();

            } else {
                onNotificationPress?.();

                openAlertMassage("Event No longer Exists ");
            }

        }
    }
    //Read CLUBS  Notification btn  Call API  **********************************************************
    const handelClubNotificationClick = (notification) => {
        if (!(notification.readStatus)) {
            (async () => {
                const response = await markClubNotificationAsRead(notification.notificationID, storedJwt, openAlertMassage);
                if (response) {
                    onNotificationPress?.();

                    navigation.navigate('ClubProfile', {club: notification.club, user, backTitle: 'Notifications'});
                    onRefresh();

                }
            })();
        } else {
            onNotificationPress?.();

            navigation.navigate('ClubProfile', {
                club: notification.club,
                user,
                backTitle: 'Notifications',
                rejectionReason: notification.notificationMessage
            });
            onRefresh();
            onNotificationPress?.();

        }

    }
    //Read EVENTS MANAGER Notification btn  Call API  **********************************************************
    const handelEventNotificationClick = (notification) => {
        if (!(notification.readStatus)) {
            (async () => {
                const response = await markEventNotificationAsRead(notification.notificationID, storedJwt, openAlertMassage);
                if (response && !notification.notificationType.includes('DELETING')) {
                    onNotificationPress?.();
                    navigation.navigate('EventFullView',
                        {
                            post: notification.event,
                            backTitle: 'Notifications',
                            rejectionReason: notification.notificationMessage
                        });
                    onRefresh();
                } else {
                    onNotificationPress?.();
                    onRefresh();
                }
            })();
        } else {
            if (!notification.notificationType.includes('DELETING')) {
                onNotificationPress?.();
                navigation.navigate('EventFullView',
                    {
                        post: notification.event,
                        backTitle: 'Notifications',
                        rejectionReason: notification.notificationMessage
                    });
                onRefresh();
            } else {
                openAlertMassage("Event No longer Exists ");
                onNotificationPress?.();
                onRefresh();
            }

        }


    }
    //Notification Title admin Mapper  **********************************************************
    const getNotificationTitle = (type) => {
        switch (type) {
            case 'UPDATE_CLUB':
                return 'UPDATE CLUB';
            case 'CREATE_CLUB':
                return 'CREATE CLUB';
            case 'CLUB_UPDATE':
                return 'UPDATE CLUB';
            case 'CLUB_ACTIVATION':
                return 'CLUB ACTIVATION';
            case 'CLUB_REJECTION':
                return 'CLUB REJECTION';
            case 'CLUB_DEACTIVATION':
                return 'CLUB DEACTIVATION';
            case 'EVENT_UPDATE':
                return 'UPDATE EVENT';
            case 'EVENT_ACTIVATION':
                return 'EVENT ACTIVATION';
            case 'EVENT_DEACTIVATION':
                return 'EVENT DEACTIVATION';
            case 'EVENT_DELETING':
                return 'EVENT DELETED';
            case 'EVENT_REJECTION':
                return 'EVENT REJECTION';
            case 'EVENT_CREATION':
                return 'CREATE EVENT';
            default:
                return type;
        }
    };
    //Notification Title color  **********************************************************
    const isItRedText = (type) => {
        const keywords = ['REJECTION', 'DELETING', 'DEACTIVATION'];
        return keywords.some(keyword => type.includes(keyword));
    };


    return (
        <AnimatedSwipeNavigator
            pageTitle={'Notification'}
            isFromLeft={true}
            navigation={navigation}
            user={user}
            userRole={userRole}
            backTitle={backTitle}
        >

            <ScrollView
                style={{backgroundColor: theme.colors.white, height: heightPercentage(100)}}
                scrollEventThrottle={16}
                contentContainerStyle={styles.pageUpNav}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={theme.colors.primaryLight}
                        colors={[theme.colors.primaryLight]}
                    />
                }>
                <View style={styles.container}>
                    {sortedNotifications?.map((note, index) => {
                        const cardLeftLineColor = (note?.notificationType.includes('CLUB') ?
                            theme.colors.primary : theme.colors.events)
                        const cardBackground = (note.readStatus ?
                            theme.type === 'dark' ? theme.colors.gray1 : '#f0f0f0'
                            :
                            theme.type === 'dark' ? theme.colors.gray : '#ffe5e5')
                        const logoImage = (note?.notificationType.includes('CLUB') ?
                            (note?.club?.clubProfilePicURL ?
                                {uri: note.club.clubProfilePicURL}
                                :
                                CLUB_DEFAULT_IMAGE)
                            :
                            userRole === 'ADMIN' ? ((note?.event?.club?.clubProfilePicURL ?
                                    {uri: note.event.club.clubProfilePicURL}
                                    :
                                    CLUB_DEFAULT_IMAGE))
                                : userRole === 'MANAGER' && ((note?.club?.clubProfilePicURL ?
                                {uri: note.club.clubProfilePicURL}
                                :
                                CLUB_DEFAULT_IMAGE)));
                        return (
                            <TouchableOpacity
                                key={index}
                                activeOpacity={0.8}
                                style={[styles.card, {backgroundColor: cardBackground}]}
                                onPress={() => {
                                    note?.notificationType.includes('CLUB') ?
                                        handelClubNotificationClick(note)
                                        :
                                        (userRole === 'ADMIN' ?
                                                handelUserNotificationClick(note)
                                                :
                                                handelEventNotificationClick(note)

                                        )
                                }}
                            >
                                <View style={[styles.leftBorder, {backgroundColor: cardLeftLineColor}]}/>
                                <Image
                                    source={logoImage} style={styles.logo}/>
                                <View style={styles.content}>
                                    <Text style={[styles.title, isItRedText(note.notificationType) &&
                                    {color: theme.colors.rose}]}>
                                        {getNotificationTitle(note.notificationType)}
                                    </Text>

                                    {note.notificationMessage.length > 99 ?
                                        <Text style={styles.message}>
                                            {note.notificationMessage.slice(0, 99)}
                                            <Text style={{color: theme.colors.cyan1}}> Read More...</Text>
                                        </Text>
                                        :
                                        <Text style={styles.message}>
                                            {note.notificationMessage}
                                        </Text>
                                    }
                                    <View style={
                                        {
                                            flexDirection: 'row',
                                            justifyContent: 'space-between'
                                        }
                                    }>

                                        <Text style={styles.date}>{
                                            note?.notificationType.includes('CLUB') ?
                                                (note?.club?.clubName)?.slice(0, 35)
                                                :
                                                (note?.event?.club?.clubName)?.slice(0, 35)} </Text>
                                        <Text style={styles.date}>{(note.creationDate)}</Text>

                                    </View>

                                </View>
                            </TouchableOpacity>
                        );
                    })}
                    {sortedNotifications.length < 1 &&
                        <Text style={styles.noNotificationText}> You have no Notifications to show !</Text>}
                </View>
            </ScrollView>
            {(isLoading || !user || !userRole) &&
                <Loading screenSize={100} size={'large'}/>
            }

        </AnimatedSwipeNavigator>

    )
}
export default Notification

const createStyles = (theme) => StyleSheet.create({
    pageUpNav: {},
    container: {
        flex: 1,
        marginBottom: 75,
        backgroundColor: theme.colors.white,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 2,
        marginBottom: 2,
        borderRadius: 12,
        shadowColor: '#006d9c',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 5,
        overflow: 'hidden',
    },
    leftBorder: {
        width: 5,
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
        height: '100%',
    },
    logo: {
        width: 50,
        height: 50,
        borderRadius: 100,
        marginHorizontal: 10,
    },
    content: {
        flex: 1,
        paddingVertical: 10,
        paddingRight: 12,
    },
    title: {
        fontSize: 13,
        fontWeight: '700',
        color: theme.colors.primaryLight,
        marginBottom: 4,
    },
    message: {
        fontSize: 12,
        color: theme.colors.text,
        marginBottom: 6,
    },
    date: {
        fontSize: 12,
        fontWeight: '400',
        color: theme.colors.textDark,
        textAlign: 'right',
        maxWidth: 200,
    },
    noNotificationText: {
        paddingVertical: heightPercentage(40),
        color: theme.colors.textLight,
        alignSelf: 'center',
        justifyContent: 'center',
        fontSize: 15,
        fontWeight: '600',
    },
});

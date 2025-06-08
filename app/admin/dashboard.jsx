import React, {useCallback, useContext, useEffect, useState} from 'react';
import {
    Animated,
    Dimensions,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import {CredentialsContext} from "../../contexts/CredentialsContext";
import {PopoverContext} from "../../contexts/PopoverContext";
import {
    deleteClub,
    getAllCategories,
    getAllClubs,
    getAllClubsCategories,
    getAllEventCategoriesById,
    getAllEvents,
    getAllUsers,
} from "../../api/ConstantsApiCalls";
import ScreenWrapper from "../../component/ScreenWrapper";
import {useScroll} from "../../contexts/ScrollContext";
import {getUserRole, heightPercentage, widthPercentage} from "../../helpers/common";
import Loading from "../../component/Loading";
import {Gesture, GestureDetector, GestureHandlerRootView} from "react-native-gesture-handler";
import AnalysisDash from "./AnalysisDash";
import EventsDash from "./EventsDash";
import ClubsDash from "./ClubsDash";
import {runOnJS, useAnimatedStyle, useSharedValue, withTiming} from "react-native-reanimated";
import ClubProfile from "../allUsersView/Clubs/ClubProfile";
import {ThemeContext} from "../../contexts/ThemeContext";
import {useNotification} from "../../contexts/NotificationsContext";

const Dashboard = ({navigation}) => {
    const {theme} = useContext(ThemeContext);
    const styles = createStyles(theme);
    const { refreshData} = useNotification();

//date control        *************************************************************************************************
    const today = new Date();
    const todayDate = today.toISOString().split('T')[0]

    const {user, club: MyClub, storedJwt} = useContext(CredentialsContext);
    const startDate = new Date();
    const currentDayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - currentDayOfWeek - 1);
    const {
        openSuccessMassage,
        openAlertMassage,
        setShowPopover,
        openPopover,
        openImagePopover,
        setCloseConfirmation
    } = useContext(PopoverContext);

    // Page View Control                                   ***************************************************************************
    const [activeView, setActiveView] = useState('analysis');
    const [toggleVisibility, setToggleVisibility] = useState(true);

    // Scroll control                                  ***************************************************************************
    const {setTabBarVisibility} = useScroll();
    const [prevOffset, setPrevOffset] = useState(0);
    const [direction, setDirection] = useState('up');
    const [refreshing, setRefreshing] = useState(false);
    const [headerVisible, setHeaderVisible] = useState(true);
    const [scroll, setScroll] = useState(true);
    // Data states                                  ***************************************************************************
    const [users, setUsers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [clubs, setClubs] = useState([]);
    const [events, setEvents] = useState([]);
    const [clubsCategories, setClubsCategories] = useState([]);
    const [eventsCategories, setEventsCategories] = useState([]);
    const [userRole, setUserRole] = useState(getUserRole(user));
    const [responseMsg, setResponseMsg] = useState('');

    // Filtered data                                  ***************************************************************************
    const [pendingClubs, setPendingClubs] = useState([]);
    const [pendingEvents, setPendingEvents] = useState([]);
    const [activeClubs, setActiveClubs] = useState([]);
    const [acceptedEvents, setAcceptedEvents] = useState([]);
    const [weekEvents, setWeekEvents] = useState([]);
    const [rejectedWeekEvents, setRejectedWeekEvents] = useState([]);
    const [acceptedWeekEvents, setAcceptedWeekEvents] = useState([]);
    const [rejectedClubs, setRejectedClubs] = useState([]);
    const [blockedClubs, setBlockedClubs] = useState([]);
    const [rejectedEvents, setRejectedEvents] = useState([]);
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [eventNameSearchActive, setEventNameSearchActive] = useState('');
    // Filtered Events For Manager                       ***************************************************************************
    const [pendingManagerEvents, setPendingManagerEvents] = useState([]);
    const [acceptedManagerEvents, setAcceptedManagerEvents] = useState([]);
    const [rejectedManagerEvents, setRejectedManagerEvents] = useState([]);

// Modal states                                  ***************************************************************************
    const [showFiltering, setShowFiltering] = useState(false);

    // Loading states                                  ***************************************************************************
    const [isLoading, setIsLoading] = useState({
        users: false,
        categories: false,
        clubs: false,
        events: false,
        clubsCategories: false,
        eventsCategories: false,
        action: false
    });
    const [isWaiting, setIsWaiting] = useState(false);

    // Selected items for actions                                  ***************************************************************************
    const [selectedClub, setSelectedClub] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);


    // Fetch all dashboard data                                  ***************************************************************************
    useEffect(() => {
        if (user && storedJwt) {
            fetchDashboardData();
        }
    }, [user,refreshData, refreshing, storedJwt]);

    // Fetch and categorize dashboard data                                   ***************************************************************************
    useEffect(() => {
        setIsWaiting(true);
        // Filter data whenever the main data changes
        if (clubs.length > 0) {
            setPendingClubs(clubs.filter(club => !club.clubIsBlocked && !club.clubisRejected && !club.clubisActivation));
            setActiveClubs(clubs.filter(club => !club.clubIsBlocked && !club.clubisRejected && club.clubisActivation));
            setRejectedClubs(clubs.filter(club => club.clubisRejected));
            setBlockedClubs(clubs.filter(club => club.clubIsBlocked && !club.clubisRejected && !club.clubisActivation));
            setIsWaiting(false);

        }

        if (events.length > 0) {
            setPendingEvents(events.filter(event => (!event.eventisRejected && (!event.eventStates || event.eventUpdated))));
            setAcceptedEvents(events.filter(event => (!event.eventisRejected && event.eventStates && !event.eventUpdated)));
            setRejectedEvents(events.filter(event => event.eventisRejected));
            setWeekEvents(events.filter(event => {
                const eventStartDate = new Date(event.eventCreationDate);
                return (eventStartDate >= startDate.setDate(startDate.getDate()))
            }));
            setAcceptedWeekEvents(acceptedEvents.filter(event => {
                const eventCreationDate = new Date(event.eventCreationDate);
                return (eventCreationDate >= startDate.setDate(startDate.getDate()))
            }));
            setRejectedWeekEvents(rejectedEvents.filter(event => {
                const eventCreationDate = new Date(event.eventCreationDate);
                return (eventCreationDate >= startDate.setDate(startDate.getDate()))
            }));


        }


        if (users.length > 0) {
            setBlockedUsers(users.filter(user => !user.active));
            setIsWaiting(false);

        }

    }, [clubs, refreshing, events, activeView, navigation, users, userRole, MyClub]);
    // Filter and categorize dashboard data of Manager Event     ***************************************************************************
    useEffect(() => {
        if (userRole === 'MANAGER' && MyClub) {
            setIsWaiting(true);

            setAcceptedManagerEvents(acceptedEvents?.filter(event =>
                event.club.clubID === MyClub.clubID).sort((a, b) => {
                const dateA = new Date(a.eventStartingDate);
                const dateB = new Date(b.eventStartingDate);
                return dateA - dateB;
            }));
            setPendingManagerEvents(pendingEvents?.filter(event =>
                event.club.clubID === MyClub.clubID).sort((a, b) => {
                const dateA = new Date(a.eventStartingDate);
                const dateB = new Date(b.eventStartingDate);
                return dateA - dateB;
            }));
            setRejectedManagerEvents(rejectedEvents?.filter(event =>
                event.club.clubID === MyClub.clubID).sort((a, b) => {
                const dateA = new Date(a.eventStartingDate);
                const dateB = new Date(b.eventStartingDate);
                return dateA - dateB;
            }));
            setIsWaiting(false);

        }
    }, [rejectedEvents, pendingEvents, acceptedEvents, MyClub, todayDate]);
    const fetchDashboardData = async () => {
        try {
            setIsLoading(prev => ({...prev, users: true}));
            const usersData = await getAllUsers(storedJwt, user, openSuccessMassage, openAlertMassage);
            if (usersData) setUsers(usersData);

            setIsLoading(prev => ({...prev, categories: true}));
            const categoriesData = await getAllCategories(storedJwt, user, openSuccessMassage, openAlertMassage);
            if (categoriesData) setCategories(categoriesData);

            setIsLoading(prev => ({...prev, clubs: true}));
            const clubsData = await getAllClubs(storedJwt, openSuccessMassage, openAlertMassage);
            if (clubsData) setClubs(clubsData);

            setIsLoading(prev => ({...prev, events: true}));
            const eventsData = await getAllEvents(storedJwt, openSuccessMassage, openAlertMassage);
            if (eventsData) setEvents(eventsData);

            setIsLoading(prev => ({...prev, clubsCategories: true}));
            const clubsCategoriesData = await getAllClubsCategories(storedJwt, user, openSuccessMassage, openAlertMassage);
            if (clubsCategoriesData) setClubsCategories(clubsCategoriesData);

            setIsLoading(prev => ({...prev, eventsCategories: true}));
            const eventsCategoriesData = await getAllEventCategoriesById(storedJwt, openSuccessMassage, openAlertMassage);
            if (eventsCategoriesData) setEventsCategories(eventsCategoriesData);
        } catch (error) {
            openAlertMassage('Failed to load dashboard data');
        } finally {
            setIsLoading({
                users: false,
                categories: false,
                clubs: false,
                events: false,
                clubsCategories: false,
                eventsCategories: false,
                action: false
            });
        }
    };

    // Scroll handling                                  ***************************************************************************
    const handleScroll = (event) => {
        const currentOffset = event.nativeEvent.contentOffset.y;
        const scrollDirection = currentOffset > prevOffset ? 'down' : 'up';
        setDirection(scrollDirection);
        setPrevOffset(currentOffset);

        setTabBarVisibility(scrollDirection === 'up');
        setToggleVisibility(scrollDirection === 'up');
        if (currentOffset <= 5) {
            setToggleVisibility(true)
            setTabBarVisibility(true);
        }
    };

    // on screen pull down                                  ***************************************************************************
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 1500);
    }, []);

    // Club Actions                                  ***************************************************************************
    const handleDeleteClub = async () => {
        if (!selectedClub) return;

        try {
            setIsWaiting(true);
            const success = await deleteClub(storedJwt, user, openSuccessMassage, openAlertMassage, selectedClub);

            if (success) {
                setClubs(prev => prev.filter(club => club.clubID !== selectedClub.clubID));
            }
        } catch (error) {
            openAlertMassage('Failed to delete club');
        } finally {
            setIsWaiting(false);
        }
    };

    const handelOuterScroll = () => {
        setScroll(prev=>!prev)

    }

    return (
        <GestureHandlerRootView>
            <ScreenWrapper navigation={navigation} isVisible={toggleVisibility} pageTitle={'Dashboard'}/>

            {(isWaiting || Object.values(isLoading).slice(0, -1).some(val => val)) && (
                <Loading screenSize={100} size={'large'}/>
            )}

            {/*  view toggle buttons ------------------------------------------------------------------------------------*/}

            <View style={[styles.viewToggleContainer, !toggleVisibility && {marginTop: 0}]}>

                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                        setActiveView('analysis')
                    }}
                    style={[
                        styles.toggleButton,
                        activeView === 'analysis' && styles.activeToggleButton
                    ]}

                >
                    <Text style={[
                        activeView === 'analysis' ? styles.activeToggleButtonText : styles.toggleButtonText
                    ]}>Analysis</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setActiveView('events')}
                    style={
                        activeView === 'events' ? styles.activeToggleButton : styles.toggleButton}
                >
                    <Text style={[
                        activeView === 'events' ? styles.activeToggleButtonText : styles.toggleButtonText
                    ]}>Events</Text>
                </TouchableOpacity>


                {/*{userRole==='MANAGER'&&*/}
                {/*    <>*/}
                {/*    <TouchableOpacity*/}
                {/*        activeOpacity={1}*/}
                {/*        onPress={() =>userRole==='MANAGER'&& setActiveView('MyClub')}*/}
                {/*        style={[*/}
                {/*            activeView === 'MyClub' ? styles.activeToggleButton : styles.toggleButton*/}
                {/*        ]}*/}
                {/*    >*/}
                {/*    <Text style={[*/}
                {/*        styles.toggleButtonText,*/}
                {/*        activeView === 'MyClub' && styles.activeToggleButtonText*/}
                {/*    ]}>My Club</Text>*/}
                {/*    </TouchableOpacity>*/}
                {/*    </>*/}
                {/*}*/}
                {userRole === 'ADMIN' &&
                    <>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => userRole === 'ADMIN' && setActiveView('clubs')}
                            style={[
                                activeView === 'clubs' ? styles.activeToggleButton : styles.toggleButton
                            ]}
                        >
                            <Text style={[
                                styles.toggleButtonText,
                                activeView === 'clubs' && styles.activeToggleButtonText
                            ]}>Clubs</Text>
                        </TouchableOpacity>
                    </>}

            </View>

            <View style={{flexDirection: 'row'}}>

                <SwipeViewContainer
                    numberOfSwipes={userRole === 'ADMIN' ? 3 : 2}
                    activeView={activeView}
                    setActiveView={setActiveView}
                />

                <ScrollView
                    scrollEnabled={scroll}
                    style={styles.container}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    contentContainerStyle={{paddingBottom: 75}}
                    keyboardShouldPersistTaps='handled'
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            progressViewOffset={90}
                            style={{marginTop: 100}}
                            tintColor={theme.colors.primaryLight}
                            colors={[theme.colors.primaryLight]}
                        />
                    }
                >
                    {activeView === 'analysis' && userRole === 'ADMIN' &&
                        <AnalysisDash
                            users={users}
                            userRole={userRole}
                            blockedUsers={blockedUsers}
                            clubs={clubs}
                            pendingClubs={pendingClubs}
                            pendingEvents={pendingEvents}
                            rejectedClubs={rejectedClubs}
                            blockedClubs={blockedClubs}
                            rejectedEvents={rejectedEvents}
                            rejectedWeekEvents={rejectedWeekEvents}
                            setActiveView={setActiveView}
                            events={events}
                            isLoading={isLoading}
                            isWaiting={isWaiting}
                            todayDate={todayDate}
                        />
                    }
                    {activeView === 'analysis' && userRole === 'MANAGER' &&
                        <AnalysisDash
                            userRole={userRole}
                            rejectedManagerEvents={rejectedManagerEvents}
                            acceptedManagerEvents={acceptedManagerEvents}
                            pendingManagerEvents={pendingManagerEvents}
                            setActiveView={setActiveView}
                            events={events}
                            isLoading={isLoading}
                            isWaiting={isWaiting}
                            MyClub={MyClub}
                            refreshing={refreshing}
                            todayDate={todayDate}

                        />
                    }
                    {activeView === 'events' &&
                        <EventsDash
                            acceptedEvents={userRole === 'ADMIN' ? acceptedEvents : acceptedManagerEvents}
                            userRole={userRole}
                            handelOuterScroll={handelOuterScroll}
                            onRefresh={onRefresh}
                            navigation={navigation}
                            isWaiting={isWaiting}
                            isLoading={isLoading}
                            rejectedEvents={userRole === 'ADMIN' ? rejectedEvents : rejectedManagerEvents}
                            pendingEvents={userRole === 'ADMIN' ? pendingEvents : pendingManagerEvents}/>}

                    {activeView === 'clubs' && userRole === 'ADMIN' &&
                        <ClubsDash
                            user={user}
                            club={MyClub}
                            onRefresh={onRefresh}
                            storedJwt={storedJwt}
                            openAlertMassage={openAlertMassage}
                            setShowPopover={setShowPopover}
                            openSuccessMassage={openSuccessMassage}
                            userRole={userRole}
                            isLoading={isLoading}
                            openImagePopover={openImagePopover}
                            openPopover={openPopover}
                            navigation={navigation}
                            pendingClubs={pendingClubs}
                            activeClubs={activeClubs}
                            rejectedClubs={rejectedClubs}
                            blockedClubs={blockedClubs}
                            isWaiting={isWaiting}
                            setCloseConfirmation={setCloseConfirmation}
                            handelOuterScroll={handelOuterScroll}

                        />}
                    {activeView === 'MyClub' && userRole === 'MANAGER' &&
                        <ClubProfile
                            navigation={navigation}
                            route={{params: {club: MyClub, backTitle: 'Dashboard'}}}
                        />

                    }
                </ScrollView>
                <SwipeViewContainer
                    numberOfSwipes={userRole === 'ADMIN' ? 3 : 2}
                    isRightSwipe={true}
                    activeView={activeView}
                    setActiveView={setActiveView}
                />


            </View>

        </GestureHandlerRootView>
    );
};

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        height: heightPercentage(100),
        backgroundColor: theme.colors.white,
        paddingTop:  Platform.OS === 'android' && 100,
    },

    pageTitle: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },

    viewToggleContainer: {
        position: 'absolute',
        width: widthPercentage(100),
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        backgroundColor: theme.colors.white,
        marginTop: 40,
        borderBottomWidth: 1,
        borderColor: theme.colors.gray1,
        paddingVertical: 5,
        marginBottom: heightPercentage(1),
        zIndex: 999,
    },
    toggleButton: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        marginHorizontal: 5,
        borderRadius: 20,
        backgroundColor: theme.colors.gray1,
        borderWidth: 1,
        borderColor: theme.colors.cyan1,
    },
    activeToggleButton: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        marginHorizontal: 5,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.colors.cyan1,
        backgroundColor: theme.colors.cyan1,
    },
    toggleButtonText: {
        color: theme.colors.cyan1,
        fontSize: 14,
        fontWeight: '500',
    },
    activeToggleButtonText: {
        color: 'white',
        fontWeight: '500',

    },
});

export default Dashboard;


const {width} = Dimensions.get("window");

export const SwipeViewContainer = ({isRightSwipe, activeView, setActiveView, numberOfSwipes}) => {
    const translateX = useSharedValue(0);
    const contextX = useSharedValue(0);

    const gesture = Gesture.Pan()
        .onStart(() => {
            contextX.value = translateX.value;
        })
        .onUpdate((event) => {
            if ((activeView === 'analysis' && event.translationX > 0)
                || (activeView === 'clubs' && event.translationX < 0)) {

            } else {
                translateX.value = contextX.value + event.translationX;
            }
        })
        .onEnd((event) => {
            if (event.translationX < -30 && activeView !== 'clubs') {
                if (numberOfSwipes < 3 && activeView !== 'events') {
                    const nextView = activeView === 'analysis' ? 'events' : 'clubs';
                    translateX.value = withTiming(-width, {duration: 300}, () => {
                        runOnJS(setActiveView)(nextView);
                        translateX.value = 0;
                    });
                    return;
                } else if (numberOfSwipes < 3 && activeView === 'events') {
                    return;
                }
                // Swipe left - go to next view
                const nextView = activeView === 'analysis' ? 'events' : 'clubs';
                translateX.value = withTiming(-width, {duration: 300}, () => {
                    runOnJS(setActiveView)(nextView);
                    translateX.value = 0;
                });
            } else if (event.translationX > 30 && activeView !== 'analysis') {
                // Swipe right - go to previous view
                const prevView = activeView === 'clubs' ? 'events' : 'analysis';
                translateX.value = withTiming(width, {duration: 300}, () => {
                    runOnJS(setActiveView)(prevView);
                    translateX.value = 0;
                });
            } else {
                // Return to original position
                translateX.value = withTiming(0, {duration: 300});
            }
        });

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{translateX: translateX.value}],
        };
    });

    return (
        <GestureDetector gesture={gesture}>
            <Animated.View style={[
                {
                    position: 'absolute',
                    width: '5%',
                    height: '100%',
                    bottom: 0,
                    zIndex: 999,

                }, animatedStyle, isRightSwipe ? {right: 0} : {left: 0}]}>
            </Animated.View>
        </GestureDetector>
    );
};


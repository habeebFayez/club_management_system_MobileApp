import React, {useCallback, useContext, useEffect, useState} from 'react';
import {Dimensions, RefreshControl, ScrollView,View, StyleSheet,} from 'react-native';
import {CredentialsContext} from "../../../contexts/CredentialsContext";
import {PopoverContext} from "../../../contexts/PopoverContext";
import {getAllEvents,} from "../../../api/ConstantsApiCalls";
import ScreenWrapper from "../../../component/ScreenWrapper";
import {useScroll} from "../../../contexts/ScrollContext";
import {getUserRole, heightPercentage} from "../../../helpers/common";
import Loading from "../../../component/Loading";
import {Gesture, GestureDetector, GestureHandlerRootView} from "react-native-gesture-handler";
import Animated, {runOnJS, useAnimatedStyle, useSharedValue, withTiming} from "react-native-reanimated";
import WeeklyEvents from "./WeeklyEvents";
import {ThemeContext} from "../../../contexts/ThemeContext";
import {useNotification} from "../../../contexts/NotificationsContext";

const Calendar = ({navigation}) => {
    const {theme} = useContext(ThemeContext);
    const styles = createStyles(theme);
    const {user, storedJwt} = useContext(CredentialsContext);
    const { refreshData} = useNotification();

    //date control        *************************************************************************************************
    const today = new Date();
    const todayDate = today.toISOString().split('T')[0]
    const startDate = new Date();
    const currentDayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - currentDayOfWeek - 1);
    const {
        openSuccessMassage,
        openAlertMassage,
        setShowPopover,
        openPopover,
        setPopoverSize,
        setCloseConfirmation,
        openImagePopover
    } = useContext(PopoverContext);

    // Page View Control                                   ***************************************************************************
    const [activeView, setActiveView] = useState('Day');
    const [toggleVisibility, setToggleVisibility] = useState(true);
    //Events posts control        *************************************************************************************************
    const [sortedEvents, setSortedEvents] = useState([]);
    const [events, setEvents] = useState([]);
    // Scroll control                                  ***************************************************************************
    const {setTabBarVisibility, isTabBarVisible} = useScroll();
    const [prevOffset, setPrevOffset] = useState(0);
    const [direction, setDirection] = useState('up');
    const [refreshing, setRefreshing] = useState(false);
    const [headerVisible, setHeaderVisible] = useState(true);
    const [userRole, setUserRole] = useState(getUserRole(user));
    // Loading states                                  ***************************************************************************
    const [isLoading, setIsLoading] = useState({
        users: false,
        categories: false,
        month: false,
        week: false,
        monthCategories: false,
        weekCategories: false,
        action: false
    });
    const [isWaiting, setIsWaiting] = useState(false);

    // Scroll handling                                  ***************************************************************************
    const handleScroll = (event) => {
        const currentOffset = event.nativeEvent.contentOffset.y;
        const scrollDirection = currentOffset > prevOffset ? 'down' : 'up';
        setDirection(scrollDirection);
        setPrevOffset(currentOffset);
        // setTabBarVisibility(scrollDirection === 'up');
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


    // API GET Events call                                        **********************************************************************
    useEffect(() => {

        (async () => {
            setIsLoading(true);
            const response = await getAllEvents(storedJwt, openSuccessMassage, openAlertMassage);
            if (response) {
                setEvents(response)
            }
            setIsLoading(false);
        })();

    }, [storedJwt,refreshData, refreshing, user, theme]);
    // sorted events                                       **********************************************************************
    useEffect(() => {
        setIsWaiting(true);
        events &&
        (setSortedEvents(events.filter(event =>
            event.eventPostRequested && event.eventStates && !event.eventUpdated && event.eventPostRequested)))

        setIsWaiting(false);
    }, [events]);

    return (
        <GestureHandlerRootView>
            <ScreenWrapper navigation={navigation} isVisible={headerVisible} pageTitle={'Calendar'}/>

            {(isWaiting || Object.values(isLoading).slice(0, -1).some(val => val)) && (
                <Loading screenSize={100} size={'large'}/>
            )}

            <View
                style={styles.container}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={true}
                scrollEnabled={activeView === 'day'}  >
                <WeeklyEvents
                    onRefresh={onRefresh}
                    userRole={userRole}
                    isWaiting={isWaiting}
                    isLoading={isLoading}
                    events={sortedEvents}
                    todayDate={todayDate}
                    navigation={navigation}
                    openSuccessMassage={openSuccessMassage}
                    openAlertMassage={openAlertMassage}

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

    },

});

export default Calendar;


const {width} = Dimensions.get("window");

export const SwipeViewContainer = ({isRightSwipe, activeView, setActiveView}) => {
    const translateX = useSharedValue(0);
    const contextX = useSharedValue(0);

    const gesture = Gesture.Pan()
        .onStart(() => {
            contextX.value = translateX.value;
        })
        .onUpdate((event) => {
            if ((activeView === 'Day' && event.translationX > 0)
                || (activeView === 'month' && event.translationX < 0)) {

            } else {
                translateX.value = contextX.value + event.translationX;
            }
        })
        .onEnd((event) => {
            if (event.translationX < -30 && activeView !== 'month') {
                // Swipe left - go to next view
                const nextView = activeView === 'Day' ? 'week' : 'month';
                translateX.value = withTiming(-width, {duration: 300}, () => {
                    runOnJS(setActiveView)(nextView);
                    translateX.value = 0;
                });
            } else if (event.translationX > 30 && activeView !== 'Day') {
                // Swipe right - go to previous view
                const prevView = activeView === 'month' ? 'week' : 'Day';
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


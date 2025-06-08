import React, {useCallback, useContext, useEffect, useRef, useState} from 'react'
import {Platform } from 'react-native'
import {CredentialsContext} from "../../../contexts/CredentialsContext";
import Loading from "../../../component/Loading";
import {PopoverContext} from "../../../contexts/PopoverContext";
import {ModalContext} from "../../../contexts/ModalContext";

import {
    Animated,
    Image,
    Linking,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    AddIcon,
    ArrowDownIcon,
    ArrowUpIcon,
    CalendarIcon,
    ClockIcon,
    Delete02Icon,
    EditIcon,
    HeartbreakIcon,
    LocationIcon,
    UnavailableIcon
} from "@hugeicons/core-free-icons";
import {getUserRole, heightPercentage, widthPercentage} from "../../../helpers/common";
import EventDescription from "./EventDescription";
import {useScroll} from '../../../contexts/ScrollContext';
import ScreenWrapper from "../../../component/ScreenWrapper";
import CreatEvent from "../../clubManager/CreatEvent";
import {deleteEventById, getAllEventCategoriesById, getAllEvents,} from "../../../api/ConstantsApiCalls";
import {CLUB_DEFAULT_IMAGE} from "../../../constants/DefaultConstants";
import DeactivateEventPop from "../../admin/DeactivateEventPop";
import MyIcon from "../../../component/MyIcons";
import {ThemeContext} from "../../../contexts/ThemeContext";
import {useNotification} from "../../../contexts/NotificationsContext";


const Home = ({navigation}) => {
    const {theme} = useContext(ThemeContext);
    const styles = createStyles(theme);
    const { refreshData} = useNotification();

    //date control        *************************************************************************************************
    const today = new Date();
    const todayDate = today.toISOString().split('T')[0]
    //contexts control        *************************************************************************************************
    const {storedJwt, club, user, setUser} = useContext(CredentialsContext);
    const {
        setShowPopover, openPopover, openSuccessMassage, openAlertMassage,
        setPopoverSize, setCloseConfirmation, openImagePopover
    } = useContext(PopoverContext);
    const {
        openModal, showModal, setShowModal,
        confirmation, confirmationPage, resetConfirmation, setConfirmation,
        setModalContent, setConfirmationPage, setModalTitle
    } = useContext(ModalContext);
    //Loading control        *************************************************************************************************
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingFilter, setIsLoadingFilter] = useState(true);
    const [showBrokenHart, setShowBrokenHart] = useState(false);


    //Events posts control        *************************************************************************************************
    const [sortedEvents, setSortedEvents] = useState([]);
    const [events, setEvents] = useState([]);
    const [dropDownMenu, setDropDownMenu] = useState(false);
    const [userRole, setUserRole] = useState(getUserRole(user));
    const [sortedEventsCategories, setSortedEventsCategories] = useState([]);
    //scroll control const's                                    *************************************************************************
    const {setTabBarVisibility, isTabBarVisible} = useScroll();
    const [prevOffset, setPrevOffset] = useState(0);
    const [direction, setDirection] = useState('up');
    const [refreshing, setRefreshing] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const scrollViewRef = useRef(null);

    const [headerVisible, setHeaderVisible] = useState(true);
    const [eventToBeDeleted, SetEventToBeDeleted] = useState([]);
    // Animation for scrolling up effect                                           *************************************************************
    const translateY = useRef(new Animated.Value(0)).current;

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

    }, [storedJwt,refreshData, refreshing, user]);
    // API GET All  Events Categories call                                        **********************************************************************
    useEffect(() => {
        (async () => {

            setIsLoading(true);
            const response = await getAllEventCategoriesById(storedJwt, openSuccessMassage, openAlertMassage);
            if (response) {
                setSortedEventsCategories(response)
            }
            setIsLoading(false);
        })();


    }, [storedJwt,refreshData, refreshing, user]);
    // API Delete Event call                                        **********************************************************************
    const handleDeleteEvent = () => {
        (async () => {

            setIsLoading(true);
            const response = await deleteEventById(storedJwt, user,
                openSuccessMassage, openAlertMassage, eventToBeDeleted);

            if (response) {
                openSuccessMassage('Event was Deleted successfully.');
                onRefresh();
            }
            setIsLoading(false);

        })();
    }

    // Refresh handler (pull-to-refresh)                                        **********************************************************************
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 1500);
    }, []);
    //  Filter Sorted Categories by event                                                          *************************************************************
    const getEventCategoryById = (eventId) => {
        if (sortedEventsCategories.length > 0) {
            return (
                sortedEventsCategories.filter(category => category.event.eventID === eventId).map(item => ({
                    categoryName: item.category.categoryName,
                    categoryID: item.category.categoryID,
                }))

            )
        }

    }
    const setScrollViewRef = (element) => {
        scrollViewRef.current = element;
    };
    //  Scrolling Up                                                          *************************************************************
    const scrollToTop = () => {
        if (scrollViewRef.current) {
            try {
                scrollViewRef.current.scrollTo({x: 0, y: 0, animated: true});
            } catch (error) {
                console.error("Error during scroll:", error);
            }
        } else {
            console.warn("Cannot scroll - ScrollView ref is null");
        }
    };
    // Determine scroll direction and show/hide tab bar  **********************************************************************
    const handleScroll = (event) => {
        const currentOffset = event.nativeEvent.contentOffset.y;
        const scrollDirection = currentOffset > prevOffset ? 'down' : 'up';
        setDirection(scrollDirection);
        setPrevOffset(currentOffset);

        // Hide tab bar when scrolling down, show tab bar when scrolling up  **********************************************************************
        setTabBarVisibility(scrollDirection === 'up');
        setDropDownMenu(dropDownMenu && scrollDirection === 'up');
        // if i want to close message on scroll                           ***********************************************************************
        // scrollDirection === 'up'&&openSuccessMassage(null)
        // Hide header if scrolling down, show if scrolling up          *************************************************************
        setHeaderVisible(scrollDirection === 'up' || currentOffset < 50);
        // Always show tab bar when at the very top                        **********************************************************************
        if (currentOffset <= 0) {
            setTabBarVisibility(true);
            setShowScrollTop(false);
            setHeaderVisible(true);
        }
        // Show "scroll to top" button when scrolled down and tabBar is off *****************************************************
        setShowScrollTop((currentOffset > 500) && !isTabBarVisible);
    };
    // Delete event Confirmation Modal                              **********************************************************************
    const handleDeleteEventConfirimation = (event) => {
        SetEventToBeDeleted(event);
        setConfirmationPage('Home/DeleteEvent')
        if (!showModal) {
            setModalTitle('Delete Event')
            openModal("Are you Sure You Want to Delete " + event.eventName.toLocaleUpperCase() + " Event ?", false)
            setShowModal(true)
        } else {
            setShowModal(false)
        }
    }
    // Deactivate event Confirmation                               **********************************************************************
    const handleDeactivateEventConfirimation = (event) => {
        openPopover(
            <DeactivateEventPop
                eventToBeBaned={event}
                close={() => {
                    setShowPopover(false)
                    setPopoverSize(heightPercentage(100));
                }}
                storedJwt={storedJwt}
                user={user}
                openSuccessMassage={openSuccessMassage}
                onRefresh={onRefresh}
                openAlertMassage={openAlertMassage}
                setCloseConfirmation={setCloseConfirmation}

            />
        );

    }
    // sorted events                                       **********************************************************************
    useEffect(() => {
        setIsLoadingFilter(true);
        events &&

        (setSortedEvents(events.filter(event =>
            event.eventStates && !event.eventUpdated && event.eventPostRequested &&
            event.eventStartingDate >= todayDate).sort((a, b) => {
            const dateA = new Date(a.eventStartingDate);
            const dateB = new Date(b.eventStartingDate);
            return dateA - dateB;
        })));
        setTimeout(() => {
            sortedEvents.length<1 && setShowBrokenHart(true);
        }, 1500);
        setIsLoadingFilter(false);
    }, [events]);
    useEffect(() => {
        Animated.timing(translateY, {
            toValue: headerVisible ? 0 : -75,
            duration: 250,
            useNativeDriver: true,
        }).start();
    }, [headerVisible]);
    // Get USER ROLE                                       **********************************************************************
    useEffect(() => {
        const role = getUserRole(user);
        setUserRole(role);
        setPopoverSize(heightPercentage(100));
    }, [user, storedJwt]);
// On confirmation for Home ********************************************************
    useEffect(() => {
        if (confirmation && confirmationPage === 'Home/DeleteEvent') {
            handleDeleteEvent()
            setShowModal(false)
            setConfirmation(false);
            resetConfirmation();

        }


    }, [confirmation]);


    return (
        <View style={{backgroundColor: theme.colors.white, alignItems: 'center'}}>

            <ScreenWrapper navigation={navigation} onRefresh={onRefresh} refreshing={refreshing}
                           isVisible={headerVisible} pageTitle={'Home'}/>

            {headerVisible && userRole === 'MANAGER' && club.clubisActivation &&
                <Animated.View style={[styles.buttonRow,
                    {transform: [{translateY}]}, dropDownMenu && {top: heightPercentage(13)}]}>
                    {/* Left green line */}
                    <View style={styles.line}/>
                    {/* Circular button in the middle */}
                    <TouchableOpacity style={styles.circleButton} onPress={() => setDropDownMenu(!dropDownMenu)}>
                        <MyIcon
                            icon={dropDownMenu ? ArrowUpIcon : ArrowDownIcon}
                            color="white"
                            size={25}

                        />
                    </TouchableOpacity>
                    {/* Right green line */}
                    <View style={styles.line}/>
                </Animated.View>}
            {dropDownMenu && userRole === 'MANAGER' && club.clubisActivation &&
                <Animated.View style={[styles.buttonRowCreatEvent,
                    {transform: [{translateY}]},]}>
                    <TouchableOpacity
                        onPress={() => openPopover(
                            <CreatEvent
                                club={club}
                                storedJwt={storedJwt}
                                user={user}
                                openAlertMassage={openAlertMassage}
                                openSuccessMassage={openSuccessMassage}
                                openImagePopover={openImagePopover}
                                userRole={userRole}
                                setCloseConfirmation={setCloseConfirmation}
                                onClose={() => setShowPopover(false)}
                                editingEventRequest={false}
                            />
                        )}
                        style={[styles.button, {transform: [{translateY}]}]}
                    >
                        <Text style={styles.buttonTextStyle}>Create New Event</Text>
                        <MyIcon
                            icon={AddIcon}
                            color={'white'}
                            size={25}

                        />
                    </TouchableOpacity>
                </Animated.View>}


            <ScrollView
                scrollEnabled={true}
                scrollsToTop={true}
                style={[{backgroundColor: theme.colors.white},
                    Platform.OS === 'android' && {paddingTop: dropDownMenu ?
                            heightPercentage(0) : heightPercentage(6)}]}
                ref={setScrollViewRef}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                // showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.pageUpNav}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        progressViewOffset={heightPercentage(5)}
                        style={{marginTop: dropDownMenu ? heightPercentage(0) : heightPercentage(6)}}
                        tintColor={theme.colors.primaryLight}
                        colors={[theme.colors.primaryLight]}
                    />
                }>
                {sortedEvents.length > 0 ? (
                    sortedEvents.map(post => (
                        <View style={styles.Backgrond} key={post.eventID}>

                            {/* poster Info Container----------------------------------------------------------------------------- */}

                            <View style={styles.posterInfoContainer}>
                                {/* Post Content----------------------------------------------------------------------------- */}
                                <TouchableOpacity
                                    style={styles.posterInfo}
                                    onPress={() => navigation.navigate('ClubProfile', {
                                        club: post.club,
                                        user,
                                        backTitle: 'Home'
                                    })}
                                >
                                    <Image
                                        source={{uri: post?.club?.clubProfilePicURL}}
                                        style={styles.posterInfoImg}
                                    />
                                    <View style={styles.posterInfoText}>
                                        <Text style={styles.clubName}>{post?.club?.clubName || 'NA'}</Text>
                                        <Text style={styles.eventDate}>{post.eventCreationDate}</Text>
                                    </View>
                                </TouchableOpacity>
                                {/* Action Buttons ----------------------------------------------------------------------------- */}
                                {user && (post.clubID.clubManager.userID === user.userID) && (
                                    <View style={styles.postChoises}>
                                        <TouchableOpacity
                                            style={styles.deleteBTN}
                                            onPress={() => handleDeleteEventConfirimation(post)}
                                        >
                                            <MyIcon icon={Delete02Icon} size={15} color={theme.colors.red}/>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.editPostBTN}
                                            onPress={() => openPopover(
                                                <CreatEvent
                                                    club={club}
                                                    storedJwt={storedJwt}
                                                    user={user}
                                                    openAlertMassage={openAlertMassage}
                                                    openSuccessMassage={openSuccessMassage}
                                                    openImagePopover={openImagePopover}
                                                    userRole={userRole}
                                                    eventToBeEdited={post}
                                                    setCloseConfirmation={setCloseConfirmation}
                                                    onClose={() => setShowPopover(false)}
                                                    editingEventRequest={true}
                                                    eventCategoriesToBeEdited={getEventCategoryById(post.eventID)}
                                                    onRefresh={onRefresh}
                                                />
                                            )}
                                        >
                                            <MyIcon icon={EditIcon} size={15} color={theme.colors.textLight}/>
                                        </TouchableOpacity>
                                    </View>
                                )}

                                {/* Admin Actions -----------------------------------------------------------------------------*/}
                                {user && user.authority.authorityName === "ROLE_ADMIN" && (
                                    <View style={styles.postChoises}>
                                        <TouchableOpacity
                                            style={styles.banBtn}
                                            onPress={() => handleDeactivateEventConfirimation(post)}
                                        >
                                            <MyIcon icon={UnavailableIcon} size={15} color={theme.colors.rose}/>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.deleteBTN}
                                            onPress={() => handleDeleteEventConfirimation(post)}
                                        >
                                            <MyIcon icon={Delete02Icon} size={15} color={theme.colors.red}/>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                            {/* Event Details----------------------------------------------------------------------------- */}
                            <View style={styles.posterInfoTDL}>
                                <View style={styles.posterInfoTimeDate}>
                                    <MyIcon icon={ClockIcon} size={18} color={theme.colors.textLight}/>
                                    <Text style={styles.eventDetail}>{post.eventNote}</Text>
                                </View>
                                <View style={styles.posterInfoTimeDate}>
                                    <MyIcon icon={CalendarIcon} size={18} color={theme.colors.textLight}/>
                                    <Text style={styles.eventDetail}>{post.eventStartingDate}</Text>
                                </View>
                                <View style={styles.posterInfoTimeDate}>
                                    <MyIcon icon={LocationIcon} size={18} color={theme.colors.cyan1}/>
                                    <TouchableOpacity style={{left: -10}} onPress={() =>
                                        Linking.openURL(post.eventLocationURL)
                                    }>
                                        <Text style={styles.eventDetailLink}>{
                                            post.eventHall.length > 20 ?
                                                post.eventHall.slice(0, 20) + '...'
                                                :
                                                post.eventHall}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Post Text Content --------------------------------------------------------------------------------- */}
                            <EventDescription key={post.eventID} post={post}/>
                            {/* Post Categories Content --------------------------------------------------------------------------------- */}
                            <View style={styles.tagsContainer}>
                                {sortedEventsCategories &&
                                    sortedEventsCategories.filter(category => category.event.eventID === post.eventID)
                                        .map((category, index) => (
                                            <TouchableOpacity key={index}
                                                              onPress={() => navigation.navigate(
                                                                  'Search',
                                                                  {
                                                                      searchFor: category.category.categoryName,
                                                                      activeFilterByPress: 'category',
                                                                      backTitle: 'Home'
                                                                  })}
                                                              style={[styles.tagButton,
                                                                  {backgroundColor: theme.colors.cyan1,}]}>
                                                <Text style={styles.tagButtonText}>
                                                    # {category.category.categoryName}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                            </View>
                            {/* Event Image */}
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => post.eventPostMediaURL && openImagePopover(post.eventPostMediaURL)}>
                                <Image
                                    source={{uri: post?.eventPostMediaURL || CLUB_DEFAULT_IMAGE}}
                                    style={styles.img}
                                />
                            </TouchableOpacity>
                        </View>
                                            ))
                                        ) : (
                   ( showBrokenHart)&&
                    <View style={styles.BackgrondEmptyEvents}>
                        <Text style={{fontSize: 18, fontWeight: "500", color: theme.colors.text}}>
                            There is No Coming Event's to Show
                        </Text>
                        <MyIcon
                            icon={HeartbreakIcon}
                            size={75}
                            strokeWidth={0.8}
                            color={theme.colors.text}
                        />
                                            </View>
                                        )}
                                    </ScrollView>
                                    
                                    {showScrollTop && (
                                        <TouchableOpacity
                                            onPress={scrollToTop}
                                            style={styles.scrollUp}
                                        >
                                            <MyIcon
                                                icon={ArrowUpIcon}
                                                size={25}
                                                strokeWidth={3}
                                                color={'white'}
                                            />
                                        </TouchableOpacity>
                                    )}
                                    

                        
                                    {/* Show loading indicator outside of ScrollView */}
                                    {(isLoading || isLoadingFilter) && (
                                        <Loading screenSize={100} backgroundColor={theme.colors.modalBackground} size={'large'}/>
                                    )}
        </View>
    )
}
export default Home
const createStyles = (theme) => StyleSheet.create({
    scrollUp: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        bottom: -10,
        borderBottomEndRadius: 0,
        borderBottomLeftRadius: 0,
        backgroundColor: theme.colors.cyan1,
        borderRadius: 25,
        paddingHorizontal: 15,
        paddingVertical: 10,
        shadowColor: '#006d9c',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.3,
        shadowRadius: 2,
    },

    refreshText: {
        color: theme.colors.primary,
        fontWeight: '600',
    },
    pageUpNav: {
        backgroundColor: theme.colors.white,
    },
    Backgrond: {
        width: widthPercentage(100),
        backgroundColor: theme.colors.white,
        borderRadius: 12,
        marginBottom: 10,
        padding: 10,
        alignSelf: 'center',
        shadowColor: '#006d9c',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.09,
        shadowRadius: 5,
        borderTopWidth: 1,
        borderTopColor: theme.colors.gray1,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.gray1,
    },
    postChoises: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
    },
    deleteBTN: {
        borderWidth: 1,
        borderColor: theme.colors.red,
        borderRadius: 15,
        padding: 5,
        marginLeft: 10,
    },
    editPostBTN: {
        borderWidth: 1,
        borderColor: theme.colors.text,
        borderRadius: 15,
        padding: 5,
        marginLeft: 10,
    },
    banBtn: {
        borderWidth: 1,
        borderColor: theme.colors.rose,
        borderRadius: 15,
        padding: 5,
        marginLeft: 10,

    },
    posterInfoContainer: {

        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    posterInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
    },
    posterInfoImg: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    clubName: {
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 10,
        color: theme.colors.text,

    },
    eventDate: {
        fontSize: 12,
        color: theme.colors.textLight,
        marginLeft: 10,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
    },
    tagButton: {
        paddingHorizontal: 6,
        paddingVertical: 5,
        borderRadius: 15,
        marginRight: 5,
        marginBottom: 5,

    },
    tagButtonText: {
        color: 'white',
        fontSize: 11,
    },
    posterInfoTDL: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        gap: 15,
        marginVertical: 3,
        overflow: 'hidden',
        color: theme.colors.textLight,

    },
    posterInfoTimeDate: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        color: theme.colors.textLight,

    },
    eventDetail: {
        fontSize: 12,
        fontWeight: theme.fonts.bold,
        color: theme.colors.textLight,

    },
    eventDetailLink: {
        fontWeight: theme.fonts.bold,
        marginLeft: 10,
        color: theme.colors.cyan1,
        fontSize: 12,
    },
    postText: {
        color: theme.colors.textLight,
        marginVertical: 10,
    },
    eventDescription: {
        fontSize: 13,
        color: theme.colors.textLight,

    },
    eventName: {
        color: theme.colors.text,

        fontSize: 17,
        fontWeight: '600',
        marginBottom: 10,
    },
    readMore: {
        color: 'blue',
        fontWeight: '700',
        marginTop: 5,
    },
    img: {
        width: widthPercentage('max'),
        height: heightPercentage(55),
        borderRadius: 5,
        marginVertical: 10,
    },
    button: {
        flexDirection: 'row',
        backgroundColor: theme.colors.green,
        height: heightPercentage(5.5),
        justifyContent: 'center',
        maxWidth: widthPercentage(50),
        alignItems: 'center',
        borderCurve: 'continuous',
        borderRadius: theme.radius.xl,
        padding: 10,
        gap: 10,

    },
    buttonRowCreatEvent: {
        paddingTop: heightPercentage(7),
        paddingBottom: 10,
        marginBottom: 10,
        alignItems: 'center',
        width: widthPercentage(100),
        backgroundColor: theme.colors.white,
    },
    buttonTextStyle: {
        fontSize: 15,
        color: 'white',
        fontWeight: theme.fonts.bold,

    },

    //555555555555555555555555555555555555555555555555555555555555
    buttonRow: {
        position: 'absolute',
        flexDirection: 'row',
        top:32,
        marginTop : heightPercentage(1),
        zIndex: 999999,

        // left:0,
        // right:0
    },
    line: {
        flex: 1,
        height: 1,
        top: 0,
        backgroundColor: theme.colors.green,
    },
    circleButton: {
        width: 50,
        height: 25,
        borderEndStartRadius: Platform.OS === 'ios' ? 100 : 0 ,
        borderEndEndRadius: 100,
        borderStartEndRadius: Platform.OS === 'ios' ? 0: 100,
        backgroundColor: theme.colors.green,
        alignItems: 'center',
        justifyContent: 'center',
    },
    BackgrondEmptyEvents: {
        width: widthPercentage(95),
        height: heightPercentage(100),
        backgroundColor: theme.colors.white,
        borderRadius: 12,
        padding: 10,
        gap: 10,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#006d9c',
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 0.3,
        shadowRadius: 2,
    },

});

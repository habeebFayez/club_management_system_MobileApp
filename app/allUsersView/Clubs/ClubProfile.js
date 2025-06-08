import React, {useCallback, useContext, useEffect, useRef, useState} from 'react';
import {
    Alert,
    Clipboard,
    Image,
    ImageBackground,
    Linking,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    ToastAndroid,
    TouchableOpacity,
    View,
} from 'react-native';
import {SkypeIndicator} from 'react-native-indicators';
import {
    Alert02Icon,
    ArrowDownIcon,
    ArrowUpIcon,
    CalendarIcon,
    CancelCircleIcon,
    CheckmarkCircle02Icon,
    ClockIcon,
    Delete02Icon,
    EditIcon,
    HeartbreakIcon,
    Layers01Icon,
    LeftToRightListDashIcon,
    LocationIcon,
    MailIcon,
    MessageIcon,
    SettingsIcon,
    UnavailableIcon,
    WhatsappIcon
} from '@hugeicons/core-free-icons';
import {CLUB_DEFAULT_IMAGE} from '../../../constants/DefaultConstants';
import {PopoverContext} from '../../../contexts/PopoverContext';
import {getUserRole, heightPercentage, widthPercentage} from '../../../helpers/common';
import AnimatedSwipeNavigator from '../../../navigators/AnimatedSwipeNavigator';
import {useScroll} from '../../../contexts/ScrollContext';
import EventDescription from "../home/EventDescription";
import Loading from "../../../component/Loading";
import {CredentialsContext} from "../../../contexts/CredentialsContext";
import EditClubProfile from "./EditClubProfile";
import {
    activateClub,
    deleteClub,
    deleteEventById,
    getAllClubEventsById,
    getAllClubsCategories,
    getAllEventCategoriesById,
} from "../../../api/ConstantsApiCalls";
import CreatEvent from "../../clubManager/CreatEvent";
import {ModalContext} from "../../../contexts/ModalContext";
import MyIcon from "../../../component/MyIcons";
import DeactivateEventPop from "../../admin/DeactivateEventPop";
import {Pressable} from "react-native-gesture-handler";
import DeactivatClubPop from "../../admin/DeactivatClubPop";
import RejectClubRequest from "../../admin/RejectClubRequest";
import EventsDash from "../../admin/EventsDash";
import {ThemeContext} from "../../../contexts/ThemeContext";
import {useNotification} from "../../../contexts/NotificationsContext";

const COVER_HEIGHT = heightPercentage(30);
const PROFILE_SIZE = 100;

const ClubProfile = ({route, navigation}) => {
    const {theme} = useContext(ThemeContext);
    const styles = createStyles(theme);
    const { refreshData} = useNotification();

    const {storedJwt, user} = useContext(CredentialsContext);
    const {club, backTitle, rejectionReason} = route.params || {};
    const [isAboutUsVisible, setIsAboutUsVisible] = useState(false);
    const {
        openModal, showModal, setShowModal,
        confirmation, confirmationPage, resetConfirmation, setConfirmation, setConfirmationPage, setModalTitle
    } = useContext(ModalContext);

//date control        *************************************************************************************************
    const today = new Date();
    const todayDate = today.toISOString().split('T')[0]
    //scroll control const's                                    *************************************************************************
    const {setTabBarVisibility, isTabBarVisible} = useScroll();
    const [prevOffset, setPrevOffset] = useState(0);
    const [direction, setDirection] = useState('up');
    const [refreshing, setRefreshing] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const scrollViewRef = useRef(null);
    const [headerVisible, setHeaderVisible] = useState(true);
    const [allClubsCategories, setAllClubsCategories] = useState([]);
    const [clubCategory, setClubCategory] = useState([]);
    const coverPic = club?.clubCoverPicURL || CLUB_DEFAULT_IMAGE;
    const profilePic = club?.clubProfilePicURL || CLUB_DEFAULT_IMAGE;

    //Loading control        *************************************************************************************************
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingFilter, setIsLoadingFilter] = useState(true);
// ADMIN Control         *************************************************************************************************
    const [clubToBeDeleted, SetClubToBeDeleted] = useState([]);
    const [clubToBeActivated, SetClubToBeActivated] = useState([]);
    const [clubToBeReject, SetClubToBeReject] = useState([]);


    //Events posts control        *************************************************************************************************
    const [sortedEvents, setSortedEvents] = useState([]);
    const [events, setEvents] = useState([]);
    const {
        openImagePopover, openAlertMassage, openSuccessMassage,
        setPopoverSize, openPopover, setShowPopover, setCloseConfirmation
    } = useContext(PopoverContext);
    const [sortedEventsCategories, setSortedEventsCategories] = useState([]);
    const [eventToBeDeleted, SetEventToBeDeleted] = useState([]);

    // Filtered Events For Manager                       ***************************************************************************
    const [pendingManagerEvents, setPendingManagerEvents] = useState([]);
    const [acceptedManagerEvents, setAcceptedManagerEvents] = useState([]);
    const [rejectedManagerEvents, setRejectedManagerEvents] = useState([]);

    //user ROLE control        *************************************************************************************************
    const [userRole, setUserRole] = useState(getUserRole(user));
    const [clubManager, setClubManager] = useState(club.clubManager);
    const [viewSelection, setViewSelection] = useState(
        userRole && userRole === 'STUDENT' || (clubManager.userID !== user.userID) ? 'Normal' : 'List');
    // Filter and categorize dashboard data of Manager Event     ***************************************************************************
    useEffect(() => {
        if (userRole === 'ADMIN' || (user && (club.clubManager.userID === user.userID))) {
            setIsLoadingFilter(true);
            setAcceptedManagerEvents(sortedEvents?.filter(event =>
                (!event.eventisRejected && event.eventStates && !event.eventUpdated)));
            setPendingManagerEvents(sortedEvents?.filter(event =>
                (!event.eventisRejected && (!event.eventStates || event.eventUpdated))));
            setRejectedManagerEvents(sortedEvents?.filter(event =>
                event.eventisRejected));
            setIsLoadingFilter(false);
        }
    }, [club, todayDate, sortedEvents, events, viewSelection]);
    useEffect(() => {
        const role = getUserRole(user);
        setUserRole(role);
    }, [user]);

    // API GET Events By club ID call                                        **********************************************************************
    useEffect(() => {
        (async () => {
            setIsLoading(true);
            const data = await getAllClubEventsById(storedJwt, user, openSuccessMassage, openAlertMassage, club);
            if (data) setEvents(data);
            setIsLoading(false);
        })();
    }, [storedJwt,refreshData, refreshing]);
    //Get All Clubs Categories Call API  **********************************************************
    useEffect(() => {
        (async () => {
            setIsLoading(true);
            const data = await getAllClubsCategories(storedJwt, user, openSuccessMassage, openAlertMassage);
            if (data) setAllClubsCategories(data);
            setIsLoading(false);

        })();
    }, [storedJwt, refreshData,refreshing, user]);
    // API GET All  Events Categories call                                        **********************************************************************
    useEffect(() => {
        (async () => {
            setIsLoading(true);
            const response = await getAllEventCategoriesById(storedJwt, openSuccessMassage, openAlertMassage);

            if (response) {
                setSortedEventsCategories(response)
            }

        })();

        setIsLoading(false);
    }, [storedJwt,refreshData, refreshing, user]);
    // API Delete Event call                                        **********************************************************************
    const handleDeleteEvent = () => {
        (async () => {

            setIsLoading(true);
            const response = await deleteEventById(storedJwt, user,
                openSuccessMassage, openAlertMassage, eventToBeDeleted);
            setIsLoading(false);
            if (response) {
                openSuccessMassage('Event was Deleted successfully.');
                onRefresh();
            }

        })();
    }
    // On confirmation for Club Profile ********************************************************
    useEffect(() => {
        if (confirmation && confirmationPage === 'ClubProfile/DeleteEvent') {
            handleDeleteEvent()
            setShowModal(false)
            setConfirmation(false);
            resetConfirmation();

        }


    }, [confirmation]);
    // Refresh handler (pull-to-refresh)                                        **********************************************************************
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 1500);
    }, []);
    // Delete event Confirmation Modal                              **********************************************************************
    const handleDeleteEventConfirimation = (event) => {
        SetEventToBeDeleted(event);
        setConfirmationPage('ClubProfile/DeleteEvent')
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
                    setShowPopover(false);
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
    // Determine scroll direction and show/hide tab bar  **********************************************************************
    const handleScroll = (event) => {
        const currentOffset = event.nativeEvent.contentOffset.y;
        const scrollDirection = currentOffset > prevOffset ? 'down' : 'up';
        setDirection(scrollDirection);
        setPrevOffset(currentOffset);

        // Always show tab bar when at the very top                        **********************************************************************
        if (currentOffset <= 0) {
            setShowScrollTop(false);
        }
        // Show "scroll to top" button when scrolled down and tabBar is off *****************************************************
        setShowScrollTop((currentOffset > 500));
    };
    //  Scrolling Up                                 *************************************************************
    const scrollToTop = () => {
        scrollViewRef.current?.scrollTo({x: 0, y: 0, animated: true});
    };
    // sorted events                                       **********************************************************************
    useEffect(() => {
        setIsLoadingFilter(true);
        events &&
        (setSortedEvents(events.filter(event =>
            (userRole === 'ADMIN' || (user && (event.clubID.clubManager.userID === user.userID)))
            && viewSelection === 'List' ?
                // (event.eventStartingDate >= todayDate)
                event
                :
                (event.eventStates && !event.eventUpdated && event.eventPostRequested &&
                    event.eventStartingDate >= todayDate)).sort((a, b) => {
            const dateA = new Date(a.eventStartingDate);
            const dateB = new Date(b.eventStartingDate);
            return dateA - dateB;
        })))
        setIsLoadingFilter(false);
    }, [events, viewSelection]);
    // Hide Bottom Tab Bar on this screen                 **********************************************************************
    useEffect(() => {
        const parent = navigation.getParent();
        setTabBarVisibility(false);

    }, [navigation, refreshing]);
    // Filter and sort clubs Carwgories                                               **********************************************************************
    useEffect(() => {
        setIsLoading(true);
        const filteredClubCategory = allClubsCategories.filter(category => category.club.clubID === club.clubID);
        setClubCategory(filteredClubCategory);
        setIsLoading(false);

    }, [navigation, allClubsCategories]);
    // Copy email -> system clipboard                **********************************************************************
    const handleCopyEmail = (email) => {
        if (!email) return;
        Clipboard.setString(email);
        if (Platform.OS === 'android') {
            ToastAndroid.show('Email copied!', ToastAndroid.SHORT);
        } else {
            Alert.alert('Email copied!');
        }
    };
    // Open phone in WhatsApp (or you could do call: Linking.openURL(`tel:${phoneNumber}`)) ************************************
    const handleCallPhone = (phoneNumber) => {
        if (!phoneNumber) return;
        //No zeroz or + in the beganing ************************************************************************
        const cleanedNumber = phoneNumber.replace(/^[+0]+/, '');
        Linking.openURL(`whatsapp://send?phone=${cleanedNumber}`);
    };

    // Deactivate Club Confirmation                               **********************************************************************
    const handleDeactivateClubById = (club) => {
        openPopover(
            <DeactivatClubPop
                clubToBeBaned={club}
                close={() => {
                    setShowPopover(false)
                }}
                storedJwt={storedJwt}
                user={user}
                openSuccessMassage={openSuccessMassage}
                onRefresh={() => {
                    navigation.goBack();
                    onRefresh();
                }} openAlertMassage={openAlertMassage}
                setCloseConfirmation={setCloseConfirmation}

            />
        );

    }
    // Reject Club Confirmation                               **********************************************************************
    const handleRejectClubById = (club) => {
        openPopover(
            <RejectClubRequest
                clubToBeRejected={club}
                close={() => {
                    setShowPopover(false)
                }}
                storedJwt={storedJwt}
                user={user}
                openSuccessMassage={openSuccessMassage}
                onRefresh={() => {
                    navigation.goBack()
                    onRefresh();
                }}
                openAlertMassage={openAlertMassage}
                setCloseConfirmation={setCloseConfirmation}

            />
        );

    }
    // Delete Club Confirmation Modal                              **********************************************************************
    const handleDeleteClubConfirimation = (club) => {
        SetClubToBeDeleted(club);
        setConfirmationPage('DashboardPage/DeleteClub')
        if (!showModal) {
            setModalTitle('Delete Club')
            openModal("Are you Sure You Want to Delete \n " + club.clubName.toLocaleUpperCase() + " Club ?", false)
            setShowModal(true)
        } else {
            setShowModal(false)
        }
    }
    // API Delete Club call                                        **********************************************************************
    const handleDeleteClub = () => {
        (async () => {
            const response = await deleteClub(storedJwt, user,
                openSuccessMassage, openAlertMassage, clubToBeDeleted);
            if (response) {
                openSuccessMassage('Club was Deleted successfully.');
                navigation.goBack();
                onRefresh();

            }

        })();
    }
    // Activate Club Confirmation Modal                              **********************************************************************
    const handleActivateClubConfirimation = (club) => {
        SetClubToBeActivated(club);
        setConfirmationPage('DashboardPage/ActivateClub')
        if (!showModal) {
            setModalTitle('Activate Club')
            openModal("Are you Sure You Want to Activate \n " + club.clubName.toLocaleUpperCase() + " Club ?", false)
            setShowModal(true)
        } else {
            setShowModal(false)
        }
    }
    // API Activate Event call                                        **********************************************************************
    const handleActivateClub = () => {
        (async () => {
            const response = await activateClub(storedJwt, user,
                openSuccessMassage, openAlertMassage, clubToBeActivated);
            if (response) {
                openSuccessMassage('Club was Activated Successfully.');
                navigation.goBack();
                onRefresh();

            }

        })();
    }

// On confirmation for Home ********************************************************
    useEffect(() => {
        if (confirmation && confirmationPage === 'DashboardPage/DeleteClub') {
            handleDeleteClub()
            setShowModal(false)
            setConfirmation(false);
            resetConfirmation();

        }
        if (confirmation && confirmationPage === 'DashboardPage/ActivateClub') {
            handleActivateClub()
            setShowModal(false)
            setConfirmation(false);
            resetConfirmation();

        }

    }, [confirmation]);
    //user ROLE control  functions      *************************************************************************************************


    return (
        <>

            <AnimatedSwipeNavigator
                pageTitle={club?.clubName}
                isFromLeft={true}
                club={club}
                user={user}
                navigation={navigation}
                backTitle={backTitle}
                userRole={userRole}


            >
                <ScrollView
                    onLayout={() => setIsLoadingFilter(false)}
                    style={{backgroundColor: theme.colors.white,}}
                    ref={scrollViewRef}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    progressViewOffset={heightPercentage(5)}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.container}
                    stickyHeaderIndices={userRole && (userRole === 'ADMIN' || user.userID === clubManager.userID) && [5]}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={theme.colors.primaryLight}
                            colors={[theme.colors.primaryLight]}
                        />
                    }>

                    {/* COVER SECTION -----------------------------------------------------------------------------------------*/}
                    <View style={styles.coverWrapper}>
                        <TouchableOpacity onPress={() => openImagePopover(coverPic)}>
                            <ImageBackground
                                source={{uri: coverPic}}
                                style={styles.coverImage}
                            >
                                {/*  overlay on top cover  image */}
                                <View style={styles.coverOverlay}/>

                            </ImageBackground>
                        </TouchableOpacity>

                        {/* PROFILE PICTURE + NAME + control */}
                        <View style={styles.profileInfo}>

                            <View style={styles.profileInfoImageAndSettings}>
                                {userRole && (userRole === 'ADMIN' || user.userID === clubManager.userID) &&
                                    <TouchableOpacity
                                        style={styles.profileInfoIcons}
                                        // onPress={() => } SEND MESSAGE
                                    >
                                        <MyIcon
                                            icon={MessageIcon}
                                            size={30}
                                            color={'white'}

                                        />
                                    </TouchableOpacity>}
                                <TouchableOpacity onPress={() => openImagePopover(profilePic)}>
                                    <Image
                                        source={{uri: profilePic}}
                                        style={styles.profileImage}
                                    />
                                    {userRole && (userRole === 'ADMIN' || user.userID === clubManager.userID) && <>
                                        {(club.clubIsBlocked && !club.clubisRejected && !club.clubisActivation) &&
                                            <View style={styles.redIconeImageContainer}>
                                                <MyIcon icon={UnavailableIcon} size={75} color={'white'}/>
                                            </View>}
                                        {club.clubisRejected &&
                                            <View style={styles.redIconeImageContainer}>
                                                <MyIcon icon={CancelCircleIcon} size={75} color={'white'}/>
                                            </View>}
                                        {(!club.clubIsBlocked && !club.clubisRejected && !club.clubisActivation) &&
                                            <View style={styles.warningIconImageContainer}>
                                                <MyIcon icon={Alert02Icon} size={75} color={'white'}/>
                                            </View>}
                                    </>}
                                </TouchableOpacity>
                                {/*fot Admin and club manager control only --------------------------------------------------------------------*/}
                                {userRole && (userRole === 'ADMIN' || user.userID === clubManager.userID) &&
                                    <TouchableOpacity
                                        style={styles.profileInfoIcons}
                                        onPress={() =>
                                            openPopover(
                                                    <EditClubProfile
                                                        allClubsCategories={allClubsCategories}
                                                        currentClubCategory={clubCategory}
                                                        openAlertMassage={openAlertMassage}
                                                        storedJwt={storedJwt}
                                                        openSuccessMassage={openSuccessMassage}
                                                        openImagePopover={openImagePopover}
                                                        user={user}
                                                        userRole={userRole}
                                                        club={club}
                                                        onClose={() => setShowPopover(false)}
                                                        setCloseConfirmation={setCloseConfirmation}
                                                    />

                                            )}
                                    >
                                        <MyIcon
                                            icon={SettingsIcon}
                                            size={30}
                                            color={'white'}

                                        />
                                    </TouchableOpacity>}
                            </View>
                            <Text style={styles.clubName}>{club?.clubName}</Text>
                            {club?.clubManager && (
                                <Text style={styles.managerText}>
                                    Manager:@{club.clubManager.firstName} {club.clubManager.lastName}
                                </Text>
                            )}
                        </View>
                    </View>
                    {/* contact Container On Cover  -----------------------------------------------------------------------------------------*/}
                    <View style={styles.contactContainerOnCover}>

                        {/* EMAIL ROW -----------------------------------------------------------------------------------------*/}
                        <TouchableOpacity
                            style={styles.contactRow}
                            onPress={() => handleCopyEmail(club?.contactEmail)}
                        >
                            <MyIcon
                                icon={MailIcon}
                                size={30}
                                color={'white'}

                            />
                        </TouchableOpacity>

                        {/* PHONE ROW (WhatsApp) ----------------------------------------------------------------------------------------- */}
                        <TouchableOpacity
                            style={styles.contactRow}
                            onPress={() => handleCallPhone(club?.contactNumber)}
                        >
                            <MyIcon
                                icon={WhatsappIcon}
                                size={30}
                                color={theme.colors.green}

                            />
                        </TouchableOpacity>
                        {userRole && (userRole !== 'ADMIN' && user.userID !== clubManager.userID) &&
                            <TouchableOpacity
                                style={styles.contactRow}
                                // onPress={() => } SEND MESSAGE
                            >
                                <MyIcon
                                    icon={MessageIcon}
                                    size={30}
                                    color={'white'}

                                />
                            </TouchableOpacity>
                        }
                    </View>
                    {/* STATS CARD ----------------------------------------------------------------------------------------- */}
                    <View style={userRole === 'ADMIN' ? styles.statsCardAdmin : styles.statsCard}>
                        {/* Club Actions Admin -------------------------------------------------------------------------*/}
                        {userRole === 'ADMIN' && (backTitle === 'Dashboard' || backTitle === 'Notifications') &&
                            <>
                                {/*Active CLUB -------------------------------------------------------------------------*/}
                                {(!club?.clubIsBlocked && !club.clubisRejected && club.clubisActivation) &&
                                    <View style={styles.actionsContainer}>
                                        {/*Deactivate Club  -------------------------------------------------------------------------*/}
                                        <View style={styles.statItem}>
                                            <Pressable
                                                style={({pressed}) => [
                                                    styles.roseIconeActionsContainer,
                                                    {opacity: pressed ? 0.7 : 1}
                                                ]}
                                                onPress={() => handleDeactivateClubById(club)}
                                            >
                                                <MyIcon icon={UnavailableIcon} size={25} color={'white'}/>
                                                <Text style={styles.statText}>
                                                    Block
                                                </Text>
                                            </Pressable>
                                        </View>
                                        {/*Delete Club Request -------------------------------------------------------------------------*/}
                                        <View style={styles.statItem}>
                                            <Pressable
                                                style={({pressed}) => [
                                                    styles.redIconeActionsContainer,
                                                    {opacity: pressed ? 0.7 : 1}
                                                ]}
                                                onPress={() => handleDeleteClubConfirimation(club)}
                                            >
                                                <MyIcon icon={Delete02Icon} size={25} color={'white'}/>
                                                <Text style={styles.statText}>
                                                    Delete
                                                </Text>
                                            </Pressable>
                                        </View>
                                    </View>}
                                {/*Pending CLUB -------------------------------------------------------------------------*/}
                                {(!club?.clubIsBlocked && !club.clubisRejected && !club.clubisActivation) &&
                                    <View style={styles.actionsContainer}>
                                        {/*Reject Club Request -------------------------------------------------------------------------*/}
                                        <View style={styles.statItem}>
                                            <Pressable
                                                style={({pressed}) => [
                                                    styles.roseIconeActionsContainer,
                                                    {opacity: pressed ? 0.7 : 1}
                                                ]}
                                                onPress={() => handleRejectClubById(club)}
                                            >
                                                <MyIcon icon={CancelCircleIcon} size={25} color={'white'}/>
                                                <Text style={styles.statText}>
                                                    Reject
                                                </Text>
                                            </Pressable>
                                        </View>
                                        {/*Accept Club Request -------------------------------------------------------------------------*/}
                                        <View style={styles.statItem}>
                                            <Pressable
                                                style={({pressed}) => [
                                                    styles.greenIconeActionsContainer,
                                                    {opacity: pressed ? 0.7 : 1}
                                                ]}
                                                onPress={() => handleActivateClubConfirimation(club)}
                                            >
                                                <MyIcon icon={CheckmarkCircle02Icon} size={25} color={'white'}/>
                                                <Text style={styles.statText}>
                                                    Accept
                                                </Text>
                                            </Pressable>
                                        </View>
                                    </View>}
                                {/*Rejected CLUB -------------------------------------------------------------------------*/}
                                {(club?.clubisRejected) &&
                                    <View style={styles.actionsContainer}>
                                        {/*Delete Club Request -------------------------------------------------------------------------*/}
                                        <View style={styles.statItem}>
                                            <Pressable
                                                style={({pressed}) => [
                                                    styles.redIconeActionsContainer,
                                                    {opacity: pressed ? 0.7 : 1}
                                                ]}
                                                onPress={() => handleDeleteClubConfirimation(club)}
                                            >
                                                <MyIcon icon={Delete02Icon} size={25} color={'white'}/>
                                                <Text style={styles.statText}>
                                                    Delete
                                                </Text>
                                            </Pressable>
                                        </View>
                                        {/*Accept Club Request -------------------------------------------------------------------------*/}
                                        <View style={styles.statItem}>
                                            <Pressable
                                                style={({pressed}) => [
                                                    styles.greenIconeActionsContainer,
                                                    {opacity: pressed ? 0.7 : 1}
                                                ]}
                                                onPress={() => handleActivateClubConfirimation(club)}
                                            >
                                                <MyIcon icon={CheckmarkCircle02Icon} size={25} color={'white'}/>
                                                <Text style={styles.statText}>
                                                    Accept
                                                </Text>
                                            </Pressable>
                                        </View>
                                    </View>}
                                {/*Blocked CLUB -------------------------------------------------------------------------*/}
                                {(club?.clubIsBlocked && !club.clubisRejected && !club.clubisActivation) &&
                                    <View style={styles.actionsContainer}>
                                        {/*Delete Club Request -------------------------------------------------------------------------*/}
                                        <View style={styles.statItem}>
                                            <Pressable
                                                style={({pressed}) => [
                                                    styles.redIconeActionsContainer,
                                                    {opacity: pressed ? 0.7 : 1}
                                                ]}
                                                onPress={() => handleDeleteClubConfirimation(club)}
                                            >
                                                <MyIcon icon={Delete02Icon} size={25} color={'white'}/>
                                                <Text style={styles.statText}>
                                                    Delete
                                                </Text>
                                            </Pressable>
                                        </View>
                                        {/*Accept Club Request -------------------------------------------------------------------------*/}
                                        <View style={styles.statItem}>
                                            <Pressable
                                                style={({pressed}) => [
                                                    styles.greenIconeActionsContainer,
                                                    {opacity: pressed ? 0.7 : 1}
                                                ]}
                                                onPress={() => handleActivateClubConfirimation(club)}
                                            >
                                                <MyIcon icon={CheckmarkCircle02Icon} size={25} color={'white'}/>
                                                <Text style={styles.statText}>
                                                    Activate
                                                </Text>
                                            </Pressable>
                                        </View>
                                    </View>
                                }

                            </>}
                        {
                            (userRole !== 'ADMIN'
                                ||
                                (userRole === 'ADMIN' && backTitle !== 'Dashboard' && backTitle !== 'Notifications'))
                            &&
                            <>
                                <View style={styles.statItem}>
                                    <Text style={styles.statNumber}>
                                        {club?.clubMaxMembersNumber ?? '0'}
                                    </Text>
                                    <Text style={styles.statLabel}>Members</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={styles.statNumber}>
                                        {club?.clubActiveEventsNumber ?? '0'}
                                    </Text>
                                    <Text style={styles.statLabel}>Events</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={styles.statNumber}>
                                        {club.clubRating ? club.clubRating * 2 : '--'}
                                    </Text>
                                    <Text style={styles.statLabel}>Rating /10</Text>
                                </View>
                            </>}
                    </View>
                    {/* Category CARD ----------------------------------------------------------------------------------------- */}
                    <View style={styles.tagsContainer}>
                        {clubCategory &&
                            clubCategory.map((category, index) => (
                                <TouchableOpacity key={index} style={[styles.tagButton,
                                    //to implement nav to search with the category in action +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
                                    {backgroundColor: theme.colors.cyan1,}]}>
                                    <Text style={styles.tagButtonText}>
                                        # {category.category.categoryName}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                    </View>
                    {/* ABOUT SECTION -----------------------------------------------------------------------------------------*/}
                    <View style={styles.aboutSection}>
                        {!isAboutUsVisible && (
                            <TouchableOpacity
                                style={styles.AboutButton}
                                onPress={() => setIsAboutUsVisible(true)}
                            >
                                <Text style={styles.AboutButtonText}>About</Text>
                                <MyIcon
                                    icon={ArrowDownIcon}
                                    size={22}
                                    color={theme.colors.primary}
                                />
                            </TouchableOpacity>
                        )}

                        {isAboutUsVisible && (
                            <View style={styles.aboutContent}>
                                <View style={styles.contactContainer}>
                                    <Text style={styles.sectionTitle}>About Us</Text>
                                    <Text style={styles.sectionTitleContactText}>
                                        {club?.clubDescription || 'No description provided.'}
                                    </Text>
                                </View>
                                <View style={styles.contactContainer}>
                                    <Text style={styles.sectionTitle}>Creation Date</Text>
                                    <Text style={styles.sectionTitleContactText}>
                                        {club?.creatingDate || 'No description provided.'}
                                    </Text>
                                </View>
                                <View style={styles.contactContainer}>
                                    <Text style={styles.sectionTitle}>Contact</Text>

                                    {/* EMAIL ROW */}
                                    <TouchableOpacity
                                        style={styles.contactRow}
                                        onPress={() => handleCopyEmail(club?.contactEmail)}
                                    >
                                        <MyIcon
                                            icon={MailIcon}
                                            size={25}
                                            color={theme.colors.cyan1}

                                        />
                                        <Text style={styles.contactRowText}>
                                            {club?.contactEmail || 'No Email'}
                                        </Text>
                                    </TouchableOpacity>

                                    {/* PHONE ROW (WhatsApp) */}
                                    <TouchableOpacity
                                        style={styles.contactRow}
                                        onPress={() => handleCallPhone(club?.contactNumber)}
                                    >
                                        <MyIcon
                                            icon={WhatsappIcon}
                                            size={25}
                                            color={theme.colors.green}

                                        />
                                        <Text style={styles.contactRowText}>
                                            {club?.contactNumber || 'No Phone'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {/* CLOSE "ABOUT" BUTTON */}
                                <TouchableOpacity
                                    style={styles.closeAboutButton}
                                    onPress={() => setIsAboutUsVisible(false)}
                                >
                                    <MyIcon
                                        icon={ArrowUpIcon}
                                        size={20}
                                        color={theme.colors.red}
                                    />
                                    <Text style={styles.closeAboutText}>Close About</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                    {/* View SELECTION SECTION -----------------------------------------------------------------------------------------*/}
                    {userRole && (userRole === 'ADMIN' || user.userID === clubManager.userID) && <View>
                        <View style={styles.tabContainer}>
                            <TouchableOpacity
                                onPress={() => setViewSelection('Normal')}
                                style={[
                                    styles.tabButton,
                                    viewSelection === 'Normal' ? styles.activeTab : styles.inactiveTab
                                ]}
                            >
                                <MyIcon
                                    icon={Layers01Icon}
                                    size={25}
                                    strokeWidth={2.5}
                                    color={viewSelection === 'Normal' ? theme.colors.cyan1 : theme.colors.textLight}
                                />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setViewSelection('List')}
                                style={[
                                    styles.tabButton,
                                    viewSelection === 'List' ? styles.activeTab : styles.inactiveTab
                                ]}
                            >
                                <MyIcon
                                    icon={LeftToRightListDashIcon}
                                    size={25}
                                    strokeWidth={2.5}
                                    color={viewSelection === 'List' ? theme.colors.cyan1 : theme.colors.textLight}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>}
                    {/* EVENTS SECTION Normal View ----------------------------------------------------------------------------------------- */}
                    {viewSelection === 'Normal' &&
                        <View style={styles.EventsPostsSection}>
                            {sortedEvents?.map(post => (
                                (
                                    <View style={styles.Backgrond}
                                          key={post.eventID}>

                                        {/* poster Info Container----------------------------------------------------------------------------- */}
                                        {userRole && (userRole === 'ADMIN' || user.userID === clubManager.userID) &&
                                            <View style={styles.posterInfoContainer}>
                                                {/*Active Event -------------------------------------------------------------------------*/}
                                                {(!post.eventisRejected && (post.eventStates && !post.eventUpdated)) &&
                                                    userRole !== 'STUDENT' &&
                                                    <View style={styles.sectionHeader}>
                                                        <View style={styles.greenIconeContainer}>
                                                            <MyIcon icon={CheckmarkCircle02Icon} size={20}
                                                                    color={'white'}/>
                                                        </View>
                                                        <Text style={styles.sectionTitle}>Active Event </Text>
                                                    </View>}
                                                {/* Action Buttons ----------------------------------------------------------------------------- */}
                                                {(post.clubID.clubManager.userID === user.userID) && (
                                                    <View style={styles.postChoises}>

                                                        <TouchableOpacity
                                                            style={styles.deleteBTN}
                                                            onPress={() => handleDeleteEventConfirimation(post)}
                                                        >
                                                            <MyIcon icon={Delete02Icon} size={15}
                                                                    color={theme.colors.red}/>
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
                                                            <MyIcon icon={EditIcon} size={15}
                                                                    color={theme.colors.text}/>
                                                        </TouchableOpacity>
                                                    </View>
                                                )}

                                                {/* Admin Actions -----------------------------------------------------------------------------*/}
                                                {userRole === "ADMIN" && (
                                                    <View style={styles.postChoises}>
                                                        <TouchableOpacity
                                                            style={styles.banBtn}
                                                            onPress={() => handleDeactivateEventConfirimation(post)}
                                                        >
                                                            <MyIcon icon={UnavailableIcon} size={15}
                                                                    color={theme.colors.rose}/>
                                                        </TouchableOpacity>
                                                        <TouchableOpacity
                                                            style={styles.deleteBTN}
                                                            onPress={() => handleDeleteEventConfirimation(post)}
                                                        >
                                                            <MyIcon icon={Delete02Icon} size={15}
                                                                    color={theme.colors.red}/>
                                                        </TouchableOpacity>
                                                    </View>
                                                )}
                                            </View>}
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
                                                <TouchableOpacity
                                                    onPress={() => Linking.openURL(post.eventLocationURL)}>
                                                    <Text style={styles.eventDetailLink}>{
                                                        post.eventHall.length > 20 ?
                                                            post.eventHall.slice(0, 20) + '...'
                                                            :
                                                            post.eventHall}</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        {/* Post Categories Content --------------------------------------------------------------------------------- */}
                                        <View style={styles.tagsEventsContainer}>
                                            {sortedEventsCategories &&
                                                sortedEventsCategories.filter(category => category.event.eventID === post.eventID)
                                                    .map((category, index) => (
                                                        <TouchableOpacity key={index} style={[styles.tagEventsButton,
                                                            //to implement nav to search with the category in action +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
                                                            {backgroundColor: theme.colors.cyan1,}]}>
                                                            <Text style={styles.tagEventsButtonText}>
                                                                {category.category.categoryName}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    ))}
                                        </View>
                                        {/* Post Text Content --------------------------------------------------------------------------------- */}
                                        <EventDescription key={post.eventID} post={post}/>
                                        {/* Event Image --------------------------------------------------------------------------------- */}
                                        {post?.eventPostMediaURL &&
                                            <TouchableOpacity
                                                activeOpacity={0.7}
                                                onPress={() => openImagePopover(post.eventPostMediaURL)}>
                                                <Image
                                                    source={{uri: post?.eventPostMediaURL}}
                                                    style={styles.img}
                                                />
                                            </TouchableOpacity>}
                                    </View>
                                )
                            ))}
                            {((isLoading || isLoadingFilter)) ?
                                (
                                    <View style={styles.BackgrondEmptyEvents}>
                                        <SkypeIndicator size={50} color={theme.colors.primaryLight}/>
                                    </View>)
                                :
                                (<>
                                    {club.clubisRejected && rejectionReason ?
                                        <View style={styles.reasonRed}>
                                            <Text style={{color: 'red'}}>
                                                Reason :
                                                {'\n' + rejectionReason?.split('Reason :')[1]?.trim()}</Text>
                                        </View>
                                        :
                                        sortedEvents.length < 1 &&
                                        (<View style={styles.BackgrondEmptyEvents}>
                                            <Text style={{
                                                fontSize: 14,
                                                color: theme.colors.textLight,
                                                fontWeight: "700"
                                            }}>This club doesn't have
                                                any Coming Event's
                                                Yet... </Text>
                                            <MyIcon
                                                icon={HeartbreakIcon}
                                                size={50}
                                                color={theme.colors.text}
                                            />
                                        </View>)

                                    }

                                </>)
                            }
                        </View>}

                    {/* EVENTS SECTION List View ----------------------------------------------------------------------------------------- */}
                    {viewSelection === 'List' && userRole && (userRole === 'ADMIN' || user.userID === clubManager.userID) &&
                        <View style={styles.EventsPostsSection}>
                            {isLoadingFilter || isLoading ?
                                <Loading screenSize={25}/>
                                :
                                sortedEvents &&
                                <View style={{marginTop: 15}}>
                                    <EventsDash
                                        acceptedEvents={acceptedManagerEvents}
                                        userRole={userRole}
                                        onRefresh={onRefresh}
                                        navigation={navigation}
                                        isWaiting={isLoadingFilter}
                                        isLoading={isLoading}
                                        rejectedEvents={rejectedManagerEvents}
                                        backTitle={club.clubName}
                                        pendingEvents={pendingManagerEvents}/>
                                </View>
                            }

                        </View>

                    }


                </ScrollView>

            </AnimatedSwipeNavigator>
            {showScrollTop && (
                <TouchableOpacity
                    onPress={scrollToTop}
                    style={styles.scrollUp}
                >
                    <MyIcon
                        icon={ArrowUpIcon}
                        size={24}
                        strokeWidth={2.5}
                        color={'white'}
                    />
                </TouchableOpacity>
            )}

            {isLoading || isLoadingFilter &&
                <Loading screenSize={100} size={'large'}/>}


        </>
    );
};

const createStyles = (theme) => StyleSheet.create({
    container: {
        backgroundColor: theme.colors.white,

    },
    coverWrapper: {
        width: '100%',
        height: COVER_HEIGHT,
        position: 'relative',

    },
    coverImage: {
        width: '100%',
        height: heightPercentage(50),
        resizeMode: 'cover'
    },
    coverOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.46)',
    },
    profileInfo: {
        alignItems: 'center',
        marginTop: -PROFILE_SIZE * 3.2, // pulls the profile image up
    },
    greenIconeActionsContainer: {
        flexDirection: 'row',
        backgroundColor: theme.colors.green,
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: 120,
        minWidth: 120,
        borderRadius: 25,
        padding: 5,
        paddingHorizontal: 15,
        gap: 5,
    },
    actionsContainer: {
        flexDirection: 'row',
        paddingVertical: 5,
        gap: 35,
        // position:'absolute',
    },
    redIconeActionsContainer: {
        backgroundColor: theme.colors.red,
        maxWidth: 120,
        minWidth: 120,
        flexDirection: 'row',
        padding: 5,
        paddingHorizontal: 15,

        gap: 5,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 25,
    },
    roseIconeActionsContainer: {
        backgroundColor: theme.colors.rose,
        maxWidth: 120,
        minWidth: 120,
        // height:35,
        flexDirection: 'row',
        padding: 5,
        paddingHorizontal: 15,

        gap: 5,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 25,
    },
    profileInfoImageAndSettings: {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 20
    },
    profileInfoIcons: {
        backgroundColor: 'rgba(255,255,255,0.22)',
        width: 45,
        height: 45,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',

    },
    profileImage: {
        width: PROFILE_SIZE,
        height: PROFILE_SIZE,
        borderRadius: PROFILE_SIZE / 2,
        borderWidth: 4,
        borderColor: theme.colors.gray1,
    },
    redIconeImageContainer: {
        position: 'absolute',
        backgroundColor: 'rgba(255,0,0,0.64)',
        width: PROFILE_SIZE,
        height: PROFILE_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: PROFILE_SIZE / 2,
    },
    warningIconImageContainer: {
        position: 'absolute',
        backgroundColor: 'rgba(255,229,32,0.58)',
        width: PROFILE_SIZE,
        height: PROFILE_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: PROFILE_SIZE / 2,
    },
    clubName: {
        textTransform: 'capitalize',
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginTop: 6
    },
    managerText: {
        fontSize: 14,
        marginTop: 2,
        fontWeight: 'semibold',
        color: '#dcdcdc',
    },
    statsCardAdmin: {
        backgroundColor: theme.colors.TabBarGlass,
        marginHorizontal: 16,
        marginTop: PROFILE_SIZE / 2,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
        shadowColor: '#006d9c',
        shadowOpacity: 0.51,
        shadowRadius: 8,
    },
    statsCard: {
        backgroundColor: theme.colors.TabBarGlass,
        marginHorizontal: 16,
        marginTop: PROFILE_SIZE / 2,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 16,
        shadowOffset: {width: 0, height: 0},
        shadowColor: '#006d9c',
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        // marginHorizontal:10,
        gap: 10
    },
    tagButton: {
        padding: 5,
        borderRadius: 15,

    },
    tagButtonText: {
        color: 'white',
        fontSize: 11,

    },
    statItem: {
        alignItems: 'center',
        color: theme.colors.text,
    },
    statNumber: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.type === 'dark' ? theme.colors.link : theme.colors.primary,
    },
    statText: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.text,

    },
    statLabel: {
        marginTop: 4,
        fontSize: 12,
        color: theme.colors.textLight,
        fontWeight: '700',

    },
    aboutSection: {
        marginHorizontal: 10,
        marginBottom: 5,
        color: theme.colors.text,
        backgroundColor: theme.colors.white,

    },
    AboutButton: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: theme.colors.gray1,
        backgroundColor: theme.colors.white,
        borderRadius: 6,
        paddingVertical: 8,
        paddingHorizontal: 12,
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#006d9c',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.3,
        shadowRadius: 2,
    },
    AboutButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textLight,
    },
    aboutContent: {
        backgroundColor: theme.colors.white,
        borderRadius: 8,
        borderBottomWidth: 1,
        borderColor: theme.colors.gray1,
        shadowColor: '#006d9c',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.3,
        shadowRadius: 2,
        marginBottom: 5
    },
    contactContainer: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderColor: theme.colors.gray1,
    },
    contactContainerOnCover: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginTop: heightPercentage(5),
        gap: 25,
        paddingHorizontal: 10,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.22)'
    },

    sectionTitleContactText: {
        fontSize: 14,
        color: theme.colors.text,
        marginBottom: 5
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5
    },
    contactRowText: {
        marginLeft: 8,
        fontSize: 16,
        color: theme.colors.text,
    },
    closeAboutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderTopWidth: 1,
        borderColor: theme.colors.gray1,
    },
    closeAboutText: {
        marginLeft: 8,
        fontSize: 14,
        color: theme.colors.red,
        fontWeight: '600'
    },
    Backgrond: {
        width: widthPercentage(95),
        backgroundColor: theme.colors.white,
        borderRadius: 12,
        marginTop: 5,
        padding: 10,
        alignSelf: 'center',
        shadowColor: '#006d9c',
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 0.19,
        shadowRadius: 5,
        borderTopWidth: 1,
        borderTopColor: theme.colors.gray1,
        borderBottomWidth: 0.5,
        borderBottomColor: '#e3e3e3',
    },
    BackgrondEmptyEvents: {
        width: widthPercentage(95),
        backgroundColor: theme.colors.white,
        borderRadius: 12,
        marginTop: 10,
        padding: 10,
        minHeight: heightPercentage(20),
        gap: 10,
        alignSelf: 'center',
        justifyContent: 'center', alignItems: 'center',
        shadowColor: '#006d9c',
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 0.19,
        shadowRadius: 5,
        borderTopWidth: 1,
        borderTopColor: theme.colors.gray1,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.gray1,
    },
    reasonRed: {
        width: widthPercentage(95),
        backgroundColor: theme.colors.white,
        borderRadius: 12,
        marginTop: 10,
        padding: 10,
        minHeight: heightPercentage(20),
        gap: 10,
        alignSelf: 'center',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        shadowColor: '#006d9c',
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 0.19,
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
        marginVertical: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    warningIconeContainer: {
        backgroundColor: theme.colors.warning,
        width: 25,
        height: 25,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 25,
    },
    greenIconeContainer: {
        backgroundColor: theme.colors.green,
        width: 27,
        height: 27,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 25,
    },
    redIconeContainer: {
        backgroundColor: theme.colors.rose,
        width: 25,
        height: 25,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 25,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginLeft: 8,
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
        borderColor: theme.colors.textLight,
        borderRadius: 15,
        padding: 5,
        marginLeft: 10,
    },
    banBtn: {
        borderWidth: 1,
        borderColor: theme.colors.red,
        borderRadius: 15,
        padding: 5,
        marginLeft: 10,

    },
    posterInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 0.4,
        borderColor: theme.colors.gary1,
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
    eventDate: {
        fontSize: 12,
        color: theme.colors.text,
        marginLeft: 10,
    },

    emptyEvents: {
        margin: 10,
        justifyContent: 'center'

    },
    posterInfoTDL: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: 15,
        marginVertical: 10,
        overflow: 'hidden',

    },
    posterInfoTimeDate: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,

    },
    eventDetail: {
        marginLeft: 10,
        color: theme.colors.text,
        fontSize: 12,
        fontWeight: theme.fonts.bold,

    },
    eventDetailLink: {
        fontWeight: theme.fonts.bold,
        marginLeft: 10,
        color: theme.colors.cyan1,
        fontSize: 12,
    },
    postText: {
        marginVertical: 10,
        color: theme.colors.text,

    },
    eventDescription: {
        fontSize: 13,
        color: theme.colors.text,

    },
    eventName: {
        fontSize: 17,
        fontWeight: '600',
        marginBottom: 10,
        color: theme.colors.textDark,

    },
    readMore: {
        color: theme.colors.cyan1,
        fontWeight: '700',
        marginTop: 5,
    },
    img: {
        width: widthPercentage('max'),
        height: heightPercentage(55),
        borderRadius: 5,
        marginVertical: 10,
    },
    scrollUp: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        bottom: -10,
        borderBottomEndRadius: 0,
        borderBottomLeftRadius: 0,
        backgroundColor: theme.colors.primaryLight,
        borderRadius: 25,
        paddingHorizontal: 15,
        paddingVertical: 10,
        shadowColor: '#006d9c',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.3,
        shadowRadius: 2,
    },
    EventsPostsSection: {
        marginBottom: 100,
    },
    tagsEventsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
    },
    tagEventsButton: {
        paddingHorizontal: 6,
        paddingVertical: 5,
        borderRadius: 15,
        marginRight: 5,
        marginBottom: 5,
        backgroundColor: theme.colors.cyan1,

    },
    tagEventsButtonText: {
        color: theme.colors.text,
        fontSize: 11,
    },
    tabContainer: {
        position: 'sticky',
        top: 0,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        height: 40,
        width: '100%',
        backgroundColor: theme.colors.white,
        paddingHorizontal: 10,
        alignItems: 'center',
        zIndex: 10,
        borderBottomWidth: 1,
        borderColor: theme.colors.gray1,

    },

    tabButton: {
        width: widthPercentage(25),
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: theme.colors.gray1,
        borderBottomWidth: 2.5,
        paddingBottom: 5,

    },
    activeTab: {
        borderColor: theme.colors.primary,
    },
    inactiveTab: {
        borderColor: theme.colors.white,
    },
    activeIcon: {
        color: theme.colors.primary,
    },
    inactiveIcon: {
        color: theme.colors.textLight,
    }
});

export default ClubProfile;

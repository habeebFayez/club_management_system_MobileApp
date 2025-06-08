import {Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import React, {useCallback, useContext, useEffect, useState} from 'react'
import {
    CalendarIcon,
    CancelCircleIcon,
    CheckmarkCircle02Icon,
    ClockIcon,
    Delete02Icon,
    EditIcon,
    LocationIcon,
    SmartPhoneIcon,
    UnavailableIcon,
    UserCircleIcon
} from "@hugeicons/core-free-icons";
import CreatEvent from "../../clubManager/CreatEvent";
import EventDescription from "./EventDescription";
import AnimatedSwipeNavigator from "../../../navigators/AnimatedSwipeNavigator";
import {CredentialsContext} from "../../../contexts/CredentialsContext";
import {PopoverContext} from "../../../contexts/PopoverContext";
import {ModalContext} from "../../../contexts/ModalContext";
import {
    activateEvent,
    deleteEventById,
    getAllEventCategoriesById,
    getAllEventsSpeakersAndSponsors
} from "../../../api/ConstantsApiCalls";
import {useScroll} from "../../../contexts/ScrollContext";
import {getUserRole, heightPercentage, widthPercentage} from "../../../helpers/common";
import Loading from "../../../component/Loading";
import DeactivateEventPop from "../../admin/DeactivateEventPop";
import MyIcon from "../../../component/MyIcons";
import RejectEventRequest from "../../admin/RejectEventRequest";
import ButtonShowMore from "../../../component/ButtonShowMore";
import {ThemeContext} from "../../../contexts/ThemeContext";
import Input from "../../../component/Input";
import {useNotification} from "../../../contexts/NotificationsContext";

const EventFullView = ({route, navigation}) => {
    const {theme} = useContext(ThemeContext);
    const styles = createStyles(theme);
    const { refreshData} = useNotification();

    const {post, backTitle, rejectionReason} = route.params || {};
    //date control        *************************************************************************************************
    const today = new Date();
    const todayDate = today.toISOString().split('T')[0]
    //contexts control        *************************************************************************************************
    const {storedJwt, club, user} = useContext(CredentialsContext);
    const {
        setShowPopover, openPopover, openSuccessMassage, openAlertMassage,
        setPopoverSize, setCloseConfirmation, openImagePopover
    } = useContext(PopoverContext);
    const {
        openModal, showModal, setShowModal,
        confirmation, confirmationPage, resetConfirmation, setConfirmation, setConfirmationPage, setModalTitle
    } = useContext(ModalContext);
    //Loading control        *************************************************************************************************
    const [isLoading, setIsLoading] = useState(true);
    //Events posts control        *************************************************************************************************
    const [userRole, setUserRole] = useState(null);
    const [sortedEventsCategories, setSortedEventsCategories] = useState([]);
    const [eventToBeActivated, SetEventToBeActivated] = useState([]);
    const [isDescriptionVisible, setIsDescriptionVisible] = useState(false);
    const [isRejectionReasonVisible, setIsRejectionReasonVisible] = useState(false);
    const [eventSponsors, setEventSponsors] = useState([]);
    const [eventSpeakers, setEventSpeakers] = useState([]);
    //scroll control const's                                    *************************************************************************
    const {setTabBarVisibility} = useScroll();
    const [eventToBeDeleted, SetEventToBeDeleted] = useState([]);


    // API GET All Events Speakers And Sponsors call                                        **********************************************************************
    useEffect(() => {
        if (userRole !== 'STUDENT') {
            (async () => {
                setIsLoading(true);
                const response = await getAllEventsSpeakersAndSponsors(storedJwt, openSuccessMassage, openAlertMassage, post);
                setIsLoading(false);
                if (response) {
                    let sponsorsData = response.sponsors.map(item => ({
                        contactNumber: item.contactNumber,
                        name: item.name,
                    }));
                    let speakersData = response.speakers.map(item => ({
                        contactNumber: item.contactNumber,
                        name: item.name,
                    }));
                    setEventSpeakers(speakersData);
                    setEventSponsors(sponsorsData);
                }

            })();
        }


    }, [storedJwt,refreshData, user, post]);
    // API GET All  Events Categories call                                        **********************************************************************
    useEffect(() => {
        (async () => {

            setIsLoading(true);
            const response = await getAllEventCategoriesById(storedJwt, openSuccessMassage, openAlertMassage);
            setIsLoading(false);
            if (response) {
                setSortedEventsCategories(response)
            }
        })();


    }, [storedJwt,refreshData, user]);
    // API Delete Event call                                        **********************************************************************
    const handleDeleteEvent = () => {
        (async () => {
            setIsLoading(true);
            const response = await deleteEventById(storedJwt, user,
                openSuccessMassage, openAlertMassage, eventToBeDeleted);
            setIsLoading(false);
            if (response) {
                openSuccessMassage('Event was Deleted successfully.');
                GoBack();

            }

        })();
    }
    // Refresh handler (pull-to-refresh)                                        **********************************************************************
    const GoBack = useCallback(() => {
        setIsLoading(true)
        setTimeout(() => {
            setIsLoading(false)
            navigation.goBack();
        }, 1500);
    }, [navigation]);
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
    //BottomTabNavigator Hiding when triggering Notification page       *********************************************************************
    useEffect(() => {
        // Hide the tab bar when Notification is focused
        const parent = navigation.getParent();
        setTabBarVisibility(false);
        return () => {
            backTitle === 'Calendar' &&
            setTabBarVisibility(true);
        };
    }, [navigation]);
    // Delete event Confirmation Modal                              **********************************************************************
    const handleDeleteEventConfirimation = (event) => {
        SetEventToBeDeleted(event);
        setConfirmationPage('PostPage/DeleteEvent')
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
                }}
                storedJwt={storedJwt}
                user={user}
                openSuccessMassage={openSuccessMassage}
                onRefresh={() => navigation.goBack()}
                openAlertMassage={openAlertMassage}
                setCloseConfirmation={setCloseConfirmation}

            />
        );

    }

    // Activate Event Confirmation Modal                              **********************************************************************
    const handleActivateEventConfirimation = (event) => {
        SetEventToBeActivated(event);
        setConfirmationPage('PostPage/ActivateEvent')
        if (!showModal) {
            setModalTitle('Activate Event')
            openModal("Are you Sure You Want to Activate \n " + event.eventName.toLocaleUpperCase() + " Event ?\n \n " +
                (event.eventPostRequested ?
                    "NOTE: This Event will be published to public "
                    :
                    " NOTE: This Event Wont be publicly Posted, since the club Manager didn't request it to be Posted"), false)
            setShowModal(true)
        } else {
            setShowModal(false)
        }
    }
    // API Activate Event call                                        **********************************************************************
    const handleActivateEvent = () => {
        (async () => {
            const response = await activateEvent(storedJwt, user,
                openSuccessMassage, openAlertMassage, eventToBeActivated);
            if (response) {
                openSuccessMassage('Event was Activated Successfully.');
                navigation.goBack()


            }

        })();
    }

    // Reject Event Confirmation                               **********************************************************************
    const handleRejectEventById = (event) => {
        openPopover(
            <RejectEventRequest
                eventToBeRejected={event}
                close={() => {
                    setShowPopover(false)
                }}
                storedJwt={storedJwt}
                user={user}
                openSuccessMassage={openSuccessMassage}
                onRefresh={() => navigation.goBack()}
                openAlertMassage={openAlertMassage}
                setCloseConfirmation={setCloseConfirmation}

            />
        );

    }
    // Get USER ROLE                                       **********************************************************************
    useEffect(() => {
        const role = getUserRole(user);
        setUserRole(role);
        setPopoverSize(heightPercentage(100));
    }, [user, storedJwt]);
// On confirmation for Home ********************************************************
    useEffect(() => {
        if (confirmation && confirmationPage === 'PostPage/DeleteEvent') {
            handleDeleteEvent()
            setShowModal(false)
            setConfirmation(false);
            resetConfirmation();

        }
        if (confirmation && confirmationPage === 'PostPage/ActivateEvent') {
            handleActivateEvent()
            setShowModal(false)
            setConfirmation(false);
            resetConfirmation();
        }


    }, [confirmation]);
    // speakers And Sponsors Form in map ********************************************************
    const speakersAndSponsorsForm = (isSpeaker, value, index) => {
        return (
            <View key={index} style={styles.sponsorsAndSpeakersCont}>
                {/* Name Input ____________________________________________________________ */}
                <Input
                    editable={false}
                    value={value.name}
                    icon={<MyIcon
                        icon={UserCircleIcon}
                        size={25}
                        color={
                            theme.colors.textLight
                        }
                    />}
                    placeholder={isSpeaker ? 'Speaker Name' : 'Sponsor Name'}
                    style={{width: widthPercentage(30), color: theme.colors.text}}
                />

                {/* Contact Number Input ____________________________________________________________ */}
                <Input
                    editable={false}
                    value={value.contactNumber}
                    icon={<MyIcon
                        icon={SmartPhoneIcon}
                        size={25}
                        color={
                            theme.colors.textLight
                        }
                    />}
                    placeholder={'Contact Number'}
                    style={{width: widthPercentage(30), color: theme.colors.text}}
                />
            </View>
        )
    }
    return (
        <>
            <AnimatedSwipeNavigator
                pageTitle={post?.club?.clubName}
                isFromLeft={true}
                navigation={navigation}
                backTitle={backTitle}
                post={post}
                user={user}
                userRole={userRole}

            >
                {isLoading ?
                    <Loading/>
                    :
                    <ScrollView
                        style={{backgroundColor: theme.colors.white, marginBottom: 100}}
                        scrollEventThrottle={16}
                        progressViewOffset={heightPercentage(5)}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{backgroundColor: theme.colors.white,}}
                    >

                        <View style={styles.Backgrond} key={post.eventID}>
                            <View
                                style={{
                                    borderBottomWidth: 2,
                                    borderBottomColor: theme.colors.gray1, paddingBottom: 10, gap: 5,
                                }}
                            >
                                {/* Manager Action Buttons ----------------------------------------------------------------------------- */}
                                {user && (post.clubID.clubManager.userID === user.userID) && (
                                    <View style={styles.postChoisesManager}>
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
                                                    onRefresh={GoBack}
                                                />
                                            )}
                                        >
                                            <MyIcon icon={EditIcon} size={15} color={theme.colors.textLight}/>
                                        </TouchableOpacity>
                                    </View>
                                )}

                                {/* Admin Actions -----------------------------------------------------------------------------*/}
                                {userRole === "ADMIN" && (
                                    <View style={styles.postChoises}>
                                        {/*Active Event -------------------------------------------------------------------------*/}
                                        {(!post.eventisRejected && (post.eventStates && !post.eventUpdated)) &&
                                            <>
                                                {/* Event Actions Admin -------------------------------------------------------------------------*/}
                                                <View style={styles.postChoises}>
                                                    {/*Reject Event Request -------------------------------------------------------------------------*/}
                                                    <TouchableOpacity
                                                        style={styles.banBtnRed}
                                                        onPress={() => handleDeleteEventConfirimation(post)}

                                                    >
                                                        <MyIcon icon={Delete02Icon} size={25} strokeWidth={2}
                                                                color={'white'}/>
                                                        <Text style={{color: 'white', fontWeight: 'bold'}}>Delete</Text>
                                                    </TouchableOpacity>

                                                    {/*Accept Event Request -------------------------------------------------------------------------*/}
                                                    <TouchableOpacity
                                                        style={styles.banBtnRose}
                                                        onPress={() => handleDeactivateEventConfirimation(post)}

                                                    >
                                                        <MyIcon icon={UnavailableIcon} size={25} strokeWidth={2}
                                                                color={'white'}/>
                                                        <Text
                                                            style={{color: 'white', fontWeight: 'bold',}}> Block</Text>

                                                    </TouchableOpacity>
                                                </View>
                                            </>
                                        }
                                        {/*Pending Event -------------------------------------------------------------------------*/}
                                        {(!post.eventisRejected && (!post.eventStates || post.eventUpdated)) &&
                                            <>
                                                {/* Event Actions Admin -------------------------------------------------------------------------*/}
                                                <View style={styles.postChoises}>
                                                    {/*Reject Event Request -------------------------------------------------------------------------*/}

                                                    <TouchableOpacity
                                                        style={styles.banBtnRed}
                                                        onPress={() => handleRejectEventById(post)}

                                                    >
                                                        <MyIcon icon={CancelCircleIcon} size={25} strokeWidth={2}
                                                                color={'white'}/>
                                                        <Text style={{color: 'white', fontWeight: 'bold'}}>Reject</Text>
                                                    </TouchableOpacity>
                                                    {/*Accept Event Request -------------------------------------------------------------------------*/}
                                                    <TouchableOpacity
                                                        style={styles.banBtnGreen}
                                                        onPress={() => handleActivateEventConfirimation(post)}

                                                    >
                                                        <MyIcon icon={CheckmarkCircle02Icon} size={25} strokeWidth={2}
                                                                color={'white'}/>
                                                        <Text style={{color: 'white', fontWeight: 'bold'}}>Accept</Text>

                                                    </TouchableOpacity>

                                                </View>
                                            </>
                                        }
                                        {/*Rejected Event -------------------------------------------------------------------------*/}
                                        {post.eventisRejected &&
                                            <>
                                                {/* Event Actions Admin -------------------------------------------------------------------------*/}
                                                <View style={styles.postChoises}>
                                                    {/*Reject Event Request -------------------------------------------------------------------------*/}
                                                    <TouchableOpacity
                                                        style={styles.banBtnRed}
                                                        onPress={() => handleDeleteEventConfirimation(post)}

                                                    >
                                                        <MyIcon icon={Delete02Icon} size={25} strokeWidth={2}
                                                                color={'white'}/>
                                                        <Text style={{color: 'white', fontWeight: 'bold'}}>Delete</Text>
                                                    </TouchableOpacity>

                                                    {/*Accept Event Request -------------------------------------------------------------------------*/}
                                                    <TouchableOpacity
                                                        style={styles.banBtnGreen}
                                                        onPress={() => handleActivateEventConfirimation(post)}

                                                    >
                                                        <MyIcon icon={CheckmarkCircle02Icon} size={25} strokeWidth={2}
                                                                color={'white'}/>
                                                        <Text style={{color: 'white', fontWeight: 'bold'}}>Accept</Text>

                                                    </TouchableOpacity>
                                                </View>
                                            </>
                                        }
                                    </View>
                                )}
                                {/* MORE Details -----------------------------------------------------------------------------*/}
                                {/* Show Description Button ---------------------------------------------------*/}
                                {(user && (post.clubID.clubManager.userID === user.userID) || userRole === 'ADMIN') &&
                                    (
                                        <ButtonShowMore
                                            isVisible={isDescriptionVisible}
                                            TextAreaDetails={post.eventDescription}
                                            TextAreaDetailsTitle={'Event Description only For Admin View'}
                                            FoldButtonText={'Fold Description'}
                                            ShowButtonText={'Show Description'}
                                            setIsVisible={() => setIsDescriptionVisible(!isDescriptionVisible)}/>
                                    )}
                                {/* Show Event Rejection Reason Details Button -----------------------------------------------------------------------------*/}
                                {(user && (post.clubID.clubManager.userID === user.userID)) &&
                                    post.eventisRejected &&
                                    (
                                        <ButtonShowMore
                                            isVisible={isRejectionReasonVisible}
                                            TextAreaDetails={rejectionReason?.split('Reason :')[1]?.trim()}
                                            alertErr={true}
                                            TextAreaDetailsTitle={'Event Rejection Reason Details'}
                                            FoldButtonText={'Fold Rejection Reason Details'}
                                            ShowButtonText={'Show Rejection Reason Details'}
                                            setIsVisible={() => setIsRejectionReasonVisible(!isRejectionReasonVisible)}/>
                                    )}

                            </View>
                            {/* poster Info Container----------------------------------------------------------------------------- */}
                            <View style={styles.posterInfoContainer}>
                                {/* Post Content----------------------------------------------------------------------------- */}
                                <TouchableOpacity
                                    style={styles.posterInfo}
                                    activeOpacity={0.8}
                                    onPress={() => navigation.replace('ClubProfile', {
                                        club: post.club,
                                        user,
                                        backTitle: 'Search'
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

                            </View>
                            {/* Event Details----------------------------------------------------------------------------- */}
                            <View style={styles.posterInfoTDL}>
                                <View style={styles.posterInfoTimeDate}>
                                    <MyIcon icon={ClockIcon} size={18} color={theme.colors.textLight}/>
                                    <Text style={styles.eventDetail}>{post.eventNote}</Text>
                                </View>
                                <View style={styles.posterInfoTimeDate}>
                                    <MyIcon icon={CalendarIcon} size={18} color={theme.colors.textLight}/>
                                    <Text
                                        style={[styles.eventDetail, post.eventStartingDate < todayDate && {color: theme.colors.red}]}>
                                        Event Date : {post.eventStartingDate}
                                        {(post.eventStartingDate < todayDate) && ' Expired'}
                                    </Text>
                                </View>
                                <View style={styles.posterInfoTimeDate}>
                                    <MyIcon icon={LocationIcon} size={18} color={theme.colors.cyan1}/>
                                    <TouchableOpacity style={{left: -10}} onPress={() =>
                                        Linking.openURL(post.eventLocationURL)
                                    }>
                                        <Text style={styles.eventDetailLink}>{
                                            post.eventHall.length > 50 ?
                                                post.eventHall.slice(0, 50) + '...'
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
                                                              activeOpacity={0.5}
                                                              style={[styles.tagButton,
                                                                  {backgroundColor: theme.colors.cyan1,}]}>
                                                <Text style={styles.tagButtonText}>
                                                    # {category.category.categoryName}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                            </View>

                            {/* Event Image */}
                            {post?.eventPostMediaURL &&
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => openImagePopover(post.eventPostMediaURL)}>
                                    <Image
                                        source={{uri: post?.eventPostMediaURL}}
                                        style={styles.img}
                                    />
                                </TouchableOpacity>}
                            {/*EVENT SPEAKERS AND SPONSORS ----------------------------------------------------------------*/}
                            {((user && (userRole === 'ADMIN' || post.clubID.clubManager.userID === user.userID))) &&
                                <>
                                    <Text style={[styles.title, {fontSize: 15, fontWeight: theme.fonts.medium}]}>Event
                                        Speakers</Text>
                                    <View style={styles.ContainerOfSponsorsAndSpeakers}>
                                        {eventSpeakers.map((value, index) =>
                                            speakersAndSponsorsForm(true, value, index)
                                        )
                                        }
                                    </View>
                                    <Text style={[styles.title, {fontSize: 15, fontWeight: theme.fonts.medium}]}>Event
                                        Sponsors</Text>
                                    <View style={styles.ContainerOfSponsorsAndSpeakers}>
                                        {eventSponsors.map((value, index) =>
                                            speakersAndSponsorsForm(false, value, index)
                                        )
                                        }
                                    </View>
                                </>}
                        </View>

                    </ScrollView>}

            </AnimatedSwipeNavigator>
        </>
    )
}
export default EventFullView
const createStyles = (theme) => StyleSheet.create({
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
        borderTopWidth: 0.2,
        borderTopColor: theme.colors.gray1,
        borderBottomWidth: 2,
        borderBottomColor: theme.colors.gray1,
    },
    adminActionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
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
        width: 25,
        height: 25,
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
    postChoises: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',

    },
    postChoisesManager: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
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
    banBtnGreen: {
        width: 100,
        flexDirection: 'row', alignItems: 'center', gap: 5,
        borderWidth: 1,
        borderColor: theme.colors.green,
        backgroundColor: theme.colors.green,
        borderRadius: 15,
        padding: 2,
        marginLeft: 10,

    },
    banBtnRed: {
        width: 100,
        flexDirection: 'row', alignItems: 'center', gap: 5,
        borderWidth: 1,
        borderColor: theme.colors.red,
        backgroundColor: theme.colors.red,
        borderRadius: 15,
        padding: 2,
        marginLeft: 10,

    },
    banBtnRose: {
        width: 100,
        flexDirection: 'row', alignItems: 'center', gap: 5,
        borderWidth: 1,
        borderColor: theme.colors.roseLight,
        backgroundColor: theme.colors.roseLight,
        borderRadius: 15,
        padding: 2,
        marginLeft: 10,

    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        alignSelf: "center",
        marginBottom: 10,
        color: theme.colors.text,
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
        color: theme.colors.text,
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 10,
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
        flexDirection: 'column',
        justifyContent: 'flex-start',
        gap: 15,
        marginVertical: 3,
        overflow: 'hidden',

    },
    posterInfoTimeDate: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,

    },
    eventDetail: {
        color: theme.colors.textLight,
        fontSize: 12,
        fontWeight: theme.fonts.bold,

    },
    eventDetailLink: {
        fontWeight: theme.fonts.bold,
        marginLeft: 10,
        color: theme.colors.cyan1,
        fontSize: 12,
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
    lableText: {
        left: 10, color: theme.colors.text, fontWeight: '700', marginVertical: 5,
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
        height: heightPercentage(5),
        justifyContent: 'center',
        maxWidth: widthPercentage(50),
        alignItems: 'center',
        borderCurve: 'continuous',
        borderRadius: 18,
        padding: 10,
        gap: 10,
    },
    sponsorsAndSpeakersCont: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5,

    },
    ContainerOfSponsorsAndSpeakers: {
        width: widthPercentage(95),
        backgroundColor: theme.colors.card,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: heightPercentage(3),
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#006d9c',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 5,
        borderWidth: 2,
        borderColor: theme.colors.gray1,
        gap: 10,
        marginBottom: 10,
    },
});
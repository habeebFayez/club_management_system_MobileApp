import {Image, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import React, {useContext, useEffect, useState} from 'react'
import {
    AddIcon,
    Alert02Icon,
    CancelCircleIcon,
    CheckmarkCircle02Icon,
    Delete02Icon,
    EditIcon,
    UnavailableIcon
} from "@hugeicons/core-free-icons";
import {CLUB_DEFAULT_IMAGE} from "../../constants/DefaultConstants";
import {heightPercentage, widthPercentage} from "../../helpers/common";
import Loading from "../../component/Loading";
import MyIcon from "../../component/MyIcons";
import {Pressable} from "react-native-gesture-handler";
import {CredentialsContext} from "../../contexts/CredentialsContext";
import {PopoverContext} from "../../contexts/PopoverContext";
import {ModalContext} from "../../contexts/ModalContext";
import {activateEvent, deleteEventById, getAllEventCategoriesById} from "../../api/ConstantsApiCalls";
import CreatEvent from "../clubManager/CreatEvent";
import DeactivateEventPop from "./DeactivateEventPop";
import RejectEventRequest from "./RejectEventRequest";
import {ThemeContext} from "../../contexts/ThemeContext";
import {useNotification} from "../../contexts/NotificationsContext";

const EventsDash = ({
                        pendingEvents, rejectedEvents, onRefresh, userRole, isWaiting, isLoading,
                        navigation, acceptedEvents, backTitle = 'Dashboard',handelOuterScroll
                    }) => {
    const {theme} = useContext(ThemeContext);
    const styles = createStyles(theme);
    const { refreshData} = useNotification();

    //contexts control        *************************************************************************************************
    const {storedJwt, club, user} = useContext(CredentialsContext);
    const {
        setShowPopover,
        openPopover,
        openSuccessMassage,
        openAlertMassage,
        setCloseConfirmation,
        openImagePopover
    } = useContext(PopoverContext);
    const {
        openModal, showModal, setShowModal,
        confirmation, confirmationPage, resetConfirmation, setConfirmation, setConfirmationPage, setModalTitle
    } = useContext(ModalContext);
//date control        *************************************************************************************************
    const today = new Date();
    const todayDate = today.toISOString().split('T')[0]
    //Loading control        *************************************************************************************************
    const [loading, setLoading] = useState(false);
    const [eventToBeDeleted, SetEventToBeDeleted] = useState([]);
    const [sortedEventsCategories, setSortedEventsCategories] = useState([]);
    const [eventToBeActivated, SetEventToBeActivated] = useState([]);


    // Activate Event Confirmation Modal                              **********************************************************************
    const handleActivateEventConfirimation = (event) => {
        SetEventToBeActivated(event);
        setConfirmationPage('DashboardPage/ActivateEvent')
        if (!showModal) {
            setModalTitle('Activate Event')
            openModal("Are you Sure You Want to Activate \n " + event.eventName.toLocaleUpperCase() + " Event ?\n \n " +
                (event.eventPostRequested && "This Event will be published to public "), false)
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
                openSuccessMassage('Event Activated Successfully.');
                onRefresh();

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
                onRefresh={onRefresh}
                openAlertMassage={openAlertMassage}
                setCloseConfirmation={setCloseConfirmation}

            />
        );

    }
    // Delete event Confirmation Modal                              **********************************************************************
    const handleDeleteEventConfirimation = (event) => {


        SetEventToBeDeleted(event);
        setConfirmationPage('Dashboard/DeleteEvent')
        if (!showModal) {
            setModalTitle('Delete Event')
            openModal("Are you Sure You Want to Delete " + event.eventName.toLocaleUpperCase() + " Event ?", false)
            setShowModal(true)
        } else {
            setShowModal(false)
        }
    }
    // API Delete Event call                                        **********************************************************************
    const handleDeleteEvent = () => {
        (async () => {
            setLoading(true);
            const response = await deleteEventById(storedJwt, user,
                openSuccessMassage, openAlertMassage, eventToBeDeleted);
            setLoading(false);
            if (response) {
                openSuccessMassage('Event Deleted successfully.');
                onRefresh();

            }

        })();
    }
    // On confirmation for Home ********************************************************
    useEffect(() => {
        if (confirmation && confirmationPage === 'Dashboard/DeleteEvent') {
            handleDeleteEvent()
            setShowModal(false)
            setConfirmation(false);
            resetConfirmation();

        }
        if (confirmation && confirmationPage === 'DashboardPage/ActivateEvent') {
            handleActivateEvent()
            setShowModal(false)
            setConfirmation(false);
            resetConfirmation();

        }

    }, [confirmation]);
    // API GET All  Events Categories call                                        **********************************************************************
    useEffect(() => {
        (async () => {

            setLoading(true);
            const response = await getAllEventCategoriesById(storedJwt, openSuccessMassage, openAlertMassage);
            setLoading(false);
            if (response) {
                setSortedEventsCategories(response)
            }

        })();

    }, [storedJwt,refreshData, user]);
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
                onRefresh={onRefresh}
                openAlertMassage={openAlertMassage}
                setCloseConfirmation={setCloseConfirmation}

            />
        );

    }
    return (
        (<>
            <View style={{
                position: 'relative',

                width: widthPercentage(100),
                paddingHorizontal: 10,

            }}>
                {userRole === 'MANAGER' && club.clubisActivation &&
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
                            onClose={() => {
                                setShowPopover(false);
                                onRefresh();
                            }}
                            editingEventRequest={false}
                        />
                    )}
                    style={styles.button}
                >
                    <Text style={styles.buttonTextStyle}>Create New Event</Text>
                    <MyIcon
                        icon={AddIcon}
                        color={'white'}
                        size={25}

                    />
                </TouchableOpacity>}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.warningIconeContainer}>
                            <MyIcon icon={Alert02Icon} size={25} color={'black'}/>
                        </View>
                        <Text style={styles.sectionTitle}>Pending Events Requests</Text>
                    </View>

                    {pendingEvents.length > 0 ? (
                        <>
                            <View style={styles.tableHeader}>
                                <Text style={styles.tableHeaderText}>Event</Text>
                                <Text style={styles.tableHeaderText}>Total: {pendingEvents.length}</Text>
                            </View>
                            <ScrollView  onTouchStart={handelOuterScroll}
                                         onTouchEnd={ handelOuterScroll}
                                         style={styles.allListItems}>
                                {pendingEvents.map(event => (
                                    <View key={event.eventID} style={styles.listItem}>
                                        <View style={styles.itemContent}>
                                            <Pressable
                                                activeOpacity={0.7}
                                                style={({pressed}) => [
                                                    styles.itemButton,
                                                    {opacity: pressed ? 0.7 : 1}
                                                ]}
                                                android_ripple={{color: theme.colors.primaryLight}}
                                                hitSlop={15}
                                                delayPressIn={0}
                                                onPress={() => navigation.navigate('EventFullView', {
                                                    post: event,
                                                    backTitle
                                                })}
                                            >
                                                <Image
                                                    source={{uri: event.eventPostMediaURL || CLUB_DEFAULT_IMAGE}}
                                                    style={styles.itemImage}
                                                />
                                                <View style={styles.itemTextContainer}>
                                                    <View
                                                        style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                                        <Text style={styles.itemName}>
                                                            {event.eventName?.length > 18 ?
                                                                event.eventName?.slice(0, 18).toUpperCase() + '...' :
                                                                event.eventName
                                                                || ''}

                                                        </Text>
                                                        {event.eventPostRequested && <Text
                                                            style={{
                                                                fontSize: 10,
                                                                fontWeight: '400',
                                                                color: 'red',
                                                                paddingHorizontal: 8,

                                                            }}>
                                                            POST</Text>}
                                                    </View>

                                                    <Text
                                                        style={[styles.itemDate, event.eventStartingDate < todayDate && {color: 'red'}]}>
                                                        Event Date : {event.eventStartingDate}
                                                        {(event.eventStartingDate < todayDate) && ' Expired'}
                                                    </Text>
                                                </View>
                                            </Pressable>
                                            {/* Event Actions Admin -------------------------------------------------------------------------*/}
                                            {userRole === 'ADMIN' &&
                                                <View style={styles.actionsContainer}>
                                                    {/*Reject Event Request -------------------------------------------------------------------------*/}
                                                    <Pressable
                                                        style={({pressed}) => [
                                                            styles.redIconeActionsContainer,
                                                            {opacity: pressed ? 0.7 : 1}
                                                        ]}
                                                        onPress={() => handleRejectEventById(event)}
                                                    >
                                                        <MyIcon icon={CancelCircleIcon} size={22} color={'white'}/>
                                                    </Pressable>
                                                    {/*Accept Event Request -------------------------------------------------------------------------*/}
                                                    <Pressable
                                                        style={({pressed}) => [
                                                            styles.greenIconeActionsContainer,
                                                            {opacity: pressed ? 0.7 : 1}
                                                        ]}
                                                        onPress={() => handleActivateEventConfirimation(event)}
                                                    >
                                                        <MyIcon icon={CheckmarkCircle02Icon} size={22} color={'white'}/>
                                                    </Pressable>
                                                </View>}
                                            {/* Event Actions Manager -------------------------------------------------------------------------*/}
                                            {userRole === 'MANAGER' &&
                                                <View style={styles.actionsContainer}>
                                                    {/*Edit  Event Request -------------------------------------------------------------------------*/}
                                                    <Pressable
                                                        style={({pressed}) => [
                                                            styles.grayIconeActionsContainer,
                                                            {opacity: pressed ? 0.7 : 1}
                                                        ]}
                                                        onPress={() => openPopover(
                                                            <CreatEvent
                                                                club={club}
                                                                storedJwt={storedJwt}
                                                                user={user}
                                                                openAlertMassage={openAlertMassage}
                                                                openSuccessMassage={openSuccessMassage}
                                                                openImagePopover={openImagePopover}
                                                                userRole={userRole}
                                                                eventToBeEdited={event}
                                                                setCloseConfirmation={setCloseConfirmation}
                                                                onClose={() => setShowPopover(false)}
                                                                editingEventRequest={true}
                                                                eventCategoriesToBeEdited={getEventCategoryById(event.eventID)}
                                                                onRefresh={onRefresh}
                                                            />
                                                        )}
                                                    >
                                                        <MyIcon icon={EditIcon} size={20}
                                                                color={theme.type === 'dark' ? "white" : "gray"}/>

                                                    </Pressable>
                                                    {/*Delete Event Request -------------------------------------------------------------------------*/}
                                                    <Pressable
                                                        style={({pressed}) => [
                                                            styles.redIconeActionsContainer,
                                                            {opacity: pressed ? 0.7 : 1}
                                                        ]}
                                                        onPress={() => handleDeleteEventConfirimation(event)}
                                                    >
                                                        <MyIcon icon={Delete02Icon} size={22} color={'white'}/>
                                                    </Pressable>
                                                </View>}
                                        </View>
                                    </View>
                                ))}
                            </ScrollView>
                        </>
                    ) : (
                        <>
                            <View style
                                      ={styles.tableHeader}>
                                <Text style={styles.tableHeaderText}>Event</Text>
                                <Text style={styles.tableHeaderText}>Total: {pendingEvents.length}</Text>
                            </View>
                            <Text style={styles.noItemsText}>No Pending Events were found</Text>
                        </>
                    )}
                </View>
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.greenIconeContainer}>
                            <MyIcon icon={CheckmarkCircle02Icon} size={25} color={'white'}/>
                        </View>
                        <Text style={styles.sectionTitle}>Active Events </Text>
                    </View>

                    {acceptedEvents.length > 0 ? (
                        <>
                            <View style={styles.tableHeader}>
                                <Text style={styles.tableHeaderText}>Event</Text>
                                <Text style={styles.tableHeaderText}>Total: {acceptedEvents.length}</Text>
                            </View>
                            <ScrollView
                                style={styles.allListItems}
                                onTouchStart={handelOuterScroll}
                                onTouchEnd={ handelOuterScroll}

                            >

                                {acceptedEvents.map(event => (
                                    <View key={event.eventID} style={styles.listItem}>
                                        <View style={styles.itemContent}>
                                            <Pressable
                                                activeOpacity={0.7}
                                                style={({pressed}) => [
                                                    styles.itemButton,
                                                    {opacity: pressed ? 0.7 : 1}
                                                ]}
                                                android_ripple={{color: theme.colors.primaryLight}}
                                                hitSlop={15}
                                                delayPressIn={0}
                                                onPress={() => navigation.navigate('EventFullView', {
                                                    post: event,
                                                    backTitle
                                                })}
                                            >
                                                <Image
                                                    source={{uri: event.eventPostMediaURL || CLUB_DEFAULT_IMAGE}}
                                                    style={styles.itemImage}
                                                />
                                                <View style={styles.itemTextContainer}>
                                                    <View
                                                        style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                                        <Text style={styles.itemName}>
                                                            {event.eventName?.length > 18 ?
                                                                event.eventName?.slice(0, 18).toUpperCase() + '...' :
                                                                event.eventName
                                                                || ''}

                                                        </Text>
                                                        {event.eventPostRequested && <Text
                                                            style={{
                                                                fontSize: 10,
                                                                fontWeight: '400',
                                                                color: 'red',
                                                                paddingHorizontal: 8,

                                                            }}>
                                                            POST</Text>}
                                                    </View>

                                                    <Text
                                                        style={[styles.itemDate, event.eventStartingDate < todayDate && {color: 'red'}]}>
                                                        Event Date : {event.eventStartingDate}
                                                        {(event.eventStartingDate < todayDate) && ' Expired'}
                                                    </Text>
                                                </View>
                                            </Pressable>

                                            {/* Event Actions Admin -------------------------------------------------------------------------*/}
                                            {userRole === 'ADMIN' &&
                                                <View style={styles.actionsContainer}>
                                                    {/*Block Event Request -------------------------------------------------------------------------*/}
                                                    <Pressable
                                                        style={({pressed}) => [
                                                            styles.roseIconeActionsContainer,
                                                            {opacity: pressed ? 0.7 : 1}
                                                        ]}
                                                        onPress={() => handleDeactivateEventConfirimation(event)}
                                                    >
                                                        <MyIcon icon={UnavailableIcon} size={20} color={'white'}/>
                                                    </Pressable>
                                                    {/*Delete Event Request -------------------------------------------------------------------------*/}
                                                    <Pressable
                                                        style={({pressed}) => [
                                                            styles.redIconeActionsContainer,
                                                            {opacity: pressed ? 0.7 : 1}
                                                        ]}
                                                        onPress={() => handleDeleteEventConfirimation(event)}
                                                    >
                                                        <MyIcon icon={Delete02Icon} size={22} color={'white'}/>
                                                    </Pressable>
                                                </View>}
                                            {/* Event Actions Manager -------------------------------------------------------------------------*/}
                                            {userRole === 'MANAGER' &&
                                                <View style={styles.actionsContainer}>
                                                    {/*Edit  Event Request -------------------------------------------------------------------------*/}
                                                    <Pressable
                                                        style={({pressed}) => [
                                                            styles.grayIconeActionsContainer,
                                                            {opacity: pressed ? 0.7 : 1}
                                                        ]}
                                                        onPress={() => openPopover(
                                                            <CreatEvent
                                                                club={club}
                                                                storedJwt={storedJwt}
                                                                user={user}
                                                                openAlertMassage={openAlertMassage}
                                                                openSuccessMassage={openSuccessMassage}
                                                                openImagePopover={openImagePopover}
                                                                userRole={userRole}
                                                                eventToBeEdited={event}
                                                                setCloseConfirmation={setCloseConfirmation}
                                                                onClose={() => setShowPopover(false)}
                                                                editingEventRequest={true}
                                                                eventCategoriesToBeEdited={getEventCategoryById(event.eventID)}
                                                                onRefresh={onRefresh}
                                                            />
                                                        )}
                                                    >
                                                        <MyIcon icon={EditIcon} size={20}
                                                                color={theme.type === 'dark' ? "white" : "gray"}/>

                                                    </Pressable>
                                                    {/*Delete Event Request -------------------------------------------------------------------------*/}
                                                    <Pressable
                                                        style={({pressed}) => [
                                                            styles.redIconeActionsContainer,
                                                            {opacity: pressed ? 0.7 : 1}
                                                        ]}
                                                        onPress={() => handleDeleteEventConfirimation(event)}
                                                    >
                                                        <MyIcon icon={Delete02Icon} size={22} color={'white'}/>
                                                    </Pressable>
                                                </View>}
                                        </View>

                                    </View>
                                ))}
                            </ScrollView>
                        </>
                    ) : (
                        <>
                            <View style
                                      ={styles.tableHeader}>
                                <Text style={styles.tableHeaderText}>Event</Text>
                                <Text style={styles.tableHeaderText}>Total: {acceptedEvents.length}</Text>
                            </View>
                            <Text style={styles.noItemsText}>No Active Events were found</Text>
                        </>
                    )}
                </View>
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.redIconeContainer}>
                            <MyIcon icon={CancelCircleIcon} size={25} color={'white'}/>
                        </View>
                        <Text style={styles.sectionTitle}>Rejected Events </Text>
                    </View>

                    {rejectedEvents.length > 0 ? (
                        <>
                            <View style={styles.tableHeader}>
                                <Text style={styles.tableHeaderText}>Event</Text>
                                <Text style={styles.tableHeaderText}>Total: {rejectedEvents.length}</Text>
                            </View>
                            <ScrollView  onTouchStart={handelOuterScroll}
                                         onTouchEnd={ handelOuterScroll}
                                         style={styles.allListItems}>

                                {rejectedEvents.map(event => (
                                    <View key={event.eventID} style={styles.listItem}>
                                        <View style={styles.itemContent}>
                                            <Pressable
                                                activeOpacity={0.7}
                                                style={({pressed}) => [
                                                    styles.itemButton,
                                                    {opacity: pressed ? 0.7 : 1}
                                                ]}
                                                android_ripple={{color: theme.colors.primaryLight}}
                                                hitSlop={15}
                                                delayPressIn={0}
                                                onPress={() => navigation.navigate('EventFullView', {
                                                    post: event,
                                                    backTitle
                                                })}
                                            >
                                                <Image
                                                    source={{uri: event.eventPostMediaURL || CLUB_DEFAULT_IMAGE}}
                                                    style={styles.itemImage}
                                                />
                                                <View style={styles.itemTextContainer}>
                                                    <View
                                                        style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                                        <Text style={styles.itemName}>
                                                            {event.eventName?.length > 18 ?
                                                                event.eventName?.slice(0, 18).toUpperCase() + '...' :
                                                                event.eventName
                                                                || ''}

                                                        </Text>
                                                        {event.eventPostRequested && <Text
                                                            style={{
                                                                fontSize: 10,
                                                                fontWeight: '400',
                                                                color: 'red',
                                                                paddingHorizontal: 8,

                                                            }}>
                                                            POST</Text>}
                                                    </View>

                                                    <Text
                                                        style={[styles.itemDate, event.eventStartingDate < todayDate && {color: 'red'}]}>
                                                        Event Date : {event.eventStartingDate}
                                                        {(event.eventStartingDate < todayDate) && ' Expired'}
                                                    </Text>
                                                </View>
                                            </Pressable>
                                            {/* Event Actions Admin -------------------------------------------------------------------------*/}
                                            {userRole === 'ADMIN' &&
                                                <View style={styles.actionsContainer}>
                                                    {/*Delete Event Request -------------------------------------------------------------------------*/}
                                                    <Pressable
                                                        style={({pressed}) => [
                                                            styles.redIconeActionsContainer,
                                                            {opacity: pressed ? 0.7 : 1}
                                                        ]}
                                                        onPress={() => handleDeleteEventConfirimation(event)}
                                                    >
                                                        <MyIcon icon={Delete02Icon} size={22} color={'white'}/>
                                                    </Pressable>
                                                    {/*Activate Event Request -------------------------------------------------------------------------*/}
                                                    <Pressable
                                                        style={({pressed}) => [
                                                            styles.greenIconeActionsContainer,
                                                            {opacity: pressed ? 0.7 : 1}
                                                        ]}
                                                        onPress={() => handleActivateEventConfirimation(event)}
                                                    >
                                                        <MyIcon icon={CheckmarkCircle02Icon} size={22} color={'white'}/>
                                                    </Pressable>
                                                </View>}
                                            {/* Event Actions Manager -------------------------------------------------------------------------*/}
                                            {userRole === 'MANAGER' &&
                                                <View style={styles.actionsContainer}>
                                                    {/*Edit  Event Request -------------------------------------------------------------------------*/}
                                                    <Pressable
                                                        style={({pressed}) => [
                                                            styles.grayIconeActionsContainer,
                                                            {opacity: pressed ? 0.7 : 1}
                                                        ]}
                                                        onPress={() => openPopover(
                                                            <CreatEvent
                                                                club={club}
                                                                storedJwt={storedJwt}
                                                                user={user}
                                                                openAlertMassage={openAlertMassage}
                                                                openSuccessMassage={openSuccessMassage}
                                                                openImagePopover={openImagePopover}
                                                                userRole={userRole}
                                                                eventToBeEdited={event}
                                                                setCloseConfirmation={setCloseConfirmation}
                                                                onClose={() => setShowPopover(false)}
                                                                editingEventRequest={true}
                                                                eventCategoriesToBeEdited={getEventCategoryById(event.eventID)}
                                                                onRefresh={onRefresh}
                                                            />
                                                        )}
                                                    >
                                                        <MyIcon icon={EditIcon} size={20}
                                                                color={theme.type === 'dark' ? "white" : "gray"}/>
                                                    </Pressable>
                                                    {/*Delete Event Request -------------------------------------------------------------------------*/}
                                                    <Pressable
                                                        style={({pressed}) => [
                                                            styles.redIconeActionsContainer,
                                                            {opacity: pressed ? 0.7 : 1}
                                                        ]}
                                                        onPress={() => handleDeleteEventConfirimation(event)}
                                                    >
                                                        <MyIcon icon={Delete02Icon} size={22} color={'white'}/>
                                                    </Pressable>
                                                </View>}

                                        </View>
                                    </View>
                                ))}
                            </ScrollView>
                        </>
                    ) : (
                        <>
                            <View style
                                      ={styles.tableHeader}>
                                <Text style={styles.tableHeaderText}>Event</Text>
                                <Text style={styles.tableHeaderText}>Total: {pendingEvents.length}</Text>
                            </View>
                            <Text style={styles.noItemsText}>No Rejected Events were found</Text>
                        </>

                    )}
                </View>

            </View>
            {(loading || !user || !userRole) &&
                <Loading screenSize={100} size={'large'}/>}
        </>)

    )
}
export default EventsDash
const createStyles = (theme) => StyleSheet.create({
    button: {
        flexDirection: 'row',
        backgroundColor: theme.colors.green,
        height: heightPercentage(5.5),
        justifyContent: 'center',
        maxWidth: widthPercentage(50),
        alignItems: 'center',
        alignSelf: 'center',
        borderCurve: 'continuous',
        borderRadius: 20,
        padding: 10,
        gap: 10,
        marginBottom: 15,
    },
    buttonTextStyle: {
        fontSize: 15,
        color: 'white',
        fontWeight: theme.fonts.bold,

    },
    section: {
        backgroundColor: theme.colors.white,
        borderRadius: 12,
        paddingHorizontal: 5,
        paddingVertical: 16,
        marginBottom: 16,
        shadowColor: '#006d9c',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    warningIconeContainer: {
        backgroundColor: theme.colors.warning,
        width: 35,
        height: 35,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 25,
    },
    greenIconeContainer: {
        backgroundColor: theme.colors.green,
        width: 35,
        height: 35,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 25,
    },
    redIconeContainer: {
        backgroundColor: theme.colors.rose,
        width: 35,
        height: 35,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 25,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginLeft: 8,
    },
    warningIconeActionsContainer: {
        backgroundColor: theme.colors.warning,
        width: 25,
        height: 25,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 25,
    },
    greenIconeActionsContainer: {
        backgroundColor: theme.colors.green,
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 25,
    },
    grayIconeActionsContainer: {
        backgroundColor: theme.colors.gray,
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 25,
    },
    actionsContainer: {
        flexDirection: 'row',
        gap: 5,
        // position:'absolute',
    },
    redIconeActionsContainer: {
        backgroundColor: theme.colors.red,
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 25,
    },
    roseIconeActionsContainer: {
        backgroundColor: theme.colors.rose,
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 25,
    },

    tableHeader: {

        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.gray1,
        paddingBottom: 12,
        marginBottom: 12,
    },
    tableHeaderText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    allListItems: {
        maxHeight: 300,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.gray1,
        backgroundColor: theme.colors.gray1,
        borderRadius: 25,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 5,
        shadowColor: '#006d9c',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    itemContent: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
        backgroundColor: theme.colors.white,
        padding: 5,
        borderRadius: 25,
    },
    itemButton: {

        flexDirection: 'row',
        alignItems: 'center',
        maxWidth: widthPercentage(70),
        overflow: 'hidden',
    },
    itemImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    itemTextContainer: {
        flex: 1,
    },
    itemName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 4,
    },
    itemDate: {
        fontSize: 12,
        color: theme.colors.textLight,
    },
    noItemsText: {
        color: theme.colors.textLight,
        textAlign: 'center',
        paddingVertical: 20,
    },
})

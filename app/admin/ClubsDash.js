import {Image, ScrollView, StyleSheet, Text, View} from 'react-native'
import {Pressable} from 'react-native-gesture-handler';

import React, {useContext, useEffect, useState} from 'react'
import CreatClub from "../allUsersView/Clubs/CreatClub";
import {
    AddIcon,
    Alert02Icon,
    CancelCircleIcon,
    CheckmarkCircle02Icon,
    Delete02Icon,
    UnavailableIcon
} from "@hugeicons/core-free-icons";
import {CLUB_DEFAULT_IMAGE} from "../../constants/DefaultConstants";
import {widthPercentage} from "../../helpers/common";
import Loading from "../../component/Loading";
import MyIcon from "../../component/MyIcons";
import {activateClub, deleteClub,} from "../../api/ConstantsApiCalls";
import DeactivatClubPop from "./DeactivatClubPop";
import {ModalContext} from "../../contexts/ModalContext";
import RejectClubRequest from "./RejectClubRequest";
import {ThemeContext} from "../../contexts/ThemeContext";

const ClubsDash = ({
                       user,
                       isLoading,
                       club,
                       storedJwt,
                       isWaiting,
                       openAlertMassage,
                       setShowPopover,
                       openSuccessMassage,
                       userRole,
                       openImagePopover,
                       openPopover,
                       onRefresh,
                       setCloseConfirmation,
                       navigation,
                       pendingClubs,
                       activeClubs,
                       rejectedClubs,
                       blockedClubs,
                        handelOuterScroll,
                   }) => {
    const {theme} = useContext(ThemeContext);
    const styles = createStyles(theme);
    const {
        openModal, showModal, setShowModal,
        confirmation, confirmationPage, resetConfirmation, setConfirmation, setConfirmationPage, setModalTitle
    } = useContext(ModalContext);
    const [clubToBeDeleted, SetClubToBeDeleted] = useState([]);
    const [clubToBeActivated, SetClubToBeActivated] = useState([]);
    const [clubToBeReject, SetClubToBeReject] = useState([]);


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
                onRefresh={onRefresh}
                openAlertMassage={openAlertMassage}
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
                onRefresh={onRefresh}
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
    // API Delete Event call                                        **********************************************************************
    const handleDeleteClub = () => {
        (async () => {
            const response = await deleteClub(storedJwt, user,
                openSuccessMassage, openAlertMassage, clubToBeDeleted);
            if (response) {
                openSuccessMassage('Club was Deleted successfully.');
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
    // API Activate Club call                                        **********************************************************************
    const handleActivateClub = () => {
        (async () => {
            const response = await activateClub(storedJwt, user,
                openSuccessMassage, openAlertMassage, clubToBeActivated);
            if (response) {
                openSuccessMassage('Club was Activated Successfully.');
                onRefresh();

            }

        })();
    }

    // On confirmation for Dashboard ********************************************************
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
    return (
        <>


            <View style={{
                position: 'relative',

                width: widthPercentage(100),
                paddingHorizontal: 10,
            }}>
                <View style={styles.pageTitle}>
                    {userRole === 'ADMIN' &&
                        <Pressable
                            style={({pressed}) => [
                                styles.createButton,
                                {opacity: pressed ? 0.7 : 1}
                            ]}
                            android_ripple={{color: theme.colors.green}}
                            hitSlop={15}
                            delayPressIn={0}
                            onPress={() =>
                                openPopover(
                                    <CreatClub
                                        openAlertMassage={openAlertMassage}
                                        storedJwt={storedJwt}
                                        openSuccessMassage={openSuccessMassage}
                                        openImagePopover={openImagePopover}
                                        user={user}
                                        club={club}
                                        userRole={userRole}
                                        onClose={() => setShowPopover(false)}
                                        setCloseConfirmation={setCloseConfirmation}
                                        navigation={navigation}
                                    />)
                            }
                        >
                            <MyIcon icon={AddIcon} size={20} color={'white'}/>
                            <Text style={styles.createButtonText}> Create Club</Text>
                        </Pressable>}
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.warningIconeContainer}>
                            <MyIcon icon={Alert02Icon} size={25} color={'black'}/>
                        </View>
                        <Text style={styles.sectionTitle}>Pending Clubs Requests</Text>
                    </View>

                    {pendingClubs.length > 0 ? (
                        <>
                            <View style
                                      ={styles.tableHeader}>
                                <Text style={styles.tableHeaderText}>CLUB</Text>
                                <Text style={styles.tableHeaderText}>Total: {pendingClubs.length}</Text>
                            </View>
                            <ScrollView  onTouchStart={handelOuterScroll}
                                         onTouchEnd={ handelOuterScroll}
                                         style={styles.allListItems}>
                                {pendingClubs.map(club => (
                                    <View key={club.clubID} style={styles.listItem}>
                                        <View style={styles.itemContent}>
                                            <Pressable
                                                style={({pressed}) => [
                                                    styles.itemButton,
                                                    {opacity: pressed ? 0.7 : 1}
                                                ]}
                                                android_ripple={{color: theme.colors.primaryLight}}
                                                hitSlop={15}
                                                delayPressIn={0}
                                                onPress={() => navigation.navigate('ClubProfile', {
                                                    club,
                                                    backTitle: 'Dashboard'
                                                })}
                                            >
                                                <Image
                                                    source={{uri: club.clubProfilePicURL || CLUB_DEFAULT_IMAGE}}
                                                    style={styles.itemImage}
                                                />
                                                <View style={styles.itemTextContainer}>
                                                    <Text style={styles.itemName}>
                                                        {club.clubName?.slice(0, 29).toUpperCase() || ''}
                                                    </Text>
                                                    <Text style={styles.itemDate}>
                                                        Created: {club.creatingDate}
                                                    </Text>
                                                </View>
                                            </Pressable>

                                            {/* Club Actions Admin -------------------------------------------------------------------------*/}
                                            {userRole === 'ADMIN' &&
                                                <View style={styles.actionsContainer}>
                                                    {/*Reject Club Request -------------------------------------------------------------------------*/}
                                                    <Pressable
                                                        style={({pressed}) => [
                                                            styles.redIconeActionsContainer,
                                                            {opacity: pressed ? 0.7 : 1}
                                                        ]}
                                                        onPress={() => handleRejectClubById(club)}
                                                    >
                                                        <MyIcon icon={CancelCircleIcon} size={22} color={'white'}/>
                                                    </Pressable>
                                                    {/*Accept Club Request -------------------------------------------------------------------------*/}
                                                    <Pressable
                                                        style={({pressed}) => [
                                                            styles.greenIconeActionsContainer,
                                                            {opacity: pressed ? 0.7 : 1}
                                                        ]}
                                                        onPress={() => handleActivateClubConfirimation(club)}
                                                    >
                                                        <MyIcon icon={CheckmarkCircle02Icon} size={22} color={'white'}/>
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
                                <Text style={styles.tableHeaderText}>CLUB</Text>
                                <Text style={styles.tableHeaderText}>Total: {pendingClubs.length}</Text>
                            </View>
                            <Text style={styles.noItemsText}>No Pending Clubs were found</Text>
                        </>


                    )}
                </View>
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.greenIconeContainer}>
                            <MyIcon icon={CheckmarkCircle02Icon} size={25} color={'white'}/>
                        </View>
                        <Text style={styles.sectionTitle}>Active Clubs </Text>
                    </View>

                    {activeClubs.length > 0 ? (
                        <>
                            <View style={styles.tableHeader}>
                                <Text style={styles.tableHeaderText}>CLUB</Text>
                                <Text style={styles.tableHeaderText}>Total: {activeClubs.length}</Text>
                            </View>
                            <ScrollView  onTouchStart={handelOuterScroll}
                                         onTouchEnd={ handelOuterScroll}
                                         style={styles.allListItems}>
                                {activeClubs.map(club => (
                                    <View key={club.clubID} style={styles.listItem}>
                                        <View style={styles.itemContent}>
                                            <Pressable
                                                style={({pressed}) => [
                                                    styles.itemButton,
                                                    {opacity: pressed ? 0.7 : 1}
                                                ]}
                                                android_ripple={{color: theme.colors.primaryLight}}
                                                onPress={() => navigation.navigate('ClubProfile', {
                                                    club,
                                                    backTitle: 'Dashboard'
                                                })}
                                            >
                                                <Image
                                                    source={{uri: club.clubProfilePicURL || CLUB_DEFAULT_IMAGE}}
                                                    style={styles.itemImage}
                                                />
                                                <View style={styles.itemTextContainer}>
                                                    <Text style={styles.itemName}>
                                                        {club.clubName?.slice(0, 29).toUpperCase() || ''}
                                                    </Text>
                                                    <Text style={styles.itemDate}>
                                                        Created: {club.creatingDate}
                                                    </Text>
                                                </View>

                                            </Pressable>
                                            {/* Club Actions Admin -------------------------------------------------------------------------*/}
                                            {userRole === 'ADMIN' &&
                                                <View style={styles.actionsContainer}>
                                                    {/*Deactivate Club  -------------------------------------------------------------------------*/}
                                                    <Pressable
                                                        style={({pressed}) => [
                                                            styles.roseIconeActionsContainer,
                                                            {opacity: pressed ? 0.7 : 1}
                                                        ]}
                                                        onPress={() => handleDeactivateClubById(club)}
                                                    >
                                                        <MyIcon icon={UnavailableIcon} size={22} color={'white'}/>
                                                    </Pressable>
                                                    {/*Delete Club Request -------------------------------------------------------------------------*/}
                                                    <Pressable
                                                        style={({pressed}) => [
                                                            styles.redIconeActionsContainer,
                                                            {opacity: pressed ? 0.7 : 1}
                                                        ]}
                                                        onPress={() => handleDeleteClubConfirimation(club)}
                                                    >
                                                        <MyIcon icon={Delete02Icon} size={22} color={'white'}/>
                                                    </Pressable>
                                                </View>}
                                            {/* Club Actions Manager -------------------------------------------------------------------------*/}
                                            {userRole === 'MANAGER' &&
                                                <View style={styles.actionsContainer}>
                                                    {/*Reject Club Request -------------------------------------------------------------------------*/}
                                                    <Pressable
                                                        style={({pressed}) => [
                                                            styles.redIconeActionsContainer,
                                                            {opacity: pressed ? 0.7 : 1}
                                                        ]}
                                                        onPress={() => console.error('rlaekgnerkang')}
                                                    >
                                                        <MyIcon icon={CancelCircleIcon} size={22} color={'white'}/>
                                                    </Pressable>
                                                    {/*Accept Club Request -------------------------------------------------------------------------*/}
                                                    <Pressable
                                                        style={({pressed}) => [
                                                            styles.greenIconeActionsContainer,
                                                            {opacity: pressed ? 0.7 : 1}
                                                        ]}
                                                        onPress={() => console.error('rlaekgnerkang')}
                                                    >
                                                        <MyIcon icon={CheckmarkCircle02Icon} size={22} color={'white'}/>
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
                                <Text style={styles.tableHeaderText}>CLUB</Text>
                                <Text style={styles.tableHeaderText}>Total: {activeClubs.length}</Text>
                            </View>
                            <Text style={styles.noItemsText}>No Active Clubs were found</Text>
                        </>
                    )}
                </View>
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.redIconeContainer}>
                            <MyIcon icon={CancelCircleIcon} size={25} color={'white'}/>
                        </View>
                        <Text style={styles.sectionTitle}>Rejected Clubs </Text>
                    </View>

                    {rejectedClubs.length > 0 ? (
                        <>
                            <View style={styles.tableHeader}>
                                <Text style={styles.tableHeaderText}>CLUB</Text>
                                <Text style={styles.tableHeaderText}>Total: {rejectedClubs.length}</Text>
                            </View>
                            <ScrollView  onTouchStart={handelOuterScroll}
                                         onTouchEnd={ handelOuterScroll}
                                         style={styles.allListItems}>
                                {rejectedClubs.map(club => (
                                    <View key={club.clubID} style={styles.listItem}>
                                        <View style={styles.itemContent}>
                                            <Pressable
                                                style={({pressed}) => [
                                                    styles.itemButton,
                                                    {opacity: pressed ? 0.7 : 1}
                                                ]}
                                                android_ripple={{color: theme.colors.primaryLight}}
                                                hitSlop={15}
                                                delayPressIn={0}
                                                onPress={() => navigation.navigate('ClubProfile', {
                                                    club,
                                                    backTitle: 'Dashboard'
                                                })}
                                            >
                                                <Image
                                                    source={{uri: club.clubProfilePicURL || CLUB_DEFAULT_IMAGE}}
                                                    style={styles.itemImage}
                                                />
                                                <View style={styles.itemTextContainer}>
                                                    <Text style={styles.itemName}>
                                                        {club.clubName?.slice(0, 29).toUpperCase() || ''}
                                                    </Text>
                                                    <Text style={styles.itemDate}>
                                                        Created: {club.creatingDate}
                                                    </Text>
                                                </View>
                                            </Pressable>
                                            {/* Club Actions Admin -------------------------------------------------------------------------*/}
                                            {userRole === 'ADMIN' &&
                                                <View style={styles.actionsContainer}>
                                                    {/*Delete Club Request -------------------------------------------------------------------------*/}
                                                    <Pressable
                                                        style={({pressed}) => [
                                                            styles.redIconeActionsContainer,
                                                            {opacity: pressed ? 0.7 : 1}
                                                        ]}
                                                        onPress={() => handleDeleteClubConfirimation(club)}
                                                    >
                                                        <MyIcon icon={Delete02Icon} size={22} color={'white'}/>
                                                    </Pressable>
                                                    {/*Accept Club Request -------------------------------------------------------------------------*/}
                                                    <Pressable
                                                        style={({pressed}) => [
                                                            styles.greenIconeActionsContainer,
                                                            {opacity: pressed ? 0.7 : 1}
                                                        ]}
                                                        onPress={() => handleActivateClubConfirimation(club)}
                                                    >
                                                        <MyIcon icon={CheckmarkCircle02Icon} size={22} color={'white'}/>
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
                                <Text style={styles.tableHeaderText}>CLUB</Text>
                                <Text style={styles.tableHeaderText}>Total: {rejectedClubs.length}</Text>
                            </View>
                            <Text style={styles.noItemsText}>No Rejected Clubs were found</Text>
                        </>
                    )}
                </View>
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.redIconeContainer}>
                            <MyIcon icon={UnavailableIcon} size={25} color={'white'}/>
                        </View>
                        <Text style={styles.sectionTitle}>Blocked Clubs </Text>
                    </View>

                    {blockedClubs.length > 0 ? (
                        <>
                            <View style={styles.tableHeader}>
                                <Text style={styles.tableHeaderText}>CLUB</Text>
                                <Text style={styles.tableHeaderText}>Total: {blockedClubs.length}</Text>
                            </View>
                            <ScrollView  onTouchStart={handelOuterScroll}
                                         onTouchEnd={ handelOuterScroll}
                                         keyboardShouldPersistTaps='handled'
                                        style={styles.allListItems}>
                                {blockedClubs.map(club => (
                                    <View key={club.clubID} style={styles.listItem}>
                                        <View style={styles.itemContent}>
                                            <Pressable
                                                style={({pressed}) => [
                                                    styles.itemButton,
                                                    {opacity: pressed ? 0.7 : 1}
                                                ]}
                                                android_ripple={{color: theme.colors.primaryLight}}
                                                hitSlop={15}
                                                delayPressIn={0}
                                                onPress={() => navigation.navigate('ClubProfile', {
                                                    club,
                                                    backTitle: 'Dashboard'
                                                })}
                                            >
                                                <Image
                                                    source={{uri: club.clubProfilePicURL || CLUB_DEFAULT_IMAGE}}
                                                    style={styles.itemImage}
                                                />
                                                <View style={styles.itemTextContainer}>
                                                    <Text style={styles.itemName}>
                                                        {club.clubName?.slice(0, 29).toUpperCase() || ''}
                                                    </Text>
                                                    <Text style={styles.itemDate}>
                                                        Created: {club.creatingDate}
                                                    </Text>
                                                </View>
                                            </Pressable>
                                            {/* Club Actions Admin -------------------------------------------------------------------------*/}
                                            {userRole === 'ADMIN' &&
                                                <View style={styles.actionsContainer}>
                                                    {/*Delete Club Request -------------------------------------------------------------------------*/}
                                                    <Pressable
                                                        style={({pressed}) => [
                                                            styles.redIconeActionsContainer,
                                                            {opacity: pressed ? 0.7 : 1}
                                                        ]}
                                                        onPress={() => handleDeleteClubConfirimation(club)}
                                                    >
                                                        <MyIcon icon={Delete02Icon} size={22} color={'white'}/>
                                                    </Pressable>
                                                    {/*Accept Club Request -------------------------------------------------------------------------*/}
                                                    <Pressable
                                                        style={({pressed}) => [
                                                            styles.greenIconeActionsContainer,
                                                            {opacity: pressed ? 0.7 : 1}
                                                        ]}
                                                        onPress={() => handleActivateClubConfirimation(club)}
                                                    >
                                                        <MyIcon icon={CheckmarkCircle02Icon} size={22} color={'white'}/>
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
                                <Text style={styles.tableHeaderText}>CLUB</Text>
                                <Text style={styles.tableHeaderText}>Total: {blockedClubs.length}</Text>
                            </View>
                            <Text style={styles.noItemsText}>No Blocked Clubs were found</Text>
                        </>
                    )}
                </View>

                {(isWaiting || Object.values(isLoading).slice(0, -1).some(val => val)) && (
                    <Loading screenSize={100} size={'large'}/>
                )}
            </View>
        </>

    )
}
export default ClubsDash
const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: theme.colors.white,
    },
    pageTitle: {

        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    pageTitleText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    createButton: {
        flexDirection: 'row',
        backgroundColor: theme.colors.green,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    createButtonText: {
        color: 'white',
        marginLeft: 8,
        fontWeight: '500',
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
        maxHeight: 400,
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

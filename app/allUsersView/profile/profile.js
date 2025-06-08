import React, {useContext, useEffect, useState} from 'react';
import {Image, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View,} from 'react-native';
import {FontAwesome5, Ionicons} from '@expo/vector-icons';
import {CredentialsContext} from "../../../contexts/CredentialsContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {USER_DEFAULT_IMAGE} from "../../../constants/DefaultConstants";
import {getUserRole, heightPercentage, widthPercentage} from "../../../helpers/common";
import {PopoverContext} from "../../../contexts/PopoverContext";
import EditProfile from "./ProfileMnue/EditProfile";
import {HugeiconsIcon} from "@hugeicons/react-native";
import {Logout02Icon} from "@hugeicons/core-free-icons";
import {ModalContext} from "../../../contexts/ModalContext";
import PasswordAndPrivacy from "./ProfileMnue/passwordAndPrivacy";
import {useScroll} from "../../../contexts/ScrollContext";
import CreatClub from "../Clubs/CreatClub";

import {ThemeContext} from "../../../contexts/ThemeContext";
import {clearNotificationToken} from "../../../api/ConstantsApiCalls";


const Profile = ({navigation}) => {
    const {theme, toggleTheme} = useContext(ThemeContext);
    const styles = createStyles(theme);
    const {storedJwt, setStoredJwt, club,stClub, user, setUser} = useContext(CredentialsContext);
    const [userRole, setUserRole] = useState(getUserRole(user));
    const [isLoading, setIsLoading] = useState(true);
    const {
        openSuccessMassage,
        openAlertMassage,
        setCloseConfirmation,
        showPopover,
        openPopover,
        setPopoverSize,
        setPopoverTitle,
        showImagePopover,
        openImagePopover,
        setShowPopover
    } = useContext(PopoverContext);
    const [formData, setFormData] = useState({name: "", email: "", phone: ""});
    const {
        openModal, showModal, setLoading, setShowModal,
        confirmationPage, setConfirmationPage, resetConfirmation,
        confirmation, setConfirmation, setModalTitle
    } = useContext(ModalContext);

    //scroll control        *************************************************************************************************
    const {setTabBarVisibility} = useScroll();
    const [prevOffset, setPrevOffset] = useState(0);
    const [direction, setDirection] = useState('up');

// for user role                                            *****************************************************************
    useEffect(() => {
        const role = getUserRole(user);
        setUserRole(role);
    }, [user]);

    // Determine scroll direction and show/hide tab bar  **********************************************************************
    const handleScroll = (event) => {
        const currentOffset = event.nativeEvent.contentOffset.y;
        const scrollDirection = currentOffset > prevOffset ? 'down' : 'up';

        setDirection(scrollDirection);
        setPrevOffset(currentOffset);

        // Hide tab bar when scrolling down, show tab bar when scrolling up  **********************************************************************
        setTabBarVisibility(scrollDirection === 'up');

        // Always show tab bar when at the very top  **********************************************************************
        if (currentOffset <= 0) {
            setTabBarVisibility(true);
        }
    };

// for menu buttons under dark mood button                   *****************************************************************
    const menuItems = [
        {id: 1, title: "Edit Profile", icon: "user-cog", color: "#3b82f6"},
        ...((userRole === 'MANAGER' && club)
                ? [{id: 2, title: "My Club", icon: "eye", color: theme.colors.primaryLight}]
                : ([])
        ),
        ...(userRole === 'STUDENT' && !(club?.clubManager?.userID === user?.userID)
            ? [{id: 2, title: "Create Club Application", icon: "plus", color: theme.colors.green}]
            : ([])),
        ...(userRole === 'STUDENT' && (club?.clubManager?.userID === user?.userID)
            ? [{id: 2, title: "My Club", icon: "eye", color: theme.colors.primaryLight}]
            : ([])),
        ...(userRole === 'ADMIN'
                ? [
                    {id: 2, title: "Create Club", icon: "plus", color: theme.colors.green},
                    {id: 3, title: "Fast Actions", icon: "cogs", color: theme.colors.cyan4}
                ]
                : []
        ),
        ...(userRole !== 'ADMIN'
                ? [{id: 3, title: "University App", icon: "university", color: "#facc15"}]
                : []
        ),
        {id: 4, title: "Interactions", icon: "exchange-alt", color: "#f87171"},
        {id: 5, title: "Settings", icon: "cog", color: "#6366f1"},
        {id: 6, title: "Password & Privacy", icon: "lock", color: theme.colors.cardRed}
    ];

    const handleLogout = async () => {
        setLoading(true);
        clearNotificationToken(storedJwt, user);
        AsyncStorage.removeItem('jwt')
            .then(() => {
                setStoredJwt('');
            })
            .catch((error) => console.log(error));
        AsyncStorage.removeItem('userData')
            .then(() => {
                setUser(null);
            })
            .catch((error) => console.log(error));
        setLoading(false);
        resetConfirmation();
    };

    //handel user Logout                                     *********************************************************
    const openModalFun = () => {
        setConfirmationPage('Profile/LogOut');
        if (!showModal) {
            openModal('Are You Sure You Want to Logout  ?');
            setModalTitle('Logout');
        } else {
            setShowModal(false);
        }
    }
    useEffect(() => {

        if (confirmation && confirmationPage === 'Profile/LogOut') {
            handleLogout();
        }
    }, [confirmation]);

    //controlling the Draggable Popover  height  size         *********************************************************
    useEffect(() => {
        setPopoverTitle('Edit Profile');
        setPopoverSize(heightPercentage(100));
    }, [showPopover]);

    const onUserChange = (ComingUser) => {
        setUser(ComingUser);
    }

    const popoverSwitch = async (id) => {
        switch (id) {
            case 1 :
                return openPopover(
                    <EditProfile
                        storedJwt={storedJwt}
                        user={user}
                        openImagePopover={openImagePopover}
                        openSuccessMassage={openSuccessMassage}
                        openAlertMassage={openAlertMassage}
                        setCloseConfirmation={setCloseConfirmation}
                        onClose={() => setShowPopover(false)}
                        onUserChange={(changedUser)=>onUserChange(changedUser)}
                        handleLogout={handleLogout}
                    />)

            case 2:
                if ((userRole === 'STUDENT' && !(club?.clubManager?.userID === user?.userID)) || userRole === 'ADMIN') {
                    openPopover(
                        <CreatClub
                            openAlertMassage={openAlertMassage}
                            storedJwt={storedJwt}
                            openSuccessMassage={openSuccessMassage}
                            openImagePopover={openImagePopover}
                            user={user}
                            club={club}
                            userRole={userRole}
                            onClose={() => {
                                setShowPopover(false)

                            }}
                            setCloseConfirmation={setCloseConfirmation}
                            navigation={navigation}
                        />
                    );
                } else {
                    (userRole === 'MANAGER' ||
                        (userRole === 'STUDENT' && (club?.clubManager?.userID === user?.userID))) &&
                    navigation.navigate('ClubProfile', {
                        club: club,
                        user: user,
                        backTitle: 'Profile'
                    });
                }
                break;


            case 6 :
                openPopover(
                    <PasswordAndPrivacy
                        storedJwt={storedJwt}
                        openSuccessMassage={openSuccessMassage}
                        openAlertMassage={openAlertMassage}
                    />
                )
                break;

            case 3 :
                openPopover(<Text>Fast Track and Actions for ADMIN </Text>)
                break;

        }

    };


    return (
        <View style={styles.container}>

            {/* Profile Info ---------------------------------------------------------------------------------*/}
            <View style={styles.profileCard}>
                <TouchableOpacity onPress={() =>
                    openImagePopover((user.profilePicURL ? user.profilePicURL : USER_DEFAULT_IMAGE)
                    )
                }>
                    <Image
                        source={{
                            uri: user.profilePicURL ? user.profilePicURL
                                :
                                USER_DEFAULT_IMAGE
                        }}
                        style={styles.avatar}
                    />
                </TouchableOpacity>

                <View style={{alignContent: 'center', alignItems: 'center', width: widthPercentage(100)}}>
                    <Text style={styles.name}>{user ? user.firstName + " " + user.lastName : ''}</Text>
                    <Text style={styles.email}>{user ? user.email : ''}</Text>
                    <Text style={styles.phone}>{userRole}</Text>
                </View>
            </View>

            {/*Options List ---------------------------------------------------------------------------------*/}
            <ScrollView style={{padingBottom: heightPercentage(20)}}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        contentContainerStyle={styles.menuContainer}>
                {/* Dark Mode Toggle  */}
                <View style={styles.menuItem}>
                    <View style={styles.menuLeft}>
                        <Ionicons name="moon" size={20} color={theme.colors.cyan1}/>
                        <Text style={styles.menuText}>Dark Mode</Text>
                    </View>
                    <Switch value={theme.type === 'dark'} onValueChange={toggleTheme}/>
                </View>


                {/* Profile Menu Items --------------------------------------------------------------------------------- */}
                {menuItems.map((item) => (
                    <TouchableOpacity key={item.id} style={styles.menuItem}
                                      onPress={() =>
                                          // passing children to the Draggable Popover ------------------------------------------------------

                                          popoverSwitch(item.id)

                                      }
                    >
                        <View style={styles.menuLeft}>
                            <FontAwesome5 name={item.icon} size={20} color={item.color}/>
                            <Text style={styles.menuText}>{item.title}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={"#9ca3af"}/>
                    </TouchableOpacity>
                ))}
                <TouchableOpacity style={[styles.menuItem, {backgroundColor: "rgba(255,0,0,0.17)"}]}
                                  onPress={() => openModalFun()}
                >
                    <View style={styles.logoutButton}>
                        <Text style={styles.logoutButtonText}>Logout</Text>
                    </View>
                    <HugeiconsIcon
                        icon={Logout02Icon}
                        size={25}
                        color={theme.colors.red}
                        strokeWidth={1.5}
                    />
                </TouchableOpacity>

            </ScrollView>


        </View>

    );
};

export default Profile;

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.white,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 20,
    },
    fullSizeImage: {
        width: widthPercentage(50),
        height: heightPercentage(50),

    },
    fullSizeImageCard: {
        backgroundColor: "rgba(0,0,0,1)",
        padding: 20,
        alignItems: "center",
        height: heightPercentage(100),
    },

    profileCard: {
        backgroundColor: theme.colors.white,
        marginHorizontal: 20,
        padding: 20,
        top: 5,
        borderRadius: 15,
        alignContent: 'center',
        alignItems: "center",
        shadowColor: "#006d9c",
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.1,
        shadowRadius: 5,
        position: "relative",
    },
    avatar: {
        width: 120,
        height: 120,

        marginBottom: 10,
        borderRadius: 60,
        borderColor: theme.colors.gray,
        borderWidth: 1,
    },
    editIcon: {
        position: "absolute",
        top: 20,
        right: 20,
        backgroundColor: theme.colors.white,
        padding: 5,
        borderRadius: 50,
    },
    name: {
        fontSize: 18,
        fontWeight: "bold",
        textTransform: 'capitalize',
        color: theme.colors.textLight,
    },
    email: {
        fontSize: 14,
        color: "#6b7280",
    },
    phone: {
        fontSize: 14,
        color: "#6b7280",
        marginBottom: 10,
    },
    menuContainer: {
        marginTop: 20,
        paddingHorizontal: 20,
        padingBottom: heightPercentage(20),
        minHeight: heightPercentage(90),

    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: theme.colors.white,
        borderWidth: 0.9,
        borderColor: theme.colors.gray1,
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: "#006d9c",
        shadowOffset: {width: 0, height: 5},
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    menuLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    menuText: {
        fontSize: 16,
        fontWeight: "500",
        color: theme.colors.text,
        marginLeft: 10,
    },
    logoutButton: {
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "flex-end",
    },
    logoutButtonText: {
        fontSize: 16,
        fontWeight: "500",
        color: theme.colors.red,
        // marginLeft: 10,
    },
    bottomTab: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        paddingVertical: 10,
        backgroundColor: theme.colors.white,
        position: "absolute",
        bottom: 10,
        left: "5%",
        right: "5%",
        borderRadius: 20,
        shadowColor: "#006d9c",
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },


});

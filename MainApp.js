import React, {useCallback, useContext, useEffect, useState,} from 'react';
import {SafeAreaView, StatusBar,LogBox,Platform, StyleSheet, View} from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {CredentialsContext} from './contexts/CredentialsContext';
import RootStack from './navigators/RootStack';
import axios from "./api/axios";
import Loading from "./component/Loading";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {PopoverContext, PopoverProvider} from "./contexts/PopoverContext";
import DraggablePopover from "./component/popoversScreens/DraggablePopover";
import {heightPercentage, widthPercentage} from "./helpers/common";
import ImagePopover from "./component/popoversScreens/ImagePopover";
import AlertMassage from "./component/AlertMassage";
import SuccessMassage from "./component/SuccessMassage";
import {ModalContext, ModalProvider} from "./contexts/ModalContext";
import ModalConfirmation from "./component/ModalConfirmation";
import {ThemeContext,} from "./contexts/ThemeContext";
import {useNotification} from './contexts/NotificationsContext';
import {clearNotificationToken} from "./api/ConstantsApiCalls";


// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const USER_DATA_CALL_API = '/auth/getUser';
const CLUB_USER_DATA_CALL_API = "/club/getClub";
LogBox.ignoreLogs([
    'useInsertionEffect must not schedule updates',
    'VirtualizedLists should never be nested inside plain ScrollViews',
    'A props object containing a "key" prop is being spread into JSX:',
    'expo-notifications:',
]);

export default function MainApp({navigation}) {
    const {theme} = useContext(ThemeContext);
    const styles = createStyles(theme);
    const {setExpoPushToken, expoPushToken,profileDataRefresh,refreshData,registerForPushNotificationsAsync} = useNotification();


    const [appReady, setAppReady] = useState(false);
    const [storedJwt, setStoredJwt] = useState('');
    const [user, setUser] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [club, setClub] = useState([]);

    const handleLogout = async () => {
        clearNotificationToken(storedJwt, user);
        AsyncStorage.removeItem('jwt')
            .then(() => {
                setStoredJwt('');
                setUser(null);
                navigation.replace('Login');
            })
            .catch((error) => console.error(error));
    };
    // when ever reloaded check JWT token and refresh user data, if not logout **********************************
    const checkLoginCredentials = useCallback(async () => {
        try {
            setIsLoading(true)
            const results = await AsyncStorage.getItem('jwt');
            if (results !== null) {
                setStoredJwt(results);
                try {

                    const response = await axios.get(USER_DATA_CALL_API, {
                        headers: {
                            Authorization: `Bearer ${results}`
                        }
                    });

                    if (response.status === 200) {
                        //update user data  if needed
                        setUser(JSON.stringify(response.data));
                        AsyncStorage.setItem('userData', JSON.stringify(response.data))
                            .then(
                            ).catch((error) => {
                            console.error(error);

                        });
                        try {
                            const userDataString = await AsyncStorage.getItem('userData');
                            const userData = userDataString ? JSON.parse(userDataString) : null;
                            setUser(userData);
                        } catch (error) {
                            console.error('Error fetching user data:', error);
                            handleLogout();

                        }

                    } else if (response.status === 401) {
                        console.error("Authorization Expired ");
                        handleLogout();

                    } else {
                        console.error("error" + response.status);
                        handleLogout();

                    }

                } catch (error) {
                    console.error("Error!!" + error);
                    handleLogout();

                }
            }
        } catch (error) {
            console.error(error);
            handleLogout();
        } finally {

            setAppReady(true);
            setIsLoading(false)
            await SplashScreen.hideAsync();
        }

    }, []);
    const loadClubData = () => {
        if (storedJwt) {
            setIsLoading(true);
            axios
                .get(CLUB_USER_DATA_CALL_API, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${storedJwt}`,
                    },
                })
                .then((response) => {
                    if (response.status === 200) {
                        return response.data;
                    } else if (response.status === 401) {
                        console.error("Authorization Expired ");
                        handleLogout();

                    } else if (response.status === 404) {
                        console.error("User Dose not has a Club");
                        return null; // Return null when club data is not found for this user
                    } else {
                        console.error("Error: We are sorry, please login again");
                        handleLogout();
                    }
                })
                .then((clubData) => {
                    if (clubData) {
                        setClub(clubData);
                    }
                })
                .catch((error) => {
                    if (error.status !== 404) {
                        console.error(error);
                        console.error("Error fetching club data");
                    }

                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }
    useEffect(() => {
        checkLoginCredentials();
        loadClubData();
    }, [checkLoginCredentials, storedJwt]);
    useEffect(() => {
        const initNotifications = async () => {
            const token = await registerForPushNotificationsAsync();
            if (token) setExpoPushToken(token);
        };
        initNotifications();

    }, []);

    //WEBSOCKET *****************************************************************************************
    // useEffect(() => {
    //     const handleWebSocketMessage = (notification) => {
    //         console.log('Received WebSocket notification:', notification);
    //
    //         if (notification.notificationStatus === 'UPDATED_USER') {
    //             console.log('User was updated, reloading user data...');
    //             checkLoginCredentials(); // your existing method to refetch user data
    //         }
    //     };
    //
    //     if (storedJwt) {
    //         console.log('Connecting WebSocket...');
    //
    //
    //         connectWebSocket(storedJwt, handleWebSocketMessage);
    //     }
    //
    //     // Cleanup on unmount or when storedJwt changes
    //     return () => {
    //         console.log('Cleaning up WebSocket...');
    //         disconnectWebSocket();
    //     };
    // }, [storedJwt]);

    if (!appReady || isLoading) {
        return <Loading screenSize={100} backgroundColor={theme.colors.white}/>;
    }

    return (

        <SafeAreaView
            style={{
                paddingVertical:Platform.OS==='ios'?0:heightPercentage(3.5),
                flex: 1,
                backgroundColor: theme.colors.white,
            }}
            edges={['top', 'bottom']}

        >
            <StatusBar hidden={false} showHideTransition={'slide'} translucent={Platform.OS !=='ios'}
                       backgroundColor={theme.colors.white}
                       barStyle={theme.type !== 'dark' ? 'dark-content' : 'light-content'}
            />

                <ModalProvider>
                    <PopoverProvider>

                        <CredentialsContext.Provider value={{storedJwt, setStoredJwt, user, setUser, club, setClub}}>
                            <RootStack/>
                        </CredentialsContext.Provider>
                        <PopoverContext.Consumer>
                            {({
                                  showPopover,
                                  setShowPopover,
                                  openPopover,
                                  popoverContent,
                                  popoverSize,
                                  setPopoverSize,
                                  popoverTitle,
                                  setPopoverTitle,
                                  setShowImagePopover,
                                  showImagePopover,
                                  setImagePopoverContent,
                                  imagePopoverContent,
                                  openImagePopover,
                                  alertMassageContent
                                  ,
                                  setAlertMassageContent,
                                  successMassageContent,
                                  setSuccessMassageContent,
                                  massageKey,
                                  setMassageKey,
                                  openSuccessMassage,
                                  openAlertMassage,
                                  popoverBackgroundColor,
                                  closeConfirmation,
                                  setCloseConfirmation
                              }) =>


                                <>
                                    {showPopover && (
                                        <DraggablePopover title={popoverTitle}
                                                          isVisible={showPopover}
                                                          size={popoverSize}
                                                          popoverBackgroundColor={popoverBackgroundColor}
                                                          onClose={() => setShowPopover(false)}
                                                          closeConfirmation={closeConfirmation}
                                                          setCloseConfirmation={setCloseConfirmation}

                                        >
                                            {popoverContent}
                                        </DraggablePopover>
                                    )}
                                    {showImagePopover &&
                                        <ImagePopover images={imagePopoverContent}
                                                      isVisible={showImagePopover}
                                                      onClose={() => setShowImagePopover(false)}>
                                            {/*{imagePopoverContent}*/}
                                        </ImagePopover>}


                                    <View style={styles.systemMassage}>
                                        <AlertMassage
                                            errorMessage={alertMassageContent}
                                            setAlertMassageContent={setAlertMassageContent}
                                            MassageKey={massageKey}
                                            background={'white'}
                                            requestFromInside={true}
                                            onClose={() => setAlertMassageContent(null)}
                                        />
                                    </View>


                                    <View style={styles.systemMassage}>

                                        <SuccessMassage
                                            successMessage={successMassageContent}
                                            setSuccessMassageContent={setSuccessMassageContent}
                                            MassageKey={massageKey}
                                            background={'white'}
                                            requestFromInside={true}
                                            onClose={() => setSuccessMassageContent(null)}
                                        />
                                    </View>


                                </>

                            }
                        </PopoverContext.Consumer>
                    </PopoverProvider>

                    <ModalContext.Consumer>
                        {({
                              showModal,
                              setShowModal,
                              ModalSize,
                              setModalSize,
                              ModalContent,
                              setModalContent,
                              ModalTitle,
                              setModalTitle,
                              setConfirmation,
                              confirmation,
                              Loading,
                              modalChildren,
                              isModalChildren,
                              setIsModalChildren,
                              modalKey,
                              setModalKey
                              ,
                              triggerConfirmation,
                              resetConfirmation,
                              confirmationPage,
                              setConfirmationPage,
                              isConfirmationWithChildren
                          }) => (
                            showModal &&
                            <ModalConfirmation
                                modalKey={modalKey}
                                onRequestClose={() => setShowModal(false)}
                                modalMessage={ModalContent}
                                children={modalChildren}
                                title={ModalTitle}
                                isVisible={showModal}
                                isModalChildren={isModalChildren}
                                confirmation={() => triggerConfirmation(confirmationPage)}
                                loading={Loading}
                                isConfirmationWithChildren={isConfirmationWithChildren}
                            />
                        )}
                    </ModalContext.Consumer>
                </ModalProvider>
        </SafeAreaView>

    );
}

const createStyles = (theme) => StyleSheet.create({


    systemMassage: {
        position: 'absolute',
        top: heightPercentage(4),
        height: heightPercentage(100),
        width: widthPercentage(100),
        // zIndex:999999,
    }
});


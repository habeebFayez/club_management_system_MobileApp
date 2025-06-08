import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import React, {useContext} from 'react'
import Animated from "react-native-reanimated";
import {HugeiconsIcon} from "@hugeicons/react-native";
import {
    Alert02Icon,
    ArrowLeftIcon,
    ArrowRightIcon,
    CancelCircleIcon,
    CheckmarkCircle02Icon,
    UnavailableIcon
} from "@hugeicons/core-free-icons";
import {heightPercentage, widthPercentage} from "../helpers/common";
import MyIcon from "../component/MyIcons";
import {ThemeContext} from '../contexts/ThemeContext';

const AnimatedSwipeNavigator = ({
                                    backTitle,
                                    club,
                                    user,
                                    post,
                                    userRole,
                                    navigation,
                                    children,
                                    buttonChildTitle,
                                    onPressButton,
                                    buttonChildIcon,
                                    isFromLeft = false,
                                    pageTitle,
                                }) => {
    const {theme} = useContext(ThemeContext);
    const styles = createStyles(theme);

    return (
        <Animated.View style={[styles.container,]}>
            <View style={styles.backButton}>
                <TouchableOpacity
                    style={[styles.backButtonRight, {opacity: 1}]}
                    onPress={() =>
                        navigation.goBack()
                    }
                >


                    <HugeiconsIcon
                        icon={ArrowLeftIcon}
                        size={23}
                        color={theme.colors.primaryLight}
                        strokeWidth={2.5}
                    />
                    <Text style={styles.backButtonTitle}>{backTitle} </Text>
                </TouchableOpacity>
                {/* CLUB States  -----------------------------------------------------------------------------*/}
                {user && club && (userRole === "ADMIN" || user.userID === club?.clubManager?.userID) &&
                    (
                        <View style={styles.clubChoises}>
                            {/*Active CLUB -------------------------------------------------------------------------*/}
                            {(!club.clubIsBlocked && !club.clubisRejected && club.clubisActivation) &&
                                <View style={styles.sectionHeader}>
                                    <View style={styles.greenIconeContainer}>
                                        <MyIcon icon={CheckmarkCircle02Icon} size={20} color={'white'}/>
                                    </View>
                                    <Text style={styles.sectionTitle}>Active Club </Text>
                                </View>}
                            {/*Pending CLUB -------------------------------------------------------------------------*/}
                            {(!club.clubIsBlocked && !club.clubisRejected && !club.clubisActivation) &&
                                <View style={styles.sectionHeader}>
                                    <View style={styles.warningIconeContainer}>
                                        <MyIcon icon={Alert02Icon} size={20} color={'black'}/>
                                    </View>
                                    <Text style={styles.sectionTitle}>Pending Club </Text>
                                </View>}
                            {/*Rejected CLUB -------------------------------------------------------------------------*/}
                            {club.clubisRejected &&
                                <View style={styles.sectionHeader}>
                                    <View style={styles.redIconeContainer}>
                                        <MyIcon icon={CancelCircleIcon} size={20} color={'white'}/>
                                    </View>
                                    <Text style={styles.sectionTitle}>Rejected Club </Text>
                                </View>}
                            {/*Blocked CLUB -------------------------------------------------------------------------*/}
                            {(club.clubIsBlocked && !club.clubisRejected && !club.clubisActivation) &&
                                <View style={styles.sectionHeader}>
                                    <View style={styles.redIconeContainer}>
                                        <MyIcon icon={UnavailableIcon} size={20} color={'white'}/>
                                    </View>
                                    <Text style={styles.sectionTitle}>Blocked Club </Text>
                                </View>}
                        </View>
                    )}

                {/* EVENT States  -----------------------------------------------------------------------------*/}
                {user && post && (userRole === "ADMIN" || (user?.userID === post?.club?.clubManager.userID)) && (

                    <View style={{
                        backgroundColor: theme.colors.white,
                        borderBottomColor: theme.colors.gray1,
                        borderBottomWidth: 1
                    }}>
                        {/*Active Event -------------------------------------------------------------------------*/}
                        {(!post?.eventisRejected && (post?.eventStates && !post?.eventUpdated)) &&

                            <View style={styles.sectionHeader}>
                                <View style={styles.greenIconeContainer}>
                                    <MyIcon icon={CheckmarkCircle02Icon} size={20} color={'white'}/>
                                </View>
                                <Text style={styles.sectionTitle}>Active Event </Text>
                            </View>
                        }
                        {/*Pending Event -------------------------------------------------------------------------*/}
                        {(!post?.eventisRejected && (!post?.eventStates || post?.eventUpdated)) &&
                            <View style={styles.sectionHeader}>
                                <View style={styles.warningIconeContainer}>
                                    <MyIcon icon={Alert02Icon} size={20} color={'black'}/>
                                </View>
                                <Text style={styles.sectionTitle}>Pending Event </Text>
                            </View>

                        }
                        {/*Rejected Event -------------------------------------------------------------------------*/}
                        {post?.eventisRejected &&
                            <View style={styles.sectionHeader}>
                                <View style={styles.redIconeContainer}>
                                    <MyIcon icon={CancelCircleIcon} size={25} strokeWidth={2} color={'white'}/>
                                </View>
                                <Text style={styles.sectionTitle}>Rejected Event </Text>
                            </View>
                        }
                    </View>
                )}
                {/*Club Name  -----------------------------------------------------------------------------*/}
                {!post && user && ((userRole !== "ADMIN") &&
                        (user?.userID !== club?.clubManager?.userID)) &&
                    <Text style={styles.pageTitle}>{pageTitle}</Text>
                }

                <TouchableOpacity
                    style={[styles.backButtonLeft, {opacity: buttonChildTitle ? 1 : 0}]}
                    onPress={() =>
                        onPressButton
                    }
                >
                    <Text style={styles.backButtonTitle}>{buttonChildTitle ? buttonChildTitle : backTitle} </Text>
                    <HugeiconsIcon
                        icon={buttonChildIcon ? buttonChildTitle : ArrowRightIcon}
                        size={23}
                        color={theme.colors.primaryLight}
                        strokeWidth={2.5}
                    />

                </TouchableOpacity>
            </View>
            <View style={styles.Backgrond}>
                {children}
            </View>
        </Animated.View>
    )
}
export default AnimatedSwipeNavigator
const createStyles = (theme) => StyleSheet.create({
    container: {
        backgroundColor: theme.colors.white,

    },
    Backgrond: {
        width: widthPercentage(100),
        minHeight: heightPercentage(100),
        backgroundColor: theme.colors.white,
        borderRadius: 12,
        marginBottom: 10,
        alignSelf: 'center',
        shadowColor: '#006d9c',
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 0.2,
        shadowRadius: 5,
        borderTopWidth: 1,
        borderTopColor: theme.colors.gray1,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.gray1,

    },
    pageTitle: {
        fontSize: 18,
        alignSelf: "center",
        fontWeight: theme.fonts.semibold,
        color: theme.colors.text,

    },
    backButton: {
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row",
        backgroundColor: theme.colors.white,
        height: 40,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.gray1,
        shadowColor: '#006d9c',
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 0.2,
        shadowRadius: 5,

    },
    backButtonLeft: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: theme.colors.white,
        height: 40,

    },
    backButtonRight: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: theme.colors.white,
        height: 40,


    },
    backButtonTitle: {
        fontSize: 14,
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        fontWeight: theme.fonts.semibold,
        color: theme.colors.primaryLight,
    },
    clubChoises: {
        alignItems: 'center',

    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginLeft: 8,
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
})

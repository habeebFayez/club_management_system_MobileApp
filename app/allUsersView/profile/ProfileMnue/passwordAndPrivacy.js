import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import React, {useContext, useState} from 'react'
import {HugeiconsIcon} from "@hugeicons/react-native";
import {ArrowLeftIcon} from "@hugeicons/core-free-icons";
import ChangePassword from "./ChangePassword";
import {FontAwesome5, Ionicons} from "@expo/vector-icons";
import {ThemeContext} from "../../../../contexts/ThemeContext";

const PasswordAndPrivacy = ({openSuccessMassage, openAlertMassage, storedJwt}) => {
    const {theme} = useContext(ThemeContext);
    const styles = createStyles(theme);
    const [visibleChangePassword, setVisibleChangePassword] = useState(null);

    return (
        <View>

            {!visibleChangePassword &&
                <>
                    <Text style={styles.title}>Password & Privacy</Text>

                    <TouchableOpacity style={styles.menuItem}
                                      onPress={() =>
                                          setVisibleChangePassword(!visibleChangePassword)
                                      }
                    >
                        <View style={styles.menuLeft}>
                            <FontAwesome5 name={'lock'} size={20} color={"#10b981"}/>
                            <Text style={styles.menuText}>Change Password </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.primary}/>
                    </TouchableOpacity>
                </>
            }
            {visibleChangePassword &&
                <>
                    <TouchableOpacity
                        onPress={() =>
                            setVisibleChangePassword(false)
                        }
                    >
                        <View style={styles.backButton}>
                            <HugeiconsIcon
                                icon={ArrowLeftIcon}
                                size={25}
                                color={theme.colors.primaryLight}
                                strokeWidth={1}
                            />
                            <Text style={styles.backButtonTitle}>Back </Text>
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.title}>Change Password </Text>

                    <ChangePassword
                        openAlertMassage={openAlertMassage}
                        openSuccessMassage={openSuccessMassage}
                        storedJwt={storedJwt}
                        goBack={() => setVisibleChangePassword(false)}/>
                </>
            }
        </View>
    )
}
export default PasswordAndPrivacy
const createStyles = (theme) => StyleSheet.create({
    title: {
        color: theme.colors.textLight,
        fontSize: 18,
        fontWeight: "bold",
        alignSelf: "center",
        marginBottom: 15,
    },
    backButton: {
        flexDirection: "row",
        top: -10,

    },
    backButtonTitle: {
        fontSize: 15,
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        fontWeight: "bold",
        color: theme.colors.primaryLight,
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
        fontSize: 15,
        fontWeight: "500",
        color: theme.colors.textLight,
        marginLeft: 10,
    },
})

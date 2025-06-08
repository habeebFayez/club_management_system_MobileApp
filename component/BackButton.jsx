import {Pressable, StyleSheet,} from 'react-native'
import React, {useContext} from 'react'
import {HugeiconsIcon} from "@hugeicons/react-native";
import {ArrowLeftIcon} from "@hugeicons/core-free-icons";
import {ThemeContext} from "../contexts/ThemeContext";

const BackButton = ({router}) => {
    const {theme} = useContext(ThemeContext);
    const styles = createStyles(theme);
    return (
        <Pressable onPress={() => router.back()} style={styles.backButton}>
            <HugeiconsIcon
                icon={ArrowLeftIcon}
                size={30}
                color={theme.colors.primaryDark}
                strokeWidth={2}
            />
        </Pressable>
    )
}
export default BackButton
const createStyles = (theme) => StyleSheet.create({
    backButton: {
        alignSelf: 'flex-start',
        padding: 5,
        borderRadius: theme.radius.sm,
        // backgroundColor:'rgba(0,0,0,0.07)',


    },

})

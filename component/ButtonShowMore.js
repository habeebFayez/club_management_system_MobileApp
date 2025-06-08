import {StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import React, {useContext} from 'react'
import MyIcon from "./MyIcons";
import {ArrowDownIcon, ArrowUpIcon} from "@hugeicons/core-free-icons";
import Input from "./Input";
import {ThemeContext} from "../contexts/ThemeContext";

const ButtonShowMore = ({
                            setIsVisible,
                            alertErr,
                            isVisible,
                            ShowButtonText,
                            FoldButtonText,
                            TextAreaDetails,
                            TextAreaDetailsTitle
                        }) => {
    const {theme} = useContext(ThemeContext);
    const styles = createStyles(theme);
    return (
        <View style={{
            backgroundColor: theme.colors.gray1, paddingVertical: 5,
            paddingHorizontal: 5, borderRadius: 10,
        }}>
            {!isVisible &&
                <TouchableOpacity
                    style={styles.AboutButton}
                    onPress={setIsVisible}
                >
                    <Text style={styles.AboutButtonText}>{ShowButtonText}</Text>
                    <MyIcon
                        icon={ArrowDownIcon}
                        size={20}
                        color={theme.colors.primaryLight}
                    />
                </TouchableOpacity>}

            {/* Show Description content -----------------------------------------------------------------------------*/}
            {isVisible &&
                <View style={styles.DescriptionContainer}>
                    <Text style={styles.lableText}>{TextAreaDetailsTitle}</Text>
                    <Input
                        multiline={true}
                        alertErr={alertErr}
                        textStyle={{
                            fontSize: 13,
                            color: theme.colors.text,
                            lineHeight: 15,
                        }}
                        containerStyle={{paddingVertical: 5, height: 'fit-content', minHeight: 50,}}
                        editable={false}
                        value={TextAreaDetails}
                    />


                    {/* Fold "Description" BUTTON */}
                    <TouchableOpacity
                        style={styles.closeAboutButton}
                        onPress={setIsVisible}
                    >
                        <Text style={styles.closeAboutText}>{FoldButtonText}</Text>
                        <MyIcon
                            icon={ArrowUpIcon}
                            size={20}
                            color={theme.colors.red}
                        />
                    </TouchableOpacity>
                </View>}
        </View>
    )
}
export default ButtonShowMore
const createStyles = (theme) => StyleSheet.create({
    DescriptionContainer: {
        borderRadius: 10,
        borderBottomWidth: 1,
        borderColor: theme.colors.gray1,
        backgroundColor: theme.colors.gray1
    },
    AboutButton: {
        backgroundColor: theme.colors.gray1,
        flexDirection: 'row',
        borderWidth: 0.4,
        paddingVertical: 5,
        borderRadius: 25,
        paddingHorizontal: 12,
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    AboutButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.text
    },
    closeAboutButton: {
        borderTopWidth: 2,
        borderBottomWidth: 2,
        borderColor: theme.colors.gray1,
        flexDirection: 'row',
        paddingVertical: 5,
        marginTop: 10,
        paddingHorizontal: 12,
        alignItems: 'center',
        justifyContent: 'space-between',

    },
    closeAboutText: {
        marginLeft: 8,
        fontSize: 12,
        color: theme.colors.red,
        fontWeight: '600',
    },
    lableText: {
        left: 10, color: theme.colors.text, fontWeight: '700', marginVertical: 5,
    },
})

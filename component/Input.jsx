import {StyleSheet, Text, TextInput, View} from 'react-native'
import React, {useContext} from 'react'
import {heightPercentage} from "../helpers/common";
import {ThemeContext} from "../contexts/ThemeContext";

const Input = (props) => {
    const {theme} = useContext(ThemeContext);
    const styles = createStyles(theme);
    return (
        <View>
            <View
                style={[props.alertErr ? styles.containerAlert : styles.container,
                    props.containerStyle && props.containerStyle
                ]}
            >
                {props.icon && props.icon}
                <TextInput
                    keyboardAppearance={theme.type}
                    style={[{flex: 1, color: theme.colors.text}, props.textStyle && props.textStyle]}
                    placeholderTextColor={props.alertErr ? theme.colors.red : theme.colors.textLight}
                    // onPressOut={Keyboard.dismiss}
                    //     onBlur={Keyboard.dismiss}

                    ref={props.inputref && props.inputref}
                    {...props}
                />
                {props.passwordIcon && props.passwordIcon}
                {props.children && props.children}
            </View>
            {props.textAlert &&
                <Text style={[styles.textAlert, props.textAlertStyle && props.textAlertStyle]}>{props.textAlert}</Text>}
            {props.list && props.list}
        </View>
    )
}
export default Input
const createStyles = (theme) => StyleSheet.create({
    container: {
        flexDirection: 'row',
        height: heightPercentage(6.2),
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0.4,
        borderColor: theme.colors.text,
        borderRadius: theme.radius.xxl,
        borderCurve: 'continuous',
        paddingHorizontal: 10,
        gap: 10,


    },
    containerAlert: {
        flexDirection: 'row',
        height: heightPercentage(6.2),
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: theme.colors.roseLight,
        borderRadius: theme.radius.xxl,
        borderCurve: 'continuous',
        paddingHorizontal: 10,
        gap: 10,
    },
    textAlert: {
        position: 'absolute',
        padding: 10,
        left: 0,
        right: 0,
        height: 'max',
        marginHorizontal: 'max',
        marginTop: 46,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.roseLight,
        zIndex: 999999,
        color: 'white',
        fontSize: 12,

    }
})

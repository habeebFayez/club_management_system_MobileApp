import {Pressable, StyleSheet, Text, View} from 'react-native'
import React, {useContext} from 'react'
import {heightPercentage} from "../helpers/common";
import Loading from "./Loading";
import {ThemeContext} from "../contexts/ThemeContext";

const Button = ({
                    children,
                    buttonStyle,
                    textStyle,
                    title = '',
                    onPress = () => {
                    },
                    loading = false,
                    hasShadow = true,


                }) => {
    const {theme} = useContext(ThemeContext);
    const styles = createStyles(theme);
    const shadowStyle = {
        shadowColor: '#006d9c',
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 0.3,
        shadowRadius: 10,
    }

    if (loading) {
        return (
            <View style={[styles.button, buttonStyle, {backgroundColor: theme.colors.card,}]}>
                <Loading screenSize={0}/>
            </View>
        )
    }
    return (
        <Pressable onPress={onPress}
                   style={({pressed}) => [
                       styles.button,
                       hasShadow && shadowStyle,
                       buttonStyle,
                       pressed && styles.buttonPressed,
                   ]}
        >
            <Text style={[styles.buttonTextStyle, textStyle]}>{title}</Text>
            {children}
        </Pressable>
    )
}
export default Button
const createStyles = (theme) => StyleSheet.create({
    button: {
        flexDirection: 'row',
        backgroundColor: theme.colors.primary,
        height: heightPercentage(7),
        justifyContent: 'center',
        alignItems: 'center',
        borderCurve: 'continuous',
        borderRadius: 18,


    },
    buttonTextStyle: {
        fontSize: heightPercentage(2.5),
        color: 'white',
        fontWeight: theme.fonts.bold,

    },
    buttonPressed: {
        opacity: 0.5
    },
})

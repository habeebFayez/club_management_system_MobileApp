import {LogBox, StyleSheet, View} from 'react-native'
import React, {useContext, useState} from 'react'
import {heightPercentage, widthPercentage} from "../helpers/common";
import {SkypeIndicator} from "react-native-indicators";
import {ThemeContext} from "../contexts/ThemeContext";

LogBox.ignoreLogs([
    'Warning: A props object containing a "key" prop is being spread into JSX',
]);
const Loading = ({
                     size = "large",
                     color = '#00909c',
                     backgroundColor,
                     screenSize = 100
                 }) => {
    const {theme} = useContext(ThemeContext);
    const [colorBackground, setColorBackground] = useState(backgroundColor ? backgroundColor : theme.colors.modalBackground)
    return (
        <View style={{
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'center',
            backgroundColor: colorBackground,
            height: heightPercentage(screenSize),
            width: widthPercentage(100),
            position: "absolute",
        }}>
            <SkypeIndicator size={50} color={color}/>
        </View>
    )
}
export default Loading
const styles = StyleSheet.create({})

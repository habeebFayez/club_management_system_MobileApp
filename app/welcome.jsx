import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import {heightPercentage, widthPercentage} from "../helpers/common";
import Button from "../component/Button";
import React, {useContext} from "react";
import {ThemeContext} from "../contexts/ThemeContext";


const Welcome = ({navigation}) => {
    const {theme, toggleTheme} = useContext(ThemeContext);
    const styles = createStyles(theme);
    return (
        <View
            style={styles.container}>

            <Image
                style={styles.welcomeImage}
                source={theme.type === 'dark' ? require('../assets/images/welcome5.png') : require('../assets/images/welcome4.png')}
            />
            <View>
                <Text style={styles.title}>LinkUp!</Text>
                <Text style={styles.titleLine}>
                    Track your club's content and enjoy your university life
                </Text>

            </View>

            <View style={styles.footer}>
                <Button
                    title={'Getting Started'}
                    buttonStyle={{marginHorizontal: widthPercentage(3)}}
                    onPress={() => navigation.replace('SignUp')}
                />


                <View style={styles.bottomTextContainer}>
                    <Text style={styles.loginText}>
                        Already Have An Account!
                    </Text>
                    <Pressable
                        onPress={() =>
                            navigation.replace('Login')}
                    >
                        <Text
                            style={[styles.loginText,
                                {
                                    color: theme.colors.link,
                                    fontWeight: theme.fonts.bold
                                }]}>
                            Login
                        </Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
};

export default Welcome;

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: heightPercentage(5),
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: theme.colors.white,
        paddingHorizontal: widthPercentage(4),


    },
    welcomeImage: {
        height: heightPercentage(55),
        padding: 5,
        width: widthPercentage(100),
        alignSelf: 'center',
        objectFit: 'scale-down'
    },
    title: {
        color: theme.colors.cyan1,
        fontSize: heightPercentage(4),
        textAlign: 'center',
        fontWeight: theme.fonts.extrabold,

    },
    titleLine: {
        color: theme.colors.text,
        fontSize: 15,
        textAlign: 'center',
        paddingHorizontal: widthPercentage(10),
    },
    footer: {
        gap: 30,
        width: '80%',

    },
    bottomTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
    },
    loginText: {
        textAlign: 'center',
        fontSize: 12,
        color: theme.colors.textLight,
    }
})
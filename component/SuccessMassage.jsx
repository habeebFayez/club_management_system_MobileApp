import React, {useContext, useEffect, useRef, useState} from 'react';
import {Animated, Easing, Pressable, StyleSheet, Text, View,} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {heightPercentage, widthPercentage} from '../helpers/common';
import {ThemeContext} from "../contexts/ThemeContext";

const ALERT_HEIGHT = heightPercentage(12);
const SHOW_DURATION = 3000; // 3 seconds
const ANIMATION_DURATION = 350; // how long the slide animation takes

const SuccessMassage = ({
                            children,
                            background,
                            successMessage,
                            MassageKey,
                            onClose,
                            setSuccessMassageContent,
                            requestFromInside = true
                        }) => {
    const {theme} = useContext(ThemeContext);
    const styles = createStyles(theme);

    const translateY = useRef(new Animated.Value(-ALERT_HEIGHT)).current;
    const [visible, setVisible] = useState(false);
    const {top} = useSafeAreaInsets();
    const paddingTop = top !== 0 ? top : 60;


    useEffect(() => {
        if (successMessage) {
            // Show the alert
            setVisible(true);

            Animated.timing(translateY, {
                toValue: -30, // Slide down to 0 = fully visible
                duration: ANIMATION_DURATION,
                useNativeDriver: true,
                easing: Easing.bounce,

            }).start();


            // Auto-hide after SHOW_DURATION
            const timerId = setTimeout(() => {
                hideAlert();
            }, SHOW_DURATION);

            // Cleanup if component unmounts or successMessage changes
            return () => clearTimeout(timerId);
        } else {
            // If there's no message, hide immediately (if already visible).

            return hideAlert();

        }
    }, [successMessage, MassageKey]);

    function hideAlert() {
        requestFromInside && setSuccessMassageContent('')
        Animated.timing(translateY, {
            toValue: -ALERT_HEIGHT, // slide up out of view
            duration: ANIMATION_DURATION,
            useNativeDriver: true,
            easing: Easing.ease,
        }).start();
        setTimeout(() => {
            setVisible(false);
        }, ANIMATION_DURATION);
    }

    return (

        <View>
            {/* ALERT BAR */}
            {visible && (
                <Animated.View
                    style={[
                        styles.alertContainer,
                        {
                            top: top, // respect safe-area top inset
                            transform: [{translateY}],
                        },
                    ]}
                >
                    <Pressable style={styles.alertContent} onPress={hideAlert}>
                        <Text style={styles.alertText}>{successMessage}</Text>
                        <Text style={styles.closeAlertText}>Close</Text>
                    </Pressable>
                </Animated.View>
            )}
        </View>
    )
}
export default SuccessMassage


const createStyles = (theme) => StyleSheet.create({

    alertContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        // height: ALERT_HEIGHT,
        marginHorizontal: 10,
        marginTop: 0,
        borderRadius: theme.radius.xxl,
        borderColor: theme.colors.green,
        borderWidth: 0.5,
        backgroundColor: theme.colors.green,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    alertText: {
        color: 'white',
        fontWeight: theme.fonts.semibold,
        fontSize: 15,
        textAlign: 'center',
        marginHorizontal: 10,
        paddingTop: 15,
    },
    closeAlertText: {
        color: 'white',
        fontWeight: theme.fonts.bold,
        fontSize: 15,
        width: widthPercentage(20),
        height: heightPercentage(2.7),
        borderRadius: theme.radius.xs,
        textAlign: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        backgroundColor: theme.colors.greenLight,
        marginVertical: 7.5,

    },
});

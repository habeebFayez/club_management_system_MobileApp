import React, {useContext, useEffect, useState} from "react";
import {Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import Animated, {runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming} from "react-native-reanimated";
import {Gesture, GestureDetector} from "react-native-gesture-handler";
import Button from "../Button";
import {ThemeContext} from "../../contexts/ThemeContext";

const {height} = Dimensions.get("window");

const MIN_HEIGHT = height * 0.15; // Minimum height from bottom
const MAX_HEIGHT = height; // Maximum height it can expand to

const DraggablePopover = ({
                              isVisible,
                              onClose,
                              size,
                              popoverBackgroundColor = 'white',
                              title,
                              children,
                              closeConfirmation = false,
                              setCloseConfirmation

                          }) => {
    const {theme} = useContext(ThemeContext);
    const styles = createStyles(theme);
    const translateY = useSharedValue(height); // Start fully hidden
    const backdropOpacity = useSharedValue(0);
    const [showModal, setShowModal] = useState(false);

    // Ensure popover opens properly when `isVisible` changes
    useEffect(() => {
        if (isVisible) {
            translateY.value = withSpring(MIN_HEIGHT, {damping: 15, stiffness: 120});
            backdropOpacity.value = withTiming(1, {duration: 500});
        } else {
            translateY.value = withTiming(height, {duration: 500});
            backdropOpacity.value = withTiming(0, {duration: 500});
        }
    }, [isVisible]);

    const handelCloseConfirmation = () => {
        if (closeConfirmation && !showModal) {
            setShowModal(true);
            translateY.value = withSpring(MIN_HEIGHT, {damping: 15, stiffness: 120});
            backdropOpacity.value = withTiming(1, {duration: 500});

        } else {
            //the only why to run onClose without crashing the app do to animation timing
            onClose();
        }
    }
    const openModalFun = () => {
        return (<View style={styles.container}>
            <Modal
                animationType="slide"
                transparent={true}
                visible={showModal}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitleText}>Close Popover ?</Text>
                        <Text style={styles.modalText}>Are You Sure You Want to Close this Popover ? {'\n\n'}
                            Entered Data will be Discard !!</Text>

                        <View style={styles.modalButtons}>
                            <Button
                                onPress={() => {
                                    onClose()
                                    setCloseConfirmation(false)
                                }}
                                title={'Discard'}
                                buttonStyle={{height: 35, width: 90, borderRadius: 30}}
                                textStyle={{fontSize: 15, fontWeight: 'bold', color: 'white'}}
                                hasShadow={false}/>
                            <Button
                                onPress={() => setShowModal(false)}
                                title={'Cancel'}
                                buttonStyle={{backgroundColor: 'red', height: 35, width: 90, borderRadius: 30}}
                                textStyle={{fontSize: 15, fontWeight: 'bold', color: 'white'}}
                                hasShadow={false}/>
                        </View>


                    </View>
                </View>
            </Modal>
        </View>)
    }
    // Gesture for dragging
    const gesture = Gesture.Pan()
        .onChange((event) => {
            const newHeight = event.translationY + MIN_HEIGHT;
            if (newHeight > MIN_HEIGHT && newHeight < MAX_HEIGHT) {
                translateY.value = newHeight;
            }
        })
        .onEnd((event) => {
            if (event.translationY > height * 0.5) {
                // If dragged down far enough, close it
                translateY.value = withTiming(height, {duration: 500}, () => {
                    runOnJS(handelCloseConfirmation)();
                });
                backdropOpacity.value = withTiming(0, {duration: 500});

            } else {
                // Snap back to MIN_HEIGHT if not dragged enough
                translateY.value = withSpring(MIN_HEIGHT, {damping: 15, stiffness: 120});
            }
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{translateY: translateY.value}],
    }));

    const backdropStyle = useAnimatedStyle(() => ({
        opacity: backdropOpacity.value,
    }));


    return (
        <>
            {showModal && openModalFun()}
            {/* Dimmed Background */}
            <Animated.View style={[styles.backdrop, backdropStyle]}>
                <TouchableOpacity style={{flex: 1}} onPress={handelCloseConfirmation}/>
            </Animated.View>

            {/* Draggable Popover */}
            <GestureDetector gesture={gesture}>
                <Animated.View style={[styles.popover, animatedStyle, {height: size}]}>
                    <View style={styles.handleBar}/>
                    {/* Header */}
                    {/*<View style={styles.header}>*/}
                    {/*    <Text style={styles.title}>{title}</Text>*/}
                    {/*</View>*/}
                    {children}
                </Animated.View>
            </GestureDetector>
        </>
    );
};

export default DraggablePopover;

const createStyles = (theme) => StyleSheet.create({
    backdrop: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: theme.colors.modalBackground,
    },
    popover: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        // maxHeight:heightPercentage(100),
        backgroundColor: theme.colors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 5,
        paddingBottom: 40,
        shadowColor: "#006d9c",
        shadowOffset: {width: 0, height: -5},
        shadowOpacity: 0.1,
        shadowRadius: 10,


    },
    handleBar: {
        width: 50,
        height: 5,
        backgroundColor: "#888888",
        alignSelf: "center",
        borderRadius: 10,
        marginBottom: 15,

    },
    header: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        alignContent: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
    },
    button: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f3f4f6",
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
    },
    buttonText: {
        fontSize: 16,
        marginLeft: 10,
        color: theme.colors.textLight,
    },
    container: {
        position: "absolute",
        justifyContent: "center",
        alignItems: "center",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999,
        backgroundColor: theme.colors.modalBackground,
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalView: {
        margin: 10,
        backgroundColor: theme.colors.white,
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#006d9c',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    textStyle: {
        color: theme.colors.text,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalText: {
        color: theme.colors.text,
        textAlign: 'center',
        fontWeight: theme.fonts.semibold,
        fontSize: 13,
    },
    modalTitleText: {
        color: theme.colors.text,
        marginBottom: 15,
        textAlign: 'center',
        fontWeight: theme.fonts.bold,
        fontSize: 18,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: '15%',
        marginVertical: 25,
        marginBottom: -10,


    }
});

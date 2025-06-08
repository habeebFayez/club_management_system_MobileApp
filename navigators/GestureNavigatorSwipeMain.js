import {Dimensions, StyleSheet} from 'react-native'
import React from 'react'
import {Gesture, GestureDetector} from "react-native-gesture-handler";
import Animated, {runOnJS, useAnimatedStyle, useSharedValue, withTiming} from "react-native-reanimated";


const {width, height} = Dimensions.get("window");

export default function GestureNavigatorSwipeMain({navigation, children, leftSwipe, rightSwipe}) {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const gesture = Gesture.Pan()
        .onChange((event) => {
            translateX.value = event.translationX;
            translateY.value = 0;


        })
        .onEnd((event) => {
            if (event.translationX > 100) {
                // Swipe right = Close
                translateX.value = withTiming(width, {duration: 300}, () => {
                    runOnJS(rightSwipe)();

                });
            } else if (event.translationX < -100) {
                // Swipe left = Open Profile
                translateX.value = withTiming(-width, {duration: 300}, () => {
                    runOnJS(leftSwipe)();

                });
            }
            translateX.value = withTiming(0, {duration: 10000});
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{translateX: translateX.value}],
    }));
    return (
        <GestureDetector gesture={gesture}>
            <Animated.View style={[animatedStyle]}>

                {children}

            </Animated.View>
        </GestureDetector>
    )
}
const styles = StyleSheet.create({})

import React from 'react';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated';

// ============================
// ANIMATION WRAPPER COMPONENT
// ============================
export const AnimationWrapper = ({
                                     children,
                                     animationType = 'none',
                                     duration = 500,
                                     delay = 0,
                                     autoPlay = true,
                                     repeat = false,
                                     style,
                                     onAnimationComplete,
                                 }) => {
    // Shared values for all transforms
    const opacity = useSharedValue(animationType === 'fade' ? 0 : 1);
    const scale = useSharedValue(
        animationType === 'scale' || animationType === 'bounce' ? 0.5 : 1
    );

    // For sliding:
    //   slideUp    => translateY starts positive (pushed down below view)
    //   slideDown  => translateY starts negative (pushed above view)
    //   slideLeft  => translateX starts positive (pushed off right)
    //   slideRight => translateX starts negative (pushed off left)
    const translateY = useSharedValue(
        animationType === 'slideUp'
            ? 50
            : animationType === 'slideDown'
                ? -50
                : animationType === 'bounce'
                    ? -20
                    : 0
    );
    const translateX = useSharedValue(
        animationType === 'slideLeft'
            ? 50
            : animationType === 'slideRight'
                ? -50
                : animationType === 'shake'
                    ? 0
                    : 0
    );

    const rotate = useSharedValue(animationType === 'rotate' ? 0 : 0);

    const handleAnimationComplete = React.useCallback(() => {
        if (onAnimationComplete) {
            onAnimationComplete();
        }
    }, [onAnimationComplete]);

    React.useEffect(() => {
        if (autoPlay) {
            startAnimation();
        }
    }, [autoPlay]);

    const startAnimation = () => {
        const repeatConfig =
            repeat === true ? -1 : typeof repeat === 'number' ? repeat : 0;

        switch (animationType) {
            case 'scale':
                scale.value = withDelay(
                    delay,
                    withRepeat(
                        withSpring(1.1, {damping: 4, stiffness: 80}),
                        repeatConfig,
                        true
                    )
                );
                break;

            case 'rotate':
                rotate.value = withDelay(
                    delay,
                    withRepeat(
                        withTiming(2 * Math.PI, {duration}),
                        repeatConfig,
                        false
                    )
                );
                break;

            case 'bounce':
                scale.value = withDelay(delay, withSpring(1, {damping: 4}));
                translateY.value = withDelay(
                    delay,
                    withRepeat(
                        withSequence(
                            withTiming(-10, {duration: duration / 2}),
                            withTiming(0, {duration: duration / 2})
                        ),
                        repeatConfig,
                        true
                    )
                );
                break;

            case 'fade':
                opacity.value = withDelay(
                    delay,
                    withTiming(1, {duration}, () => {
                        if (!repeat) {
                            runOnJS(handleAnimationComplete)();
                        }
                    })
                );
                break;

            // Slide Up/Down/Left/Right
            case 'slideUp':
                translateY.value = withDelay(
                    delay,
                    withTiming(0, {duration}, () => {
                        if (!repeat) {
                            runOnJS(handleAnimationComplete)();
                        }
                    })
                );
                break;

            case 'slideDown':
                translateY.value = withDelay(
                    delay,
                    withTiming(0, {duration}, () => {
                        if (!repeat) {
                            runOnJS(handleAnimationComplete)();
                        }
                    })
                );
                break;

            case 'slideLeft':
                translateX.value = withDelay(
                    delay,
                    withTiming(0, {duration}, () => {
                        if (!repeat) {
                            runOnJS(handleAnimationComplete)();
                        }
                    })
                );
                break;

            case 'slideRight':
                translateX.value = withDelay(
                    delay,
                    withTiming(0, {duration}, () => {
                        if (!repeat) {
                            runOnJS(handleAnimationComplete)();
                        }
                    })
                );
                break;

            case 'pulse':
                scale.value = withDelay(
                    delay,
                    withRepeat(
                        withSequence(
                            withTiming(1.1, {duration: duration / 2}),
                            withTiming(1, {duration: duration / 2})
                        ),
                        repeatConfig,
                        true
                    )
                );
                break;

            case 'shake':
                translateX.value = withDelay(
                    delay,
                    withRepeat(
                        withSequence(
                            withTiming(10, {duration: duration / 6}),
                            withTiming(-10, {duration: duration / 6}),
                            withTiming(8, {duration: duration / 6}),
                            withTiming(-8, {duration: duration / 6}),
                            withTiming(5, {duration: duration / 6}),
                            withTiming(0, {duration: duration / 6})
                        ),
                        repeatConfig,
                        false
                    )
                );
                break;

            case 'none':
            default:
                // No animation
                break;
        }
    };

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
            transform: [
                {scale: scale.value},
                {translateY: translateY.value},
                {translateX: translateX.value},
                {rotateZ: `${rotate.value}rad`},
            ],
        };
    });

    return (
        <Animated.View style={[animatedStyle, style]}>
            {children}
        </Animated.View>
    );
};

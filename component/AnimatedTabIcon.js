import React, {useEffect} from 'react';
import {HugeiconsIcon} from "@hugeicons/react-native";
import {
    Appointment02Icon,
    DashboardCircleEditIcon,
    Home05Icon,
    LayersIcon,
    UserIcon,
} from "@hugeicons/core-free-icons";
import Animated, {useAnimatedStyle, useSharedValue, withSpring, withTiming} from "react-native-reanimated";

const AnimatedTabIcon = ({route, color, focused}) => {
    // Shared animation value that responds to focused state changes
    const scale = useSharedValue(0);

    // Update scale when focused state changes
    useEffect(() => {

        scale.value = focused ?
            withSpring(1.33, {damping: 10, stiffness: 100}) :
            withTiming(1, {duration: 200});
    }, [focused, scale]);

    // Create animated style based on the scale value
    const animatedIconStyle = useAnimatedStyle(() => {
        return {
            transform: [{scale: scale.value}]

        };
    });

    // Define icon for each tab
    let iconName;
    switch (route) {
        case 'Home':
            iconName = Home05Icon;
            break;
        case 'Dashboard':
            iconName = DashboardCircleEditIcon;
            break;
        case 'Calendar':
            iconName = Appointment02Icon;
            break;
        case 'Clubs':
            iconName = LayersIcon;
            break;
        case 'Profile':
            iconName = UserIcon;
            break;
        default:
            iconName = Home05Icon;
    }

    return (
        <Animated.View style={animatedIconStyle}>
            <HugeiconsIcon
                icon={iconName}
                size={23}
                color={color}
                strokeWidth={focused ? 2.5 : 1.8}
            />
        </Animated.View>
    );
};

export default AnimatedTabIcon;
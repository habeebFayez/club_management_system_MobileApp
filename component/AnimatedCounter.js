import React, {useEffect, useState} from 'react';
import {Animated, Text, View} from 'react-native';
import {Easing} from 'react-native-reanimated';

const AnimatedCounter = ({value, duration = 2000, style}) => {
    const animatedValue = useState(new Animated.Value(0))[0];
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: value,
            duration: duration,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start();

        const listener = animatedValue.addListener(({value}) => {
            setDisplayValue(Math.floor(value));
        });

        return () => {
            animatedValue.removeListener(listener);
        };
    }, [value]);

    return <Text style={style}>{displayValue}</Text>;
};

const Dashboard = () => {
    const [users, setUsers] = useState([]);

    // Simulate fetching users
    useEffect(() => {
        // Replace with your actual data fetching
        setTimeout(() => {
            setUsers(Array(42).fill({})); // Example with 42 users
        }, 500);
    }, []);

    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text>Total Users:</Text>
            <AnimatedCounter value={users.length} duration={2000}/>
        </View>
    );
};

export default AnimatedCounter;
import React, {useContext} from 'react';
import {StyleSheet, TouchableOpacity} from 'react-native';
import {widthPercentage} from "../helpers/common";
import {ThemeContext} from "../contexts/ThemeContext";

const CustomTabButton = ({children, accessibilityState, onPress}) => {
    const isSelected = accessibilityState.selected;
    const {theme} = useContext(ThemeContext);
    const styles = createStyles(theme);


    return (
        <TouchableOpacity
            style={[
                styles.tabButtonContainer,
                isSelected && styles.activeButton,
            ]}
            activeOpacity={0.7}
            onPress={() => onPress()}
        >
            {children}
        </TouchableOpacity>
    );
};

const createStyles = (theme) => StyleSheet.create({
    tabButtonContainer: {
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 500,
        left: widthPercentage(2),
        right: widthPercentage(2),
    },
    activeButton: {
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 500,
        left: widthPercentage(2),
        right: widthPercentage(2),
        backgroundColor: theme.colors.primaryDark,
        width: 60,
        height: 60,
        bottom: 20,
    },
});

export default CustomTabButton;

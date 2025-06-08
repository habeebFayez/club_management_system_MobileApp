
import React, {useContext} from 'react';
import {StyleSheet,Platform, View} from 'react-native';
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {heightPercentage} from "../helpers/common";
import {ThemeContext} from "../contexts/ThemeContext";

export default function ScrollScreen({
                                         children,
                                         background,
                                         enableScroll,
                                         scrollEnabled = true,
                                         onScroll,  // Add this prop
                                     }) {
    const {theme} = useContext(ThemeContext);
    const styles = createStyles(theme);

    return (
        <View style={[styles.containerMAx]}>
            <KeyboardAwareScrollView
                style={[styles.container, {backgroundColor: background ? background : theme.colors.white}]}
                // decelerationRate={'fast'}
                contentContainerStyle={
                {
                    flexGrow: 1,
                    paddingBottom: Platform.select({ ios: 100, android: 150 })
                }}
                disableScrollViewPanResponder={true}
                nestedScrollEnabled={true}
                scrollEnabled={scrollEnabled}
                enableAutomaticScroll={true}
                keyboardShouldPersistTaps="never"
                bounces={true}
                maintainVisibleContentPosition={{
                    minIndexForVisible: 0,
                    autoscrollToTopThreshold: 10
                }}
                bouncesZoom={false}
                overScrollMode="never"
                showsVerticalScrollIndicator={true}
                onScroll={onScroll}  // Add scroll handler
                scrollEventThrottle={16}  // Add this for smooth scroll events
                extraScrollHeight={20}  // Add this to help with keyboard handling
                keyboardDismissMode={'interactive'}
            >
                {children}
            </KeyboardAwareScrollView>
        </View>
    );
}

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
    },
    containerMAx: {
        height: heightPercentage(100),
        paddingBottom: 50
    }
});
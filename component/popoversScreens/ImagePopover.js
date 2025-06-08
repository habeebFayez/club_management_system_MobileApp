import React, { useContext, useState } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import ImageViewing from 'react-native-image-viewing';
import { ThemeContext } from "../../contexts/ThemeContext";

const { width, height } = Dimensions.get("window");

const ImagePopover = ({ isVisible, onClose, images }) => {
    const { theme } = useContext(ThemeContext);
    const styles = createStyles(theme);
    const [isImageLoading, setIsImageLoading] = useState(true);

    return (
        <View style={{ backgroundColor: 'transparent' }}>
        <ImageViewing
            style={{ width: '100%', height: '100%' }}
            images={images}
            imageIndex={0}
            visible={isVisible}
            onRequestClose={onClose}
            backgroundColor={theme.colors.modalBackground}
            onImageLoadEnd={() => setIsImageLoading(false)}
            animationType={'slide'}
            keyExtractor={(image, index) => image.uri + '-' + index}
            presentationStyle={'overFullScreen'}
            swipeToCloseEnabled={true}

        />
        </View>
    );
};

export default ImagePopover;

const createStyles = (theme) => StyleSheet.create({
    closeButton: {
        position: "absolute",
        top: 30,
        left: 10,
        zIndex: 10,
    },

});

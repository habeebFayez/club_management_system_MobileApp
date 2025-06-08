import {Dimensions, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {HugeiconsIcon} from "@hugeicons/react-native";
import {CameraIcon, Delete02Icon, Image03Icon} from "@hugeicons/core-free-icons";
import React from "react";
import {theme} from '../constants/theme'

//getting height and width of the current device
const {width: deviceWidth, height: deviceHeight} = Dimensions.get('window');


//calculating the device height
export const heightPercentage = percentage => {
    return (percentage * deviceHeight) / 100;
}

//calculating the device width

export const widthPercentage = percentage => {
    return (percentage * deviceWidth) / 100;
}

// for making the app responsive
export const getUserRole = (user) => {
    if (!user) {
        return null;
    }

    if (user?.authority?.authorityID === 1) {
        return 'ADMIN';
    } else if (user?.authority?.authorityID === 3) {
        return 'MANAGER';
    } else if (user?.authority?.authorityID === 2) {
        return 'STUDENT';
    }
    return null
}
//Image Edit  **********************************************************
export const openModalFun = (isProfileImage, imageFromCamera, imageFromStudio, deleteProfileImage, isDeleted) => {

    return (<View style={styles.ImageEditingContainer}>
            {/*Open Camera --------------------------------------------------------------------------------- */}
            <TouchableOpacity style={styles.editPicIconCamera}
                              onPress={() => imageFromCamera(isProfileImage)}>
                <HugeiconsIcon
                    icon={CameraIcon}
                    size={25}
                    color={theme.colors.white}
                    strokeWidth={1}
                />
                <Text style={{color: 'white'}}> By Camera </Text>
            </TouchableOpacity>

            {/*from Phone photos  Camera --------------------------------------------------------------------------------- */}
            <TouchableOpacity style={styles.editPicIconUpload}
                              onPress={() => imageFromStudio(isProfileImage)}>
                <HugeiconsIcon
                    icon={Image03Icon}
                    size={25}
                    color={theme.colors.white}
                    strokeWidth={1}
                />
                <Text style={{color: 'white'}}> From Gallery </Text>
            </TouchableOpacity>
            {/*Delete image  --------------------------------------------------------------------------------- */}
            {isDeleted &&
                <TouchableOpacity style={styles.editPicIconDelete}
                                  onPress={() => deleteProfileImage(isProfileImage)}>
                    <HugeiconsIcon
                        icon={Delete02Icon}
                        size={25}
                        color={theme.colors.white}
                        strokeWidth={1}
                    />
                    <Text style={{color: 'white'}}>Delete Image </Text>
                </TouchableOpacity>}
        </View>
    );

}
const styles = StyleSheet.create({

    ImageEditingContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 20,


    },
    editPicIconCamera: {
        alignItems: "center",
        justifyContent: 'center',
        padding: 7.5,
        backgroundColor: 'rgb(92,92,92)',
        borderRadius: 25,
        gap: 10,
        width: 300

    },
    editPicIconUpload: {
        alignItems: "center",
        justifyContent: 'center',
        padding: 7.5,
        backgroundColor: theme.colors.cyan1,
        borderRadius: 25,
        gap: 10,


    },
    editPicIconDelete: {
        alignItems: "center",
        justifyContent: 'center',
        padding: 7.5,
        backgroundColor: theme.colors.red,
        borderRadius: 25,
        gap: 10,


    },
})
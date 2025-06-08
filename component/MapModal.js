import React, {useContext, useEffect, useState} from 'react';
import {Alert, Dimensions, Modal, Platform, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import * as Location from 'expo-location';
import * as Linking from 'expo-linking';
import {heightPercentage, widthPercentage} from "../helpers/common";
import {ThemeContext} from "../contexts/ThemeContext";

const MapModal = ({isVisible, onClose, onConfirm}) => {
    const {theme} = useContext(ThemeContext);
    const styles = createStyles(theme);

    const [region, setRegion] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [statusOfPermissions, setStatusOfPermissions] = useState(false);

    useEffect(() => {
        requestLocationPermission();

    }, [isVisible]);

    const requestLocationPermission = async () => {
        let {status} = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
            setStatusOfPermissions(false)
            Alert.alert(
                "Location Permission Required",
                "You need to allow location access to select a place. Try again or open settings.",
                [
                    {
                        text: "Open Settings",
                        onPress: () => {
                            if (Platform.OS === 'ios') {
                                Linking.openURL('App-Prefs:Privacy&path=LOCATION');
                            } else {
                                Linking.openSettings();
                            }
                        },
                    },
                    {
                        text: "Cancel",
                        style: "cancel",
                    },
                ]
            );
            setStatusOfPermissions(false)
            return;
        } else {
            setStatusOfPermissions(true)
        }


        let location = await Location.getCurrentPositionAsync({});
        setRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        });
    };

    const handleMapPress = (event) => {
        setSelectedLocation(event.nativeEvent.coordinate);
    };

    return (
        <Modal
            visible={isVisible && statusOfPermissions} transparent={true} animationType="slide"
            onRequestClose={onClose}
        >
            <View
                style={{
                    flex: 1,
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    paddingBottom: 15,
                    backgroundColor: theme.colors.gray,

                }}>
                <TouchableOpacity onPress={onClose}
                                  style={{height: heightPercentage(100), width: widthPercentage(100)}}/>

                <View
                    style={{
                        backgroundColor: theme.colors.white,
                        padding: 15,
                        borderRadius: 25,
                        width: widthPercentage(95),
                        alignItems: 'center',
                        shadowColor: '#006d9c',
                        shadowOffset: {width: 0, height: 0},
                        shadowOpacity: 0.2,
                        shadowRadius: 5,
                        borderWidth: 2,
                        borderColor: theme.colors.gray1,
                    }}
                >
                    <Text style={{fontSize: 18, marginBottom: 10, color: theme.colors.text}}>
                        Select Location
                    </Text>

                    {region ? (
                        <MapView
                            style={styles.map}
                            initialRegion={region}
                            onPress={handleMapPress}
                            showsUserLocation={true}
                            onRegionChangeComplete={(region) => setRegion(region)}
                            moveOnMarkerPress={true}

                        >
                            {selectedLocation && (
                                <Marker coordinate={selectedLocation} title="Selected Location"/>
                            )}
                        </MapView>
                    ) : (
                        <Text style={{color: theme.colors.text}}>Loading Map...</Text>
                    )}
                </View>

                <View style={{gap: 5, alignItems: 'center', justifyContent: 'center', marginTop: 5}}>
                    <TouchableOpacity
                        onPress={() => {
                            if (selectedLocation) {
                                onConfirm(selectedLocation);
                                onClose();
                            } else {
                                alert('Please select a location on the map to continue ');
                            }
                        }}
                        activeOpacity={0.9}
                        style={{
                            padding: 10,
                            backgroundColor: theme.colors.white,
                            borderRadius: 50,
                            height: heightPercentage(8),
                            width: widthPercentage(95),
                            alignItems: 'center',
                            justifyContent: 'center',
                            shadowColor: '#006d9c',
                            shadowOffset: {width: 0, height: 0},
                            shadowOpacity: 0.2,
                            shadowRadius: 5,
                            borderWidth: 2,
                            borderColor: theme.colors.gray1,
                        }}
                    >
                        <Text style={{color: theme.colors.text, fontSize: 18}}>Confirm</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={onClose}
                        activeOpacity={0.9}

                        style={{
                            padding: 10,
                            backgroundColor: theme.colors.white,
                            borderRadius: 50,
                            width: widthPercentage(95),
                            height: heightPercentage(8),
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 5,
                            shadowColor: '#006d9c',
                            shadowOffset: {width: 0, height: 0},
                            shadowOpacity: 0.2,
                            shadowRadius: 5,
                            borderWidth: 2,
                            borderColor: theme.colors.gray1,
                        }}
                    >
                        <Text style={{color: theme.colors.text, fontSize: 18}}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default MapModal;

const createStyles = (theme) => StyleSheet.create({
    map: {
        borderRadius: 10,
        position: 'relative',
        width: Dimensions.get('window').width * 0.9,
        height: Dimensions.get('window').height * 0.65,

    },
});

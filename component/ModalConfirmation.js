import {Modal, StyleSheet, Text, View} from 'react-native'
import React, {useContext} from 'react'
import Button from "./Button";
import {ThemeContext} from "../contexts/ThemeContext";

const ModalConfirmation = ({
                               modalKey, modalMessage, isModalChildren,
                               children, onRequestClose, confirmation, isConfirmationWithChildren = false,
                               title, loading = false, isVisible,
                           }) => {
    const {theme} = useContext(ThemeContext);
    const styles = createStyles(theme);
    if (!isVisible) return null;
    return (
        <View style={styles.container}>
            <Modal
                key={modalKey}
                animationType="slide"
                transparent={true}
                visible={isVisible}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitleText}>{title}</Text>
                        {(children && isModalChildren && !isConfirmationWithChildren) && children}
                        {(children && isModalChildren && !isConfirmationWithChildren) &&
                            <View style={styles.modalButtons}>
                                <Button
                                    onPress={onRequestClose}
                                    title={'Done'}
                                    loading={loading}
                                    buttonStyle={{height: 35, width: 90, borderRadius: 30}}
                                    textStyle={{fontSize: 15, fontWeight: 'bold', color: 'white'}}
                                    hasShadow={false}/>
                            </View>}
                        {modalMessage && !isModalChildren && !isConfirmationWithChildren &&
                            <>
                                <Text style={styles.modalText}>{modalMessage}</Text>

                                <View style={styles.modalButtons}>
                                    <Button
                                        onPress={confirmation}
                                        title={'Confirm'}
                                        loading={loading}
                                        buttonStyle={{height: 35, width: 90, borderRadius: 30}}
                                        textStyle={{fontSize: 15, fontWeight: 'bold', color: 'white'}}
                                        hasShadow={false}/>
                                    <Button
                                        onPress={onRequestClose}
                                        title={'Cancel'}
                                        loading={loading}
                                        buttonStyle={{
                                            backgroundColor: theme.colors.red,
                                            height: 35,
                                            width: 90,
                                            borderRadius: 30
                                        }}
                                        textStyle={{fontSize: 15, fontWeight: 'bold', color: 'white'}}
                                        hasShadow={false}/>
                                </View>
                            </>
                        }
                        {children && isConfirmationWithChildren &&
                            <>
                                <Text style={styles.modalText}>{modalMessage}</Text>
                                {children}
                                <View style={styles.modalButtons}>
                                    <Button
                                        onPress={confirmation}
                                        title={'Confirm'}
                                        loading={loading}
                                        buttonStyle={{height: 35, width: 90, borderRadius: 30}}
                                        textStyle={{fontSize: 15, fontWeight: 'bold', color: 'white'}}
                                        hasShadow={false}/>
                                    <Button
                                        onPress={onRequestClose}
                                        title={'Cancel'}
                                        loading={loading}
                                        buttonStyle={{
                                            backgroundColor: theme.colors.red,
                                            height: 35,
                                            width: 90,
                                            borderRadius: 30
                                        }}
                                        textStyle={{fontSize: 15, fontWeight: 'bold', color: 'white'}}
                                        hasShadow={false}/>
                                </View>
                            </>}

                    </View>
                </View>
            </Modal>
        </View>
    )
}
export default ModalConfirmation
const createStyles = (theme) => StyleSheet.create({
    container: {
        position: "absolute",
        justifyContent: "center",
        alignItems: "center",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
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
            height: 0,
        },
        shadowOpacity: 0.5,
        shadowRadius: 4,
    },
    button: {
        borderRadius: 20,
        padding: 10,
    },
    buttonOpen: {
        backgroundColor: '#F194FF',
    },
    buttonClose: {
        backgroundColor: '#2196F3',
    },
    textStyle: {
        color: theme.colors.textLight,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalText: {
        color: theme.colors.textLight,
        textAlign: 'center',
        fontWeight: theme.fonts.semibold,
        fontSize: 13,
    },
    modalTitleText: {
        color: theme.colors.textLight,
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

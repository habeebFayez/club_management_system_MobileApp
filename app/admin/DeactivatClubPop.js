import {Keyboard, Pressable, StyleSheet, Text, TextInput, View} from 'react-native'
import React, {useContext, useEffect, useState} from 'react'
import ScrollScreen from "../../component/ScrollScreen";
import {heightPercentage, widthPercentage} from "../../helpers/common";
import {deactivateClub} from "../../api/ConstantsApiCalls";
import Button from "../../component/Button";
import Loading from "../../component/Loading";
import {ThemeContext} from "../../contexts/ThemeContext";

const DeactivatClubPop = ({
                              clubToBeBaned, openAlertMassage, openSuccessMassage, close,
                              storedJwt, setCloseConfirmation, user, onRefresh
                          }) => {
    const {theme} = useContext(ThemeContext);
    const styles = createStyles(theme);
    const [isLoading, setIsLoading] = useState(false);

    const [notificationMessage, setNotificationMessage] = useState('');
    // API Ban Club call                                        **********************************************************************
    const handleDeactivateClub = () => {
        (async () => {
            setIsLoading(true)
            const response = await deactivateClub(storedJwt, user,
                openSuccessMassage, openAlertMassage, clubToBeBaned, notificationMessage);
            setIsLoading(false)
            if (response) {
                close();
                openSuccessMassage('Club was Deactivated successfully.');
                onRefresh();
            }

        })();
    }
    useEffect(() => {
        notificationMessage && setCloseConfirmation(true);
        clubToBeBaned.clubName ? setIsLoading(false) : setIsLoading(true)
    }, [clubToBeBaned, notificationMessage]);

    return (

        <ScrollScreen>
            <View style={styles.container}>
                <Text style={styles.ConfirmationTitle}>
                    Deactivate Club
                </Text>
                <Pressable onPress={Keyboard.dismiss}>
                    <Text style={styles.ConfirmationText}>
                        Are You Sure You Want to
                        Deactivate {'\n\n' + clubToBeBaned?.clubName?.toUpperCase() + ' Club ?'}
                    </Text>
                    <View style={{gap: 5}}>
                        <Text style={styles.lableText}>Club Deactivating Reason</Text>
                        <TextInput
                            keyboardAppearance={theme.type}
                            multiline
                            style={styles.input}
                            placeholderTextColor={theme.colors.text}
                            value={notificationMessage}
                            onChangeText={text => setNotificationMessage(text)}
                            placeholder="Club Deactivating Reason"
                        />
                    </View>
                    <Text style={{color: theme.colors.red, fontSize: 12}}> (*You can leave it empty*)</Text>
                </Pressable>
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    gap: '15%',
                    marginVertical: 25,

                }}>
                    <Button
                        onPress={handleDeactivateClub}
                        title={'Confirm'}
                        buttonStyle={{height: 45, width: 100, borderRadius: 50}}
                        textStyle={{fontSize: 15, fontWeight: 'bold', color: 'white'}}
                        hasShadow={false}/>
                    <Button
                        onPress={close}
                        title={'Cancel'}
                        buttonStyle={{backgroundColor: 'red', height: 45, width: 100, borderRadius: 50}}
                        textStyle={{fontSize: 15, fontWeight: 'bold', color: 'white'}}
                        hasShadow={false}/>
                </View>

            </View>
            {isLoading && <Loading screenSize={50} backgroundColor={'rgba(0,0,0,0)'}/>}

        </ScrollScreen>


    )
}
export default DeactivatClubPop
const createStyles = (theme) => StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: 'center',
        gap: 25,
    },
    lableText: {
        left: 10, color: theme.colors.red, fontWeight: '700', bottom: 0, top: 0, marginTop: 10,
    },
    input: {
        flexDirection: 'row',
        height: heightPercentage(40),
        width: widthPercentage(90),
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0.4,
        borderColor: theme.colors.text,
        borderRadius: 20,
        borderCurve: 'continuous',
        paddingHorizontal: 18,
        gap: 12,
        color: theme.colors.text,


    },
    ConfirmationTitle: {
        color: theme.colors.text,
        fontWeight: '700',
        fontSize: 18,
        bottom: 0,
        top: 0,
        textAlign: 'center',

    },
    ConfirmationText: {
        color: theme.colors.text,
        fontWeight: '600',
        fontSize: 15,
        marginBottom: 10,
        textAlign: 'center',

    },
})

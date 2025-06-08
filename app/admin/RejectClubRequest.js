import {Keyboard, Pressable, StyleSheet, Text, TextInput, View} from 'react-native'
import React, {useContext, useEffect, useState} from 'react'
import ScrollScreen from "../../component/ScrollScreen";
import {heightPercentage, widthPercentage} from "../../helpers/common";
import {rejectClub} from "../../api/ConstantsApiCalls";
import Button from "../../component/Button";
import Loading from "../../component/Loading";
import {ThemeContext} from "../../contexts/ThemeContext";

const RejectClubRequest = ({
                               clubToBeRejected, openAlertMassage, openSuccessMassage, close,
                               storedJwt, setCloseConfirmation, user, onRefresh
                           }) => {
    const {theme} = useContext(ThemeContext);
    const styles = createStyles(theme);
    const [isLoading, setIsLoading] = useState(false);

    const [notificationMessage, setNotificationMessage] = useState('');
    // API Reject Club call                                        **********************************************************************
    // API Reject Event call                                        **********************************************************************
    const handleRejectClub = () => {
        (async () => {
            const response = await rejectClub(storedJwt, user,
                openSuccessMassage, openAlertMassage, clubToBeRejected, notificationMessage);
            if (response) {
                close();
                openSuccessMassage('Club was Reject Successfully.');
                onRefresh();

            }

        })();
    }
    useEffect(() => {
        notificationMessage && setCloseConfirmation(true);
        clubToBeRejected.clubName ? setIsLoading(false) : setIsLoading(true)
    }, [clubToBeRejected, notificationMessage]);


    return (
        !isLoading ?
            <ScrollScreen>
                <View style={styles.container}>
                    <Text style={styles.ConfirmationTitle}>
                        Reject Club
                    </Text>
                    <Pressable onPress={Keyboard.dismiss} style={{gap: 5}}>
                        <Text style={styles.ConfirmationText}>
                            Are you Sure You Want to Reject the Request
                            of {'\n\n' + clubToBeRejected?.clubName?.toUpperCase() + ' Club ?'}
                        </Text>
                        <View style={{gap: 5}}>
                            <Text style={styles.lableText}>Club Rejection Reason</Text>
                            <TextInput
                                keyboardAppearance={theme.type}
                                multiline
                                style={styles.input}
                                value={notificationMessage}
                                onChangeText={text => setNotificationMessage(text)}
                                placeholder="Club Rejection Reason"
                                placeholderTextColor={theme.colors.text}
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
                            onPress={handleRejectClub}
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

            </ScrollScreen>
            :
            <Loading screenSize={75} backgroundColor={'rgba(0,0,0,0)'}/>


    )
}
export default RejectClubRequest
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

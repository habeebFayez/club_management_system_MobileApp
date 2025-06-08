import {StyleSheet, View} from 'react-native'
import React, {useContext, useEffect, useState} from 'react'
import Input from "../../../../component/Input";
import {SquareLockCheck02Icon, SquareLockIcon, ViewIcon, ViewOffIcon} from "@hugeicons/core-free-icons";
import Button from "../../../../component/Button";
import axios from "../../../../api/axios";
import MyIcon from "../../../../component/MyIcons";
import {ThemeContext} from "../../../../contexts/ThemeContext";


const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\W_])\S{8,35}$/;
const RESET_PASSWORD_URL = '/auth/resetPassword'
const ChangePassword = ({openSuccessMassage, openAlertMassage, storedJwt, goBack}) => {
    const {theme} = useContext(ThemeContext);
    const styles = createStyles(theme);
    const [currentPassword, setCurrentPassword] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [validPassword, setValidPassword] = useState(false);
    const [validNewPassword, setValidNewPassword] = useState(false);
    const [loadingSubmit, setLoadingSubmit] = useState(false);


    //Submit Call API SIGN UP                                                        **********************************************************
    const onSubmit = async () => {
        //Make sure all inuts are VALID                                             ***************************************************************
        if (!(validPassword && validNewPassword
            && confirmPassword !== '')) {
            openAlertMassage('Please fill all fields');
            return;
        } else if (currentPassword === password) {
            openAlertMassage('You cant use same password!!');
            return;
        }

        //API Call for updating password                                              ************************************************************************
        try {
            setLoadingSubmit(true);

            const response = await axios.post(RESET_PASSWORD_URL,
                JSON.stringify({lastName: password, password: currentPassword}), {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${storedJwt}`
                    },
                    withCredentials: true
                });
            openSuccessMassage('Your Password was Updated Successfully!');
            goBack();
        } catch (error) {
            console.error('Submission error:', error);
            if (!error.response) {
                openAlertMassage("No Server Response");
            } else if (error.response.status === 401) {
                openAlertMassage('Wrong password please try again');
            } else {
                openAlertMassage('Update Failed. Please try again later.');
            }
        } finally {
            setLoadingSubmit(false);
        }


    };
    //Password Validation                                                                                         ********************************************************
    useEffect(() => {
        const result = PASSWORD_REGEX.test(password);
        setValidPassword(result);
        if (password) {
            const match = password === confirmPassword;
            setValidNewPassword(match);
        }
    }, [password]);
    //Confirm Password Matching                                                                                          ********************************************************
    useEffect(() => {
        const match = password === confirmPassword;
        setValidNewPassword(match);
    }, [confirmPassword]);
    return (
        <View style={styles.form}>
            {/* Current Password Input                                             -----------------------------------------------------------------------------------*/}
            <Input
                value={currentPassword}
                icon={<MyIcon
                    icon={SquareLockIcon}
                    size={25}
                    color={theme.colors.textLight}
                />}
                placeholder={'Current Password'}
                secureTextEntry={!showCurrentPassword}
                onChangeText={(text) => setCurrentPassword(text)}
                passwordIcon={<MyIcon
                    icon={showCurrentPassword ? ViewIcon : ViewOffIcon}
                    size={21}
                    color={theme.colors.textLight}
                    onPress={() => showCurrentPassword ? setShowCurrentPassword(false) : setShowCurrentPassword(true)}
                />}

            />

            {/*NewPassword Input                                             ____________________________________________________________ */}

            <Input
                value={password}
                alertErr={(password === '' ? false : !validPassword)}
                textAlert={(password === '' ?
                    false
                    :
                    (validPassword ? false : '  8 to 35 characters are allowed' +
                        '  include at least One capital letter one small letter' +
                        ' one number and one special character'))}
                icon={<MyIcon
                    icon={SquareLockIcon}
                    size={25}
                    color={(password === '' ?
                        theme.colors.textLight
                        :
                        (validPassword ? theme.colors.textLight : theme.colors.red))}
                />}
                placeholder={'Your New Password'}
                secureTextEntry={!showPassword}
                onChangeText={(text) => setPassword(text)}
                passwordIcon={<MyIcon
                    icon={showPassword ? ViewIcon : ViewOffIcon}
                    size={21}
                    color={(password === '' ?
                        theme.colors.textLight
                        :
                        (validPassword ? theme.colors.textLight : theme.colors.red))}
                    onPress={() => showPassword ? setShowPassword(false) : setShowPassword(true)}
                />}

            />

            {/*Confirm NewPassword Input                                             ____________________________________________________________ */}

            <Input
                value={confirmPassword}
                alertErr={(confirmPassword === '' ? false : !validNewPassword)}
                textAlert={(confirmPassword === '' ?
                    false
                    :
                    (validNewPassword ? false : ' Confirm Password must match your Password '))}
                icon={<MyIcon
                    icon={SquareLockCheck02Icon}
                    size={25}
                    color={(confirmPassword === '' ?
                        theme.colors.textLight
                        :
                        (validNewPassword ? theme.colors.textLight : theme.colors.red))}
                />}
                placeholder={'Confirm Your New Password '}
                secureTextEntry={!showConfirmPassword}
                onChangeText={(text) => setConfirmPassword(text)}
                passwordIcon={<MyIcon
                    icon={showConfirmPassword ? ViewIcon : ViewOffIcon}
                    size={21}
                    color={(confirmPassword === '' ?
                        theme.colors.textLight
                        :
                        (validNewPassword ? theme.colors.textLight : theme.colors.red))}
                    onPress={() => showConfirmPassword ? setShowConfirmPassword(false) : setShowConfirmPassword(true)}
                />}


            />
            {/*Signup Button                                             ____________________________________________________________ */}
            <View style={{padding: 20}}>
                <Button title={'Save'} loading={loadingSubmit} onPress={onSubmit}/>
            </View>
            {/*Footer area                                             ____________________________________________________________ */}
            <View style={styles.footer}>

            </View>
        </View>

    )
}
export default ChangePassword

const createStyles = (theme) => StyleSheet.create({
    form: {
        gap: 20,
    },
})

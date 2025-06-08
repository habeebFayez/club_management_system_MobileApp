import {Image, Pressable, StyleSheet, Text, Vibration, View} from 'react-native'
import React, {useContext, useRef, useState} from 'react'
import {heightPercentage, widthPercentage} from "../helpers/common";
import Input from "../component/Input";
import {AlertCircleIcon, MailIcon, SquareLockIcon, ViewIcon, ViewOffIcon} from "@hugeicons/core-free-icons";
import Button from "../component/Button";
import axios from "../api/axios";
import AlertMassage from "../component/AlertMassage";
import {CredentialsContext} from '../contexts/CredentialsContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MyIcon from "../component/MyIcons";
import {ThemeContext} from "../contexts/ThemeContext";
import {useNotification} from '../contexts/NotificationsContext';

const LOGIN_LOGO = '../assets/images/logo.png';
const LOGIN_URL = '/auth/login'
const Login = ({navigation}) => {
    const {theme} = useContext(ThemeContext);
    const {expoPushToken, registerForPushNotificationsAsync} = useNotification();

    const styles = createStyles(theme);
    const emailRef = useRef("");
    const passwordRef = useRef("");
    const [emailEntry, setEmailEntry] = useState(false);
    const [passwordEntry, setPasswordEntry] = useState(false);
    const [loading, setLoading] = useState(false);
    const [alertErrMassage, setAlertErrMassage] = useState(null);
    const [massageKey, setMassageKey] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    //context ****************************************************************************
    const {storedJwt, setStoredJwt, user, setUser} = useContext(CredentialsContext);
    // Login Submit ***********************************************************************
    const onSubmit = async () => {

        if (!expoPushToken) {
            registerForPushNotificationsAsync();
        }
        ;

        if (!emailRef.current && !passwordRef.current) {
            setEmailEntry(true);
            setPasswordEntry(true);
            setMassageKey(prev => prev + 1);
            setAlertErrMassage('Please fill all fields ');

            return;
        } else if (!emailRef.current) {
            setEmailEntry(true);
            setPasswordEntry(false);
            setMassageKey(prev => prev + 1);
            setAlertErrMassage('Please Enter Your Email to Continue');
            return;
        } else if (!passwordRef.current) {
            setPasswordEntry(true);
            setEmailEntry(false);
            setMassageKey(prev => prev + 1);
            setAlertErrMassage('Please Enter Your Password to Continue ');
            return;
        }

        //API Call for Login token ************************************************************************
        try {
            setLoading(true);
            const response = await axios.post(LOGIN_URL, {
                email: emailRef.current,
                password: passwordRef.current,
                expoPushToken: expoPushToken ? expoPushToken : null,
            });

            if (response.status === 200) {
                //save JWT token to Storage *****************************************************
                AsyncStorage.setItem('jwt', response.headers.get("authorization")).then(
                    setStoredJwt(response.headers.get("authorization"))
                ).catch((error) => {
                    setAlertErrMassage(error);
                });

            } else {
                setMassageKey(prev => prev + 1);
                setAlertErrMassage({response} + 'Invalid Login Attempt');
            }

        } catch (error) {
            if (error.code === 'ECONNABORTED') {
                // Axios hit the configured timeout
                setMassageKey(prev => prev + 1);

                setAlertErrMassage('Request Timed Out \n Please check your network and try again.');
                Vibration.vibrate(10);
            } else if (error.response) {
                // The request was made and the server responded with a status code
                if (error.response.status === 403) {
                    setMassageKey(prev => prev + 1);

                    setAlertErrMassage('Your account is blocked. Pleas contact With SKS ADMIN.');
                } else if (error.response.status === 401) {
                    setMassageKey(prev => prev + 1);

                    setAlertErrMassage('Wrong Email or Password.');

                } else {
                    setMassageKey(prev => prev + 1);

                    setAlertErrMassage('Login failed! \n ' + error.message);
                }
            } else {
                // The request was made but got no response or something else happened
                setMassageKey(prev => prev + 1);

                setAlertErrMassage('Network Error \n please try agan later...');
            }
        } finally {
            setLoading(false);
            setEmailEntry(false);
            setPasswordEntry(false);

        }


    };
    return (
        <View style={styles.container}>
            {/* ALERT BAR */}
            <AlertMassage requestFromInside={false} errorMessage={alertErrMassage} MassageKey={massageKey}
                          background={'white'}/>
            <View>
                <Text style={styles.welcomeText}> Hey, </Text>
                <Text style={styles.welcomeText}> Welcome Back </Text>

            </View>
            <Image
                style={styles.logoImage}
                source={require(LOGIN_LOGO)}
            />
            <View style={styles.form}>


                <Input
                    textContentType="username"
                    autoComplete="email"
                    alertErr={alertErrMassage && (emailEntry)}
                    icon={<MyIcon
                        icon={!emailRef.current && emailEntry ? AlertCircleIcon : MailIcon}
                        size={21}
                        color={!emailRef.current && emailEntry ? theme.colors.red : theme.colors.textLight}

                    />}

                    containerStyle={{height: heightPercentage(7.2),}}
                    placeholder={'Enter Your Email'}
                    onChangeText={value => emailRef.current = value}

                />
                {/*Password Input ____________________________________________________________ */}
                <Input
                    textContentType="password"
                    autoComplete="password"
                    alertErr={alertErrMassage && (passwordEntry)}
                    icon={<MyIcon
                        icon={!passwordRef.current && passwordEntry ? AlertCircleIcon : SquareLockIcon}
                        size={21}
                        color={!passwordRef.current && passwordEntry ? theme.colors.red : theme.colors.textLight}

                    />}
                    containerStyle={{height: heightPercentage(7.2),}}
                    placeholder={'Enter Your Password'}
                    secureTextEntry={!showPassword}
                    onChangeText={value => passwordRef.current = value}
                    passwordIcon={<MyIcon
                        icon={showPassword ? ViewIcon : ViewOffIcon}
                        size={21}
                        color={!passwordRef.current && passwordEntry ? theme.colors.red : theme.colors.textLight}

                        onPress={() => showPassword ? setShowPassword(false) : setShowPassword(true)}
                    />}

                />
                <Text style={styles.forgotPassword}> Forgot Password ? </Text>
                {/*Login Button ____________________________________________________________ */}
                <Button title={'Login'} loading={loading} onPress={onSubmit}/>
                {/*Footer area ____________________________________________________________ */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Don't Have An Account ?
                    </Text>
                    <Pressable onPress={() => navigation.replace('SignUp')}>
                        <Text style={{color: theme.colors.link, fontWeight: theme.fonts.bold}}>Sign Up</Text>
                    </Pressable>
                </View>

            </View>
        </View>

    )
}
export default Login
const createStyles = (theme) => StyleSheet.create({
    container: {
        backgroundColor: theme.colors.white,
        paddingTop: 20,
        flex: 1, gap: 5, paddingHorizontal: widthPercentage(4),
    }, welcomeText: {
        fontSize: heightPercentage(3.5), fontWeight: theme.fonts.bold, color: theme.colors.cyan1,
    }, form: {
        gap: 25, paddingTop: 20,
    }, forgotPassword: {
        textAlign: 'right', fontWeight: theme.fonts.semibold, color: theme.colors.link,
    }, footer: {
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5,
    }, footerText: {
        textAlign: 'center', color: theme.colors.text, fontSize: heightPercentage(1.6),
    },
    logoImage: {
        height: 200,
        width: 200,
        alignSelf: 'center',
        borderRadius: 100,
        top: 5,
    },
});


import {KeyboardAvoidingView, Pressable, StyleSheet, Text, View} from 'react-native'
import React, {useContext, useEffect, useState} from 'react'
import ScrollScreen from "../component/ScrollScreen";
import {heightPercentage, widthPercentage} from "../helpers/common";
import Input from "../component/Input";
import {
    MailIcon,
    SquareLockCheck02Icon,
    SquareLockIcon,
    StudentIcon,
    UserAccountIcon,
    ViewIcon,
    ViewOffIcon,
    WavingHandIcon
} from "@hugeicons/core-free-icons";
import Button from "../component/Button";
import AlertMassage from "../component/AlertMassage";
import axios from "../api/axios";
import SuccessMassage from "../component/SuccessMassage";
import MyIcon from "../component/MyIcons";
import {ThemeContext} from "../contexts/ThemeContext";

const USER_REGEX = /^[a-zA-Z ]{3,24}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\W_])\S{8,35}$/;
const EMAIL_REGEX = /^[a-zA-Z.]{3,50}@st\.uskudar\.edu\.tr$/;
const STUDEN_NUMBER_REGEX = /^[0-9]{9}$/;
const REGISTER_URL = '/auth/register'


const SignUp = ({navigation}) => {
    const {theme} = useContext(ThemeContext);
    const styles = createStyles(theme);
    const [loading, setLoading] = useState(false);
    const [alertErrMassage, setAlertErrMassage] = useState(null);
    const [alertSuccessMassage, setAlertSuccessMassage] = useState(null);
    const [massageKey, setMassageKey] = useState(false);

    //Input Feileds *****************************************************************************
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [studentNumber, setStudentNumber] = useState('');

    //Password Icons  *****************************************************************************
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    //Validation of Input  ************************************************************************
    const [validFirstName, setValidFirstName] = useState(false);
    const [validLastName, setValidLastName] = useState(false);
    const [validPassword, setValidPassword] = useState(false);
    const [validNewPassword, setValidNewPassword] = useState(false);
    const [validEmail, setValidEmail] = useState(false);
    const [validStudentNumber, setValidStudentNumber] = useState(false);


    //First name Validation ********************************************************
    useEffect(() => {
        const result = USER_REGEX.test(firstName);
        setValidFirstName(result);
    }, [firstName]);
    //Last name Validation ********************************************************
    useEffect(() => {
        const result = USER_REGEX.test(lastName);
        setValidLastName(result);
    }, [lastName]);
    //Email Validation ********************************************************
    useEffect(() => {
        const result = EMAIL_REGEX.test(email);
        setValidEmail(result);
    }, [email]);
    //Student number Validation ********************************************************
    useEffect(() => {
        const result = STUDEN_NUMBER_REGEX.test(studentNumber);
        setValidStudentNumber(result);
    }, [studentNumber]);
    //Password Validation ********************************************************
    useEffect(() => {
        const result = PASSWORD_REGEX.test(password);
        setValidPassword(result);
        if (password) {
            const match = password === confirmPassword;
            setValidNewPassword(match);
        }
    }, [password]);
    //Confirm Password Matching  ********************************************************
    useEffect(() => {
        const match = password === confirmPassword;
        setValidNewPassword(match);
    }, [confirmPassword]);

    //Submit Call API SIGN UP **********************************************************
    const onSubmit = async () => {

        //Make sure all inuts are VALID ***************************************************************
        if (!(validEmail && validFirstName && validLastName && validStudentNumber && validPassword && validNewPassword
            && confirmPassword !== '')) {
            setMassageKey(prev => prev + 1);
            setAlertErrMassage('Please fill all fields');
            return;
        }


        //API Call for SIGN UP  ************************************************************************
        try {
            setLoading(true);
            const response = await axios.post(REGISTER_URL,
                JSON.stringify({firstName, lastName, email, password, studentNumber}),
                {
                    headers: {'Content-Type': 'application/json'},
                    withCredentials: true

                });
            setMassageKey(prev => prev + 1);
            setAlertSuccessMassage('You Signed up successfully! \n Navigating to Login Page ...');
            setTimeout(() => {
                //Redirect to Login page  *****************************************************
                navigation.replace('Login');
            }, 2000);

        } catch (error) {
            if (!error?.response) {
                setMassageKey(prev => prev + 1);
                setAlertErrMassage("No Server Response : " + error.response);
            } else if (error.response?.status === 409) {
                setMassageKey(prev => prev + 1);
                setAlertErrMassage('User already Exists! \n Please try to Login ');
            } else {
                setMassageKey(prev => prev + 1);
                setAlertErrMassage('Network Error \n please try agan later...');
            }


        } finally {
            setLoading(false);
            const empty = "";
            setFirstName(empty);
            setLastName(empty);
            setEmail(empty);
            setStudentNumber(empty);
            setPassword(empty);
            setConfirmPassword(empty);
            setAlertErrMassage(empty);
            // setAlertSuccessMassage(empty);
        }


    };
    return (
        <View style={styles.container}>
            <SuccessMassage requestFromInside={false} successMessage={alertSuccessMassage} MassageKey={massageKey}
                            background={'white'}/>
            <AlertMassage requestFromInside={false} errorMessage={alertErrMassage} MassageKey={massageKey}
                          background={'white'}/>

            <View style={{padding: 15}}>
                <Text style={styles.welcomeText}> Welcome
                    <MyIcon
                        icon={WavingHandIcon}
                        color={theme.colors.cyan1}
                        size={30}

                    />
                </Text>
                <Text
                    style={{
                        fontSize: 17,
                        color: theme.colors.text
                    }}>
                    Please Enter Your Student Details to Continue
                </Text>

            </View>
            <ScrollScreen>
                <KeyboardAvoidingView>
                    <View style={styles.form}>

                        <View style={styles.fullNameContainer}>

                            {/*First Name Input ____________________________________________________________ */}
                            <Input
                                containerStyle={{height: heightPercentage(7.2),}}
                                value={firstName}
                                alertErr={(firstName === '' ? false : !validFirstName)}
                                textAlert={(firstName === '' ?
                                    false
                                    :
                                    (validFirstName ? false : '3 to 24 characters Only letters are allowed.'))}
                                icon={<MyIcon
                                    icon={UserAccountIcon}
                                    size={25}
                                    color={(firstName === '' ?
                                        theme.colors.textLight
                                        :
                                        (validFirstName ? theme.colors.textLight : theme.colors.red))}

                                />}
                                placeholder={'First Name'}
                                onChangeText={(text) => setFirstName(text)}
                                style={{width: widthPercentage(33), color: theme.colors.text}}
                            />

                            {/*Last Name Input ____________________________________________________________ */}
                            <Input
                                containerStyle={{height: heightPercentage(7.2),}}
                                value={lastName}
                                alertErr={(lastName === '' ? false : !validLastName)}
                                textAlert={(lastName === '' ?
                                    false
                                    :
                                    (validLastName ? false : '3 to 24 characters Only letters are allowed.'))}
                                icon={<MyIcon
                                    icon={UserAccountIcon}
                                    size={25}
                                    color={(lastName === '' ?
                                        theme.colors.textLight
                                        :
                                        (validLastName ? theme.colors.textLight : theme.colors.red))}

                                />}
                                placeholder={'Last Name'}
                                onChangeText={(text) => setLastName(text)}
                                style={{width: widthPercentage(33), color: theme.colors.text}}
                            />
                        </View>

                        {/*Email Input ____________________________________________________________ */}

                        <Input
                            containerStyle={{height: heightPercentage(7.2),}}
                            value={email}
                            alertErr={(email === '' ? false : !validEmail)}
                            textAlert={(email === '' ?
                                false
                                :
                                (validEmail ? false : '3 to 24 characters. ' +
                                    'Only letters and the special character DOT . are allowed  ' +
                                    ' must use your University Student email ' +
                                    'Email@st.uskudar.edu.tr'))}
                            icon={<MyIcon
                                icon={MailIcon}
                                size={25}
                                color={(email === '' ?
                                    theme.colors.textLight
                                    :
                                    (validEmail ? theme.colors.textLight : theme.colors.red))}

                            />}
                            placeholder={'Email'}
                            onChangeText={(text) => setEmail(text)}
                        />
                        {/*Student Number Input ____________________________________________________________ */}

                        <Input
                            containerStyle={{height: heightPercentage(7.2),}}
                            value={studentNumber}
                            alertErr={(studentNumber === '' ? false : !validStudentNumber)}
                            textAlert={(studentNumber === '' ?
                                false
                                :
                                (validStudentNumber ? false : ' Only 10 numbers are allowed ' +
                                    ' must use your University Student Number'))}
                            icon={<MyIcon
                                icon={StudentIcon}
                                size={25}
                                color={(studentNumber === '' ?
                                    theme.colors.textLight
                                    :
                                    (validStudentNumber ? theme.colors.textLight : theme.colors.red))}

                            />}
                            placeholder={'Student Number'}
                            onChangeText={(text) => setStudentNumber(text)}

                        />
                        {/*Password Input ____________________________________________________________ */}
                        <Input
                            containerStyle={{height: heightPercentage(7.2),}}
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
                            placeholder={'Password'}
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
                        {/*Confirm Password Input ____________________________________________________________ */}

                        <Input
                            containerStyle={{height: heightPercentage(7.2),}}
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
                            placeholder={'Confirm Your Password'}
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
                        {/*Signup Button ____________________________________________________________ */}
                        <View style={{padding: 20}}>
                            <Button title={'Sign Up'} loading={loading} onPress={onSubmit}/>
                        </View>
                        {/*Footer area ____________________________________________________________ */}
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>
                                Already Have An Account ?
                            </Text>
                            <Pressable onPress={() => navigation.replace('Login')}>
                                <Text style={{color: '#3255ff', fontWeight: theme.fonts.bold}}>Login</Text>
                            </Pressable>
                        </View>

                    </View>
                </KeyboardAvoidingView>
            </ScrollScreen>
        </View>


    )
}
export default SignUp
const createStyles = (theme) => StyleSheet.create({
    container: {
        paddingTop: 20,
        paddingHorizontal: 10,
        flex: 1,
        backgroundColor: theme.colors.white,

    },
    welcomeText: {
        fontSize: heightPercentage(4),
        fontWeight: theme.fonts.bold,
        color: theme.colors.primary,
    },
    form: {
        gap: 20,
        top: 30,
    },
    forgotPassword: {
        textAlign: 'right',
        fontWeight: theme.fonts.semibold,
        color: '#3255ff',
    },
    fullNameContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',

    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5,
    },
    footerText: {
        textAlign: 'center',
        color: theme.colors.text,
        fontSize: heightPercentage(1.6),
    },
});


import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import React, {useContext, useEffect, useRef, useState} from 'react'
import ScrollScreen from "../../../../component/ScrollScreen";
import Input from "../../../../component/Input";
import {
    CameraIcon,
    Delete02Icon,
    Image03Icon,
    MailIcon,
    StudentIcon,
    UserAccountIcon,
} from "@hugeicons/core-free-icons";
import Button from "../../../../component/Button";
import axios from "../../../../api/axios";
import * as ImagePicker from "expo-image-picker";
import {storage} from "../../../../api/Firebase";
import {getDownloadURL, ref, uploadBytesResumable} from "firebase/storage";
import Loading from "../../../../component/Loading";

import {USER_DEFAULT_IMAGE} from "../../../../constants/DefaultConstants";
import MyIcon from "../../../../component/MyIcons";
import {ThemeContext} from "../../../../contexts/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {getUserData} from "../../../../api/ConstantsApiCalls";


const USER_REGEX = /^[a-zA-Z ]{3,24}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\W_])\S{8,35}$/;
const EMAIL_REGEX = /^[a-zA-Z.]{3,50}@st\.uskudar\.edu\.tr$/;
const STUDEN_NUMBER_REGEX = /^[0-9]{9}$/;
const UPDATE_USER_URL = '/auth/updateUser'
const EditProfile = ({
                         user ,
                         openImagePopover,
                         onClose,
                         storedJwt,
                         openAlertMassage,
                         setCloseConfirmation,
                         openSuccessMassage,
                         onUserChange,
                         handleLogout
                     }) => {
    const {theme} = useContext(ThemeContext);
    const styles = createStyles(theme);

    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [loading, setLoading] = useState(false);
    const [alertErrMassage, setAlertErrMassage] = useState(null);
    const [alertSuccessMassage, setAlertSuccessMassage] = useState(null);
    const [massageKey, setMassageKey] = useState(null);

    //Input Feileds *****************************************************************************
    const [firstName, setFirstName] = useState(user ? user.firstName : '');
    const [lastName, setLastName] = useState(user ? user.lastName : '');
    const [email, setEmail] = useState(user ? user.email : '');
    const [studentNumber, setStudentNumber] = useState(user ? user.studentNumber : '');
    const [profilePicURL, setProfilePicURL] = useState(user.profilePicURL ? user.profilePicURL
        :
        USER_DEFAULT_IMAGE);
    const [newProfilePicURL, setNewProfilePicURL] = useState(null);
    const isFirstRender = useRef(true);

    //Validation of Input  ************************************************************************
    const [validFirstName, setValidFirstName] = useState(true);
    const [validLastName, setValidLastName] = useState(true);
    const [validEmail, setValidEmail] = useState(true);
    const [validStudentNumber, setValidStudentNumber] = useState(true);

    /*
On event input fields change trigger close popover
 with confirmation and without first render *******************************************************
*/
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false; // Mark first render as handled
            return; // Skip effect on mount
        }
        setCloseConfirmation(true);

    }, [firstName, lastName, email, studentNumber, profilePicURL]);

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
    // New Profile Image Uploading to Firebase
    useEffect(() => {
        const uploadFile = async (file) => {
            try {
                setLoading(true);

                // Extract filename from URI
                const filename = file.uri.split('/').pop();
                const extension = filename.split('.').pop();
                const newName = `${Date.now()}.${extension}`;

                // Convert URI to blob
                const response = await fetch(file.uri);
                const blob = await response.blob();

                const storageRef = ref(storage, `images/${newName}`);
                const uploadTask = uploadBytesResumable(storageRef, blob);

                uploadTask.on('state_changed',
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        console.log(`Upload progress: ${progress}%`);
                    },
                    (error) => {
                        console.error('Upload Error:', error);
                        setLoading(false);
                    },
                    async () => {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        setProfilePicURL(downloadURL);
                        setNewProfilePicURL(null);
                        console.log(downloadURL);
                        setLoading(false);
                    }
                );
            } catch (error) {
                console.error('Upload Failed:', error);
                setLoading(false);
            }
        };

        if (newProfilePicURL?.uri) {
            uploadFile(newProfilePicURL);
            setAlertErrMassage("Don't Forget to Save Changes");
        }
    }, [newProfilePicURL]);
    //Submit Call API UPDATE USER DATA **********************************************************
    const onSubmit = async () => {

        // Add null checks for validation states
        if (!(validEmail && validFirstName && validLastName && validStudentNumber)) {
            openAlertMassage('Please fill all fields');
            return;
        }

        try {
            setLoadingSubmit(true);

            const response = await axios.post(UPDATE_USER_URL, {
                firstName,
                lastName,
                email,
                studentNumber,
                profilePicURL
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${storedJwt}`
                },
                withCredentials: true
            });
            const userData = await getUserData(storedJwt, handleLogout);

            if (userData) {
                onUserChange(userData);
                await AsyncStorage.setItem("userData", JSON.stringify(userData));
            }


            openSuccessMassage('Your Data was Updated Successfully!');
            onClose();
        } catch (error) {
            console.error('Submission error:', error);
            if (!error.response) {
                openAlertMassage("No Server Response");
            } else if (error.response.status === 409) {
                openAlertMassage('Student Number already in Use!');
            } else {
                openAlertMassage('Update Failed. Please try again later.');
            }
        } finally {
            setLoadingSubmit(false);

        }

    };


    const imageFromCamera = async () => {
        try {
            await ImagePicker.requestCameraPermissionsAsync();
            const result = await ImagePicker.launchCameraAsync({
                CameraType: ImagePicker.CameraType.front,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const selectedAsset = result.assets[0];
                setNewProfilePicURL({
                    uri: selectedAsset.uri,
                    name: selectedAsset.fileName || `photo_${Date.now()}.jpg`,
                    type: selectedAsset.type || 'image/jpeg'
                });
            }
        } catch (error) {
            console.error('Camera Error:', error);
            setAlertErrMassage(error.message);
        }
    };
    const imageFromStudio = async () => {
        try {
            await ImagePicker.requestMediaLibraryPermissionsAsync();
            const result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                aspect: [1, 1],
                allowsMultipleSelection: false,
                mediaTypes: "images",

            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const selectedAsset = result.assets[0];
                setNewProfilePicURL({
                    uri: selectedAsset.uri,
                    name: selectedAsset.fileName || `photo_${Date.now()}.jpg`,
                    type: selectedAsset.type || 'image/jpeg'
                });
            }
        } catch (error) {
            console.error('Camera Error:', error);
            setAlertErrMassage(error.message);
        }
    };
    const deleteProfileImage = () => {
        setProfilePicURL('');
        setNewProfilePicURL(null);
    }
    return (
        <>
            <ScrollScreen>
                <View style={styles.profileCard}>

                    <TouchableOpacity onPress={() =>
                        openImagePopover(
                            profilePicURL ? profilePicURL : USER_DEFAULT_IMAGE
                        )
                    } style={styles.avatar}>
                        {loading ?
                            <Loading backgroundColor={'transparent'} screenSize={20} size={'large'}/>
                            :
                            <Image
                                source={
                                    {uri: (profilePicURL ? profilePicURL : USER_DEFAULT_IMAGE)}}

                                style={styles.avatar}
                            />
                        }
                    </TouchableOpacity>
                    <View style={styles.ImageEditingContainer}>
                        {/*Open Camera --------------------------------------------------------------------------------- */}
                        <TouchableOpacity style={styles.editPicIconCamera}
                                          onPress={imageFromCamera}>
                            <MyIcon
                                icon={CameraIcon}
                                size={25}
                                color={'white'}

                            />
                        </TouchableOpacity>
                        {/*from Phone photos  Camera --------------------------------------------------------------------------------- */}
                        <TouchableOpacity style={styles.editPicIconUpload}
                                          onPress={imageFromStudio}>
                            <MyIcon
                                icon={Image03Icon}
                                size={25}
                                color={'white'}

                            />
                        </TouchableOpacity>
                        {/*Delete image  --------------------------------------------------------------------------------- */}
                        {user.profilePicURL &&
                            <TouchableOpacity style={styles.editPicIconDelete}
                                              onPress={deleteProfileImage}>
                                <MyIcon
                                    icon={Delete02Icon}
                                    size={25}
                                    color={'white'}

                                />
                            </TouchableOpacity>}
                    </View>
                </View>

                <View style={styles.form}>


                    {/*First Name Input ____________________________________________________________ */}
                    <Text style={styles.lableText}>First Name</Text>
                    <Input
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
                                theme.colors.text
                                :
                                (validFirstName ? theme.colors.text : theme.colors.red))}

                        />}
                        placeholder={'First Name'}
                        onChangeText={(text) => setFirstName(text)}
                    />

                    {/*Last Name Input ____________________________________________________________ */}
                    <Text style={styles.lableText}>Last Name</Text>

                    <Input
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
                                theme.colors.text
                                :
                                (validLastName ? theme.colors.text : theme.colors.red))}

                        />}
                        placeholder={'Last Name'}
                        onChangeText={(text) => setLastName(text)}

                    />


                    {/*Email Input ____________________________________________________________ */}
                    <Text style={styles.lableText}>Email</Text>

                    <Input
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
                                theme.colors.text
                                :
                                (validEmail ? theme.colors.text : theme.colors.red))}

                        />}
                        placeholder={'Email'}
                        onChangeText={(text) => setEmail(text)}
                    />
                    {/*Student Number Input ____________________________________________________________ */}
                    <Text style={styles.lableText}>Student Number </Text>

                    <Input
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
                                theme.colors.text
                                :
                                (validStudentNumber ? theme.colors.text : theme.colors.red))}

                        />}
                        placeholder={'Student Number'}
                        onChangeText={(text) => setStudentNumber(text)}
                    />

                    {/*Submit Button ____________________________________________________________ */}
                    <View style={{padding: 20}}>
                        {!loading ?
                            <Button title={'Save Changes'}
                                    loading={loadingSubmit}
                                    onPress={() => onSubmit()}
                                    isAllowed={false}

                            />
                            :
                            <Button title={'Uploading ...'}
                                    buttonStyle={{backgroundColor: theme.colors.red}}

                            />}

                    </View>
                </View>


            </ScrollScreen>

        </>
    )
}
export default EditProfile
const createStyles = (theme) => StyleSheet.create({

    profileCard: {
        alignItems: "center",
        backgroundColor: theme.colors.white,

    },
    fullSizeImage: {},
    avatar: {
        width: 150,
        height: 150,
        borderRadius: 75,
        borderColor: theme.colors.gray1,
        borderWidth: 0.5,
        borderStyle: 'solid',
    },
    editPicIconCamera: {
        alignItems: "center",
        width: 40,
        height: 40,
        padding: 7.5,
        backgroundColor: 'rgb(92,92,92)',
        borderRadius: 25,
        top: 10,

    },
    editPicIconUpload: {
        alignItems: "center",
        width: 40,
        height: 40,
        padding: 7.5,
        // backgroundColor:'#b5b5b5',
        backgroundColor: theme.colors.primary,
        borderRadius: 25,
        top: 10,

    },
    editPicIconDelete: {
        alignItems: "center",
        width: 40,
        height: 40,
        padding: 7.5,
        backgroundColor: theme.colors.red,
        borderRadius: 25,
        top: 10,

    },
    ImageEditingContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 30,

    },
    form: {
        top: 20,
        gap: 5,
        backgroundColor: theme.colors.white,

    },

    fullNameContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',

    },
    lableText: {
        bottom: 0,
        color: theme.colors.text
    }
})

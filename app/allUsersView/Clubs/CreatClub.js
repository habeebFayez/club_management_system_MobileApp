import {FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import React, {useContext, useEffect, useRef, useState} from 'react'
import {CLUB_DEFAULT_IMAGE, USER_DEFAULT_IMAGE} from "../../../constants/DefaultConstants";
import {getDownloadURL, ref, uploadBytesResumable} from "firebase/storage";
import {storage} from "../../../api/Firebase";
import * as ImagePicker from "expo-image-picker";
import ScrollScreen from "../../../component/ScrollScreen";
import {
    CancelCircleIcon,
    CheckmarkCircle02Icon,
    MailIcon,
    PencilEditIcon,
    UserAccountIcon,
    UserIcon,
    WhatsappIcon
} from "@hugeicons/core-free-icons";
import Input from "../../../component/Input";
import Button from "../../../component/Button";
import {heightPercentage, openModalFun, widthPercentage} from "../../../helpers/common";
import {ModalContext} from "../../../contexts/ModalContext";
import {CreatClubByAdmin, CreatClubByStudent, getAllCategories, getAllUsers} from "../../../api/ConstantsApiCalls";
import CategoryMultiSelect from "../../../component/CategoryMultiSelect";
import * as Progress from 'react-native-progress';
import MyIcon from "../../../component/MyIcons";
import {ThemeContext} from "../../../contexts/ThemeContext";
import Loading from "../../../component/Loading";
import {useNotification} from "../../../contexts/NotificationsContext";



const USER_REGEX = /^[a-zA-Z ]{3,24}$/;
const CLUB_EMAIL_REGEX = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/;
const CLUB_CONTACT_NUMBER_REGEX = /^[0-9]{14}$/;
const DESCRIPTION_REGEX = /^[\s\S]{1,5000}$/;


const CreatClub = ({
                       user, club, openImagePopover, storedJwt, openAlertMassage, onClose,
                       navigation, openSuccessMassage, userRole, setCloseConfirmation
                   }) => {
    const {theme} = useContext(ThemeContext);
    const styles = createStyles(theme);
    const { refreshData} = useNotification();
    const [loading, setLoading] = useState(false);
    const isFirstRender = useRef(true);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadProgressLoadingCoverPic, setUploadProgressLoadingCoverPic] = useState(false);
    const [uploadProgressLoadingProfilePic, setUploadProgressLoadingProfilePic] = useState(false);

    //FOR ADMIN ONLY USE  *************************************************************************
    const isAdmin = userRole === 'ADMIN';
    const [searchText, setSearchText] = useState('');
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);

    //Context   *************************************************************************
    const {
        openModal, showModal, setShowModal, setModalTitle
    } = useContext(ModalContext);
    //Input Feileds *****************************************************************************
    const [clubName, setClubName] = useState('');
    const [clubManager, setClubManager] = useState(null);
    const [email, setEmail] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [profilePicURL, setProfilePicURL] = useState('');
    const [coverPicURL, setCoverPicURL] = useState('');
    const [clubDescription, setClubDescription] = useState('');
    const [clubCategories, setClubCategories] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);

    //Validation of Input  ************************************************************************
    const [validClubName, setValidClubName] = useState(true);
    const [validEmail, setValidEmail] = useState(true);
    const [validContactNumber, setValidContactNumber] = useState(true);
    const [validClubDescription, setValidClubDescription] = useState(true);

    /*
        On Club input fields change trigger close popover
         with confirmation and without first render *******************************************************
        */
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false; // Mark first render as handled
            return; // Skip effect on mount
        }

        setCloseConfirmation(true);

    }, [
        clubName, clubManager, email, contactNumber, profilePicURL,
        coverPicURL, clubDescription, selectedCategories]);
    //club Name Validation ********************************************************
    useEffect(() => {
        const result = USER_REGEX.test(clubName);
        setValidClubName(result);
    }, [clubName]);
    //Email Validation ********************************************************
    useEffect(() => {
        const result = CLUB_EMAIL_REGEX.test(email);
        setValidEmail(result);
    }, [email]);
    //contact Number  Validation ********************************************************
    useEffect(() => {
        const result = CLUB_CONTACT_NUMBER_REGEX.test(contactNumber);
        setValidContactNumber(result);
    }, [contactNumber]);
    // Profile Image Uploading to Firebase ********************************************************
    useEffect(() => {
        const uploadFile = async (file) => {
            try {
                setUploadProgressLoadingProfilePic(true);

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
                        setUploadProgress(progress.toFixed(0));
                        console.log('Upload is ' + progress + '% done')
                    },
                    (error) => {
                        console.error('Upload Error:', error);
                        setUploadProgressLoadingProfilePic(false);
                    },
                    async () => {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        setProfilePicURL(downloadURL);
                        setUploadProgressLoadingProfilePic(false);
                    }
                );
            } catch (error) {
                console.error('Uploading Profile Image Failed:', error);
                setUploadProgressLoadingProfilePic(false);
            }
        };

        if (profilePicURL?.uri) {
            uploadFile(profilePicURL);
            openSuccessMassage("Don't Forget to Save Changes");
        }
    }, [profilePicURL]);
    //club Description Validation ********************************************************
    useEffect(() => {
        const result = DESCRIPTION_REGEX.test(clubDescription);
        setValidClubDescription(result);

    }, [clubDescription]);
    //  Cover Image Uploading to Firebase ********************************************************
    useEffect(() => {
        const uploadFile = async (file) => {
            try {
                setUploadProgressLoadingCoverPic(true);

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
                        setUploadProgress(progress.toFixed(0));
                    },
                    (error) => {
                        console.error('Upload Error:', error);
                        setUploadProgressLoadingCoverPic(false);
                    },
                    async () => {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        setCoverPicURL(downloadURL);
                        setUploadProgressLoadingCoverPic(false);
                    }
                );
            } catch (error) {
                console.error('Uploading Cover Image Failed:', error);
                setUploadProgressLoadingCoverPic(false);
            }
        };

        if (coverPicURL?.uri) {
            uploadFile(coverPicURL);
            openSuccessMassage("Don't Forget to Save Changes");
        }
    }, [coverPicURL]);
    //Users search Filtration  ********************************************************
    useEffect(() => {
        if (user && userRole === 'ADMIN' && searchText) {
            const query = searchText.toLowerCase();
            // Filter the users
            const newFiltered = users.filter((user) => {
                const name = (user.firstName + ' ' + user.lastName).toLowerCase();
                const email = user.email.toLowerCase();
                const studentNumber = user.studentNumber || '';
                const role = user.authority.authorityName;
                const isActive = user.active === true;

                return (
                    // Does the name, email, or student number match
                    (name.includes(query) || email.includes(query) || studentNumber.includes(query)) &&
                    // Exclude if the role is admin or manager
                    !role.includes('ROLE_ADMIN') &&
                    !role.includes('ROLE_MANAGER')
                    && isActive
                );
            });

            setFilteredUsers(newFiltered);
        }
    }, [searchText, users, user]);
    //Get All  Categories Call API  **********************************************************
    useEffect(() => {
        (async () => {
            setLoading(true);
            const data = await getAllCategories(storedJwt, user, openSuccessMassage, openAlertMassage);
            if (data) setAllCategories(data);
            setLoading(false);
        })();

    }, [storedJwt,refreshData, user]);

    //Submit Call API UPDATE USER DATA **********************************************************
    const onSubmit = () => {
        //  null checks for validation states
        if (!(validEmail && validClubName && validContactNumber && validClubDescription)) {
            openAlertMassage('Please fill all fields');
            return;
        }
        if (!selectedCategories.length > 0) {
            openAlertMassage("You Must Choose one Category at least !! ");
            return;
        }
        const clubToSend = {
            clubName: clubName,
            clubDescription: clubDescription,
            clubCoverPicURL: coverPicURL,
            contactEmail: email,
            contactNumber: contactNumber,
            clubProfilePicURL: profilePicURL,
        };

        if ((userRole === 'ADMIN')) {
            if (clubManager === null) {
                openAlertMassage("You Must Choose Club Manager to Continue!! ");
                return;
            }
        }
        (async () => {
            if (userRole === 'ADMIN') {
                setLoading(true);
                const response = await CreatClubByAdmin(storedJwt, user,
                    openSuccessMassage, openAlertMassage, clubManager, clubToSend, selectedCategories);
                if (response) {
                    openSuccessMassage('Club was Created successfully.');
                    onClose();
                    // navigation.navigate('ClubProfile', { club: clubCard,user:user,backTitle:'Clubs' })
                }
                setLoading(false);
            } else if ((userRole === 'STUDENT')) {
                if (!coverPicURL || !profilePicURL) {
                    openAlertMassage("You must Upload Logo and cover images to continue !!! ");
                    return;
                }
                setLoading(true);
                const response = await CreatClubByStudent(storedJwt, user,
                    openSuccessMassage, openAlertMassage, clubToSend, selectedCategories);
                if (response) {
                    openSuccessMassage('Club Creation Request Was Sent successfully.');
                    onClose();

                }
                setLoading(false);
            } else {
                openAlertMassage('You already has a Club with the Name :', club?.clubName?.toUpperCase())
            }
            setLoading(false);
        })();
    }


    //Get All users Call API  **********************************************************
    useEffect(() => {

        (async () => {
            setLoading(true);
            const data = await getAllUsers(storedJwt, user, openSuccessMassage, openAlertMassage);
            if (data) setUsers(data);
            setLoading(false);


        })();
    }, [storedJwt,refreshData, userRole, user]);

    //Image Edit  **********************************************************
    const imageFromCamera = async (isProfileImage) => {
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
                isProfileImage ?
                    setProfilePicURL({
                        uri: selectedAsset.uri,
                        name: selectedAsset.fileName || `photo_${Date.now()}.jpg`,
                        type: selectedAsset.type || 'image/jpeg'
                    })
                    :
                    setCoverPicURL({
                        uri: selectedAsset.uri,
                        name: selectedAsset.fileName || `photo_${Date.now()}.jpg`,
                        type: selectedAsset.type || 'image/jpeg'
                    })
                setShowModal(false);
            }
        } catch (error) {
            console.error('Camera Error:', error);
            openAlertMassage(error.message);
        }
    };
    const imageFromStudio = async (isProfileImage) => {
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
                if (isProfileImage) {
                    setProfilePicURL({
                        uri: selectedAsset.uri,
                        name: selectedAsset.fileName || `photo_${Date.now()}.jpg`,
                        type: selectedAsset.type || 'image/jpeg'
                    })
                } else {
                    setCoverPicURL({
                        uri: selectedAsset.uri,
                        name: selectedAsset.fileName || `photo_${Date.now()}.jpg`,
                        type: selectedAsset.type || 'image/jpeg'
                    })
                }
                setShowModal(false);
            }
        } catch (error) {
            console.error('Camera Error:', error);
            openAlertMassage(error.message);
        }
    };
    const deleteProfileImage = (isProfileImage) => {
        if (isProfileImage) {
            setProfilePicURL('');
            setShowModal(false);
        } else {
            setCoverPicURL('');
        }
        setShowModal(false);
    }
    const openModalFunctionClub = (isProfileImage) => {
        if (!showModal) {
            openModal(
                openModalFun(isProfileImage, imageFromCamera, imageFromStudio,
                    deleteProfileImage, profilePicURL || coverPicURL)
                , true
            );
            setModalTitle(isProfileImage ? 'Change Profile Image' : 'Change Cover Image');
        } else {
            setShowModal(false);
        }
    }
//List Of filtered users VIEW IN FLAT LIST  **************************************************************************
    const showClubManager = (Manager) => {
        if (Manager === null) return;

        return (
            <View style={styles.ManagerViewContainer}>
                <TouchableOpacity
                    style={styles.clubManagerProfile}
                    activeOpacity={0.8}
                    // onPress={()=>
                    // openImagePopover(
                    //     clubManager.profilePicURL?clubManager.profilePicURL:CLUB_DEFAULT_IMAGE
                    // )}
                >
                    <Image
                        source={
                            {uri: (Manager.profilePicURL ? Manager.profilePicURL : CLUB_DEFAULT_IMAGE)}}

                        style={styles.userAvatar}
                    />
                    <View style={styles.clubManagerProfileTextContainer}>
                        <Text style={styles.clubManagerProfileTextName}>
                            {Manager.firstName.toUpperCase() + ' ' + Manager.lastName.toUpperCase()}
                        </Text>
                        <Text style={styles.clubManagerProfileTextStudentNumber}>
                            S.N : {Manager.studentNumber}
                        </Text>
                    </View>
                </TouchableOpacity>

                {isAdmin &&
                    <TouchableOpacity
                        onPress={() => setClubManager(null)}
                    >
                        <MyIcon
                            icon={CancelCircleIcon}
                            size={25}
                            color={theme.colors.red}

                        />
                    </TouchableOpacity>}
            </View>)

    }
//List Of filtered users VIEW IN FLAT LIST  **************************************************************************
    const renderUserItem = ({item}) => {
        return (
            <TouchableOpacity
                style={styles.searchResultItem}
                onPress={() => {
                    setClubManager(item);
                    setSearchText(null);
                }}
            >
                <Image
                    style={styles.resultImage}
                    source={{uri: item.profilePicURL || USER_DEFAULT_IMAGE}}
                />
                <View style={{marginLeft: 8}}>
                    <Text style={styles.resultName}>
                        {(item.firstName + ' ' + item.lastName).toUpperCase()}
                    </Text>
                    <Text style={styles.resultSubtitle}>
                        Student Number: {item.studentNumber}
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.addManager}
                    onPress={() => {
                        setClubManager(item);
                        setSearchText(null);
                    }}
                >
                    <MyIcon
                        icon={CheckmarkCircle02Icon}
                        size={30}
                        color={theme.colors.green}

                    />
                </TouchableOpacity>
            </TouchableOpacity>
        )
    }

    return (
        <>
            <ScrollScreen>

                <View style={styles.profileCard}>

                    {/*PROFILE IMAGE  -----------------------------------------------------------------------------*/}
                    <View style={styles.profileCardImages}>
                        <Text style={styles.profileCardImagesText}> Profile Image</Text>
                        <TouchableOpacity onPress={() =>
                            !uploadProgressLoadingProfilePic && profilePicURL && openImagePopover(
                                profilePicURL
                            )
                        }>
                            <View style={styles.avatar}>
                                {uploadProgressLoadingProfilePic ?

                                    <Progress.Circle size={75} progress={uploadProgress / 100} showsText={true}
                                                     formatText={() => uploadProgress.toString() + '%'}
                                                     color={theme.colors.primary}/>
                                    :
                                    <>
                                        <Image
                                            source={
                                                {uri: (profilePicURL ? profilePicURL : CLUB_DEFAULT_IMAGE)}}
                                            onLoadStart={() => setLoading(true)}
                                            onLoadEnd={() => setLoading(false)}
                                            onError={() => setLoading(false)}
                                            style={styles.avatar}

                                        />
                                        {loading &&
                                            <Loading screenSize={0}/>
                                        }
                                    </>
                                }
                            </View>


                        </TouchableOpacity>
                        {!uploadProgressLoadingCoverPic && !uploadProgressLoadingProfilePic &&
                            <TouchableOpacity style={styles.editProfileImage}
                                              onPress={() => openModalFunctionClub(true)}
                            >
                                <MyIcon
                                    icon={PencilEditIcon}
                                    size={25}
                                    color={'white'}
                                />
                            </TouchableOpacity>}
                    </View>

                    {/*COVER IMAGE  -----------------------------------------------------------------------------*/}
                    <View style={styles.profileCardImages}>
                        <Text style={styles.profileCardImagesText}> Cover Image</Text>
                        <TouchableOpacity onPress={() =>
                            !uploadProgressLoadingCoverPic && coverPicURL && openImagePopover(
                                coverPicURL
                            )
                        }>
                            <View style={styles.avatar}>
                                {uploadProgressLoadingCoverPic ?

                                    <Progress.Circle size={75} progress={uploadProgress / 100} showsText={true}
                                                     formatText={() => uploadProgress.toString() + '%'}
                                                     color={theme.colors.primary}/>
                                    :
                                    <>
                                        <Image
                                            source={{uri: (coverPicURL ? coverPicURL : CLUB_DEFAULT_IMAGE)}}
                                            onLoadStart={() => setLoading(true)}
                                            onLoadEnd={() => setLoading(false)}
                                            onError={() => setLoading(false)}
                                            style={styles.avatar}

                                        />
                                        {loading && <Loading screenSize={0}/>}
                                    </>
                                }
                            </View>


                        </TouchableOpacity>
                        {!uploadProgressLoadingCoverPic && !uploadProgressLoadingProfilePic &&
                            <TouchableOpacity style={styles.editProfileImage}
                                              onPress={() => openModalFunctionClub(false)}
                            >
                                <MyIcon
                                    icon={PencilEditIcon}
                                    size={25}
                                    color={'white'}
                                />
                            </TouchableOpacity>}
                    </View>

                </View>
                <View>

                </View>
                <View style={styles.form}>

                    {/*Club Manager Input ________________________________________ONLY ADMIN_____ */}
                    <Text style={styles.lableText}>Club Manager</Text>
                    <Input
                        editable={isAdmin}
                        alertErr={(clubManager === null)}
                        icon={<MyIcon
                            icon={UserIcon}
                            size={25}
                            color={(clubManager !== null ?
                                theme.colors.textLight
                                :
                                theme.colors.red)}

                        />}
                        placeholder={userRole === 'ADMIN' && !clubManager ? "Search by name, email, student number..." : ''}
                        onChangeText={(text) => setSearchText(text)}
                        children={showClubManager(isAdmin ? clubManager : user)}
                        list={(searchText && isAdmin) ? (
                            filteredUsers?.length ? (

                                <FlatList
                                    renderScrollComponent={props =>
                                        <ScrollView style={styles.dropdownContainer}></ScrollView>}
                                    scrollEnabled={false}
                                    data={filteredUsers}
                                    keyExtractor={(item, index) => String(item?.email || index)}
                                    renderItem={renderUserItem}
                                    style={styles.dropdownContainer}
                                />
                            ) : (
                                <TouchableOpacity
                                    style={styles.searchResultItem}>
                                    <Text style={styles.noResultsText}>No Users Found</Text>
                                </TouchableOpacity>
                            )
                        ) : null}
                    />


                    {/*Club Name Input ____________________________________________________________ */}
                    <Text style={styles.lableText}>Club Name</Text>
                    <Input
                        value={clubName}
                        alertErr={(clubName === '' ? false : !validClubName)}
                        textAlert={(clubName === '' ?
                            false
                            :
                            (validClubName ? false : '3 to 24 characters Only letters are allowed.'))}
                        icon={<MyIcon
                            icon={UserAccountIcon}
                            size={25}
                            color={(clubName === '' ?
                                theme.colors.textLight
                                :
                                (validClubName ? theme.colors.textLight : theme.colors.red))}

                        />}
                        placeholder={'Club Name'}
                        onChangeText={(text) => setClubName(text)}
                    />

                    {/*Email Input ____________________________________________________________ */}
                    <Text style={styles.lableText}>Email</Text>

                    <Input
                        value={email}
                        alertErr={(email === '' ? false : !validEmail)}
                        textAlert={(email === '' ?
                            false
                            :
                            (validEmail ? false : ' Pleas Enter a valid Email '))}
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
                    {/*Contact Number Input ____________________________________________________________ */}
                    <Text style={styles.lableText}>WhatsApp Number </Text>
                    <Input
                        value={contactNumber}
                        alertErr={(contactNumber === '' ? false : !validContactNumber)}
                        textAlert={(contactNumber === '' ?
                            false
                            :
                            (validContactNumber ? false : ' Only 14 numbers are allowed ' +
                                ' Please add 00 then yor country code then yor number '))}
                        icon={<MyIcon
                            icon={WhatsappIcon}
                            size={25}
                            color={(contactNumber === '' ?
                                theme.colors.green
                                :
                                (validContactNumber ? theme.colors.green : theme.colors.red))}

                        />}
                        placeholder={'Contact Number'}
                        onChangeText={(text) => setContactNumber(text)}
                    />
                    {/*Club Categories Input ____________________________________________________________ */}
                    <Text style={styles.lableText}>Club Categories </Text>
                    <CategoryMultiSelect
                        data={allCategories}
                        selectedCategories={clubCategories}
                        setSelectedCategories={setSelectedCategories}
                    />

                    {/*Club Description About Bio Input ____________________________________________________________ */}
                    <Text style={styles.lableText}>About Your CLub </Text>

                    <Input
                        multiline
                        containerStyle={{
                            height: heightPercentage(30),
                            paddingHorizontal: 15,
                        }}
                        textStyle={{
                            alignSelf: 'flex-start'
                        }}
                        textAlertStyle={{
                            position: 'relative',
                            marginTop: 2
                        }}
                        value={clubDescription}
                        alertErr={(clubDescription === '' ? false : !validClubDescription)}
                        textAlert={(clubDescription === '' ?
                            false
                            :
                            (validClubDescription ? false : ' you wrote more than 5000 character  ' +
                                ' Please Keep it under 5000 character '))}
                        placeholder={'About Your Club'}
                        onChangeText={(text) => setClubDescription(text)}
                    />

                    {/*Submit Button ____________________________________________________________ */}
                    <View style={{padding: 20}}>
                        {!loading && !uploadProgressLoadingCoverPic && !uploadProgressLoadingProfilePic ?
                            <Button title={'Save Changes'}
                                    loading={loading}
                                    onPress={onSubmit}
                                    isAllowed={false}

                            />
                            :
                            <Button title={'Uploading ...'}
                                    buttonStyle={{backgroundColor: theme.colors.red}}
                                    onPress={() => openAlertMassage(' Still Uploading... \n Please wait... :)')}

                            />}

                    </View>

                </View>


            </ScrollScreen>


        </>
    )
}
export default CreatClub
const createStyles = (theme) => StyleSheet.create({
    profileCard: {
        alignItems: "center",
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 50,
    },
    profileCardImages: {
        alignItems: "center",
        justifyContent: 'center',
        gap: 10,

    },
    profileCardImagesText: {
        fontWeight: '600',
        color: theme.colors.text
    },
    avatar: {
        alignItems: 'center',
        justifyContent: 'center',
        alignContent: 'center',
        width: 120,
        height: 120,
        borderRadius: 75,
        borderColor: 'rgba(143,143,143,0.74)',
        borderWidth: 0.5,
        borderStyle: 'solid',
    },
    editProfileImage: {
        position: 'absolute',
        alignItems: "center",
        justifyContent: 'center',
        width: 45,
        height: 45,
        backgroundColor: 'rgba(0,0,0,0.65)',
        borderRadius: 150,
        bottom: -15,

    },
    ImageEditingContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 20,


    },
    form: {
        top: 25,
        gap: 7,

    },
    lableText: {
        left: 10,
        color: theme.colors.text,
        fontWeight: '700',
        bottom: 0,
        top: 0,
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
        backgroundColor: theme.colors.primary,
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
    ManagerViewContainer: {
        position: 'absolute',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.primaryLight,
        padding: 10,
        paddingLeft: 0,
        left: 50,
        gap: 20,
        height: 45,
        borderRadius: 50,
        maxWidth: widthPercentage(100),
    },
    clubManagerProfile: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5,
        // backgroundColor:theme.colors.primary,

    },
    clubManagerProfileTextContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',


    },
    clubManagerProfileTextName: {
        overflow: 'hidden',
        width: widthPercentage(60),
        color: theme.colors.text,
        fontSize: 15,
        fontWeight: '600',

    },
    dropdownContainer: {
        backgroundColor: theme.colors.white,
        marginTop: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: theme.colors.gray,
        maxHeight: heightPercentage(30),
    },
    noResultsText: {
        marginTop: 4,
        fontSize: 14,
        color: theme.colors.text,
        marginHorizontal: widthPercentage(33),
    },
    clubManagerProfileTextStudentNumber: {
        alignSelf: 'flex-start',
        color: theme.colors.text,
        fontSize: 13,
        fontWeight: '500',

    },
    userAvatar: {
        width: 50,
        height: 50,
        borderRadius: 30,
        borderColor: theme.colors.gray1,
        borderWidth: 1,
        borderStyle: 'solid',
    },
    container: {
        marginVertical: 10,
    },
    searchResultItem: {
        flexDirection: 'row',
        padding: 8,
        alignItems: 'center',
        borderBottomWidth: 0.5,
        borderColor: theme.colors.gray1,
        backgroundColor: theme.colors.gray1,
        marginVertical: 1,
    },
    resultImage: {
        width: 36,
        height: 36,
        borderRadius: 18,
        resizeMode: 'cover',
    },
    resultName: {
        color: theme.colors.text,
        fontWeight: '600',
        fontSize: 14,
        maxWidth: widthPercentage(60),
        overflow: 'hidden',
        minWidth: widthPercentage(60),

    },
    resultSubtitle: {
        fontSize: 12,
        color: theme.colors.textLight,
        maxWidth: widthPercentage(60),
        minWidth: widthPercentage(60),
        overflow: 'hidden',
    },
    addManager: {
        marginLeft: widthPercentage(10)
    }

})

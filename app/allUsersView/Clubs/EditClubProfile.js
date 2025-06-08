import {FlatList, Image, StyleSheet, Text, TouchableOpacity, View,} from 'react-native'
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
import {editClubAdmin, editClubManager, getAllCategories, getAllUsers} from "../../../api/ConstantsApiCalls";
import CategoryMultiSelect from "../../../component/CategoryMultiSelect";
import * as Progress from 'react-native-progress';
import MyIcon from "../../../component/MyIcons";
import {ThemeContext} from "../../../contexts/ThemeContext";
import {useNotification} from "../../../contexts/NotificationsContext";


const USER_REGEX = /^[a-zA-Z ]{3,24}$/;
const CLUB_EMAIL_REGEX = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/;
const CLUB_CONTACT_NUMBER_REGEX = /^[0-9]{14}$/;
const DESCRIPTION_REGEX = /^[\s\S]{1,5000}$/;


const EditClubProfile = ({
                             user, club, openImagePopover, storedJwt, openAlertMassage, onClose,
                             currentClubCategory, openSuccessMassage, userRole, setCloseConfirmation
                         }) => {
    const {theme} = useContext(ThemeContext);
    const styles = createStyles(theme);
    const { refreshData} = useNotification();

    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [loading, setLoading] = useState(false);
    const isFirstRender = useRef(true);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadProgressLoadingCoverPic, setUploadProgressLoadingCoverPic] = useState(false);
    const [uploadProgressLoadingProfilePic, setUploadProgressLoadingProfilePic] = useState(false);

    //FOR ADMIN ONLY USE  *************************************************************************
    const isAdmin = user?.authority?.authorityName === 'ROLE_ADMIN';
    const [searchText, setSearchText] = useState('');
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);

    //Context   *************************************************************************
    const {
        openModal, showModal, setShowModal,
        confirmation, setConfirmation, isComponent, setIsComponent, setModalTitle
    } = useContext(ModalContext);
    //Input Feileds *****************************************************************************
    const [clubName, setClubName] = useState(club?.clubName);
    const [clubManager, setClubManager] = useState(club.clubManager);
    const [email, setEmail] = useState(club?.contactEmail);
    const [contactNumber, setContactNumber] = useState(club?.contactNumber);
    const [profilePicURL, setProfilePicURL] = useState(club?.clubProfilePicURL || CLUB_DEFAULT_IMAGE);
    const [newProfilePicURL, setNewProfilePicURL] = useState(null);
    const [coverPicURL, setCoverPicURL] = useState(club?.clubCoverPicURL || CLUB_DEFAULT_IMAGE);
    const [newCoverPicURL, setNewCoverPicURL] = useState(null);
    const [clubDescription, setClubDescription] = useState(club.clubDescription || '');
    const [clubCategories, setClubCategories] = useState(currentClubCategory.map(item => item.category.categoryID));
    const [allCategories, setAllCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);


    //Validation of Input  ************************************************************************
    const [validClubName, setValidClubName] = useState(true);
    const [validClubManager, setValidClubManager] = useState(true);
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
        clubName, clubManager, email, contactNumber, profilePicURL, newProfilePicURL,
        coverPicURL, newCoverPicURL, clubDescription, selectedCategories]);
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
    // New Profile Image Uploading to Firebase ********************************************************
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
                    },
                    (error) => {
                        console.error('Upload Error:', error);
                        setUploadProgressLoadingProfilePic(false);
                    },
                    async () => {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        setProfilePicURL(downloadURL);
                        setNewProfilePicURL(null);
                        setUploadProgressLoadingProfilePic(false);
                    }
                );
            } catch (error) {
                console.error('Uploading Profile Image Failed:', error);
                setUploadProgressLoadingProfilePic(false);
            }
        };

        if (newProfilePicURL?.uri) {
            uploadFile(newProfilePicURL);
            openSuccessMassage("Don't Forget to Save Changes");
        }
    }, [newProfilePicURL]);
    //club Description Validation ********************************************************
    useEffect(() => {
        const result = DESCRIPTION_REGEX.test(clubDescription);
        setValidClubDescription(result);

    }, [clubDescription]);
    // New Cover Image Uploading to Firebase ********************************************************
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
                        setNewCoverPicURL(null);
                        setUploadProgressLoadingCoverPic(false);
                    }
                );
            } catch (error) {
                console.error('Uploading Cover Image Failed:', error);
                setUploadProgressLoadingCoverPic(false);
            }
        };

        if (newCoverPicURL?.uri) {
            uploadFile(newCoverPicURL);
            openSuccessMassage("Don't Forget to Save Changes");
        }
    }, [newCoverPicURL]);
    //Users search Filtration  ********************************************************
    useEffect(() => {
        if (user && user.authority.authorityName === 'ROLE_ADMIN' && searchText) {
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

        if (clubManager === null) {
            openAlertMassage("You Must Choose Club Manager to Continue!! ");
            return;
        }
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
            clubID: club.clubID,
            clubName: clubName,
            clubDescription: clubDescription,
            clubCoverPicURL: coverPicURL,
            contactEmail: email,
            contactNumber: contactNumber,
            clubProfilePicURL: profilePicURL,
        };
        (async () => {
            if (userRole === 'ADMIN') {
                setLoading(true);
                const response = await editClubAdmin(storedJwt, user,
                    openSuccessMassage, openAlertMassage, clubManager, clubToSend, selectedCategories);
                if (response) {
                    openSuccessMassage('Club was Updated successfully.');
                    onClose();
                }
                setLoading(false);
            } else if (userRole !== 'ADMIN' && (club?.clubManager?.userID === user?.userID)) {
                setLoading(true);
                const response = await editClubManager(storedJwt, user,
                    openSuccessMassage, openAlertMassage, clubManager, clubToSend, selectedCategories);
                if (response) {
                    openSuccessMassage('Club was Updated successfully.');
                    onClose();
                }
                setLoading(false);
            }
        })();


    };

    //Get All users Call API  **********************************************************
    useEffect(() => {
        (async () => {
            setLoading(true);
            const data = await getAllUsers(storedJwt, user, openSuccessMassage, openAlertMassage);
            if (data) setUsers(data);
            setLoading(false);

        })();
    }, [storedJwt,refreshData, user]);

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
                    setNewProfilePicURL({
                        uri: selectedAsset.uri,
                        name: selectedAsset.fileName || `photo_${Date.now()}.jpg`,
                        type: selectedAsset.type || 'image/jpeg'
                    })
                    :
                    setNewCoverPicURL({
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
                    setNewProfilePicURL({
                        uri: selectedAsset.uri,
                        name: selectedAsset.fileName || `photo_${Date.now()}.jpg`,
                        type: selectedAsset.type || 'image/jpeg'
                    })
                } else {
                    setNewCoverPicURL({
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
            setNewProfilePicURL(null);
            setShowModal(false);
        } else {
            setCoverPicURL('');
            setNewCoverPicURL(null);
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
        <ScrollScreen>
            <View style={{flex: 1}}>

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
                                                <Image
                                                    source={
                                                        {uri: (profilePicURL ? profilePicURL : CLUB_DEFAULT_IMAGE)}}

                                                    style={styles.avatar}
                                                />}
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
                                                <Image
                                                    source={{uri: (coverPicURL ? coverPicURL : CLUB_DEFAULT_IMAGE)}}

                                                    style={styles.avatar}
                                                />}
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
                                    editable={isAdmin && !clubManager}
                                    alertErr={(clubManager === null)}
                                    icon={<MyIcon
                                        icon={UserIcon}
                                        size={25}
                                        color={(clubManager !== null ?
                                            theme.colors.textLight
                                            :
                                            theme.colors.red)}
                                    />}
                                    placeholder={!clubManager ? "Search by name, email, student number..." : ''}
                                    onChangeText={(text) => setSearchText(text)}
                                    children={clubManager &&
                                        <View style={styles.ManagerViewContainer}>
                                            <TouchableOpacity
                                                style={styles.clubManagerProfile}
                                                // onPress={()=>
                                                // openImagePopover(
                                                //     clubManager.profilePicURL?clubManager.profilePicURL:CLUB_DEFAULT_IMAGE
                                                // )}
                                            >
                                                <Image
                                                    source={
                                                        {uri: (clubManager.profilePicURL ? clubManager.profilePicURL : CLUB_DEFAULT_IMAGE)}}

                                                    style={styles.userAvatar}
                                                />
                                                <View style={styles.clubManagerProfileTextContainer}>
                                                    <Text style={styles.clubManagerProfileTextName}>
                                                        {clubManager.firstName.toUpperCase() + ' ' + clubManager.lastName.toUpperCase()}
                                                    </Text>
                                                    <Text style={styles.clubManagerProfileTextStudentNumber}>
                                                        S.N : {clubManager.studentNumber}
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

                                        </View>
                                    }
                                    list={(searchText && isAdmin) ? (
                                        filteredUsers?.length ? (
                                            <FlatList
                                                nestedScrollEnabled={true}
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
                                    placeholder={'First Name'}
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
                                    placeholder={'Student Number'}
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
                                    placeholder={'Something About Your CLub'}
                                    onChangeText={(text) => setClubDescription(text)}
                                />

                                {/*Submit Button ____________________________________________________________ */}
                                <View style={{padding: 20}}>
                                    {!loading || !uploadProgressLoadingCoverPic ||
                                    !uploadProgressLoadingProfilePic ?
                                        <Button title={'Save Changes'}
                                                loading={loadingSubmit}
                                                onPress={() => onSubmit()}
                                                isAllowed={false}

                                        />
                                        :
                                        <Button title={'Uploading ...'}
                                                buttonStyle={{backgroundColor: theme.colors.red}}
                                                onPress={() => openAlertMassage(' Still Uploading... \n Please wait... :)')}

                                        />}

                                </View>

                            </View>

            </View>
        </ScrollScreen>

    )
}
export default EditClubProfile
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
        backgroundColor: theme.colors.link,
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
        borderWidth: 0.5,
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
        fontWeight: '600',
        fontSize: 14,
        maxWidth: widthPercentage(60),
        overflow: 'hidden',
        minWidth: widthPercentage(60),
        color: theme.colors.text,

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

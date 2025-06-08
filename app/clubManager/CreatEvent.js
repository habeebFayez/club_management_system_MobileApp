import React, {useContext, useEffect, useRef, useState} from 'react';
import {Animated, Image, StyleSheet, Switch, Text, TouchableOpacity, View} from 'react-native';
import {ModalContext} from "../../contexts/ModalContext";
import {getDownloadURL, ref, uploadBytesResumable} from "firebase/storage";
import {storage} from "../../api/Firebase";
import * as ImagePicker from "expo-image-picker";
import {
    AddIcon,
    ArrowLeftIcon,
    CalendarIcon,
    Clock03Icon,
    Delete02Icon,
    Location04Icon,
    PencilEditIcon,
    SmartPhoneIcon,
    SubtitleIcon,
    UniversityIcon,
    UserCircleIcon,
    UserGroup02Icon,
} from "@hugeicons/core-free-icons";
import ScrollScreen from "../../component/ScrollScreen";
import Input from "../../component/Input";
import CategoryMultiSelect from "../../component/CategoryMultiSelect";
import {heightPercentage, openModalFun, widthPercentage} from "../../helpers/common";
import Button from "../../component/Button";
import {
    CreateEventByManager,
    editEventByManager,
    getAllCategories,
    getAllEventsSpeakersAndSponsors
} from "../../api/ConstantsApiCalls";
import CustomDateTimePicker from "../../component/popoversScreens/CustomDateTimePicker";
import {CLUB_DEFAULT_IMAGE} from "../../constants/DefaultConstants";
import * as Progress from 'react-native-progress';
import Loading from "../../component/Loading";
import MapModal from "../../component/MapModal";
import MyIcon from "../../component/MyIcons";
import {ThemeContext} from "../../contexts/ThemeContext";
import {useNotification} from "../../contexts/NotificationsContext";

// FOR PUBLIC USE ******************************************************************************************************
const NAMES_REGEX = /^[a-zA-Z ()]{3,50}$/;
const EVENT_NAME_REGEX = /^[\s\S]{5,50}$/;
const GOOGLE_MAPS_URL_REGEX = /^(?:https?:\/\/)?(?:www\.)?google\.com\/maps\/.*$/;
const DESCRIPTION_REGEX = /^[\s\S]{0,5000}$/;
const PHONE_NUMBER_REGEX = /^[0-9]{14}$/;
const CreateEvent = ({
                         user, club, openImagePopover, storedJwt,
                         openAlertMassage, openSuccessMassage, userRole, editingEventRequest,
                         setCloseConfirmation, onClose, eventToBeEdited, eventCategoriesToBeEdited, onRefresh
                     }) => {
    const {theme} = useContext(ThemeContext);
    const styles = createStyles(theme);
    const { refreshData} = useNotification();


// USed by Components                           *******************************************************************
    const today = new Date();
    const todayDate = today.toISOString().split('T')[0]
    const [loading, setLoading] = useState(false);
    const [allCategories, setAllCategories] = useState([]);
    const translateX = useRef(new Animated.Value(0)).current;
    const isFirstRender = useRef(true);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadProgressLoadingEventPic, setUploadProgressLoadingEventPic] = useState(false);
    //Context                                *************************************************************************
    const {
        openModal, showModal, setShowModal, resetConfirmation, confirmation,
        setConfirmation, confirmationPage, setConfirmationPage, setModalTitle
    } = useContext(ModalContext);
    //******************************************SET HOME AS MODAL PARENT CONFIRMATION *************************************************************
    //Input Fields                            *****************************************************************************
    const [eventName, setEventName] = useState('');
    const [eventDescription, setEventDescription] = useState('');
    const [eventPostDescription, setEventPostDescription] = useState('');
    const [eventLocationURL, setEventLocationURL] = useState('');
    const [eventPostMediaURL, setEventPostMediaURL] = useState('');
    const [eventTime, setEventTime] = useState(null);
    const [eventEndTime, setEventEndTime] = useState(null);
    const [eventHall, setEventHall] = useState('');
    const [eventStartingDate, setEventStartingDate] = useState(null);
    const [eventSponsors, setEventSponsors] = useState([]);
    const [eventSpeakers, setEventSpeakers] = useState([]);
    const [eventCategories, setEventCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);

// FORMS Control                                                    ***************************************************************
    const [eventPostRequested, setIsEventPostRequested] = useState(false);
    const [sponsorsData, setSponsorsData] = useState([{name: "", contactNumber: ""}]);
    const [speakersData, setSpeakersData] = useState([{name: "", contactNumber: ""}]);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);
    const [showNextPageForSponsors, setShowNextPageForSponsors] = useState(false);
    const [showMapModal, setShowMapModal] = useState(false);
    //Validation of Input  ************************************************************************
    const [validEventName, setValidEventName] = useState(false);
    const [validEventTime, setValidEventTime] = useState(false);
    const [validEventDescription, setValidEventDescription] = useState(true);
    const [validEventPostDescription, setValidEventPostDescription] = useState(true);
    const [validEventDate, setValidEventDate] = useState(false);
    const [validNameKeySponser, setValidNameKeySponser] = useState([]);
    const [validNumberKeySponser, setValidNumberKeySponser] = useState([]);
    const [validNameKeySpeaker, setValidNameKeySpeaker] = useState([]);
    const [validNumberKeySpeaker, setValidNumberKeySpeaker] = useState([]);
    const [validSpeakersAndSponsors, setValidSpeakersAndSponsors] = useState(false);


    // Location Filling Input  **********************************************************
    const handleConfirmLocation = (location) => {
        setEventLocationURL(`Lat: ${location.latitude}, Lng: ${location.longitude}`);
    };
    // Time Formating 00:00 Input  **********************************************************
    const parseTime = (timeString) => {
        const [hours, minutes] = timeString.split(':');
        return new Date(0, 0, 0, hours, minutes);
    };
    //Submit Call API Creat EVENT **********************************************************
    const onSubmit = () => {

        if (!(validEventName && validEventDate && validEventTime && validEventDescription && validEventPostDescription &&
            selectedCategories?.length > 0)) {
            openAlertMassage("Please fill all input fields ");
            return;
        } else if ((eventPostMediaURL === '') && eventPostRequested) {
            openAlertMassage("You must Upload Event image to continue !!");
            return;
        }
        if ((eventLocationURL === '') && eventPostRequested && !GOOGLE_MAPS_URL_REGEX.test(eventLocationURL)) {
            openAlertMassage("Please Enter Event Location");
            return;
        }
        if (eventSponsors?.length < 1 || eventSpeakers < 1) {
            openAlertMassage("Please Enter at least One Sponsor and One Speaker !!");
            return;
        }


        if (userRole === 'MANAGER' && user.userID === club.clubManager.userID) {

            if (!editingEventRequest) {
                (async () => {
                    const eventToSend = {
                        eventID: eventToBeEdited?.eventID,
                        eventName,
                        eventDescription,
                        eventLocationURL,
                        eventPostMediaURL,
                        eventStartingDate,
                        eventNote: eventTime,
                        eventPostDescription,
                        eventPostRequested,
                        eventHall,
                        eventEndTime
                    };
                    setLoading(true);
                    const response = await CreateEventByManager(storedJwt, user,
                        openSuccessMassage, openAlertMassage, club.clubManager, eventToSend,
                        sponsorsData, speakersData, selectedCategories);
                    setLoading(false);
                    if (response) {
                        onClose(); // better to navigate to Event Page For
                        openSuccessMassage('Event was Sent successfully.');
                    }

                })();
            }
            if (editingEventRequest) {
                const nextDay = new Date(eventStartingDate);
                nextDay.setDate(nextDay.getDate() + 1);
                const eventToSend = {
                    eventID: eventToBeEdited?.eventID,
                    eventName,
                    eventDescription,
                    eventLocationURL,
                    eventPostMediaURL,
                    eventStartingDate: nextDay.toISOString().split('T')[0],
                    eventNote: eventTime,
                    eventPostDescription,
                    eventPostRequested,
                    eventHall,
                    eventEndTime
                };
                (async () => {
                    setLoading(true);
                    const response = await editEventByManager(storedJwt, user,
                        openSuccessMassage, openAlertMassage, club.clubManager, eventToSend,
                        sponsorsData, speakersData, selectedCategories);
                    setLoading(false);
                    if (response) {
                        onClose(); // better to navigate to Event Page For
                        openSuccessMassage('Event was Edited Successfully.\n\n Wait for Admin Approval !! ');
                        onRefresh();
                    }

                })();
            }
        }


    };
    // API Edit Event call                                        **********************************************************************
    const onEditEventRequest = () => {
        setEventName(eventToBeEdited.eventName);
        setEventDescription(eventToBeEdited.eventDescription);
        setEventLocationURL(eventToBeEdited.eventLocationURL);
        setEventPostMediaURL(eventToBeEdited.eventPostMediaURL);
        setEventStartingDate(eventToBeEdited.eventStartingDate);
        setEventTime(eventToBeEdited.eventNote);
        setEventPostDescription(eventToBeEdited.eventPostDescription);
        setEventHall(eventToBeEdited.eventHall);
        setEventEndTime(eventToBeEdited.eventEndTime);
        setIsEventPostRequested(eventToBeEdited.eventPostRequested)
        setSelectedCategories(eventCategoriesToBeEdited)

    }
    const imageFromCamera = async () => {
        try {
            await ImagePicker.requestCameraPermissionsAsync();
            const result = await ImagePicker.launchCameraAsync({
                CameraType: ImagePicker.CameraType.front, allowsEditing: false, aspect: [1, 1], quality: 0.8,
            });

            if (!result?.canceled && result?.assets && result?.assets?.length > 0) {
                const selectedAsset = result.assets[0];
                setEventPostMediaURL({
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
    const imageFromStudio = async () => {
        try {
            await ImagePicker.requestMediaLibraryPermissionsAsync();
            const result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: false, aspect: [1, 1], allowsMultipleSelection: false, mediaTypes: "images",
                quality: 0.8
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const selectedAsset = result.assets[0];

                setEventPostMediaURL({
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
    const deleteProfileImage = () => {
        setEventPostMediaURL('');
        setShowModal(false);

    }
    const openModalFunctionEventImage = (isProfileImage) => {
        if (!showModal) {
            openModal(
                openModalFun(isProfileImage, imageFromCamera, imageFromStudio, deleteProfileImage, eventPostMediaURL)
                , true
            );
            setModalTitle('Upload Event Post Image');
        } else {
            setShowModal(false);
        }
    }
//  Controlling Speakers and Sponsors Input Fields  **************************************************************
    const handleClickButtonConfirmSpeakers = () => {
        setValidNameKeySponser([]);
        setValidNumberKeySponser([]);
        setValidNameKeySpeaker([]);
        setValidNumberKeySpeaker([]);

        if (speakersData.length > 0 && sponsorsData.length > 0) {
            // Temporary arrays to hold validation errors sense React state updates are asynchronous.
            let tempValidNameKeySpeaker = [];
            let tempValidNumberKeySpeaker = [];
            let tempValidNameKeySponser = [];
            let tempValidNumberKeySponser = [];

            //  Controlling Speaker Input Fields  **************************************************************
            const hasEmptyFieldsSpeakersData = speakersData.some(
                (speaker) => speaker.name === "" || speaker.contactNumber === ""
            );

            speakersData.forEach((speaker, index) => {
                const isValidName = NAMES_REGEX.test(speaker.name);
                const isValidNumber = PHONE_NUMBER_REGEX.test(speaker.contactNumber);
                if (!isValidName && !isValidNumber) {
                    tempValidNumberKeySpeaker.push(index);
                    tempValidNameKeySpeaker.push(index);
                } else if (isValidName && !isValidNumber) {
                    tempValidNumberKeySpeaker.push(index);
                } else if (!isValidName && isValidNumber) {
                    tempValidNameKeySpeaker.push(index);
                }
            });

            //  Controlling Sponsors Input Fields  **************************************************************
            const hasEmptyFieldsSponsorsData = sponsorsData.some(
                (sponsor) => sponsor.name === "" || sponsor.contactNumber === ""
            );

            sponsorsData.forEach((sponsor, index) => {
                const isValidName = NAMES_REGEX.test(sponsor.name);
                const isValidNumber = PHONE_NUMBER_REGEX.test(sponsor.contactNumber);
                if (!isValidName && !isValidNumber) {
                    tempValidNumberKeySponser.push(index);
                    tempValidNameKeySponser.push(index);
                } else if (isValidName && !isValidNumber) {
                    tempValidNumberKeySponser.push(index);
                } else if (!isValidName && isValidNumber) {
                    tempValidNameKeySponser.push(index);
                }
            });

            // Now updating Validation hooks once with the collected data *********************************************
            setValidNameKeySpeaker(tempValidNameKeySpeaker);
            setValidNumberKeySpeaker(tempValidNumberKeySpeaker);
            setValidNameKeySponser(tempValidNameKeySponser);
            setValidNumberKeySponser(tempValidNumberKeySponser);

            // Validation check after state updates *********************************************
            if (!hasEmptyFieldsSpeakersData && !hasEmptyFieldsSponsorsData) {
                if (
                    tempValidNumberKeySpeaker.length === 0 &&
                    tempValidNameKeySpeaker.length === 0 &&
                    tempValidNumberKeySponser.length === 0 &&
                    tempValidNameKeySponser.length === 0
                ) {
                    openSuccessMassage("Speakers and Sponsors Added Successfully");
                    setEventSpeakers(speakersData ||[]);
                    setEventSponsors(sponsorsData||[]);
                    setShowNextPageForSponsors(false);
                    setValidSpeakersAndSponsors(true)
                } else {
                    openAlertMassage(
                        "3 to 24 Only letters are allowed for names. " +
                        "And only 14 numbers are allowed for the contact number. " +
                        "Please add 00, then your country code, then your number."
                    );
                }
            } else {
                openAlertMassage(
                    "Please fill in all speakers and sponsor details before confirming or delete extra input fields."
                );
            }
        } else {
            openAlertMassage("You must enter at least one sponsor and one speaker to continue.");
        }
    };
    const handelDeleteSpeakerClick = (index) => {
        const updatedSpeakersValue = [...speakersData];
        updatedSpeakersValue.splice(index, 1);
        setSpeakersData(updatedSpeakersValue);
        if (eventSpeakers.length > 0) {
            const updatedSpeakersValue = [...eventSpeakers];
            updatedSpeakersValue.splice(index, 1);
            setEventSpeakers(updatedSpeakersValue||[]);
        }
    };
    const handelSpeakersChange = (isName, text, index) => {
        const updatedSpeakers = [...speakersData];
        isName ?
            updatedSpeakers[index].name = text
            :
            updatedSpeakers[index].contactNumber = text
        setSpeakersData(updatedSpeakers);
    };
    const addMoreInputFieldSpeakers = (e) => {
        if (speakersData.length < 5) {
            setSpeakersData([...speakersData, {name: "", contactNumber: ""}]);
        } else {
            openAlertMassage("Cant Add More Than 5 Speakers !! ")
        }

    };
    const handelDeleteSponsorsClick = (index) => {
        const updatedSponsorsValue = [...sponsorsData];
        updatedSponsorsValue.splice(index, 1);
        setSponsorsData(updatedSponsorsValue||[]);
        if (eventSponsors.length > 0) {
            const updatedSponsorsValue = [...eventSponsors];
            updatedSponsorsValue.splice(index, 1);
            setEventSponsors(updatedSponsorsValue||[]);
        }
    };
    const handelSponsorsChange = (isName, text, index) => {
        const onChangeValue = [...sponsorsData];
        isName ?
            onChangeValue[index].name = text
            :
            onChangeValue[index].contactNumber = text
        setSponsorsData(onChangeValue);

    };
    const addMoreInputFieldSponsors = (e) => {
        if (sponsorsData.length < 5) {
            setSponsorsData([...sponsorsData, {name: "", contactNumber: ""}]);
        } else {
            openAlertMassage("Cant Add More Than 5 Sponsors !! ")
        }

    };
// speakers And Sponsors Form in map ********************************************************
    const speakersAndSponsorsForm = (isSpeaker, value, index) => {
        return (
            <View key={index} style={styles.sponsorsAndSpeakersCont}>

                {/* Name Input ____________________________________________________________ */}
                <Input
                    value={value.name}
                    alertErr={(isSpeaker ? validNameKeySpeaker.includes(index) : validNameKeySponser.includes(index))}
                    icon={<MyIcon
                        icon={UserCircleIcon}
                        size={25}
                        color={
                            theme.colors.textLight
                        }
                    />}
                    placeholder={isSpeaker ? 'Speaker Name' : 'Sponsor Name'}
                    onChangeText={(text) => isSpeaker ? handelSpeakersChange(true, text, index) : handelSponsorsChange(true, text, index)}
                    style={{width: widthPercentage(27), color: theme.colors.text}}
                />

                {/* Contact Number Input ____________________________________________________________ */}
                <Input
                    value={value.contactNumber}
                    alertErr={(isSpeaker ? validNumberKeySpeaker.includes(index) : validNumberKeySponser.includes(index))}
                    icon={<MyIcon
                        icon={SmartPhoneIcon}
                        size={25}
                        color={
                            theme.colors.textLight
                        }
                    />}
                    placeholder={'Contact Number'}
                    onChangeText={(text) => isSpeaker ? handelSpeakersChange(false, text, index) : handelSponsorsChange(false, text, index)}
                    style={{width: widthPercentage(27), color: theme.colors.text}}
                />
                <TouchableOpacity
                    onPress={() => isSpeaker ? handelDeleteSpeakerClick(index) : handelDeleteSponsorsClick(index)}>
                    <MyIcon
                        icon={Delete02Icon}
                        size={25}
                        color={'red'}
                    />
                </TouchableOpacity>
            </View>
        )
    }
//  Go Back Page confirmation  of Sponsors And Sponsors Form in map ********************************************************
    const handeGoBackPageofSponsors = () => {
        setConfirmationPage('CreatEvent/GoBack');
        if (
            speakersData.length > eventSpeakers.length
            ||
            sponsorsData.length > eventSponsors.length
        ) {
            if (!showModal) {
                openModal('Are You Sure You Want to Go Back Without Saving Your Data ?\n\n' +
                    'New Added Fields Will be Discard!!', false);
                setModalTitle('Go Back ?');
            } else {
                setShowModal(false);
            }

        } else {
            setShowNextPageForSponsors(false)
        }
    }
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

    }, [eventName, eventPostDescription, eventLocationURL,
        eventPostMediaURL, eventTime, eventEndTime, eventHall,
        eventStartingDate, eventSponsors, eventSpeakers, eventCategories]);
    //Event Name Validation ********************************************************
    useEffect(() => {
        const result = EVENT_NAME_REGEX.test(eventName);
        setValidEventName(result);
    }, [eventName]);
    //Time Validation ********************************************************
    useEffect(() => {
        if (eventTime && eventEndTime) {
            const timeOutPut = (parseTime(eventEndTime).getTime() - parseTime(eventTime).getTime()) / 60000;
            setValidEventTime(timeOutPut > 59);

        }


    }, [eventEndTime]);
    //Event Date Validation ********************************************************
    useEffect(() => {
        const result = eventStartingDate >= todayDate;
        setValidEventDate(result);
    }, [eventStartingDate]);
    //SAVE selected Categories Date to show when needed ********************************************************
    useEffect(() => {

        if (selectedCategories.length > 0) {
            setEventCategories(selectedCategories.map(item => item.categoryID))

        }
    }, [selectedCategories]);
    // Post Image Uploading to Firebase ********************************************************
    useEffect(() => {
        const uploadFile = async (file) => {
            try {
                setUploadProgressLoadingEventPic(true);

                // Extract filename from URI
                const filename = file.uri.split('/').pop();
                const extension = filename.split('.').pop();
                const newName = `${Date.now()}.${extension}`;

                // Convert URI to blob
                const response = await fetch(file.uri);
                const blob = await response.blob();

                const storageRef = ref(storage, `images/${newName}`);
                const uploadTask = uploadBytesResumable(storageRef, blob);

                uploadTask.on('state_changed', (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(progress.toFixed(0))
                }, (error) => {
                    console.error('Upload Error:', error);
                    setUploadProgressLoadingEventPic(false);
                }, async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    setEventPostMediaURL(downloadURL);
                    setUploadProgressLoadingEventPic(false);
                });
            } catch (error) {
                console.error('Uploading Profile Image Failed:', error);
                setUploadProgressLoadingEventPic(false);
            }
        };

        if (eventPostMediaURL?.uri) {
            uploadFile(eventPostMediaURL);
        }
    }, [eventPostMediaURL]);
    //event Description Validation ********************************************************
    useEffect(() => {
        const result = DESCRIPTION_REGEX.test(eventDescription);
        setValidEventDescription(result);

    }, [eventDescription]);
    //event Description Validation ********************************************************
    useEffect(() => {
        const result = DESCRIPTION_REGEX.test(eventPostDescription);
        setValidEventPostDescription(result);

    }, [eventPostDescription]);
    //Get All  Categories Call API  **********************************************************
    useEffect(() => {

        (async () => {
            setLoading(true);
            const data = await getAllCategories(storedJwt, user, openSuccessMassage, openAlertMassage);
            if (data) setAllCategories(data);
            setLoading(false);
        })();
    }, [storedJwt, refreshData ,user, club, editingEventRequest,
        eventToBeEdited]);
    // API GET All Events Speakers And Sponsors call                                        **********************************************************************
    useEffect(() => {
        if (eventToBeEdited) {
            (async () => {
                setLoading(true);
                const response = await getAllEventsSpeakersAndSponsors(storedJwt, openSuccessMassage, openAlertMassage, eventToBeEdited);
                setLoading(false);
                if (response) {
                    let sponsorsData = response.sponsors.map(item => ({
                        contactNumber: item.contactNumber,
                        name: item.name,
                    }));
                    let speakersData = response.speakers.map(item => ({
                        contactNumber: item.contactNumber,
                        name: item.name,
                    }));
                    setEventSpeakers(speakersData||[]);
                    setSpeakersData(speakersData||[]);
                    setEventSponsors(sponsorsData||[]);
                    setSponsorsData(sponsorsData||[]);
                }

            })();
            onEditEventRequest();
        }


    }, [storedJwt, user, eventToBeEdited, editingEventRequest]);
// TranslateX Animation ********************************************************
    useEffect(() => {
        Animated.timing(translateX, {
            toValue: !showNextPageForSponsors ? 0 : 1000,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }, [showNextPageForSponsors]);
// On confirmation for Go Back Button ********************************************************
    useEffect(() => {
        if (confirmation && confirmationPage === 'CreatEvent/GoBack') {
            setSponsorsData(eventSponsors);
            setSpeakersData(eventSpeakers);
            setShowModal(false)
            setShowNextPageForSponsors(false);
            setConfirmation(false);
            resetConfirmation();
        }


    }, [confirmation]);

    return (
        <View style={{paddingHorizontal: 10}}>
            {/* Header Title and Back Button --------------------------------------------------------------------*/}
            <View style={{
                shadowColor: '#006d9c',
                shadowOffset: {width: 0, height: 0},
                shadowOpacity: 0.2,
                shadowRadius: 5,
                marginBottom: 10,
                borderBottomWidth: 2,
                borderBottomColor: theme.colors.gray1,
            }}>
                <Text style={styles.title}>{eventToBeEdited ? 'Edit Event' : 'Creat Event'}</Text>
                {showNextPageForSponsors &&
                    <TouchableOpacity
                        onPress={() => {
                            handeGoBackPageofSponsors()
                        }
                        }
                    >
                        <View style={styles.backButton}>
                            <MyIcon
                                icon={ArrowLeftIcon}
                                size={25}
                                color={theme.colors.primaryLight}
                                strokeWidth={1}
                            />
                            <Text style={styles.backButtonTitle}>Back </Text>
                        </View>
                    </TouchableOpacity>}

            </View>
            {/* Page of Popover --------------------------------------------------------------------*/}
            <ScrollScreen scrollEnabled={true} >
                {!showNextPageForSponsors &&
                    // Input feilds of Popover --------------------------------------------------------------------
                    <Animated.View style={[styles.form, {transform: [{translateX}]}]}>
                        {/*Event Name Input ____________________________________________________________ */}
                        <Text style={styles.lableText}>Event Title</Text>
                        <Input
                            value={eventName}
                            alertErr={(eventName === '' ? false : !validEventName)}
                            textAlert={(eventName === '' ? false : (validEventName ? false : '5 to 50 characters Only are allowed!!.'))}
                            icon={<MyIcon
                                icon={SubtitleIcon}
                                size={25}
                                color={(eventName === '' ? theme.colors.textLight : (validEventName ? theme.colors.textLight : theme.colors.red))}

                            />}
                            placeholder={'Event Title'}
                            onChangeText={(text) => setEventName(text)}
                        />

                        {/*Event Time Input ____________________________________________________________ */}
                        <View style={styles.fullTimeContainer}>
                            {/*Start Time Input ____________________________________________________________ */}
                            <TouchableOpacity onPress={() => setShowStartTimePicker(!showStartTimePicker)}>
                                <View style={{gap: 7, color: theme.colors.text}}>
                                    <Text style={styles.lableText}>Event Start Time</Text>
                                    <Input
                                        onPress={() => setShowStartTimePicker(!showStartTimePicker)}
                                        editable={false}
                                        value={eventTime}
                                        icon={<MyIcon
                                            icon={Clock03Icon}
                                            size={25}
                                            color={(theme.colors.textLight)}
                                        />}
                                        style={{width: widthPercentage(30), color: theme.colors.text}}
                                        placeholder={'Event Start Time'}

                                    />
                                </View>
                            </TouchableOpacity>
                            {/*End Time Input ____________________________________________________________ */}
                            <TouchableOpacity style={{zIndex: 100}}
                                              onPress={() => setShowEndTimePicker(!showStartTimePicker)}>
                                <View style={{gap: 7}}>
                                    <Text style={styles.lableText}>Event End Time</Text>
                                    <Input
                                        onPress={() => setShowEndTimePicker(!showStartTimePicker)}
                                        editable={false}
                                        value={eventEndTime}
                                        alertErr={(eventEndTime === null ? false : !validEventTime)}
                                        textAlert={(eventEndTime === null ? false :
                                            (validEventTime ? false : 'Event End Time must be greater than Event Start Time!!.'))}
                                        icon={<MyIcon
                                            icon={Clock03Icon}
                                            size={25}
                                            color={(eventEndTime === null ? theme.colors.textLight :
                                                validEventTime ? theme.colors.textLight : theme.colors.red)}
                                        />}
                                        placeholder={'Event End Time'}
                                        style={{width: widthPercentage(30), color: theme.colors.text}}
                                    />
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/*Event Date & Hall Input ____________________________________________________________ */}
                        <View style={[styles.fullTimeContainer, {zIndex: 99}]}>
                            {/*Date  Input ____________________________________________________________ */}
                            <TouchableOpacity onPress={() => setShowDatePicker(!showDatePicker)}>
                                <View style={{gap: 7}}>
                                    <Text style={styles.lableText}>Event Date</Text>
                                    <Input
                                        onPress={() => setShowDatePicker(!showDatePicker)}
                                        editable={false}
                                        value={eventStartingDate}
                                        alertErr={(eventStartingDate === null ? false : !validEventDate)}
                                        textAlert={(eventStartingDate === null ? false : (validEventDate ?
                                            false : 'Event Date must be greater than Today!!.'))}
                                        icon={<MyIcon
                                            icon={CalendarIcon}
                                            size={25}
                                            color={(eventStartingDate === null ?
                                                theme.colors.textLight
                                                : (validEventDate) ? theme.colors.textLight : theme.colors.red)}
                                        />}
                                        placeholder={'Event Date'}
                                        style={{width: widthPercentage(30), color: theme.colors.text}}
                                    />

                                </View>
                            </TouchableOpacity>
                            {/*Event Hall Input ____________________________________________________________ */}
                            <View style={{gap: 7}}>
                                <Text style={styles.lableText}>Event Hall</Text>

                                <Input
                                    value={eventHall}
                                    icon={<MyIcon
                                        icon={UniversityIcon}
                                        size={25}
                                        color={theme.colors.textLight}
                                    />}
                                    placeholder={'Event Hall'}
                                    onChangeText={(text) => setEventHall(text)}
                                    style={{width: widthPercentage(30), color: theme.colors.text}}
                                />

                            </View>
                        </View>
                        {/*for ADMIN Event Description Input ____________________________________________________________ */}
                        <Text style={styles.lableText}>Event Description for Admin </Text>
                        <Input
                            multiline
                            containerStyle={{
                                height: heightPercentage(15), paddingHorizontal: 15
                            }}
                            textStyle={{
                                alignSelf: 'flex-start', zIndex: 0
                            }}
                            textAlertStyle={{
                                position: 'relative', marginTop: 2,
                            }}
                            value={eventDescription}
                            alertErr={(eventDescription === '' ? false : !validEventDescription)}
                            textAlert={(eventDescription === '' ? false
                                :
                                (validEventDescription ?
                                    false
                                    :
                                    ' you wrote more than 5000 character  ' + ' Please Keep it under 5000 character '))}
                            placeholder={'Write Your Event Description for Admin...'}
                            onChangeText={(text) => setEventDescription(text)}
                        />

                        {/*Club Categories Input ____________________________________________________________ */}
                        <Text style={styles.lableText}>Event Categories </Text>
                        <CategoryMultiSelect
                            data={allCategories}
                            selectedCategories={eventCategories}
                            setSelectedCategories={setSelectedCategories}
                        />
                        {/*Event SPEAKERS AND SPONSORS AFTER SAVING Input ____________________________________________________________ */}

                        <View style={styles.fullTimeContainer}>
                            {/*SPEAKERS Input ____________________________________________________________ */}
                            <TouchableOpacity onPress={() => setShowNextPageForSponsors(true)}>
                                <View style={{gap: 7}}>
                                    <Text style={styles.lableText}>Event Speakers</Text>
                                    <Input
                                        onPress={() => setShowNextPageForSponsors(true)}
                                        editable={false}
                                        icon={<MyIcon
                                            icon={UserGroup02Icon}
                                            size={25}
                                            color={(theme.colors.textLight)}
                                        />}
                                        style={{width: widthPercentage(30), color: theme.colors.text}}
                                        placeholder={'Event Speakers : ' + eventSpeakers.length}

                                    />
                                </View>
                            </TouchableOpacity>
                            {/* SPONSOR Input ____________________________________________________________ */}
                            <TouchableOpacity onPress={() => setShowNextPageForSponsors(true)}>
                                <View style={{gap: 7}}>
                                    <Text style={styles.lableText}>Event Sponsors </Text>
                                    <Input
                                        onPress={() => setShowNextPageForSponsors(true)}
                                        editable={false}
                                        icon={<MyIcon
                                            icon={UserGroup02Icon}
                                            size={25}
                                            color={theme.colors.textLight}
                                        />}
                                        placeholder={'Event Sponsors : ' + eventSponsors.length}
                                        style={{width: widthPercentage(30), color: theme.colors.text}}
                                    />
                                </View>
                            </TouchableOpacity>

                        </View>
                        {/*When Event Post Requested  -----------------------------------------------------------------------------*/}

                        {eventPostRequested &&
                            <View style={{gap: 10}}>
                                {/* for PUBLIC Event Post Description  -----------------------------------------------------------------------------*/}

                                <Text style={styles.lableText}>Event Public Post Description </Text>
                                <Input
                                    multiline
                                    containerStyle={{
                                        height: heightPercentage(15), paddingHorizontal: 15
                                    }}
                                    textStyle={{
                                        alignSelf: 'flex-start', zIndex: 0, color: theme.colors.text
                                    }}
                                    textAlertStyle={{
                                        position: 'relative', marginTop: 2,
                                    }}
                                    value={eventPostDescription}
                                    alertErr={(eventPostDescription === '' ? false : !validEventPostDescription)}
                                    textAlert={(eventPostDescription === '' ? false
                                        :
                                        (validEventPostDescription ?
                                            false
                                            :
                                            ' you wrote more than 5000 character  ' + ' Please Keep it under 5000 character '))}
                                    placeholder={'Write Your Event Public Post Description ...'}
                                    onChangeText={(text) => setEventPostDescription(text)}
                                />
                                {/*Event Location  -----------------------------------------------------------------------------*/}
                                <Text style={styles.lableText}>Event Location </Text>
                                <TouchableOpacity onPress={() => setShowMapModal(true)}>

                                    <Input
                                        onPress={() => setShowMapModal(!showMapModal)}
                                        editable={false}
                                        value={eventLocationURL}
                                        icon={<MyIcon
                                            icon={Location04Icon}
                                            size={25}
                                            color={theme.colors.textLight}
                                        />}
                                        placeholder={'Event Location '}
                                    />
                                </TouchableOpacity>
                                {/*Event IMAGE  -----------------------------------------------------------------------------*/}
                                <Text style={styles.profileCardImagesText}> Event Post Image</Text>

                                <View style={styles.EventPostImage}>

                                    <View style={styles.profileCardImages}>
                                        <TouchableOpacity
                                            onPress={() => (eventPostMediaURL && !uploadProgressLoadingEventPic) &&
                                                openImagePopover(eventPostMediaURL)}
                                        >

                                            {uploadProgressLoadingEventPic ?
                                                <Progress.Circle size={75} progress={uploadProgress / 100}
                                                                 showsText={true}
                                                                 formatText={() => uploadProgress.toString() + '%'}
                                                                 color={theme.colors.primary}/>
                                                :
                                                <Image
                                                    source={{uri: (eventPostMediaURL ? eventPostMediaURL : CLUB_DEFAULT_IMAGE)}}

                                                    style={styles.avatar}
                                                />}


                                        </TouchableOpacity>

                                        {!uploadProgressLoadingEventPic &&
                                            <TouchableOpacity style={styles.editProfileImage}
                                                              onPress={() => openModalFunctionEventImage(false)}
                                            >
                                                <MyIcon
                                                    icon={PencilEditIcon}
                                                    size={25}
                                                    color={'white'}
                                                />
                                            </TouchableOpacity>}
                                    </View>
                                </View>
                            </View>
                        }
                        {/*Switch Is Event Post Requested  -----------------------------------------------------------------------------*/}
                        <View style={[styles.EventPostRequestedMenuItem,
                            {backgroundColor: eventPostRequested ? 'rgba(125,251,132,0.5)' : 'rgba(255,129,129,0.5)'}]}>
                            <View style={styles.EventPostRequestedMenuLeft}>
                                <Text style={styles.EventPostRequestedMenuText}>Create a Public Post to Everyone?</Text>
                            </View>
                            <Switch value={eventPostRequested}
                                    onValueChange={() => setIsEventPostRequested(!eventPostRequested)}/>
                        </View>
                        {/*Submit Button ____________________________________________________________ */}
                        <View style={{padding: 50}}>
                            {!loading && !uploadProgressLoadingEventPic ? <Button title={'Submit'}
                                                                                  onPress={() => onSubmit()}
                                                                                  isAllowed={false}
                                />
                                : <Button title={uploadProgressLoadingEventPic ? 'Uploading ' : 'Submitting ...'}
                                          buttonStyle={{backgroundColor: theme.colors.red}}
                                          onPress={() => openAlertMassage('Please Wait, Sending Data To Server ')}
                                >
                                    <View style={{
                                        alignSelf: 'center',
                                        justifyContent: 'center',
                                        marginLeft: widthPercentage(10)
                                    }}>
                                        <Loading screenSize={1} size={'small'} backgroundColor={'transparent'}
                                                 color={'white'}/>
                                    </View>
                                </Button>
                            }

                        </View>
                    </Animated.View>}
                {/*// SPONSORS AND SPEAKERS Form ---------------------------------------------------------------*/}
                {showNextPageForSponsors &&
                    <Animated.View style={{gap: 5, marginBottom: heightPercentage(10)}}>
                        {/*// SPONSORS  Form INPUT  ---------------------------------------------------------------*/}
                        <>
                            <Text style={[styles.title, {fontSize: 15, fontWeight: theme.fonts.medium}]}>Speakers</Text>
                            {speakersData.map((value, index) =>
                                speakersAndSponsorsForm(true, value, index)
                            )
                            }
                            <View style={{alignSelf: 'center'}}>
                                <Button title={'Add Speaker'}
                                        hasShadow={false}
                                        textStyle={{fontSize: 14}}
                                        onPress={() => addMoreInputFieldSpeakers()}
                                        buttonStyle={{
                                            backgroundColor: theme.colors.green,
                                            height: heightPercentage(6), width: widthPercentage(35)
                                        }}>
                                    <View style={{
                                        alignSelf: 'center',
                                        justifyContent: 'center',
                                        marginLeft: widthPercentage(1)
                                    }}>
                                        <MyIcon
                                            icon={AddIcon}
                                            size={20}
                                            color={'white'}
                                        />
                                    </View>

                                </Button>
                            </View>
                        </>
                        {/*space between  ------------------------------------------------------------------------------ */}
                        <View style={{
                            borderWidth: 1,
                            borderColor: theme.colors.gray,
                            marginTop: heightPercentage(1),
                            marginBottom: heightPercentage(1)
                        }}/>
                        {/*// SPONSORS  FORM INPUT ----------------------------------------------------------------------------*/}
                        <>
                            <Text style={[styles.title, {fontSize: 15, fontWeight: theme.fonts.medium}]}>Sponsors</Text>

                            {sponsorsData.map((value, index) =>
                                speakersAndSponsorsForm(false, value, index)
                            )
                            }
                            <View style={{alignSelf: 'center',}}>
                                <Button title={'Add Sponsor'}
                                        textStyle={{fontSize: 14}}
                                        hasShadow={false}
                                        onPress={() => addMoreInputFieldSponsors()}
                                        buttonStyle={{
                                            backgroundColor: theme.colors.green,
                                            height: heightPercentage(6), width: widthPercentage(35)
                                        }}>
                                    <View style={{
                                        alignSelf: 'center',
                                        justifyContent: 'center',
                                        marginLeft: widthPercentage(1)
                                    }}>
                                        <MyIcon
                                            icon={AddIcon}
                                            size={20}
                                            color={'white'}
                                        />
                                    </View>

                                </Button>
                            </View>
                        </>
                        {/*Next Button ____________________________________________________________ */}
                        <View style={{padding: 20}}>
                            <Button title={' Save '}
                                    onPress={handleClickButtonConfirmSpeakers}/>
                        </View>
                    </Animated.View>
                }

            </ScrollScreen>

            {/*//TIME AND DATE Picker ----------------------------------------------------------  */}
            <CustomDateTimePicker
                visible={showDatePicker || showStartTimePicker || showEndTimePicker}
                isDateMode={(!(showStartTimePicker || showEndTimePicker))}
                onClose={() => {
                    setShowDatePicker(false)
                    setShowEndTimePicker(false);
                    setShowStartTimePicker(false);
                }}
                onConfirm={(selectedDate) => {
                    if (showDatePicker) {

                        setEventStartingDate(selectedDate.toISOString().split('T')[0]);
                    }
                    if (showStartTimePicker) {
                        const timeString = selectedDate.toLocaleTimeString('en-US', {
                            hour12: false,
                            hour: "2-digit",
                            minute: "2-digit"
                        });
                        setEventTime(timeString);
                    }
                    if (showEndTimePicker) {
                        const timeString = selectedDate.toLocaleTimeString('en-US', {
                            hour12: false,
                            hour: "2-digit",
                            minute: "2-digit"
                        });
                        setEventEndTime(timeString);
                    }
                }}
                initialDate={eventStartingDate ? new Date(eventStartingDate) : today}
                theme={theme}
                is24Hours={true}
                widthPercentage={widthPercentage}
                heightPercentage={heightPercentage}
            />

            {eventPostRequested &&
                <MapModal
                    isVisible={showMapModal}
                    onClose={() => setShowMapModal(false)}
                    onConfirm={handleConfirmLocation}
                />}

        </View>

    );
};


const createStyles = (theme) => StyleSheet.create({
    title: {
        fontSize: 18,
        fontWeight: "bold",
        alignSelf: "center",
        marginBottom: 10,
        color: theme.colors.text,
    },
    EventPostImage: {
        alignItems: "center",
        justifyContent: 'center',
        alignSelf: 'center',
        flexDirection: 'row',
        borderWidth: 0.4,
        height: heightPercentage(25),
        width: widthPercentage(50),
        borderColor: theme.colors.text,
        borderRadius: 20,
        borderCurve: 'continuous',
    },
    profileCardImages: {
        alignItems: "center", justifyContent: 'center', gap: 10,

    },
    profileCardImagesText: {
        fontWeight: '700',
        alignSelf: 'center',
        color: theme.colors.text
    },
    avatar: {
        width: widthPercentage(45),
        height: heightPercentage(23),
        borderRadius: 25,
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
        flexDirection: 'column', justifyContent: 'center', gap: 20,
    },
    backButton: {
        flexDirection: "row",
        top: -20,

    },
    backButtonTitle: {
        fontSize: 15,
        alignItems: "center",
        alignSelf: "center",
        fontWeight: "bold",
        color: theme.colors.primaryLight,
    },
    form: {
        gap: 7,

    },
    fullTimeContainer: {
        flexDirection: 'row', justifyContent: 'space-between'

    },
    lableText: {
        left: 10, color: theme.colors.text, fontWeight: '700', bottom: 0, top: 0,
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

    clubManagerProfile: {
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5,

    },
    clubManagerProfileTextContainer: {
        flexDirection: 'column', justifyContent: 'center', alignItems: 'center',


    },
    clubManagerProfileTextName: {
        overflow: 'hidden', width: widthPercentage(60), color: theme.colors.link, fontSize: 15, fontWeight: '600',

    },
    dropdownContainer: {
        backgroundColor: '#fff',
        marginTop: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#ccc',
        maxHeight: heightPercentage(30),
    },
    noResultsText: {
        marginTop: 4, fontSize: 14, color: '#666', marginHorizontal: widthPercentage(33),
    },
    clubManagerProfileTextStudentNumber: {
        alignSelf: 'flex-start', color: theme.colors.textLight, fontSize: 13, fontWeight: '500',

    },
    userAvatar: {
        width: 50,
        height: 50,
        borderRadius: 30,
        borderColor: 'rgba(143,143,143,0.74)',
        borderWidth: 0.5,
        borderStyle: 'solid',
    }, container: {
        marginVertical: 10,
    },
    searchResultItem: {
        flexDirection: 'row',
        padding: 8,
        alignItems: 'center',
        borderBottomWidth: 0.5,
        backgroundColor: 'rgba(255,0,0,0.06)',

    },
    resultImage: {
        width: 36, height: 36, borderRadius: 18, resizeMode: 'cover',
    },
    resultName: {
        fontWeight: '600',
        fontSize: 14,
        maxWidth: widthPercentage(60),
        overflow: 'hidden',
        minWidth: widthPercentage(60),

    },
    resultSubtitle: {
        fontSize: 12, color: '#666', maxWidth: widthPercentage(60), minWidth: widthPercentage(60), overflow: 'hidden',
    },
    addManager: {
        marginLeft: widthPercentage(10)
    },
    sponsorsAndSpeakersCont: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5,
        marginBottom: 10,

    },
    EventPostRequestedMenuItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: theme.colors.white,
        padding: 10,
        height: heightPercentage(7.2),
        borderWidth: 0.7,
        borderColor: theme.colors.cyan1,
        borderRadius: 20,
        borderCurve: 'continuous',
        marginVertical: 10,

    },
    EventPostRequestedMenuLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    EventPostRequestedMenuText: {
        fontSize: 14,
        fontWeight: "700",
        color: theme.colors.textLight,
        marginLeft: 10,
    },

});

export default CreateEvent;


/*

//Sponsor and Speaker Name & Contact Number Validation ********************************************************
useEffect(() => {
    //Speaker Validation  ****************************
    const resultNameSpeaker = speakersData.some(speaker =>
        NAMES_REGEX.test(speaker.name));
    const resultNumberSpeaker = speakersData.some(speaker =>
        PHONE_NUMBER_REGEX.test(speaker.contactNumber))
    setValidNameSpeaker(resultNameSpeaker);
    setValidContactNumberSpeaker(resultNumberSpeaker)
    //Sponsor Validation  ****************************
    const resultNameSponsor = sponsorsData.some(sponsor =>
        NAMES_REGEX.test(sponsor.name));
    const resultNumberSponsor = sponsorsData.some(sponsor =>
        PHONE_NUMBER_REGEX.test(sponsor.contactNumber))
    setValidNameSponsor(resultNameSponsor);
    setValidContactNumberSponsor(resultNumberSponsor)
}, [sponsorsData,speakersData]);




 */
import React, {useContext, useState} from 'react';
import {View} from 'react-native';
import {Calendar} from 'react-native-calendars';
import dayjs from 'dayjs';
import {ArrowLeftIcon, ArrowRightIcon} from "@hugeicons/core-free-icons";
import MyIcon from "../../../component/MyIcons";
import {CredentialsContext} from "../../../contexts/CredentialsContext";
import {PopoverContext} from "../../../contexts/PopoverContext";
import {ModalContext} from "../../../contexts/ModalContext";
import {useDefaultStyles} from "react-native-ui-datepicker";
import {ThemeContext} from "../../../contexts/ThemeContext";


const eventDates = ['2025-04-15', '2025-04-20', '2025-04-25'];

const markedDates = eventDates.reduce((acc, date) => {
    const {theme} = useContext(ThemeContext);

    acc[date] = {
        marked: true,
        dotColor: theme.colors.red,
        //  dots: [{ color: 'red' },{ color:'blue' }]
    };
    return acc;
}, {});

export default function MonthlyEvents({
                                          onRefresh, userRole, isWaiting, isLoading, openDayTimeLine,
                                          navigation, acceptedEvents, backTitle = 'Calendar'
                                      }) {
    const {theme} = useContext(ThemeContext);

    const [selected, setSelected] = useState()
    //contexts control        *************************************************************************************************
    const {storedJwt, club, user} = useContext(CredentialsContext);
    const {
        setShowPopover, openPopover, openSuccessMassage, openAlertMassage,
        setPopoverSize, setCloseConfirmation, openImagePopover
    } = useContext(PopoverContext);
    const {
        openModal, showModal, setShowModal, confirmation, confirmationPage,
        resetConfirmation, setConfirmation, setConfirmationPage, setModalTitle
    } = useContext(ModalContext);

    const [loading, setLoading] = useState(false);

    const [sortedEventsCategories, setSortedEventsCategories] = useState([]);
    const defaultStyles = useDefaultStyles('light');

    // merge in your loaded events if needed...
    const handleDayPress = (date) => {
        openAlertMassage(dayjs(date).format('DD/MM/YYYY'))
        setSelected(date);
    };
    return (
        <View>
            <Calendar
                // —— Selection & Dots ——
                current={selected}
                onDayPress={(day) => handleDayPress(day.dateString)}
                markingType={'dot'}
                markedDates={{
                    ...markedDates,
                    [selected]: {
                        selected: true, disableTouchEvent: true,
                        customStyles: {
                            container: {
                                backgroundColor: theme.colors.link,
                            },
                        }
                    },
                }}

                enableSwipeMonths={true}
                displayLoadingIndicator={isLoading}


                // —— Theming ——
                theme={{
                    // container
                    backgroundColor: theme.colors.white,
                    calendarBackground: theme.colors.white,
                    // month title
                    monthTextColor: theme.colors.link,
                    textMonthFontWeight: 'bold',
                    textMonthFontSize: 18,
                    // day names (Mon, Tue…)
                    dayTextColor: theme.colors.text,
                    textDayFontSize: 15,
                    textDayFontWeight: '500',
                    weekVerticalMargin: 12,
                    textSectionTitleColor: theme.colors.text,
                    textDayHeaderFontWeight: 'bold',
                    // today
                    todayTextColor: 'white',
                    indicatorColor: theme.colors.primaryLight,
                    todayBackgroundColor: theme.colors.primary,
                    dotStyle: {
                        width: 7,
                        height: 7,
                        borderRadius: 5,
                        marginTop: 1,
                    },
                    selectedDayBackgroundColor: theme.colors.link,

                }}

                // —— Styles Container ——
                style={{}}
                // optional custom navigation
                renderArrow={(direction) => (
                    <View
                        style={{
                            backgroundColor: '#ddd',
                            width: 35,
                            height: 35,
                            borderRadius: 35,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        {direction === 'left' ?
                            <MyIcon icon={ArrowLeftIcon} size={22} strokeWidth={2.5}/>
                            :
                            <MyIcon icon={ArrowRightIcon} size={22} strokeWidth={2.5}/>
                        }
                    </View>
                )}
            />
        </View>
    );
}

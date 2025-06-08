import React, {memo, useCallback, useContext, useEffect, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View,} from 'react-native';
import {CalendarProvider, ExpandableCalendar, Timeline, TimelineList} from 'react-native-calendars';
import Loading from "../../../component/Loading";
import {heightPercentage, widthPercentage} from "../../../helpers/common";
import MyIcon from "../../../component/MyIcons";
import {ArrowLeftIcon, ArrowRightIcon, LocationIcon,} from "@hugeicons/core-free-icons";
import {ThemeContext} from "../../../contexts/ThemeContext";

const getLocalISODate = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    // return `${year}-${month}-${day}`;
    return `${year}-${month}-${day}T${hours}:${minutes}:00`;
};
const WeeklyEvents = ({
                          events = [], onRefresh, todayDate, openSuccessMassage,
                          openAlertMassage, navigation, isLoading, isWaiting, userRole
                      }) => {
    const {theme} = useContext(ThemeContext);
    const styles = createStyles(theme);
    const [currentDate, setCurrentDate] = useState(getLocalISODate());
    const [pressedDate, setPressedDate] = useState(getLocalISODate());
    const [isReady, setIsReady] = useState(false);
    const [eventDates, setEventDates] = useState([]);
    const [fullDailyEvents, setFullDailyEvents] = useState([]);
    const [startEventDateOfWeek, setStartEventDateOfWeek] = useState('');
    const [endEventDateOfWeek, setEndEventDateOfWeek] = useState('');
    const [eventsByDate, setEventsByDate] = useState({});
    const [initialTime, setInitialTime] = useState({hour: 8, minutes: 0});
    const [timelineReady, setTimelineReady] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsReady(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        setTimelineReady(false)
        const eventsThisWeek = events.filter(event => {
            return (
                event?.eventStartingDate >= startEventDateOfWeek &&
                event?.eventStartingDate <= endEventDateOfWeek
            );
        });
        setFullDailyEvents(eventsThisWeek.filter(event => {
            return (
                event?.eventStartingDate === pressedDate
            );
        }))
        const eventsByDate = eventsThisWeek.reduce((acc, e) => {
            const d = e.eventStartingDate;
            if (!acc[d]) acc[d] = [];
            acc[d].push({
                id: String(e.eventID),
                start: `${d}T${e.eventNote}:00`,
                end: `${d}T${e.eventEndTime}:00`,
                title: e.eventName,
                summary: e.eventPostDescription,
                imageUrl: e.eventPostMediaURL,
                eventHall: e.eventHall,
                creationDate: e.eventCreationDate,
                color: '#fff',
                event: e,
            });
            return acc;
        }, {});

        setEventsByDate(eventsByDate);
        const datesThisWeek = eventsThisWeek.map(event => event.eventStartingDate);
        setEventDates(datesThisWeek)
        const dayEvents = eventsByDate[pressedDate] || [];
        if (dayEvents?.length) {
            // Sort by start time ***************************************************
            const sorted = [...dayEvents].sort((a, b) =>
                new Date(a.start) - new Date(b.start)
            );
            const first = sorted[0].start;
            const [, time] = first.split('T');
            const [hh, mm] = time.split(':').map(Number);
            setInitialTime({hour: hh, minutes: mm});
        } else {
            // no events: default to your normal initial ***************************************************
            if (pressedDate === todayDate) {
                const [, time] = currentDate.split('T');
                const [hh, mm] = time.split(':').map(Number);
                setInitialTime({hour: hh, minutes: mm});


            } else {
                setInitialTime({hour: 9, minutes: 0});

            }

        }
        setTimelineReady(true)

    }, [events, pressedDate]);

    const markedDates = eventDates.reduce((acc, date) => {
        acc[date] = {
            marked: true,
            dotColor: theme.colors.red,
            //  dots: [{ color: 'red' },{ color:'blue' }]
        };
        return acc;
    }, {});
    const onDateChanged = (date, source) => {

        setPressedDate(date)
        const start = new Date(date);
        start.setDate(start.getDate() + 6);
        const yyyy = start.getFullYear();
        const mm = String(start.getMonth() + 1).padStart(2, '0');
        const dd = String(start.getDate()).padStart(2, '0');
        const endDate = `${yyyy}-${mm}-${dd}`;
        if (source === 'weekScroll') {
            setStartEventDateOfWeek(date)
            setEndEventDateOfWeek(endDate)
        }
        if (source === 'listDrag') {
            const startByListDrag = new Date(date);
            startByListDrag.setDate(startByListDrag.getDate() - 6);
            const yyyy = startByListDrag.getFullYear();
            const mm = String(startByListDrag.getMonth() + 1).padStart(2, '0');
            const dd = String(startByListDrag.getDate()).padStart(2, '0');
            const startByListDragDate = `${yyyy}-${mm}-${dd}`;
            setStartEventDateOfWeek(startByListDragDate)
            setEndEventDateOfWeek(endDate)
        }


    };
    const onMonthChange = (month, source) => {
        setPressedDate(month.dateString)
        const start = new Date(month.dateString);
        start.setDate(start.getDate() + 6);
        const yyyy = start.getFullYear();
        const mm = String(start.getMonth() + 1).padStart(2, '0');
        const dd = String(start.getDate()).padStart(2, '0');
        const endDate = `${yyyy}-${mm}-${dd}`;
        if (source === 'weekScroll') {
            setStartEventDateOfWeek(month.dateString)
            setEndEventDateOfWeek(endDate)
        }
        if (source === 'listDrag') {
            const startByListDrag = new Date(month.dateString);
            startByListDrag.setDate(startByListDrag.getDate() - 6);
            const yyyy = startByListDrag.getFullYear();
            const mm = String(startByListDrag.getMonth() + 1).padStart(2, '0');
            const dd = String(startByListDrag.getDate()).padStart(2, '0');
            const startByListDragDate = `${yyyy}-${mm}-${dd}`;
            setStartEventDateOfWeek(startByListDragDate)
            setEndEventDateOfWeek(endDate)
        }

    };


    const timelineTheme = {
        timeline: {
            backgroundColor: theme.colors.white,
            marginHorizontal: 1,
        },

        timelineContainer: {
            backgroundColor: theme.colors.white,
            marginBottom: 75,

        },
        contentStyle: {
            backgroundColor: theme.colors.white,
            padding: 5,
            marginBottom: 100,

        },
        event: {
            borderRadius: 12,
            borderLeftWidth: 7,
            borderLeftColor: theme.colors.primaryLight,
            marginVertical: 6,
            shadowColor: '#006d9c',
            shadowOpacity: 0.1,
            shadowRadius: 6,
            backgroundColor: theme.colors.white,

        },

        eventTitle: {
            color: theme.colors.text,
            fontSize: 16,
            fontWeight: '600',
        },
        eventSummary: {
            color: theme.colors.text,
            fontSize: 14,
        },
        eventTimes: {
            color: '#2563EB',
            fontSize: 13,
            fontWeight: '500',
        },
        line: {
            backgroundColor: theme.colors.primaryLight,
            width: 1,
            // marginLeft:75,
        },
        verticalLine: {
            backgroundColor: 'rgba(229,231,235,0)',
        },
        nowIndicatorLine: {
            backgroundColor: theme.colors.rose,
            width: 3,
        },
        nowIndicatorKnob: {
            backgroundColor: theme.colors.rose,
            width: 8,
            height: 8,
            borderRadius: 4,
        },
        timeLabel: {
            color: theme.colors.textLight,
            fontWeight: '700',
            fontSize: 12,
        },
    };

    const timelineProps = {
        format24h: true,
        unavailableHours: [{start: 0, end: 8}, {start: 22, end: 24}],
        unavailableHoursColor: theme.colors.white === '#ffffff' ? 'rgba(220,220,220,0.35)' : 'rgba(20,100,106,0.45)',
        overlapEventsSpacing: 8,
        rightEdgeSpacing: 24,
        styles: timelineTheme,
        initialTime: initialTime,


    };
    const renderEventCard = evt => {
        return (evt &&
            <View
                key={evt.id}
                style={[styles.card, {width: evt.width - 5, height: evt.height}]}
            >
                <View style={styles.content}>
                    <View style={styles.dateRow}>
                        <View>
                            <Text style={styles.title}>{
                                evt.title.length > 25 ? evt.title.slice(0, 25) + '...' :
                                    evt.title.toUpperCase()}</Text>
                            {evt.eventHall ? (
                                <View style={styles.hallRow}>
                                    <MyIcon
                                        icon={LocationIcon}
                                        size={22}
                                        color={theme.colors.text}
                                    />
                                    <Text style={styles.hall}>{
                                        evt.eventHall.length > 25 ? evt.eventHall.slice(0, 25) + '...' :
                                            evt.eventHall}</Text>
                                </View>

                            ) : null}
                        </View>
                        <Text style={styles.message}>{
                            evt.summary.length > 50 ? evt.summary.slice(0, 50) + '...' :
                                evt.summary.toUpperCase()}</Text>
                        <Text style={styles.date}>
                            {new Date(evt.start).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                            {' - '}
                            {new Date(evt.end).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                        </Text>
                    </View>
                    {/*<View style={styles.logoContainer}>*/}
                    {/*    {evt.imageUrl ? (*/}
                    {/*        <Image source={{uri: evt.imageUrl}} style={styles.logo} />*/}
                    {/*    ) : <Image source={{uri: CLUB_DEFAULT_IMAGE}} style={styles.logo} />}*/}
                    {/*</View>*/}
                </View>

            </View>
        );
    };
    const EventCard = memo(({evt, navigation}) => {
        const handlePress = useCallback(() => {
            navigation.navigate('EventFullView', {
                post: evt.event,
                backTitle: 'Calendar',
            });
        }, [evt.event, navigation]);

        return (
            fullDailyEvents.length > 2 ?
                <View style={[styles.card, {width: evt.width - 5, height: evt.height}]}>
                    <TouchableOpacity onPress={handlePress} style={styles.content}>
                        <View style={styles.dateRow}>
                            <View>
                                <Text style={[styles.title]}>
                                    {evt.title.length > 50 ? evt.title.slice(0, 50) + '...' : evt.title.toUpperCase()}
                                </Text>
                            </View>

                            <Text style={styles.date}>
                                {new Date(evt.start).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                                {' - '}
                                {new Date(evt.end).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                :
                <View style={[styles.card, {width: evt.width - 5, height: evt.height}]}>
                    <TouchableOpacity onPress={handlePress} style={styles.content}>
                        <View style={styles.dateRow}>
                            <View>
                                <Text style={styles.title}>
                                    {evt.title.length > 25 ? evt.title.slice(0, 25) + '...' : evt.title.toUpperCase()}
                                </Text>
                                {evt.eventHall && (
                                    <View style={styles.hallRow}>
                                        <MyIcon
                                            icon={LocationIcon}
                                            size={22}
                                            color={theme.colors.text}
                                        />
                                        <Text style={styles.hall}>
                                            {evt.eventHall.length > 25 ? evt.eventHall.slice(0, 25) + '...' : evt.eventHall}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            <Text style={styles.message}>
                                {evt.summary.length > 50 ? evt.summary.slice(0, 50) + '...' : evt.summary.toUpperCase()}
                            </Text>
                            <Text style={styles.date}>
                                {new Date(evt.start).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                                {' - '}
                                {new Date(evt.end).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
        );
    });

    const renderTimelineItem = useCallback((timelineProps, {item}) => (
        <View style={{backgroundColor: theme.colors.white}} onLayout={() => setTimelineReady(true)}>
            <Timeline
                {...timelineProps}
                showNowIndicator
                events={eventsByDate[item]}
                renderEvent={evt => <EventCard evt={evt} navigation={navigation}/>}
                key={pressedDate}
                initialTime={initialTime}
                keyExtractor={evt => evt.id}
                initialNumToRender={3}
                maxToRenderPerBatch={2}
                windowSize={2}
                removeClippedSubviews
            />
        </View>
    ), [eventsByDate, navigation]);
    if (!isReady || isWaiting || isLoading) {
        return (
            <Loading screenSize={100}/>
        );
    }
    return (
        <View style={styles.container}>
            {timelineReady && pressedDate !== todayDate &&
                <TouchableOpacity
                    style={styles.todayButton}
                    onPress={() => onDateChanged(getLocalISODate(), 'listDrag')}>
                    {pressedDate > todayDate &&
                        <MyIcon icon={ArrowLeftIcon} size={18} color={'white'} strokeWidth={2.5}/>}
                    <Text style={{color: 'white', fontSize: 12, fontWeight: '600'}}>Today</Text>
                    {pressedDate < todayDate &&
                        <MyIcon icon={ArrowRightIcon} size={18} color={'white'} strokeWidth={2.5}/>}
                </TouchableOpacity>}
            <CalendarProvider
                date={pressedDate}
                onDateChanged={onDateChanged}
                onMonthChange={onMonthChange}
            >

                <View style={styles.calendarContainer}>
                    <ExpandableCalendar
                        //to make today is the start of the week
                        firstDay={new Date().getDay()}
                        markedDates={{
                            ...markedDates
                        }}
                        displayLoadingIndicator={isLoading || isWaiting}
                        style={{
                            backgroundColor: theme.colors.white,
                            minHeight: 100,
                            maxHeight: 350,
                            // borderBottomWidth: 0.1,
                            // borderColor: theme.colors.white==='#ffffff'? '#ccc':theme.colors.gray ,
                        }}
                        theme={{
                            contentStyle: {
                                backgroundColor: theme.colors.white,
                                borderBottomWidth: 0.1,
                                borderColor: theme.colors.white === '#ffffff' ? '#ccc' : theme.colors.gray1,
                            },
                            backgroundColor: theme.colors.white,
                            calendarBackground: theme.colors.white,
                            textSectionTitleColor: theme.colors.textLight,
                            textSectionTitleDisabledColor: theme.colors.textLight,
                            selectedDayBackgroundColor: theme.colors.cyan4,
                            selectedDayTextColor: '#ffffff',
                            todayBackgroundColor: theme.colors.primary,
                            arrowColor: theme.colors.primaryLight,
                            indicatorColor: theme.colors.primary,
                            arrowStyle: {
                                backgroundColor: '#ddd',
                                width: 35,
                                height: 35,
                                borderRadius: 35,
                                justifyContent: 'center',
                                alignItems: 'center',

                            },
                            textMonthFontWeight: 'semibold',
                            textMonthFontSize: 17,
                            monthTextColor: theme.colors.textLight,
                            dotStyle: {
                                width: 6,
                                height: 6,
                                borderRadius: 5,
                                marginTop: 1,
                            },
                            todayTextColor: '#ffffff',
                            dayTextColor: theme.colors.text,
                            textDisabledColor: theme.colors.text,
                            textDayFontSize: 15,
                            textDayFontWeight: '500',

                        }}
                        pastScrollRange={12}
                        futureScrollRange={12}
                        hideArrows={true}
                        customHeader={null}
                        // disableMonthChange={true}
                        allowShadow={false}
                        disablePan={true}

                    />
                </View>

                <TimelineList
                    events={eventsByDate}
                    timelineProps={timelineProps}
                    // renderItem={(timelineProps,{item, index}) => {
                    //     return (
                    //         <View onLayout={()=>setTimelineReady(true)} >
                    //             <Timeline
                    //                 {...timelineProps}
                    //                 onEventPress={evt => {
                    //                     navigation.navigate('EventFullView',
                    //                         {
                    //                             post: evt.event,
                    //                             backTitle: 'Calendar',
                    //
                    //                         });
                    //
                    //                 }}
                    //                 key={pressedDate}
                    //                 showNowIndicator
                    //                 initialTime={initialTime}
                    //                 events={eventsByDate[item]}
                    //                 renderEvent={renderEventCard}
                    //                 initialNumToRender={7}
                    //             />
                    //            </View>
                    //     );
                    // }}
                    renderItem={renderTimelineItem}

                />
                {(!timelineReady) &&
                    <Loading screenSize={100}/>}
            </CalendarProvider>
        </View>
    );
};

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.gray1,


    },
    calendarContainer: {
        minHeight: 150,
        maxHeight: 350,
        overflow: 'hidden',
    },
    todayButton: {
        alignSelf: 'flex-end',
        top: heightPercentage(75),
        right: widthPercentage(1),
        gap: 2,
        position: 'absolute',
        flexDirection: 'row',
        alignItems: 'center'
        , justifyContent: 'center',
        height: 35,
        width: 70,
        borderColor: theme.colors.primaryLight,
        borderWidth: 1,
        backgroundColor: theme.colors.primary,
        zIndex: 99,
        borderRadius: 20,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
    },
    card: {
        paddingVertical: 10,
        marginHorizontal: -6,
        marginVertical: -6,
        backgroundColor: theme.type === 'dark' ? theme.colors.primary : theme.colors.gray1,
        borderRadius: 12,
        flexDirection: 'column',
        alignItems: 'center',
        shadowColor: '#006d9c',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 5,
        overflow: 'hidden'
    },
    leftBorder: {
        width: 5,
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
        height: '100%'
    },
    logoContainer: {
        height: '100%',
        width: '100%',

    },
    logo: {
        height: '100%',
        width: '100%',
        objectFit: 'fill',
        borderRadius: 10,

    },
    content: {
        height: '100%',
        width: '100%',
        padding: 2,
    },

    title: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 5,
    },
    message: {
        fontSize: 11,
        color: theme.colors.text,
        marginBottom: 6
    },
    dateRow: {
        height: '100%',
        flexDirection: 'column',
        justifyContent: 'space-between'
    },
    hallRow: {
        flexDirection: 'row',
        alignContent: 'center',
        gap: 10,
    },
    hall: {
        alignSelf: 'center',
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.textLight
    },
    date: {

        alignSelf: 'flex-end',
        alignContent: 'flex-end',
        justifyContent: 'flex-end',
        fontSize: 12.5,
        fontWeight: '600',
        color: theme.colors.textLight
    }
});

export default WeeklyEvents;


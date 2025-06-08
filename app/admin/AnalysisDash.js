import {Dimensions, StyleSheet, Text, View,} from 'react-native';
import React, {Fragment, useContext, useEffect, useState} from 'react';
import AnimatedCounter from "../../component/AnimatedCounter";
import {heightPercentage, widthPercentage} from "../../helpers/common";
import {BarIndicator,} from "react-native-indicators";
import {ThemeContext} from "../../contexts/ThemeContext";
import {LineChart} from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;


const AnalysisDash = ({
                          users,
                          userRole,
                          blockedUsers,
                          clubs,
                          pendingClubs,
                          pendingEvents,
                          rejectedClubs,
                          blockedClubs,
                          rejectedEvents,
                          rejectedWeekEvents,
                          setActiveView,
                          pendingManagerEvents,
                          acceptedManagerEvents,
                          rejectedManagerEvents,
                          weekEvents,
                          refreshing,
                          MyClub,
                          todayDate,
                          events, isWaiting, isLoading
                      }) => {
    const {theme} = useContext(ThemeContext);
    const styles = createStyles(theme);

    const [pendingWeekManagerEvents, setPendingWeekManagerEvents] = useState([]);
    const [acceptedWeekManagerEvents, setAcceptedWeekManagerEvents] = useState([]);
    const [rejectedWeekManagerEvents, setRejectedWeekManagerEvents] = useState([]);
    const [filterLoading, setFilterLoading] = useState(false);
    const [clubChartData, setClubChartData] = useState({
        labels: [],
        datasets: [{ data: [] }],
        legend: ["Clubs"]
    });


    //categorize dashboard data  for MANAGER                               ***************************************************************************
    useEffect(() => {
        if (userRole === 'MANAGER' && MyClub) {
            setFilterLoading(true);
            setAcceptedWeekManagerEvents(acceptedManagerEvents?.filter(event =>
                event.club.clubID === MyClub.clubID &&
                event.eventCreationDate >= todayDate));
            setPendingWeekManagerEvents(pendingManagerEvents?.filter(event =>
                event.club.clubID === MyClub.clubID &&
                event.eventCreationDate >= todayDate));

            setRejectedWeekManagerEvents(rejectedManagerEvents?.filter(event =>
                event.club.clubID === MyClub.clubID &&
                event.eventCreationDate >= todayDate));

        }
        setFilterLoading(false);


    }, [userRole, refreshing, events, MyClub, todayDate]);

    useEffect(() => {
        if (clubs ) {
            // Get current date and calculate date 6 months ago
            const currentDate = new Date();
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(currentDate.getMonth() -6);

            // Generate array of month names for the last 6 months
            const monthLabels = [];
            const monthData = [];

            //  counters for each month ( count how many clubs were created in each month)
            for (let i = 0; i <= 6; i++) {
                const monthDate = new Date(sixMonthsAgo);
                monthDate.setMonth(sixMonthsAgo.getMonth() + i);

                // short month name
                const monthName = monthDate.toLocaleString('default', { month: 'short' });
                monthLabels.push(monthName);
                monthData.push(0); // Initialize with 0 clubs for this month
            }

            // Filter clubs created in the last 6 months
            const recentClubs = clubs.filter(club => {
                const creationDate = new Date(club.creatingDate);
                return creationDate >= sixMonthsAgo;
            });

            // Count clubs created in each month
            let cumulativeTotal = 0;
            if (recentClubs.length > 0) {
                for (let i = 0; i <= 6; i++) {
                    const monthStartDate = new Date(sixMonthsAgo);
                    monthStartDate.setMonth(sixMonthsAgo.getMonth() + i);

                    const monthEndDate = new Date(monthStartDate);
                    monthEndDate.setMonth(monthStartDate.getMonth() + 1);

                    // Count clubs created in this month
                    const clubsInMonth = recentClubs.filter(club => {
                        const creationDate = new Date(club.creatingDate);
                        return creationDate >= monthStartDate && creationDate < monthEndDate;
                    });

                    // Use cumulative growth (total clubs up to this month)
                    cumulativeTotal += clubsInMonth.length;
                    monthData[i] = cumulativeTotal;
                }
            }
            console.log("Month data for chart:", monthData);


            // Update chart data state
            setClubChartData({
                labels: monthLabels,
                datasets: [{
                    data: monthData,
                    color: (opacity = 1) => `rgba(0, 144, 156, ${opacity})`,
                    strokeWidth: 3
                }],
                legend: ["Clubs Growth"]
            });
        }
    }, [clubs]);


    // const data = {
    //     labels: ["January", "February", "March", "April", "May", "June","july"],
    //     datasets: [
    //         {
    //             data: [20, 45, 28, 80, 99, 43],
    //             color: (opacity = 1) => `rgba(0, 144, 156, ${opacity})`, // Primary color (cyan1)
    //             strokeWidth: 2
    //         },
    //     ],
    //     legend: ["Clubs"]
    // };




    const chartConfig = {
        backgroundColor: theme.colors.card,
        backgroundGradientFrom: theme.colors.card,
        backgroundGradientTo: theme.colors.card,
        backgroundGradientFromOpacity: 0.1,
        backgroundGradientToOpacity: 0.5,
        decimalPlaces: 0,
        // Chart line and dots colors
        color: (opacity = 1) => `rgba(0, 144, 156, ${opacity})`, // Using cyan1
        // Label text color
        labelColor: (opacity = 1) => `rgba(${theme.type === 'dark' ? '213, 213, 213' : '73, 73, 73'}, ${opacity})`,
        // Grid lines style
        propsForBackgroundLines: {
            strokeDasharray: '',
            stroke: theme.colors.gray1,
            strokeWidth: 1
        },
        // Style for dots
        propsForDots: {
            r: "4",
            strokeWidth: "2",
            stroke: theme.colors.green,
            fill: theme.colors.cyan1
        },
        // For bezier curves
        style: {
            borderRadius: theme.radius.md
        },
    formatYLabel: (value) => Math.floor(value).toString(),


};



    return (
        <>


            <View style={{
                position: 'relative',

                width: widthPercentage(100),
            }}>
                {/*ADMIN Dashboard View Analysis -------------------------------------------------------------------------------*/}
                {userRole === 'ADMIN' && users?.length > 0 &&
                    <View style={styles.cardContainer}>
                        <View style={styles.card}>
                            {(!filterLoading || !isLoading || isWaiting) ?
                                <>
                                    <Text style={styles.cardTitle}>Total Users</Text>
                                    <AnimatedCounter style={styles.cardValueGreen} value={users.length} duration={500}/>
                                    <View style={styles.cardTagGreenContainer}>
                                        <Text style={styles.cardTagGreen}>{blockedUsers.length} Blocked</Text>
                                    </View>
                                </>
                                :
                                <BarIndicator size={25} count={10} color={theme.colors.cyan1}/>}

                        </View>

                        <View style={styles.card}>
                            {(!filterLoading || !isLoading || isWaiting) ?
                                <>
                                    <Text style={styles.cardTitle}>Total Clubs</Text>
                                    <AnimatedCounter style={styles.cardValueGreen} value={clubs.length} duration={500}/>
                                    <View style={styles.cardTagGreenContainer}>
                                        <Text style={styles.cardTagGreen}>{pendingClubs.length} Pending</Text>
                                    </View>
                                </>
                                :
                                <BarIndicator size={25} count={10} color={theme.colors.cyan1}/>}

                        </View>

                        <View style={styles.card}>
                            {(!filterLoading || !isLoading || isWaiting) ?
                                <>
                                    <Text style={styles.cardTitle}>Total Events</Text>
                                    <AnimatedCounter style={styles.cardValueGreen} value={events.length}
                                                     duration={500}/>
                                    <View style={styles.cardTagGreenContainer}>
                                        <Text style={styles.cardTagGreen}>{pendingEvents.length} Pending</Text>
                                    </View>
                                </>
                                :
                                <BarIndicator size={25} count={10} color={theme.colors.cyan1}/>}

                        </View>

                        <View style={[styles.card, styles.redCard]}>
                            {(!filterLoading || !isLoading || isWaiting) ?
                                <>
                                    <Text style={styles.cardTitle}>Rejected Clubs</Text>
                                    <AnimatedCounter style={styles.cardValueRed} value={rejectedClubs.length}
                                                     duration={500}/>
                                    <View style={styles.cardTagredContainer}>
                                        <Text style={styles.cardTagred}>{blockedClubs.length} Blocked</Text>
                                    </View>
                                </>
                                :
                                <BarIndicator size={25} count={10} color={theme.colors.cyan1}/>}

                        </View>

                        <View style={[styles.card, styles.redCard]}>
                            {(!filterLoading || !isLoading || isWaiting) ?
                                <>
                                    <Text style={styles.cardTitle}>Rejected Events</Text>
                                    <AnimatedCounter style={styles.cardValueRed} value={rejectedEvents.length}
                                                     duration={500}/>
                                    <View style={styles.cardTagredContainer}>
                                        <Text style={styles.cardTagred}>{rejectedWeekEvents.length} This week</Text>
                                    </View>
                                </>
                                :
                                <BarIndicator size={25} count={10} color={theme.colors.cyan1}/>}
                        </View>

                        <View style={styles.cardContainer}>
                            <LineChart
                                data={clubChartData}
                                width={screenWidth - 20}
                                height={220}
                                yAxisLabel=" "
                                yAxisSuffix=""
                                // formatYLabel={(value) => {
                                //     if (value === undefined || value === null) return "0";
                                //     return String(value).split('.')[0]; }}
                            yAxisInterval={1}
                                chartConfig={chartConfig}
                                bezier
                                style={{
                                    marginVertical: 8,
                                    borderRadius: theme.radius.md,
                                    padding: 10,
                                    shadowColor: theme.colors.cyan1,
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 3,
                                }}
                                fromZero={true}
                            withInnerLines={true}


                            />
                        </View>
                    </View>}

                {/*MANAGER Dashboard View Analysis -------------------------------------------------------------------------------*/}
                {userRole === 'MANAGER' &&
                    <View style={styles.cardContainer}>

                        <View style={styles.card}>
                            {(!filterLoading || !isLoading || isWaiting) ?
                                <>
                                    <Text style={styles.cardTitle}>Created Events</Text>
                                    <AnimatedCounter style={styles.cardValueGreen}
                                                     value={
                                                         rejectedManagerEvents?.length +
                                                         pendingManagerEvents?.length +
                                                         acceptedManagerEvents?.length} duration={500}/>
                                    <View style={styles.cardTagGreenContainer}>
                                        <Text style={styles.cardTagGreen}>{rejectedWeekManagerEvents?.length +
                                            pendingWeekManagerEvents?.length +
                                            acceptedWeekManagerEvents?.length} This Week </Text>
                                    </View>
                                </>
                                :
                                <BarIndicator size={25} count={10} color={theme.colors.cyan1}/>

                            }

                        </View>

                        <View style={[styles.card, styles.redCard]}>
                            {!filterLoading || !isLoading || isWaiting ?
                                <>

                                    <Text style={styles.cardTitle}>Pending Events</Text>
                                    <AnimatedCounter style={styles.cardValueRed} value={pendingManagerEvents.length}
                                                     duration={500}/>
                                    <View style={styles.cardTagredContainer}>
                                        <Text style={styles.cardTagred}>{pendingWeekManagerEvents?.length} This
                                            week</Text>
                                    </View>
                                </>
                                :
                                <BarIndicator size={25} count={10} color={theme.colors.cyan1}/>

                            }
                        </View>

                        <View style={styles.card}>
                            {!filterLoading || !isLoading || isWaiting ?
                                <>
                                    <Text style={styles.cardTitle}>Accepted Events</Text>
                                    <AnimatedCounter style={styles.cardValueGreen} value={acceptedManagerEvents.length}
                                                     duration={500}/>
                                    <View style={styles.cardTagGreenContainer}>
                                        <Text style={styles.cardTagGreen}> {acceptedWeekManagerEvents?.length} This
                                            Week </Text>
                                    </View>
                                </>
                                :
                                <BarIndicator size={25} count={10} color={theme.colors.cyan1}/>}
                        </View>

                        <View style={[styles.card, styles.redCard]}>
                            {(!filterLoading || Object.values(isLoading).slice(0, -1).some(val => val) || isWaiting) ?
                                <>
                                    <Text style={styles.cardTitle}>Rejected Events</Text>
                                    <AnimatedCounter style={styles.cardValueRed} value={rejectedManagerEvents.length}
                                                     duration={500}/>
                                    <View style={styles.cardTagredContainer}>
                                        <Text style={styles.cardTagred}> {rejectedWeekManagerEvents?.length} This
                                            Week </Text>
                                    </View>

                                </>
                                :
                                <BarIndicator size={25} count={10} color={theme.colors.cyan1}/>
                            }
                        </View>
                    </View>}


            </View>

        </>

    );
};


export default AnalysisDash;

const createStyles = (theme) => StyleSheet.create({

    cardContainer: {
        // position:'absolute',
        width: widthPercentage(100),
        height: heightPercentage(100),
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-evenly',
        marginBottom: 20,

    },
    card: {
        width: widthPercentage(46),
        height: heightPercentage(15),
        backgroundColor: theme.colors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#006d9c',
        shadowOffset: {width: 0, height: 5},
        shadowOpacity: 0.2,
        shadowRadius: 5,

    },
    redCard: {
        width: widthPercentage(46),
        height: heightPercentage(15),
        backgroundColor: theme.colors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#006d9c',
        shadowOffset: {width: 0, height: 5},
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    cardTitle: {
        fontSize: 14,
        color: theme.colors.text,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    cardValueRed: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.red,
        marginBottom: 4,
    },
    cardValueGreen: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.green,
        marginBottom: 4,
    },
    cardTagredContainer: {
        textAlign: 'center',
        backgroundColor: theme.colors.gray,
        height: 25,
        width: 85,
        padding: 5,
        borderRadius: 50,
    },
    cardTagred: {
        textAlign: 'center',
        fontSize: 12,
        fontWeight: 'bold',
        color: theme.colors.rose,
    },
    cardTagGreenContainer: {
        textAlign: 'center',
        backgroundColor: theme.colors.gray,
        height: 25,
        width: 85,
        padding: 5,
        borderRadius: 50,

    },
    cardTagGreen: {
        textAlign: 'center',
        fontSize: 12,
        fontWeight: 'bold',
        color: theme.colors.green,
    },

})

import React, {useCallback, useContext, useEffect, useRef, useState} from 'react';
import {FlatList, Image, RefreshControl, StyleSheet, Text, Platform,TouchableOpacity, View} from 'react-native';
import axios from '../../../api/axios';
import {CredentialsContext} from '../../../contexts/CredentialsContext';
import {heightPercentage,} from '../../../helpers/common';
import ScreenWrapper from "../../../component/ScreenWrapper";
import {useScroll} from "../../../contexts/ScrollContext";
import {HugeiconsIcon} from "@hugeicons/react-native";
import {ArrowUpIcon} from "@hugeicons/core-free-icons";
import {CLUB_DEFAULT_IMAGE} from "../../../constants/DefaultConstants";
import Loading from "../../../component/Loading";
import {PopoverContext} from "../../../contexts/PopoverContext";
import {getAllClubsCategories} from "../../../api/ConstantsApiCalls";
import {ThemeContext} from "../../../contexts/ThemeContext";
import {useNotification} from "../../../contexts/NotificationsContext";


const CLUBS_CALL_API = '/club/getAllClubs';
;

const Clubs = ({navigation}) => {
    const {theme} = useContext(ThemeContext);
    const styles = createStyles(theme);
    const {storedJwt, club, user} = useContext(CredentialsContext);
    const {openSuccessMassage, openAlertMassage,} = useContext(PopoverContext);
    const { refreshData} = useNotification();

    //scroll control const's                                    *************************************************************************
    const {setTabBarVisibility, isTabBarVisible} = useScroll();
    const [prevOffset, setPrevOffset] = useState(0);
    const [direction, setDirection] = useState('up');
    const [refreshing, setRefreshing] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const scrollViewRef = useRef(null);
    const [headerVisible, setHeaderVisible] = useState(true);

    //Clubs DATA                                    ***************************************************************************
    const [allClubs, setAllClubs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [allClubsCategories, setAllClubsCategories] = useState([]);


    // Determine scroll direction and show/hide tab bar  **********************************************************************
    const handleScroll = (event) => {
        const currentOffset = event.nativeEvent.contentOffset.y;
        const scrollDirection = currentOffset > prevOffset ? 'down' : 'up';
        setDirection(scrollDirection);
        setPrevOffset(currentOffset);

        // Hide tab bar when scrolling down, show tab bar when scrolling up  **********************************************************************
        setTabBarVisibility(scrollDirection === 'up');

        // Hide header if scrolling down, show if scrolling up          *************************************************************
        setHeaderVisible(scrollDirection === 'up');
        // Always show tab bar when at the very top                        **********************************************************************
        if (currentOffset <= 5) {
            setTabBarVisibility(true);
            setShowScrollTop(false);
            setHeaderVisible(true);
        }
        // Show "scroll to top" button when scrolled down and tabBar is off *****************************************************
        setShowScrollTop((!isTabBarVisible && currentOffset > 500));
    };

    // Refresh handler (pull-to-refresh)                                        **********************************************************************
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 1500);
    }, []);

    //  Scrolling Up                                 *************************************************************
    const scrollToTop = () => {
        scrollViewRef.current?.scrollToOffset({offset: 0, animated: true});
    };

    // API GET Clubs call                                        **********************************************************************
    useEffect(() => {
        if (storedJwt) {
            setIsLoading(true);
            axios
                .get(CLUBS_CALL_API, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${storedJwt}`,
                    },
                })
                .then((response) => {
                    if (response.status === 200) {
                        return response.data;
                    } else if (response.status === 401) {
                        openAlertMassage('Authorization Expired');

                    } else if (response.status === 404) {
                        return response.data;
                    } else {
                        openAlertMassage('Error: We are sorry please login again');
                        return response.data;
                    }
                })
                .then((clubData) => {
                    setAllClubs(clubData);
                })
                .catch((error) => {
                    console.error(error);
                    openAlertMassage('Error fetching clubs');
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [storedJwt,refreshData, refreshing]);

    // API GET Clubs Categories                                        **********************************************************************
    //Get All Clubs Categories Call API  **********************************************************
    useEffect(() => {

        (async () => {
            setIsLoading(true);
            const data = await getAllClubsCategories(storedJwt, user, openSuccessMassage, openAlertMassage);
            if (data) setAllClubsCategories(data);
            setIsLoading(false);

        })();
    }, [storedJwt,refreshData, refreshing]);
    // Filter and sort clubs                                                **********************************************************************
    const filteredClubs = allClubs
        .filter((club) => club.clubisActivation)
        .sort((a, b) => {
            if (club) {
                if (club.clubID === a.clubID) return -1;
                if (club.clubID === b.clubID) return 1;
            }
            const firstIndex = a.clubActiveEventsNumber - a.clubRejectedEventsNumber;
            const secondIndex = b.clubActiveEventsNumber - b.clubRejectedEventsNumber;
            return secondIndex - firstIndex;
        });

    // Helper to count words in a string.
    const wordCount = (str) => {
        if (!str) return 0;
        return str.trim().split(/\s+/).length;
    };
    const renderClubCard = ({item: clubCard}) => (
        clubCard &&
        <TouchableOpacity
            activeOpacity={0.5}
            onPress={() =>
                navigation.navigate('ClubProfile', {club: clubCard, user: user, backTitle: 'Clubs'})

            }
            style={club?.clubID === clubCard.clubID ? styles.myClubCard : styles.card}
        >
            <TouchableOpacity
                style={styles.posterInfo}
                onPress={() =>
                    navigation.navigate('ClubProfile', {club: clubCard, user: user, backTitle: 'Clubs'})

                }
            >
                <Image
                    source={{uri: clubCard.clubProfilePicURL || CLUB_DEFAULT_IMAGE}}
                    style={styles.posterInfoImg}
                />
                <View style={styles.posterInfoText}>
                    <Text style={styles.clubName}>
                        {clubCard.clubName || 'NA'}
                    </Text>
                    <Text style={styles.eventDate}>{clubCard.creatingDate}</Text>
                </View>

            </TouchableOpacity>
            <Text style={styles.cardDescription}>
                {clubCard.clubDescription.split(/\s+/).slice(0, 55).join(' ')}
                {wordCount(clubCard.clubDescription) > 69 && (
                    <TouchableOpacity
                        onPress={() =>
                            navigation.navigate('ClubProfile', {club: clubCard, user: user, backTitle: 'Clubs'})
                        }>
                        <Text style={styles.readMore}> ... Read More </Text>
                    </TouchableOpacity>
                )}
            </Text>
            <View style={styles.tagsContainer}>

                {allClubsCategories &&
                    allClubsCategories.filter(category => category.club.clubID === clubCard.clubID).map((category, index) => (
                        <TouchableOpacity key={index}
                                          onPress={() => navigation.navigate(
                                              'Search',
                                              {
                                                  searchFor: category.category.categoryName,
                                                  activeFilterByPress: 'category',
                                                  backTitle: 'Clubs'
                                              })}
                                          style={[styles.tagButton,
                                              {backgroundColor: theme.colors.cyan1,}]}>
                            <Text style={styles.tagButtonText}>
                                # {category.category.categoryName}
                            </Text>
                        </TouchableOpacity>
                    ))}
            </View>
        </TouchableOpacity>
    );


    return (
        <>
            <ScreenWrapper navigation={navigation} isVisible={headerVisible} pageTitle={'Clubs'}/>

            <View style={styles.container}>
                <FlatList
                    data={filteredClubs}
                    keyExtractor={(item) => String(item.clubID)}
                    renderItem={renderClubCard}
                    contentContainerStyle={styles.listContent}
                    style={[{backgroundColor: theme.colors.white},
                        Platform.OS === 'android' && {paddingTop: heightPercentage(7),}]}
                    ref={scrollViewRef}
                    showsVerticalScrollIndicator={false}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            progressViewOffset={heightPercentage(5)}
                            style={{
                                marginTop: heightPercentage(7),
                            }}
                            tintColor={theme.colors.primaryLight}
                            colors={[theme.colors.primaryLight]}
                        />
                    }
                />

                {showScrollTop && (
                    <TouchableOpacity
                        onPress={scrollToTop}
                        style={styles.scrollUp}
                    >
                        <HugeiconsIcon
                            icon={ArrowUpIcon}
                            size={24}
                            strokeWidth={2.5}
                            color={'white'}
                        />
                    </TouchableOpacity>
                )}
            </View>
            {isLoading && <Loading screenSize={100} size={'large'}/>}
        </>

    );
};

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.white,
        padding: 10,
        paddingTop: 0,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    listContent: {
        paddingBottom: 100,
    },
    card: {
        backgroundColor: theme.colors.white,
        borderRadius: 12,
        padding: 10,
        marginBottom: 10,
        shadowColor: '#006d9c',
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 0.2,
        shadowRadius: 5,
        borderWidth: 2,
        borderColor: theme.colors.gray1,
    },
    myClubCard: {
        backgroundColor: theme.colors.gray,
        borderRadius: 12,
        padding: 10,
        marginBottom: 10,
        shadowColor: '#006d9c',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.09,
        shadowRadius: 5,
        borderWidth: 0.5,
        borderColor: theme.colors.gray1,
    },
    posterInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    posterInfoImg: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 0.1

    },
    posterInfoText: {
        color: theme.colors.text,

        marginLeft: 10,
    },
    clubName: {
        color: theme.colors.text,
        fontSize: 14,
        fontWeight: 'bold',
    },
    eventDate: {
        fontSize: 12,
        color: theme.colors.textLight,

    },
    cardDescription: {
        fontSize: 14,

        marginBottom: 10,
        color: theme.colors.textLight,

    },
    readMore: {
        top: 4,
        fontWeight: '500',
        color: theme.colors.cyan1,

    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
    },
    tagButton: {
        paddingHorizontal: 6,
        paddingVertical: 5,
        borderRadius: 15,
        marginRight: 5,
        marginBottom: 5,

    },
    tagButtonText: {
        color: 'white',
        fontSize: 11,
    },
    scrollUp: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        bottom: -10,
        borderBottomEndRadius: 0,
        borderBottomLeftRadius: 0,
        backgroundColor: theme.colors.primaryLight,
        borderRadius: 25,
        paddingHorizontal: 15,
        paddingVertical: 10,
        shadowColor: '#006d9c',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.3,
        shadowRadius: 2,
    },

});

export default Clubs;

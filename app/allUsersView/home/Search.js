import {
    Animated,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native'
import React, {useCallback, useContext, useEffect, useRef, useState} from 'react'
import AnimatedSwipeNavigator from "../../../navigators/AnimatedSwipeNavigator";
import {heightPercentage, widthPercentage} from "../../../helpers/common";
import {useScroll} from "../../../contexts/ScrollContext";
import {CalendarIcon, CancelCircleIcon, FilterIcon, SearchIcon, TagIcon} from "@hugeicons/core-free-icons";
import {HugeiconsIcon} from "@hugeicons/react-native";
import {CredentialsContext} from "../../../contexts/CredentialsContext";
import {PopoverContext} from "../../../contexts/PopoverContext";
import {
    getAllCategories,
    getAllClubs,
    getAllClubsCategories,
    getAllEventCategoriesById,
    getAllEvents
} from "../../../api/ConstantsApiCalls";
import {CLUB_DEFAULT_IMAGE} from "../../../constants/DefaultConstants";
import {SkypeIndicator} from "react-native-indicators";
import CustomDateTimePicker from "../../../component/popoversScreens/CustomDateTimePicker";
import CategoryMultiSelect from "../../../component/CategoryMultiSelect";
import {ThemeContext} from "../../../contexts/ThemeContext";
import {useNotification} from "../../../contexts/NotificationsContext";

const Search = ({route, navigation}) => {
    const {theme} = useContext(ThemeContext);
    const styles = createStyles(theme);
    const { refreshData} = useNotification();

    const {searchFor, backTitle, activeFilterByPress} = route.params || {};
    const [refreshing, setRefreshing] = useState(false);
    const {setTabBarVisibility, isTabBarVisible} = useScroll();
    const {storedJwt, user} = useContext(CredentialsContext);
    const {openSuccessMassage, openAlertMassage} = useContext(PopoverContext);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingFilter, setIsLoadingFilter] = useState(true);
    //date control        *************************************************************************************************
    const today = new Date();
    const todayDate = today.toISOString().split('T')[0]

    // Animation for scrolling up effect                                           *************************************************************
    const translateY = useRef(new Animated.Value(0)).current;
    const [headerVisible, setHeaderVisible] = useState(true);
    const [prevOffset, setPrevOffset] = useState(0);


//Control Search                                                     ***************************************************************************
    const [showFilters, setShowFilters] = useState(false);
    const [searchQuery, setSearchQuery] = useState(searchFor ? searchFor : '');
    const [activeFilter, setActiveFilter] = useState(activeFilterByPress ? activeFilterByPress : 'all');
    const [activeView, setActiveView] = useState('all');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [allCategories, setAllCategories] = useState([]);
    const [eventCategories, setEventCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);

//Values of  Search   result                                                   ***************************************************************************
    const [events, setEvents] = useState([]);
    const [sortedEvents, setSortedEvents] = useState([]);
    const [clubs, setClubs] = useState([]);
    const [sortedEventsCategories, setSortedEventsCategories] = useState([]);
    const [sortedClubCategories, setSortedClubCategories] = useState([]);
    const [filterResults, setFilterResults] = useState([]);
    const [pendingSearch, setPendingSearch] = useState(null);
    const [beforSearchResults, setBeforSearchResults] = useState([]);
    const [searchTextByName, setSearchTextByName] = useState(true);
    const [searchTextByDescription, setSearchTextByDescription] = useState(false);
    const [searchTextByCategory, setSearchTextByCategory] = useState(false);


    // setting stat of filter type first and then change to pend the value by useEffect *********************************************
    const handelCategoryPress = (category) => {
        setActiveFilter('all')
        setActiveView('all')
        setSearchTextByCategory(true)
        setSearchTextByDescription(false)
        setSearchTextByName(false)
        setPendingSearch(category)
    }
    // after Pending the value make sure filter was set by the stat then call search fun *********************************************
    useEffect(() => {
        if (activeFilter === 'all' && pendingSearch) {
            handleSearch(pendingSearch);
            setPendingSearch(null);
        }
    }, [activeFilter, pendingSearch]);
    // Fetch data for events, categories and clubs API CALLS
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [eventsData,
                eventsCategoriesData,
                clubsData,
                clubsCategoriesData,
                ctegoriesData] = await Promise.all([
                getAllEvents(storedJwt, openSuccessMassage, openAlertMassage),
                getAllEventCategoriesById(storedJwt, openSuccessMassage, openAlertMassage),
                getAllClubs(storedJwt, openSuccessMassage, openAlertMassage),
                getAllClubsCategories(storedJwt, user, openSuccessMassage, openAlertMassage),
                getAllCategories(storedJwt, user, openSuccessMassage, openAlertMassage),
            ]);
            setEvents(eventsData)
            setClubs(clubsData)
            setSortedClubCategories(clubsCategoriesData)
            setAllCategories(ctegoriesData)
            if (eventsData) {
                // Add type and unique ID to events
                const typedEvents = eventsData.map(event => ({
                    ...event,
                    type: 'event',
                    id: `event-${event.eventID}`
                }));
                setEvents(typedEvents);

                // Filter active events and sort by date
                const filtered = typedEvents.filter(event =>
                    event.eventStates && !event.eventUpdated && event.eventPostRequested
                    && event.eventStartingDate >= todayDate
                ).sort((a, b) => {
                    const dateA = new Date(a.eventStartingDate);
                    const dateB = new Date(b.eventStartingDate);
                    return dateB - dateA;
                });
                setSortedEvents(filtered);
            }

            if (eventsCategoriesData) {
                setSortedEventsCategories(eventsCategoriesData);
            }

            if (clubsData) {
                const typedClubs = clubsData.sort((a, b) => {
                    const creationDateA = new Date(a.creatingDate);
                    const creationDateB = new Date(b.creatingDate);
                    return creationDateB - creationDateA;
                }).map(club => ({
                    ...club,
                    type: 'club',
                    id: `club-${club.clubID}`
                }));
                setClubs(typedClubs);
            }

        } catch (error) {
            console.error('Error fetching data:', error);
            openAlertMassage('Failed to load data');
        }
        setIsLoading(false);
    };
    useEffect(() => {

        // 1: # make clubs and events  in one place  ***********************************************************
        const combinedItems = [
            ...sortedEvents.map(item => ({type: 'event', ...item})),
            ...clubs.map(item => ({type: 'club', ...item}))
        ];
        // 2: # sort by Date  ***********************************************************
        const sortedFiltered = combinedItems.sort((a, b) => {
            const creationDateA = new Date(
                a.type === 'event' ? a.eventStartingDate : a.creatingDate
            );
            const creationDateB = new Date(
                b.type === 'event' ? b.eventStartingDate : b.creatingDate
            );

            return creationDateB - creationDateA;
        });
        setBeforSearchResults(sortedFiltered)
    }, [clubs, sortedEvents]);

    // Fetch initial data                           *********************************************************************
    useEffect(() => {
        fetchData();
        setTabBarVisibility(false);


    }, [storedJwt, searchFor,refreshData, activeFilterByPress, navigation, refreshing, activeView, user]);
    // Handle search for both events and clubs                          *********************************************************************
    const handleSearch = (text) => {
        setSearchQuery(text);
        setIsLoadingFilter(true)
        const filteredEventsByCategory = sortedEventsCategories.filter(item =>
            searchTextByCategory && item.category.categoryName?.toLowerCase().includes(text?.toLowerCase())
        ).map(item => item.event.eventID);
        const filteredClubsByCategory = sortedClubCategories.filter(item =>
            searchTextByCategory && item.category.categoryName?.toLowerCase().includes(text?.toLowerCase())
        ).map(item => item.club.clubID);
        const searchText = text?.toLowerCase();
        switch (activeFilter) {
            case 'all':
                // 3: # sort by search  ***********************************************************
                const filteredResults = beforSearchResults.filter(item => {
                    if (item.type === 'event') {
                        return (
                            searchTextByName && item.eventName?.toLowerCase().startsWith(searchText) ||
                            searchTextByDescription && item.eventPostDescription?.toLowerCase().includes(searchText) ||
                            searchTextByCategory && filteredEventsByCategory.some(eventID => item.eventID === eventID)
                        );
                    } else if (item.type === 'club') {
                        return (
                            searchTextByName && item.clubName?.toLowerCase().startsWith(searchText) ||
                            searchTextByDescription && item.clubDescription?.toLowerCase().includes(searchText) ||
                            searchTextByCategory && filteredClubsByCategory.some(clubID => item.clubID === clubID)
                        );
                    }
                    return false;
                });


                setFilterResults(filteredResults);
                break;


            case 'category':
                const eventsByCategory = sortedEvents.filter(event => {
                    return sortedEventsCategories
                        .filter(cat => cat.event.eventID === event.eventID)
                        .some(cat => cat.category.categoryName?.toLowerCase().includes(searchText));
                }).map(event => ({
                    ...event,
                    type: 'event',
                    name: event.eventName,
                    description: event.eventDescription,
                    date: event.eventStartingDate
                }));

                const clubsByCategory = clubs.filter(club => {
                    return sortedClubCategories
                        ?.filter(cat => cat.club.clubID === club.clubID)
                        ?.some(cat => cat.category.categoryName?.toLowerCase().includes(searchText));
                }).map(club => ({
                    ...club,
                    type: 'club',
                    name: club.clubName,
                    description: club.clubDescription
                }));

                setFilterResults([...eventsByCategory, ...clubsByCategory]);
                break;

            case 'date':
                setFilterResults(sortedEvents.map(event => ({
                    ...event,
                    type: 'event',
                    name: event.eventName,
                    description: event.eventDescription,
                    date: event.eventStartingDate.split('T')[0]
                })).filter(event =>
                    event.date === searchText
                ));
                break;
        }
        setIsLoadingFilter(false)
    };
    //BottomTabNavigator Hiding when triggering Notification page       *********************************************************************
    useEffect(() => {
        setTabBarVisibility(false);

    }, [navigation]);
    useEffect(() => {
        if (searchTextByName ||
            searchTextByDescription ||
            searchTextByCategory) {
            handleSearch(searchQuery || '')

        }

    }, [searchTextByName, searchTextByDescription, searchTextByCategory]);
    // Refresh handler (pull-to-refresh)                                        **********************************************************************
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 1500);
    }, []);
    // Determine scroll direction and show/hide tab bar  **********************************************************************
    const handleScroll = (event) => {
        const currentOffset = event.nativeEvent.contentOffset.y;
        const scrollDirection = currentOffset > prevOffset ? 'down' : 'up';
        setPrevOffset(currentOffset);
        // Hide tab bar when scrolling down, show tab bar when scrolling up  **********************************************************************
        setHeaderVisible(scrollDirection === 'up');
        setShowFilters(false);
        // Always show tab bar when at the very top                        **********************************************************************
        if (currentOffset <= 0) {
            setTabBarVisibility(false)
            setHeaderVisible(true);
        }
    };
    // Helper to count words in a string.
    const wordCount = (str) => {
        if (!str) return 0;
        return str.trim().split(/\s+/).length;
    };
    //Animation Trigger Controller                                        ***********************************************************
    useEffect(() => {
        Animated.timing(translateY, {
            toValue: headerVisible ? 0 : -5,
            duration: 100,
            useNativeDriver: true,
        }).start();
    }, [headerVisible]);
    //set hte Active View  only for events when searching by date          ***********************************************************
    useEffect(() => {
        activeFilter === 'date' && setActiveView('events')
    }, [activeFilter]);
    // //Trigger Category Search          ***********************************************************
    useEffect(() => {
        if (activeFilter === 'category' &&
            selectedCategories.length > 0 && allCategories) {
            setEventCategories(selectedCategories[0].categoryID);
            handleSearch(selectedCategories[0]?.categoryName)
        }
    }, [selectedCategories]);
    // //Trigger Category Search for tag press from out         ***********************************************************
    useEffect(() => {

        if (activeFilterByPress === 'category' && searchFor && allCategories.length > 0) {

            setIsLoadingFilter(true)
            setSelectedCategories(
                allCategories.filter(item =>
                    item.categoryName.toLowerCase()
                        .includes(searchFor.toLowerCase()))
            );
            setIsLoadingFilter(false)
        }
    }, [activeFilterByPress, searchFor, allCategories, eventCategories]);

    return (
        <AnimatedSwipeNavigator navigation={navigation}
                                backTitle={backTitle}
                                pageTitle={"Search"}
                                fromLeft={false}>
            {/* Header of Search Input and filters and Toggle pages ------------------------------------------------------------------------------------*/}
            <View style={styles.headerContainer}>
                {/*Search Input ------------------------------------------------------------------------------------*/}
                {headerVisible &&
                    <Animated.View style={[styles.searchContainer, {transform: [{translateY}]},]}>
                        {activeFilter !== 'category' ?
                            // Search ALL AND DATE ------------------------------------------------------------------------------------
                            <View style={styles.searchBar}>
                                <TouchableOpacity
                                    activeOpacity={1}
                                    onPress={() => setShowFilters(!showFilters)}
                                    style={[styles.filterButton, showFilters && {
                                        backgroundColor: theme.colors.cyan1, height: '100%',
                                    }]}
                                >
                                    <HugeiconsIcon icon={FilterIcon} size={24} strokeWidth={2.5}
                                                   color={showFilters ? 'white' : theme.colors.cyan1}/>
                                </TouchableOpacity>
                                <View style={styles.searchInputContainer}>
                                    <HugeiconsIcon icon={SearchIcon} strokeWidth={2} size={24}
                                                   color={theme.colors.text}/>
                                    {activeFilter === 'all' &&
                                        <TextInput
                                            keyboardAppearance={theme.type}
                                            onPress={() => {
                                                setShowFilters(false)
                                            }}
                                            placeholderTextColor={theme.colors.text}
                                            style={styles.searchInput}
                                            placeholder="Search Name, Description or Category..."
                                            value={searchQuery}
                                            onChangeText={handleSearch}
                                        />
                                        ||
                                        activeFilter === 'date' &&
                                        <>
                                            <TextInput
                                                keyboardAppearance={theme.type}
                                                onPress={() => {
                                                    setShowDatePicker(!showDatePicker)
                                                    setShowFilters(false)
                                                }}
                                                editable={false}
                                                style={styles.searchInput}
                                                placeholderTextColor={theme.colors.text}
                                                placeholder="Search by Event Date"
                                                value={searchQuery}
                                            />
                                            {searchQuery &&
                                                <TouchableOpacity
                                                    activeOpacity={0.5}
                                                    style={{marginHorizontal: 10}}
                                                    onPress={() => handleSearch('')}

                                                >
                                                    <HugeiconsIcon
                                                        icon={CancelCircleIcon}
                                                        size={24}
                                                        color={theme.colors.red}
                                                    />
                                                </TouchableOpacity>

                                            }
                                            <TouchableOpacity
                                                activeOpacity={0.5}
                                                style={{marginHorizontal: 10}}
                                                onPress={() => setShowDatePicker(!showDatePicker)}

                                            >
                                                <HugeiconsIcon
                                                    icon={CalendarIcon}
                                                    size={24}
                                                    strokWidth={2.5}
                                                    color={theme.colors.cyan1}
                                                />
                                            </TouchableOpacity>
                                        </>
                                    }
                                </View>
                            </View>
                            :
                            // Search Category ------------------------------------------------------------------------------------

                            <View style={styles.searchBarCategories}>
                                <TouchableOpacity
                                    activeOpacity={0.9}
                                    onPress={() => (setShowFilters(!showFilters))}
                                    style={[styles.filterButtonCategory, showFilters && {
                                        backgroundColor: theme.colors.cyan1, height: '100%',
                                    }]}
                                >
                                    <HugeiconsIcon icon={FilterIcon} size={24} strokeWidth={2.5}
                                                   color={showFilters ? 'white' : theme.colors.cyan1}/>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    activeOpacity={0.5}
                                    style={{marginHorizontal: 5}}
                                >
                                    <HugeiconsIcon
                                        icon={TagIcon}
                                        size={24}
                                        color={theme.colors.cyan1}
                                    />
                                </TouchableOpacity>
                                <CategoryMultiSelect
                                    data={allCategories}
                                    selectedCategories={eventCategories}
                                    setSelectedCategories={setSelectedCategories}
                                    allowedToSelect={1}
                                    styleContainer={styles.styleContainerSelect}
                                />
                            </View>}

                        {showFilters && (
                            <View style={styles.filterMenuContainer}>
                                <View style={styles.filterMenu}>
                                    {['all', 'category', 'date'].map((filter) => (
                                        <TouchableOpacity
                                            activeOpacity={1}
                                            key={filter}
                                            style={[
                                                styles.filterOption,
                                                activeFilter === filter && styles.activeFilter
                                            ]}
                                            onPress={() => {
                                                // setShowFilters(false)
                                                setActiveView('all')
                                                setActiveFilter(filter);
                                                setSearchQuery('')
                                                setSelectedCategories([])
                                                setEventCategories([])
                                            }}
                                        >
                                            <HugeiconsIcon
                                                icon={filter === 'category' ? TagIcon : filter === 'date' ? CalendarIcon : SearchIcon}
                                                size={20}
                                                strokeWidth={2}
                                                color={activeFilter === filter ? 'white' : theme.colors.cyan1}
                                            />
                                            <Text style={[
                                                styles.filterText,
                                                activeFilter === filter && styles.activeFilterText
                                            ]}>
                                                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}

                                </View>
                                {activeFilter === 'all' &&
                                    <View style={{flexDirection: 'row'}}>

                                        {/* search Text By Name Toggle ---------------------------------------------------------- */}
                                        <View style={styles.menuItem}>
                                            <View style={styles.menuLeft}>
                                                <Text style={styles.menuText}> By Name </Text>
                                            </View>
                                            <View style={{transform: [{scaleX: 0.8}, {scaleY: 0.8}]}}>
                                                <Switch value={searchTextByName} onValueChange={setSearchTextByName}/>
                                            </View>
                                        </View>
                                        {/* search Text By Description Toggle ---------------------------------------------------------- */}
                                        <View style={styles.menuItem}>
                                            <View style={styles.menuLeft}>
                                                <Text style={styles.menuText}> By Description </Text>
                                            </View>
                                            <View style={{transform: [{scaleX: 0.8}, {scaleY: 0.8}]}}>
                                                <Switch value={searchTextByDescription}
                                                        onValueChange={setSearchTextByDescription}/>
                                            </View>
                                        </View>
                                        {/* search Text By Category Toggle ---------------------------------------------------------- */}
                                        <View style={styles.menuItem}>
                                            <View style={styles.menuLeft}>
                                                <Text style={styles.menuText}> By Category </Text>
                                            </View>
                                            <View style={{transform: [{scaleX: 0.8}, {scaleY: 0.8}]}}>
                                                <Switch value={searchTextByCategory}
                                                        onValueChange={setSearchTextByCategory}/>
                                            </View>
                                        </View>
                                    </View>}
                            </View>
                        )}

                    </Animated.View>}
                {/*  view toggle buttons ------------------------------------------------------------------------------------*/}
                {!showFilters &&
                    <View style={styles.viewToggleContainer}>

                        {activeFilter !== 'date' &&
                            <TouchableOpacity
                                activeOpacity={1}
                                onPress={() => {
                                    setSearchQuery('')
                                    setActiveView('all')
                                }}
                                style={[
                                    styles.toggleButton,
                                    activeView === 'all' && styles.activeToggleButton
                                ]}

                            >
                                <Text style={[
                                    activeView === 'all' ? styles.activeToggleButtonText : styles.toggleButtonText
                                ]}>All</Text>
                            </TouchableOpacity>}
                        <TouchableOpacity
                            activeOpacity={1}
                            onPress={() => setActiveView('events')}
                            style={
                                activeView === 'events' ? styles.activeToggleButton : styles.toggleButton}
                        >
                            <Text style={[
                                activeView === 'events' ? styles.activeToggleButtonText : styles.toggleButtonText
                            ]}>Events</Text>
                        </TouchableOpacity>
                        {activeFilter !== 'date' && <TouchableOpacity
                            activeOpacity={1}
                            onPress={() => setActiveView('clubs')}
                            style={[
                                activeView === 'clubs' ? styles.activeToggleButton : styles.toggleButton
                            ]}
                        >
                            <Text style={[
                                styles.toggleButtonText,
                                activeView === 'clubs' && styles.activeToggleButtonText
                            ]}>Clubs</Text>
                        </TouchableOpacity>}
                    </View>
                }
            </View>
            <ScrollView
                style={{backgroundColor: theme.colors.white, height: heightPercentage(100)}}
                scrollEventThrottle={16}
                onScroll={handleScroll}
                contentContainerStyle={styles.pageUpNav}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        progressViewOffset={heightPercentage(15)}
                        tintColor={theme.colors.primary}
                        colors={[theme.colors.primary]}
                    />
                }>

                {/*  Search results Area ------------------------------------------------------------------------------------*/}
                <View style={styles.searchResults}>
                    {filterResults?.map((item, index) => {
                        if (item.type === 'club' && activeView !== 'events') {
                            return (
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() => navigation.navigate('ClubProfile', {
                                        club: item,
                                        user: user,
                                        backTitle: 'Clubs'
                                    })}
                                    key={`club-${item.clubID}-${index}`}
                                    style={styles.card}
                                >
                                    <TouchableOpacity activeOpacity={0.7} style={styles.topCardButton}>
                                        <Text style={[styles.tagButtonText,]}># Club</Text>
                                    </TouchableOpacity>

                                    <View style={{paddingHorizontal: 10}}>
                                        <TouchableOpacity
                                            activeOpacity={0.7}
                                            style={styles.posterInfo}
                                            onPress={() => navigation.navigate('ClubProfile', {
                                                club: item,
                                                user: user,
                                                backTitle: 'Clubs'
                                            })}
                                        >
                                            <Image
                                                source={{uri: item.clubProfilePicURL || CLUB_DEFAULT_IMAGE}}
                                                style={styles.posterInfoImg}
                                            />
                                            <View style={styles.posterInfoText}>
                                                <Text style={styles.clubName}>{item.clubName || 'NA'}</Text>
                                                <Text style={styles.eventDate}>{item.creatingDate}</Text>
                                            </View>
                                        </TouchableOpacity>

                                        <Text style={styles.cardDescription}>
                                            {item.clubDescription.split(/\s+/).slice(0, 20).join(' ')}
                                            {wordCount(item.clubDescription) > 20 && (
                                                <TouchableOpacity
                                                    activeOpacity={0.7}
                                                    onPress={() => navigation.navigate('ClubProfile', {
                                                        club: item,
                                                        user: user,
                                                        backTitle: 'Clubs'
                                                    })}
                                                >
                                                    <Text style={styles.readMore}>... Read More</Text>
                                                </TouchableOpacity>
                                            )}
                                        </Text>

                                        <View style={styles.tagsContainer}>
                                            {sortedClubCategories
                                                ?.filter(category => category.club.clubID === item.clubID)
                                                .map((category, index) => (
                                                    <TouchableOpacity
                                                        key={index}
                                                        onPress={() => handelCategoryPress(category.category.categoryName)}
                                                        style={[styles.tagButton, {backgroundColor: theme.colors.cyan1}]}
                                                    >
                                                        <Text
                                                            style={styles.tagButtonText}># {category.category.categoryName}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        }

                        if (item.type === 'event' && activeView !== 'clubs') {
                            return (
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() => navigation.navigate('EventFullView', {
                                        post: item,
                                        backTitle: 'Search'
                                    })}
                                    key={`event-${item.eventID}-${index}`}
                                    style={styles.card}
                                >
                                    <TouchableOpacity
                                        activeOpacity={0.7}
                                        style={[styles.topCardButton, {backgroundColor: theme.colors.events}]}
                                    >
                                        <Text style={[styles.tagButtonText,]}># Event</Text>
                                    </TouchableOpacity>

                                    <View style={{paddingHorizontal: 10}}>
                                        <TouchableOpacity
                                            style={styles.posterInfo}
                                            onPress={() => navigation.navigate('EventFullView', {
                                                post: item,
                                                backTitle: 'Search'
                                            })}
                                        >
                                            <Image
                                                source={{uri: item.eventPostMediaURL || CLUB_DEFAULT_IMAGE}}
                                                style={styles.posterInfoImg}
                                            />
                                            <View style={styles.posterInfoText}>
                                                <Text style={styles.clubName}>{item.eventName || 'NA'} Event</Text>
                                                <Text style={styles.eventDate}>{item.eventStartingDate}</Text>
                                            </View>
                                        </TouchableOpacity>

                                        <Text style={styles.cardDescription}>
                                            {item.eventPostDescription.split(/\s+/).slice(0, 20).join(' ')}
                                            {wordCount(item.eventPostDescription) > 20 && (
                                                <TouchableOpacity
                                                    onPress={() => navigation.navigate('EventFullView', {
                                                        post: item,
                                                        backTitle: 'Search'
                                                    })}
                                                >
                                                    <Text style={styles.readMore}>... Read More</Text>
                                                </TouchableOpacity>
                                            )}
                                        </Text>

                                        <View style={styles.tagsContainer}>
                                            {sortedEventsCategories
                                                ?.filter(category => category.event.eventID === item.eventID)
                                                .map((category, index) => (
                                                    <TouchableOpacity
                                                        key={index}
                                                        onPress={() => handelCategoryPress(category.category.categoryName)}
                                                        style={[styles.tagButton, {backgroundColor: theme.colors.cyan1}]}
                                                    >
                                                        <Text
                                                            style={styles.tagButtonText}># {category.category.categoryName}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        }

                        return null;
                    })}

                    {/* Loading and Empty States */}
                    {(isLoading || isLoadingFilter) && filterResults.length > 0 ? (
                        <View style={styles.BackgrondEmptyEvents}>
                            <SkypeIndicator size={50} color={theme.colors.primaryLight}/>
                        </View>
                    ) : filterResults.length < 1 ? (
                        searchQuery ? (
                            <View style={styles.BackgrondEmptyEvents}>
                                <Text style={{fontSize: 16, fontWeight: '600', color: theme.colors.text}}>
                                    There is no results of "{searchQuery}".
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.BackgrondEmptyEvents}>
                                <Text style={{
                                    fontSize: 16, fontWeight: '600', color: theme.colors.textLight
                                }}>
                                    {activeFilter === 'date' ? 'Search Events By Date .' : 'Search Events, Clubs .'}
                                </Text>
                            </View>
                        )
                    ) : null}
                </View>


            </ScrollView>
            <CustomDateTimePicker
                visible={showDatePicker}
                isDateMode={true}
                onClose={() => {
                    setShowDatePicker(false)
                }}
                onConfirm={(selectedDate) => {
                    handleSearch(selectedDate.toISOString().split('T')[0]);

                }}
                initialDate={new Date()}
                theme={theme}
                widthPercentage={widthPercentage}
                heightPercentage={heightPercentage}
            />

        </AnimatedSwipeNavigator>
    )
}
export default Search
const createStyles = (theme) => StyleSheet.create({
    headerContainer: {
        position: 'absolute',
        zIndex: 9999,

    },
    searchContainer: {

        padding: 5,
        width: widthPercentage(100),
        backgroundColor: theme.colors.white,

    },
    searchBar: {
        flexDirection: 'row',
        height: heightPercentage(6),
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        backgroundColor: theme.type === 'dark' ? theme.colors.gray : 'white',
        borderColor: theme.type === 'dark' ? theme.colors.gray1 : theme.colors.cyan1,
        borderRadius: 18,
        borderCurve: 'continuous',
    },
    searchBarCategories: {

        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 5,
        justifyContent: 'flex-start',
        borderWidth: 1,
        borderColor: theme.type === 'dark' ? theme.colors.gray1 : theme.colors.cyan1,
        borderRadius: 20,
        borderCurve: 'continuous',
        backgroundColor: theme.type === 'dark' ? theme.colors.gray : 'white',
        height: heightPercentage(7.2),
        width: widthPercentage(95),
    },
    filterButton: {
        paddingHorizontal: 15,
        borderRightWidth: 0.5,
        borderTopLeftRadius: theme.radius.lg,
        borderBottomLeftRadius: theme.radius.lg,
        borderRightColor: theme.colors.cyan1,
        backgroundColor: theme.type === 'dark' ? theme.colors.gray1 : 'white',
        height: '100%',
        justifyContent: 'center',
    },
    filterButtonCategory: {
        paddingHorizontal: 10,
        borderRightWidth: 0.5,
        borderTopLeftRadius: theme.radius.lg,
        borderBottomLeftRadius: theme.radius.lg,
        borderRightColor: theme.colors.cyan1,
        backgroundColor: theme.type === 'dark' ? theme.colors.gray1 : 'white',
        height: '100%',
        justifyContent: 'center',
    },
    filterIcon: {
        marginHorizontal: 5,
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 5,
        gap: 5,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        paddingVertical: 7,
        color: theme.colors.text,
    },
    filterMenuContainer: {
        backgroundColor: theme.colors.white,
        borderBottomWidth: 2,
        borderColor: theme.colors.gray1,
        paddingBottom: 5,
        shadowColor: '#006d9c',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.3,
        shadowRadius: 2,

    },
    filterMenu: {
        flexDirection: 'row',
        backgroundColor: theme.colors.white,
        padding: 5,
        width: widthPercentage(100),
        justifyContent: 'space-evenly',
        paddingVertical: 10,
    },
    filterOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 5,
        marginHorizontal: 5,
        borderRadius: 20,
        backgroundColor: theme.colors.white,
        borderWidth: 1,
        borderColor: theme.colors.cyan1,
        gap: 5,

    },
    activeFilter: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 5,
        marginHorizontal: 5,
        borderRadius: 20,
        backgroundColor: theme.colors.cyan1,
        borderWidth: 1,
        borderColor: theme.colors.cyan1,
        gap: 5,

    },
    filterText: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.cyan1,
    },
    activeFilterText: {
        fontSize: 15,
        fontWeight: '700',
        color: 'white',

    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: theme.colors.white,
    },
    menuLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    menuText: {
        fontSize: 13,
        fontWeight: "500",
        color: theme.colors.textLight,
    },
    viewToggleContainer: {
        width: widthPercentage(100),
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        backgroundColor: theme.colors.white,
        paddingVertical: 5,
        zIndex: -10,
        shadowColor: '#006d9c',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.09,
        shadowRadius: 5,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.gray1,


    },
    toggleButton: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        marginHorizontal: 5,
        borderRadius: 20,
        backgroundColor: theme.colors.white,
        borderWidth: 1,
        borderColor: theme.colors.cyan1,
    },
    activeToggleButton: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        marginHorizontal: 5,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.colors.cyan1,
        backgroundColor: theme.colors.cyan1,
    },
    toggleButtonText: {
        color: theme.colors.cyan1,
        fontSize: 14,
        fontWeight: '500',
    },
    activeToggleButtonText: {
        color: 'white',
        fontWeight: '500',
        fontSize: 14,

    },
    scrollView: {
        flex: 1,
        backgroundColor: theme.colors.white,
        top: heightPercentage(25),
    },
    simpleCard: {
        flexDirection: 'row',
        backgroundColor: theme.colors.white,
        borderRadius: 12,
        padding: 10,
        marginBottom: 10,
        marginHorizontal: 10,
        shadowColor: '#006d9c',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.09,
        shadowRadius: 5,
        borderWidth: 0.5,
        borderColor: theme.colors.gray1,
        alignItems: 'center',
    },
    cardImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
    },
    cardContent: {
        flex: 1,
        justifyContent: 'center',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 4,
    },
    cardDate: {
        fontSize: 14,
        color: theme.colors.text,
    },
    searchResults: {
        paddingTop: heightPercentage(15),
        paddingBottom: heightPercentage(10),
    },
    card: {
        backgroundColor: theme.colors.white,
        borderRadius: 12,
        paddingTop: 0,
        paddingBottom: 10,
        marginBottom: 10,
        marginHorizontal: 10,
        shadowColor: '#006d9c',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.3,
        shadowRadius: 5,
        borderWidth: 2,
        borderColor: theme.colors.gray1
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
    },
    posterInfoText: {
        marginLeft: 10,
        color: theme.colors.text,
    },
    clubName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    eventDate: {
        fontSize: 12,
        color: theme.colors.textLight,
    },
    cardDescription: {
        flexDirection: 'column',
        fontSize: 13,
        color: theme.colors.text,
        marginBottom: 10,
    },
    readMore: {
        top: 4,
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
    topCardButton: {
        backgroundColor: theme.colors.cyan1,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomEndRadius: 0,
        borderBottomLeftRadius: 0,
        paddingHorizontal: 6,
        borderRadius: 15,
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
    BackgrondEmptyEvents: {
        width: widthPercentage(95),
        borderRadius: 12,
        marginTop: 10,
        padding: 10,
        minHeight: heightPercentage(20),
        gap: 10,
        alignSelf: 'center',
        justifyContent: 'center', alignItems: 'center',

    },
    styleContainerSelect: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99,
        width: widthPercentage(75),
        shadowColor: '#006d9c',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.09,
        shadowRadius: 5,
        borderWidth: 0.5,
        borderColor: theme.colors.gray1,
    },
})


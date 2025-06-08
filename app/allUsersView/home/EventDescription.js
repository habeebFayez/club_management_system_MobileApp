import React, {useContext, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {ThemeContext} from "../../../contexts/ThemeContext";

const EventDescription = ({post}) => {
    const {theme} = useContext(ThemeContext);
    const styles = createStyles(theme);
    const [expandedPosts, setExpandedPosts] = useState({});
    const words = post.eventPostDescription.split(/\s+/);
    const shouldTruncate = words.length > 60;
    const truncatedText = shouldTruncate ?
        words.slice(0, 60).join(' ') + '...' :
        post.eventPostDescription;


    const toggleExpansion = (postId) => {
        setExpandedPosts(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };


    return (
        <View style={styles.postText}>
            <Text style={styles.eventName}>{post.eventName.toUpperCase()}</Text>
            <Text style={styles.eventDescription}>
                {expandedPosts[post.eventID] ? post.eventPostDescription : truncatedText}
            </Text>

            {shouldTruncate && (
                <TouchableOpacity onPress={() => toggleExpansion(post.eventID)}>
                    <Text style={styles.readMore}>
                        {expandedPosts[post.eventID] ? 'Show Less' : 'Read More...'}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const createStyles = (theme) => StyleSheet.create({
    eventDescription: {
        fontSize: 14,
        lineHeight: 24,
        color: theme.colors.text,

    },

    postText: {
        marginVertical: 10,
    },

    eventName: {
        color: theme.colors.textDark,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
    },
    readMore: {
        color: '#0c63bf',
        fontWeight: '700',
        marginTop: 5,
    },
});

export default EventDescription;
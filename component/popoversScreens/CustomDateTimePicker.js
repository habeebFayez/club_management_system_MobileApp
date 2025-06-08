import React, {useState} from 'react';
import {Modal, Platform, Text, TouchableOpacity, View} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

// use props directly as foe Ex... <CustomDateTimePicker dateFormat={"day month year"}
// ... rest props will be passed to DateTimePicker component}
const CustomDateTimePicker = ({
                                  props,
                                  visible,
                                  isDateMode = true,
                                  onClose,
                                  onConfirm,
                                  initialDate,
                                  theme,
                                  widthPercentage,
                                  heightPercentage,
                                  is24Hours = false
                              }) => {

    const [selectedDate, setSelectedDate] = useState(initialDate || new Date());

    const handleChange = (event, newDate) => {
        if (newDate) setSelectedDate(newDate);
    };

    const confirmSelection = () => {
        onConfirm(selectedDate);
        onClose();
    };

    return (
        visible && (
            <Modal
                transparent
                animationType="slide"
                visible={visible}
                onRequestClose={onClose}

            >
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0,0,0,0.32)',
                        borderWidth: 2,
                        borderColor: theme.colors.gray1,
                        shadowColor: '#006d9c',
                        shadowOffset: {width: 0, height: 0},
                        shadowOpacity: 0.2,
                        shadowRadius: 5,
                    }}>
                    <TouchableOpacity onPress={onClose}
                                      style={{height: heightPercentage(100), width: widthPercentage(100)}}/>

                    <View
                        style={{
                            backgroundColor: theme.colors.white,
                            padding: 20,
                            borderRadius: 50,
                            width: widthPercentage(95),
                            alignItems: 'center',
                            borderWidth: 2,
                            borderColor: theme.colors.gray1,
                            shadowColor: '#006d9c',
                            shadowOffset: {width: 0, height: 0},
                            shadowOpacity: 0.2,
                            shadowRadius: 5,
                        }}
                    >
                        <Text style={{fontSize: 18, marginBottom: 10, color: theme.colors.textLight}}>
                            {isDateMode === "date" ? "Select Date" : "Select Time"}
                        </Text>

                        <DateTimePicker
                            value={selectedDate}
                            mode={isDateMode ? 'date' : 'time'}
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={handleChange}
                            textColor={theme.colors.textLight}
                            is24Hour={true}
                            {...props}

                        />
                    </View>

                    <View style={{
                        borderWidth: 2,
                        borderColor: theme.colors.gray1,
                        shadowColor: '#006d9c',
                        shadowOffset: {width: 0, height: 0},
                        shadowOpacity: 0.2,
                        shadowRadius: 5, gap: 5, alignItems: 'center', justifyContent: 'center', marginTop: 5
                    }}>
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={confirmSelection}
                            style={{
                                padding: 10,
                                backgroundColor: theme.colors.white,
                                borderRadius: 50,
                                height: heightPercentage(9),
                                width: widthPercentage(95),
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Text style={{color: theme.colors.textLight, fontSize: 18}}>Confirm</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={onClose}
                            activeOpacity={0.9}
                            style={{
                                padding: 10,
                                backgroundColor: theme.colors.white,
                                borderRadius: 50,
                                width: widthPercentage(95),
                                height: heightPercentage(9),
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 5,
                            }}
                        >
                            <Text style={{color: theme.colors.textLight, fontSize: 18}}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        )
    );
};

export default CustomDateTimePicker;

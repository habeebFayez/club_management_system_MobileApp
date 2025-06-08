import React, {useContext, useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import {heightPercentage} from "../helpers/common";
import {ThemeContext} from "../contexts/ThemeContext";

export default function CategoryMultiSelect({
                                                data, selectedCategories,
                                                setSelectedCategories, styleContainer,
                                                allowedToSelect = 3
                                            }) {
    const {theme} = useContext(ThemeContext);
    const styles = createStyles(theme);
    const [open, setOpen] = useState(false);
    //just to be shown for user must make selected Categories fixed to an ID value not as it comes sense it comes with club and user data
    const [value, setValue] = useState([]);
    const [items, setItems] = useState([]);

    //SAVE selected Categories Date to show depends on data for reloading first  ********************************************************
    useEffect(() => {
        if (selectedCategories.length > 0 || allowedToSelect === 1) {
            setValue(selectedCategories)
        }

    }, [data]);
    useEffect(() => {
        setItems(data.map(item => ({
            label: item.categoryName,
            value: item.categoryID,
        })));
    }, [data]);

    useEffect(() => {
        // selectedItems: all items from my items list whose value is in our selected value array
        if (allowedToSelect !== 1) {
            const selectedItems = items.filter(item => value.includes(item.value));
            const updatedCategories = selectedItems.map(category => ({
                categoryName: category.label,
                categoryID: category.value
            }));
            setSelectedCategories(updatedCategories);
        } else {
            const selectedItem = items.find(item => item.value === value);
            setSelectedCategories(selectedItem ? [{
                categoryName: selectedItem.label,
                categoryID: selectedItem.value
            }] : []);
        }
    }, [value, items]);

    const handleSearchTextChange = (text) => {
        if (!text) {
            // If search text is empty, reset items.
            setItems(data.map(item => ({
                label: item.categoryName,
                value: item.categoryID,
            })));
        } else {
            const filtered = data.map(item => ({
                label: item.categoryName,
                value: item.categoryID,
            })).filter(item =>
                item.label.toLowerCase().startsWith(text.toLowerCase())
            );
            setItems(filtered);
        }
    };

    return (
        <View style={styleContainer ? styleContainer : styles.container}>
            <DropDownPicker
                searchable={true}
                modalAnimationType={'slide'}
                onChangeSearchText={handleSearchTextChange}
                searchPlaceholder={'Search'}
                open={open}
                value={value}
                items={items}
                setOpen={setOpen}
                setValue={setValue}
                setItems={setItems}
                max={allowedToSelect}
                onChangeValue={() => {
                    if (value.length >= allowedToSelect) {
                        setOpen(false);
                    }
                }}
                placeholder={allowedToSelect !== 1 ? "Select three Categories maximum" : "Select a Category"}
                theme={theme.type === 'dark' ? "DARK" : 'LIGHT'}
                multiple={allowedToSelect !== 1}
                mode="BADGE"
                badgeColors={theme.colors.cyan1}
                badgeDotColors={["#e76f51", "#00b4d8", "#e9c46a"]}
                containerStyle={styles.dropdownContainer}
                style={styleContainer ? {
                    borderWidth: 0, borderRadius: 20,
                } : styles.dropdown}
                dropDownContainerStyle={styles.dropdownList}
                searchContainerStyle={styles.search}
                searchTextInputStyle={styles.search}
                textStyle={{color: theme.colors.text,}}
                badgeTextStyle={{colore: 'blach'}}
                showArrowIcon={true}

            />
        </View>
    );
}


const createStyles = (theme) => StyleSheet.create({
    container: {
        position: 'relative',
        flexDirection: 'row',
        height: heightPercentage(7.2),
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99,
        gap: 12,

    },
    search: {
        color: theme.colors.text,
        borderWidth: 0,
        backgroundColor: theme.colors.gray1,
    },
    dropdownContainer: {

        height: 50,
        borderWidth: 0.,
        borderColor: theme.colors.gray1,
        borderRadius: 20,
        borderCurve: 'continuous',
        backgroundColor: theme.colors.white,
    },
    dropdown: {
        borderWidth: 0.4,
        borderColor: theme.colors.text,
        borderRadius: 20,
        borderCurve: 'continuous',
        backgroundColor: theme.colors.white,
    },
    dropdownList: {

        borderWidth: 0.4,
        borderColor: 'gray',
        borderRadius: 20,
        borderCurve: 'continuous',
        backgroundColor: theme.colors.white,
    },
});


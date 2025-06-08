import React, {createContext, useState} from "react";

export const PopoverContext = createContext(null);

export const PopoverProvider = ({children}) => {
    const [showPopover, setShowPopover] = useState(false);
    const [popoverSize, setPopoverSize] = useState(false);
    const [popoverContent, setPopoverContent] = useState(null);
    const [popoverTitle, setPopoverTitle] = useState(null);
    const [closeConfirmation, setCloseConfirmation] = useState(null);

    const [showImagePopover, setShowImagePopover] = useState(false);
    const [imagePopoverContent, setImagePopoverContent] = useState([]);

    const [alertMassageContent, setAlertMassageContent] = useState(null);
    const [successMassageContent, setSuccessMassageContent] = useState(null);
    const [massageKey, setMassageKey] = useState(0);
    const [popoverBackgroundColor, setPopoverBackgroundColor] = useState(null);


    const openPopover = (content) => {
        // openSuccessMassage(null);
        // openAlertMassage(null);
        setPopoverContent(content);
        setShowPopover(true);

    };
    const openImagePopover = (content) => {
        setMassageKey(prev => prev + 1);
        setImagePopoverContent([{uri: content ,key:'image'+massageKey}]);

        setShowImagePopover(true);
        // openSuccessMassage(null);
        // openAlertMassage(null);
    };
    const openAlertMassage = (content) => {
        setSuccessMassageContent(null)
        setMassageKey(prev => prev + 1);
        setAlertMassageContent(content);
    };
    const openSuccessMassage = (content) => {
        setAlertMassageContent(null);
        setMassageKey(prev => prev + 1);
        setSuccessMassageContent(content);
    };
    return (
        <PopoverContext.Provider value={{
            showPopover,
            setShowPopover,
            openPopover,
            popoverContent,
            popoverSize,
            setPopoverSize,
            popoverTitle,
            setPopoverTitle,
            setShowImagePopover,
            showImagePopover,
            setImagePopoverContent,
            imagePopoverContent,
            openImagePopover,
            alertMassageContent,
            setAlertMassageContent,
            successMassageContent,
            setSuccessMassageContent,
            massageKey,
            setMassageKey,
            openSuccessMassage,
            openAlertMassage,
            popoverBackgroundColor,
            setPopoverBackgroundColor,
            closeConfirmation,
            setCloseConfirmation

        }}>
            {children}
        </PopoverContext.Provider>
    );
};

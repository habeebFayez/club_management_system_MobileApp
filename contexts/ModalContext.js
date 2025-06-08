import React, {createContext, useState} from "react";

export const ModalContext = createContext(null);

export const ModalProvider = ({children}) => {
    const [showModal, setShowModal] = useState(false);
    const [ModalSize, setModalSize] = useState(false);
    const [ModalContent, setModalContent] = useState(null);
    const [ModalTitle, setModalTitle] = useState(null);
    const [loading, setLoading] = useState(null);
    const [confirmation, setConfirmation] = useState(null);
    const [modalChildren, setModalChildren] = useState([]);
    const [isModalChildren, setIsModalChildren] = useState(false);
    const [modalKey, setModalKey] = useState(Date.now());
    const [confirmationPage, setConfirmationPage] = useState(null);
    const [isConfirmationWithChildren, setIsConfirmationWithChildren] = useState(false);


    const openModal = (content, isComponent = false, isComponentWithChildren) => {
        if (isComponent && !isComponentWithChildren) {
            setIsModalChildren(true);
            setModalChildren([]);
            setModalContent(null);
            setModalChildren(content);
            setShowModal(true);
        } else if (isComponent && isComponentWithChildren) {
            setIsModalChildren(true);
            setIsConfirmationWithChildren(true);
            setModalChildren([]);
            setModalContent(null);
            setModalChildren(content);
            setShowModal(true);
        } else {
            setIsModalChildren(false);
            setModalChildren([]);
            setModalContent(content);
            setShowModal(true);
        }
    };
    const triggerConfirmation = (page) => {
        setConfirmation(true);
        setConfirmationPage(page);  // Set the page that triggered the confirmation
    };

    const resetConfirmation = () => {
        setConfirmation(false);
        setConfirmationPage(null);  // Reset confirmation state after handling
    };

    return (
        <ModalContext.Provider value={{
            showModal, setShowModal, ModalSize, setModalSize, ModalContent, setModalContent,
            ModalTitle, setModalTitle, openModal, loading, setLoading, confirmation, setConfirmation,
            modalChildren, setModalChildren, isModalChildren, setIsModalChildren, modalKey, setModalKey,
            confirmationPage, setConfirmationPage, triggerConfirmation, resetConfirmation, isConfirmationWithChildren

        }}>
            {children}
        </ModalContext.Provider>
    );
};

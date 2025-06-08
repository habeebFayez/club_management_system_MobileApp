import React, {createContext, useContext, useState} from 'react';

//  context with default value
const ScrollContext = createContext({
    isTabBarVisible: true,
    setTabBarVisibility: () => {
    },
});

// Custom hook to consume context
export const useScroll = () => useContext(ScrollContext);

// Provider component
export const ScrollProvider = ({children}) => {
    const [isTabBarVisible, setTabBarVisibility] = useState(true);

    return (
        <ScrollContext.Provider value={{isTabBarVisible, setTabBarVisibility}}>
            {children}
        </ScrollContext.Provider>
    );
};

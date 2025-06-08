import {createContext} from 'react';

export const CredentialsContext = createContext(
    {
        storedJwt: {}, setStoredJwt: () => {
        },
        user: {}, setUser: () => {
        },
        club: {}, setClub: () => {
        },
    })

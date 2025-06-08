// components/PrivateRoute.js
import React, {useState} from 'react';
import {useRouter} from 'expo-router';
import Loading from '../component/Loading';
import ajax from '../Api/fetchServise';
import useAsyncStorage from '../util/useAsyncStorage';

const PrivateRoute = ({children}) => {
    const [jwt, setJwt] = useAsyncStorage("", "jwt");
    const [isLoading, setIsLoading] = useState(true);
    const [isValid, setIsValid] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const router = useRouter();

    if (jwt) {
        ajax(`${process.env.EXPO_PUBLIC_API_URL}/api/auth/validate?token=${jwt}`, "GET", jwt).then((isValid) => {
            setIsValid(isValid);
            setIsLoading(false);

        })
        if (isValid) {
            router.replace('home');
        }
    } else {
        return router.push('login');
    }

    return isLoading ? (
            <Loading/>)
        : (isValid === true ? (children)
            : (<Navigate to="/login"/>));
};

export default PrivateRoute;
// const PrivateRoute = ({ children, jwt }) => {
//     const [isValid, setIsValid] = useState(false);
//     const [isLoading, setIsLoading] = useState(true);
//     const router = useRouter();
//
//     useEffect(() => {
//         let isMounted = true;
//
//         const validate = async () => {
//             try {
//                 // Immediately redirect if no JWT
//                 if (!jwt) {
//                     router.replace('/welcome');
//                     return;
//                 }
//
//                 // Validate token
//                 const isValidToken = await ajax(
//                     `${process.env.EXPO_PUBLIC_API_URL}/api/auth/validate?token=${jwt}`,
//                     "GET",
//                     jwt
//                 );
//
//                 if (isMounted) {
//                     setIsValid(isValidToken);
//                     setIsLoading(false);
//
//                     // Redirect if invalid after validation
//                     if (!isValidToken) {
//                         router.replace('/login');
//
//                     }
//                 }
//             } catch (error) {
//                 console.error('Validation failed:', error);
//                 if (isMounted) {
//                     router.replace('/welcome');
//                     setIsLoading(false);
//                 }
//             }
//         };
//
//         validate();
//
//         return () => { isMounted = false; };
//     }, [jwt]);
//
//     if (isLoading) {
//         return (
//             <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
//                 <Loading  />
//             </View>
//         );
//     }
//
//     return isValid ? children : null;
// };

// export default PrivateRoute;
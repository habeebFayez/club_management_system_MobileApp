import React from 'react';
import Login from '../app/login';
import SignUp from '../app/signUp';
import Welcome from '../app/welcome';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {CredentialsContext} from '../contexts/CredentialsContext';
import BottomTabNavigator from '../navigators/BottomTabNavigator';
import {ScrollProvider} from "../contexts/ScrollContext";

const Stack = createNativeStackNavigator();

const RootStack = () => {

    return (
        <CredentialsContext.Consumer>
            {({storedJwt}) => (
                <ScrollProvider>
                    <NavigationContainer>
                        <Stack.Navigator
                            screenOptions={{headerShown: false,}}
                            initialRouteName={storedJwt ? "MainApp" : "Welcome"}
                        >
                            {storedJwt ? (
                                // Authenticated screens

                                <Stack.Screen name="MainApp"
                                              component={BottomTabNavigator}
                                              options={{headerShown: false}}/>


                            ) : (
                                // Unauthenticated screens

                                <Stack.Group screenOptions={{headerShown: false}}>
                                    <Stack.Screen name="Welcome" component={Welcome}/>
                                    <Stack.Screen name="Login" component={Login}/>
                                    <Stack.Screen name="SignUp" component={SignUp}/>
                                </Stack.Group>


                            )}
                        </Stack.Navigator>
                    </NavigationContainer>
                </ScrollProvider>
            )}
        </CredentialsContext.Consumer>
    );
};

export default RootStack;
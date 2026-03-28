import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';

const Stack = createNativeStackNavigator();

export default function AuthNavigator({ setIsAuthenticated }) {
        return (
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                        <Stack.Screen name="Login">
                                {props => <LoginScreen {...props} setIsAuthenticated={setIsAuthenticated} />}
                        </Stack.Screen>
                        <Stack.Screen name="SignUp">
                                {props => <SignUpScreen {...props} setIsAuthenticated={setIsAuthenticated} />}
                        </Stack.Screen>
                </Stack.Navigator>
        );
}
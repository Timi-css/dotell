import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';

export default function RootNavigator() {
        const [isAuthenticated, setIsAuthenticated] = useState(false);

        return (
                <NavigationContainer>
                        {isAuthenticated ? (
                                <AppNavigator setIsAuthenticated={setIsAuthenticated} />
                        ) : (
                                <AuthNavigator setIsAuthenticated={setIsAuthenticated} />
                        )}
                </NavigationContainer>
        );
}
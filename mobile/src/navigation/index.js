import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import { colors } from '../theme';

export default function RootNavigator() {
        const [isAuthenticated, setIsAuthenticated] = useState(false);
        const [isLoading, setIsLoading] = useState(true);

        useEffect(() => {
                checkToken();
        }, []);

        const checkToken = async () => {
                try {
                        const token = await AsyncStorage.getItem('token');
                        if (token) setIsAuthenticated(true);
                } catch {
                        setIsAuthenticated(false);
                } finally {
                        setIsLoading(false);
                }
        };

        if (isLoading) {
                return (
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface.cream }}>
                                <ActivityIndicator color={colors.brand.ember} />
                        </View>
                );
        }

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
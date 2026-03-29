import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import { colors } from '../theme';

const TOKEN_KEY = 'dotell_token';

export default function RootNavigator() {
        const [isAuthenticated, setIsAuthenticated] = useState(false);
        const [isLoading, setIsLoading] = useState(true);

        useEffect(() => {
                checkToken();
        }, []);

        const checkToken = async () => {
                try {
                        let token;
                        if (Platform.OS === 'web') {
                                token = localStorage.getItem(TOKEN_KEY);
                        } else {
                                token = await SecureStore.getItemAsync(TOKEN_KEY);
                        }
                        console.log('Token check:', token ? 'found' : 'not found');
                        setIsAuthenticated(!!token);
                } catch (err) {
                        console.log('checkToken error:', err.message);
                        setIsAuthenticated(false);
                } finally {
                        setIsLoading(false);
                }
        };

        if (isLoading) {
                return (
                        <View style={{
                                flex: 1,
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: colors.surface.cream,
                        }}>
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
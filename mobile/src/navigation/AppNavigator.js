import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme';

import HomeScreen from '../screens/HomeScreen';
import ExploreScreen from '../screens/ExploreScreen';
import WriteReviewScreen from '../screens/WriteReviewScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CompanyProfileScreen from '../screens/CompanyProfileScreen';
import SuccessScreen from '../screens/SuccessScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeTabs() {
        return (
                <Tab.Navigator
                        screenOptions={{
                                headerShown: false,
                                tabBarStyle: {
                                        backgroundColor: colors.surface.cream,
                                        borderTopColor: colors.surface.border,
                                        borderTopWidth: 0.5,
                                },
                                tabBarActiveTintColor: colors.brand.ember,
                                tabBarInactiveTintColor: colors.text.stone,
                                tabBarLabelStyle: {
                                        fontSize: 11,
                                        fontWeight: '500',
                                },
                        }}
                >
                        <Tab.Screen name="Home" component={HomeScreen} />
                        <Tab.Screen name="Explore" component={ExploreScreen} />
                        <Tab.Screen name="Write" component={WriteReviewScreen} />
                        <Tab.Screen name="Profile" component={ProfileScreen} />
                </Tab.Navigator>
        );
}

export default function AppNavigator() {
        return (
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="Tabs" component={HomeTabs} />
                        <Stack.Screen name="CompanyProfile" component={CompanyProfileScreen} />
                        <Stack.Screen name="Success" component={SuccessScreen} />
                </Stack.Navigator>
        );
}
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme';
import { House, Compass, PlusCircle, User } from 'phosphor-react-native';
import { View, Text } from 'react-native';

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
                                        paddingBottom: 16,
                                        paddingTop: 12,
                                        height: 82,
                                },
                                tabBarActiveTintColor: colors.brand.ember,
                                tabBarInactiveTintColor: colors.text.stone,
                                tabBarLabelStyle: {
                                        fontSize: 11,
                                        fontWeight: '500',
                                },
                        }}
                >
                        <Tab.Screen
                                name="Home"
                                component={HomeScreen}
                                options={{
                                        tabBarIcon: ({ color, size }) => (
                                                <House size={size} color={color} weight="light" />
                                        ),
                                }}
                        />
                        <Tab.Screen
                                name="Explore"
                                component={ExploreScreen}
                                options={{
                                        tabBarIcon: ({ color, size }) => (
                                                <Compass size={size} color={color} />
                                        ),
                                }}
                        />
                        <Tab.Screen
                                name="Write"
                                component={WriteReviewScreen}
                                options={{
                                        tabBarIcon: ({ color, size }) => (
                                                <PlusCircle size={size} color={color} />
                                        ),
                                }}
                        />
                        <Tab.Screen
                                name="Profile"
                                component={ProfileScreen}
                                options={{
                                        tabBarIcon: ({ color, size }) => (
                                                <User size={size} color={color} />
                                        ),
                                }}
                        />
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
import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export function FadeInView({ children, delay = 0, style }) {
        const opacity = useRef(new Animated.Value(0)).current;
        const translateY = useRef(new Animated.Value(12)).current;

        useEffect(() => {
                Animated.parallel([
                        Animated.timing(opacity, {
                                toValue: 1,
                                duration: 400,
                                delay,
                                useNativeDriver: true,
                        }),
                        Animated.timing(translateY, {
                                toValue: 0,
                                duration: 400,
                                delay,
                                useNativeDriver: true,
                        }),
                ]).start();
        }, []);

        return (
                <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
                        {children}
                </Animated.View>
        );
}

export function ScaleInView({ children, delay = 0, style }) {
        const opacity = useRef(new Animated.Value(0)).current;
        const scale = useRef(new Animated.Value(0.95)).current;

        useEffect(() => {
                Animated.parallel([
                        Animated.timing(opacity, {
                                toValue: 1,
                                duration: 300,
                                delay,
                                useNativeDriver: true,
                        }),
                        Animated.spring(scale, {
                                toValue: 1,
                                delay,
                                useNativeDriver: true,
                        }),
                ]).start();
        }, []);

        return (
                <Animated.View style={[{ opacity, transform: [{ scale }] }, style]}>
                        {children}
                </Animated.View>
        );
}
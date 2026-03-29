import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';
import { colors, typography, spacing, radius } from '../theme';

const TOAST_TYPES = {
        success: {
                background: colors.semantic.offer,
                icon: '✓',
        },
        error: {
                background: colors.semantic.rejected,
                icon: '✕',
        },
        info: {
                background: colors.card.violet,
                icon: 'ℹ',
        },
        warning: {
                background: colors.semantic.ghosted,
                icon: '⚠',
        },
};

export default function Toast({ message, type = 'success', visible, onHide }) {
        const translateY = useRef(new Animated.Value(-100)).current;
        const opacity = useRef(new Animated.Value(0)).current;

        useEffect(() => {
                if (visible) {
                        Animated.parallel([
                                Animated.spring(translateY, {
                                        toValue: 0,
                                        damping: 15,
                                        stiffness: 120,
                                        useNativeDriver: true,
                                }),
                                Animated.timing(opacity, {
                                        toValue: 1,
                                        duration: 200,
                                        useNativeDriver: true,
                                }),
                        ]).start();

                        const timer = setTimeout(() => {
                                hideToast();
                        }, 3000);

                        return () => clearTimeout(timer);
                }
        }, [visible]);

        const hideToast = () => {
                Animated.parallel([
                        Animated.timing(translateY, {
                                toValue: -100,
                                duration: 250,
                                useNativeDriver: true,
                        }),
                        Animated.timing(opacity, {
                                toValue: 0,
                                duration: 250,
                                useNativeDriver: true,
                        }),
                ]).start(() => onHide?.());
        };

        const config = TOAST_TYPES[type] || TOAST_TYPES.info;

        if (!visible) return null;

        return (
                <Animated.View
                        style={[
                                styles.container,
                                { backgroundColor: config.background },
                                { transform: [{ translateY }], opacity },
                        ]}
                >
                        <View style={styles.iconCircle}>
                                <Text style={styles.icon}>{config.icon}</Text>
                        </View>
                        <Text style={styles.message}>{message}</Text>
                </Animated.View>
        );
}

const styles = StyleSheet.create({
        container: {
                position: 'absolute',
                top: 60,
                left: 20,
                right: 20,
                borderRadius: radius.lg,
                padding: spacing.md,
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
                zIndex: 9999,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 8,
        },
        iconCircle: {
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: 'rgba(255,255,255,0.25)',
                alignItems: 'center',
                justifyContent: 'center',
        },
        icon: {
                fontSize: 13,
                color: '#fff',
                fontWeight: '700',
        },
        message: {
                flex: 1,
                fontFamily: 'GeneralSans-Semibold',
                fontSize: typography.sizes.bodySmall,
                color: '#fff',
                lineHeight: 18,
        },
});
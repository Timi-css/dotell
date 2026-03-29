import React, { useState } from 'react';
import {
        View,
        Text,
        StyleSheet,
        TouchableOpacity,
        TextInput,
        ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CaretLeft } from 'phosphor-react-native';
import { colors, typography, spacing, radius } from '../theme';
import { api } from '../services/api';
import { FadeInView } from '../components/FadeInView';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';

export default function ForgotPasswordScreen({ navigation }) {
        const [email, setEmail] = useState('');
        const [loading, setLoading] = useState(false);
        const { toast, showToast, hideToast } = useToast();

        const handleSubmit = async () => {
                if (!email) {
                        showToast('Please enter your email', 'error');
                        return;
                }
                setLoading(true);
                try {
                        await api.post('/auth/forgot-password', { email });
                        showToast('Reset code sent if that email exists', 'success');
                        setTimeout(() => {
                                navigation.navigate('ResetPassword', { email });
                        }, 1500);
                } catch (err) {
                        showToast(err.message, 'error');
                } finally {
                        setLoading(false);
                }
        };

        return (
                <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
                        <FadeInView delay={0}>
                                <View style={styles.header}>
                                        <TouchableOpacity
                                                style={styles.backBtn}
                                                onPress={() => navigation.goBack()}
                                        >
                                                <CaretLeft size={16} color={colors.text.ink} />
                                        </TouchableOpacity>
                                </View>

                                <Text style={styles.title}>Forgot your{'\n'}password?</Text>
                                <Text style={styles.subtitle}>
                                        Enter your email and we'll send you a reset code.
                                </Text>
                        </FadeInView>

                        <FadeInView delay={80}>
                                <View style={styles.section}>
                                        <Text style={styles.label}>EMAIL</Text>
                                        <TextInput
                                                style={styles.input}
                                                value={email}
                                                onChangeText={setEmail}
                                                placeholder="you@example.com"
                                                placeholderTextColor={colors.text.stone}
                                                autoCapitalize="none"
                                                keyboardType="email-address"
                                        />

                                        <TouchableOpacity
                                                style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                                                onPress={handleSubmit}
                                                disabled={loading}
                                        >
                                                {loading ? (
                                                        <ActivityIndicator color="#fff" />
                                                ) : (
                                                        <Text style={styles.submitBtnText}>Send reset code</Text>
                                                )}
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                                style={styles.loginBtn}
                                                onPress={() => navigation.navigate('Login')}
                                        >
                                                <Text style={styles.loginText}>Back to login</Text>
                                        </TouchableOpacity>
                                </View>
                        </FadeInView>

                        <Toast
                                visible={toast.visible}
                                message={toast.message}
                                type={toast.type}
                                onHide={hideToast}
                        />
                </SafeAreaView>
        );
}

const styles = StyleSheet.create({
        container: {
                flex: 1,
                backgroundColor: colors.surface.cream,
                paddingHorizontal: spacing.xl,
        },
        header: {
                paddingTop: spacing.lg,
                marginBottom: spacing.xl,
        },
        backBtn: {
                width: 36,
                height: 36,
                borderRadius: radius.sm + 2,
                backgroundColor: colors.surface.linen,
                borderWidth: 0.5,
                borderColor: colors.surface.border,
                alignItems: 'center',
                justifyContent: 'center',
        },
        title: {
                fontFamily: 'CabinetGrotesk-Bold',
                fontSize: typography.sizes.displayHero,
                color: colors.text.ink,
                lineHeight: 36,
                marginBottom: spacing.sm,
        },
        subtitle: {
                fontFamily: 'GeneralSans-Regular',
                fontSize: typography.sizes.bodyRegular,
                color: colors.text.stone,
                marginBottom: spacing.xl,
        },
        section: {
                gap: spacing.md,
        },
        label: {
                fontFamily: 'GeneralSans-Semibold',
                fontSize: typography.sizes.labelCaps,
                color: colors.text.ink,
                letterSpacing: 1.0,
        },
        input: {
                height: 44,
                backgroundColor: colors.surface.white,
                borderRadius: radius.md,
                borderWidth: 0.5,
                borderColor: colors.surface.border,
                paddingHorizontal: spacing.md,
                fontFamily: 'GeneralSans-Regular',
                fontSize: typography.sizes.bodyRegular,
                color: colors.text.ink,
        },
        submitBtn: {
                height: 52,
                backgroundColor: colors.brand.ember,
                borderRadius: radius.lg,
                alignItems: 'center',
                justifyContent: 'center',
        },
        submitBtnDisabled: {
                opacity: 0.6,
        },
        submitBtnText: {
                fontFamily: 'CabinetGrotesk-Bold',
                fontSize: typography.sizes.h2,
                color: '#fff',
        },
        loginBtn: {
                alignItems: 'center',
                paddingVertical: spacing.sm,
        },
        loginText: {
                fontFamily: 'GeneralSans-Regular',
                fontSize: typography.sizes.bodySmall,
                color: colors.text.stone,
        },
});
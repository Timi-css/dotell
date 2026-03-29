import React, { useState, useRef } from 'react';
import {
        View,
        Text,
        StyleSheet,
        TouchableOpacity,
        TextInput,
        ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius } from '../theme';
import { api } from '../services/api';
import { FadeInView } from '../components/FadeInView';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';

export default function VerifyEmailScreen({ navigation, route, setIsAuthenticated }) {
        const { email } = route.params;
        const [code, setCode] = useState('');
        const [loading, setLoading] = useState(false);
        const { toast, showToast, hideToast } = useToast();

        const handleVerify = async () => {
                if (code.length !== 6) {
                        showToast('Please enter the 6-digit code', 'error');
                        return;
                }
                setLoading(true);
                try {
                        await api.post('/auth/verify-email', { email, code });
                        showToast('Email verified successfully', 'success');
                        setTimeout(() => setIsAuthenticated(true), 1500);
                } catch (err) {
                        showToast(err.message, 'error');
                } finally {
                        setLoading(false);
                }
        };

        const handleResend = async () => {
                try {
                        await api.post('/auth/resend-verification', { email });
                        showToast('New code sent to your email', 'info');
                } catch (err) {
                        showToast(err.message, 'error');
                }
        };

        return (
                <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
                        <FadeInView delay={0}>
                                <View style={styles.promptCard}>
                                        <View style={styles.promptDeco} />
                                        <Text style={styles.promptTitle}>Check your email.</Text>
                                        <Text style={styles.promptSub}>
                                                We sent a 6-digit code to{'\n'}
                                                <Text style={styles.promptEmail}>{email}</Text>
                                        </Text>
                                </View>
                        </FadeInView>

                        <FadeInView delay={80}>
                                <View style={styles.section}>
                                        <Text style={styles.label}>VERIFICATION CODE</Text>
                                        <TextInput
                                                style={styles.codeInput}
                                                value={code}
                                                onChangeText={setCode}
                                                placeholder="000000"
                                                placeholderTextColor={colors.text.stone}
                                                keyboardType="number-pad"
                                                maxLength={6}
                                                textAlign="center"
                                        />

                                        <TouchableOpacity
                                                style={[styles.verifyBtn, loading && styles.verifyBtnDisabled]}
                                                onPress={handleVerify}
                                                disabled={loading}
                                        >
                                                {loading ? (
                                                        <ActivityIndicator color="#fff" />
                                                ) : (
                                                        <Text style={styles.verifyBtnText}>Verify email</Text>
                                                )}
                                        </TouchableOpacity>

                                        <TouchableOpacity style={styles.resendBtn} onPress={handleResend}>
                                                <Text style={styles.resendText}>Didn't get it? </Text>
                                                <Text style={styles.resendLink}>Resend code</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                                style={styles.backBtn}
                                                onPress={() => navigation.navigate('Login')}
                                        >
                                                <Text style={styles.backText}>Back to login</Text>
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
        promptCard: {
                backgroundColor: colors.card.violet,
                borderRadius: radius.xl,
                padding: spacing.xl,
                marginTop: spacing.huge,
                marginBottom: spacing.xl,
                overflow: 'hidden',
                position: 'relative',
        },
        promptDeco: {
                position: 'absolute',
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: 'rgba(255,255,255,0.08)',
                right: -30,
                top: -30,
        },
        promptTitle: {
                fontFamily: 'CabinetGrotesk-Bold',
                fontSize: typography.sizes.displayTitle,
                color: '#fff',
                marginBottom: spacing.sm,
        },
        promptSub: {
                fontFamily: 'GeneralSans-Regular',
                fontSize: typography.sizes.bodyRegular,
                color: 'rgba(255,255,255,0.75)',
                lineHeight: 22,
        },
        promptEmail: {
                fontFamily: 'GeneralSans-Semibold',
                color: '#fff',
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
        codeInput: {
                height: 64,
                backgroundColor: colors.surface.white,
                borderRadius: radius.md,
                borderWidth: 0.5,
                borderColor: colors.surface.border,
                fontFamily: 'CabinetGrotesk-Bold',
                fontSize: 32,
                color: colors.text.ink,
                letterSpacing: 8,
        },
        verifyBtn: {
                height: 52,
                backgroundColor: colors.brand.ember,
                borderRadius: radius.lg,
                alignItems: 'center',
                justifyContent: 'center',
        },
        verifyBtnDisabled: {
                opacity: 0.6,
        },
        verifyBtnText: {
                fontFamily: 'CabinetGrotesk-Bold',
                fontSize: typography.sizes.h2,
                color: '#fff',
        },
        resendBtn: {
                flexDirection: 'row',
                justifyContent: 'center',
                paddingVertical: spacing.sm,
        },
        resendText: {
                fontFamily: 'GeneralSans-Regular',
                fontSize: typography.sizes.bodySmall,
                color: colors.text.stone,
        },
        resendLink: {
                fontFamily: 'GeneralSans-Semibold',
                fontSize: typography.sizes.bodySmall,
                color: colors.brand.ember,
        },
        backBtn: {
                alignItems: 'center',
                paddingVertical: spacing.sm,
        },
        backText: {
                fontFamily: 'GeneralSans-Regular',
                fontSize: typography.sizes.bodySmall,
                color: colors.text.stone,
        },
});
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

export default function ResetPasswordScreen({ navigation, route }) {
        const { email } = route.params;
        const [code, setCode] = useState('');
        const [newPassword, setNewPassword] = useState('');
        const [showPassword, setShowPassword] = useState(false);
        const [loading, setLoading] = useState(false);
        const { toast, showToast, hideToast } = useToast();

        const handleReset = async () => {
                if (!code || !newPassword) {
                        showToast('Please fill in all fields', 'error');
                        return;
                }
                if (code.length !== 6) {
                        showToast('Please enter the 6-digit code', 'error');
                        return;
                }
                setLoading(true);
                try {
                        await api.post('/auth/reset-password', { email, code, newPassword });
                        showToast('Password reset successfully', 'success');
                        setTimeout(() => navigation.navigate('Login'), 1500);
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

                                <Text style={styles.title}>Reset your{'\n'}password.</Text>
                                <Text style={styles.subtitle}>
                                        Enter the code we sent to{' '}
                                        <Text style={styles.email}>{email}</Text>
                                        {' '}and choose a new password.
                                </Text>
                        </FadeInView>

                        <FadeInView delay={80}>
                                <View style={styles.section}>
                                        <View style={styles.field}>
                                                <Text style={styles.label}>RESET CODE</Text>
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
                                        </View>

                                        <View style={styles.field}>
                                                <Text style={styles.label}>NEW PASSWORD</Text>
                                                <View style={styles.passwordWrapper}>
                                                        <TextInput
                                                                style={styles.passwordInput}
                                                                value={newPassword}
                                                                onChangeText={setNewPassword}
                                                                placeholder="Min 8 chars, number and symbol"
                                                                placeholderTextColor={colors.text.stone}
                                                                secureTextEntry={!showPassword}
                                                                autoCapitalize="none"
                                                        />
                                                        <TouchableOpacity
                                                                style={styles.eyeBtn}
                                                                onPress={() => setShowPassword(!showPassword)}
                                                        >
                                                                <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁'}</Text>
                                                        </TouchableOpacity>
                                                </View>
                                        </View>

                                        <TouchableOpacity
                                                style={[styles.resetBtn, loading && styles.resetBtnDisabled]}
                                                onPress={handleReset}
                                                disabled={loading}
                                        >
                                                {loading ? (
                                                        <ActivityIndicator color="#fff" />
                                                ) : (
                                                        <Text style={styles.resetBtnText}>Reset password</Text>
                                                )}
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
                lineHeight: 22,
        },
        email: {
                fontFamily: 'GeneralSans-Semibold',
                color: colors.text.ink,
        },
        section: {
                gap: spacing.lg,
        },
        field: {
                gap: spacing.sm,
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
                padding: 16
        },
        passwordWrapper: {
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.surface.white,
                borderRadius: radius.md,
                borderWidth: 0.5,
                borderColor: colors.surface.border,
                height: 44,
        },
        passwordInput: {
                flex: 1,
                paddingHorizontal: spacing.md,
                fontFamily: 'GeneralSans-Regular',
                fontSize: typography.sizes.bodyRegular,
                color: colors.text.ink,
        },
        eyeBtn: {
                paddingHorizontal: spacing.md,
        },
        eyeText: {
                fontSize: 16,
        },
        resetBtn: {
                height: 52,
                backgroundColor: colors.brand.ember,
                borderRadius: radius.lg,
                alignItems: 'center',
                justifyContent: 'center',
        },
        resetBtnDisabled: {
                opacity: 0.6,
        },
        resetBtnText: {
                fontFamily: 'CabinetGrotesk-Bold',
                fontSize: typography.sizes.h2,
                color: '#fff',
        },
});
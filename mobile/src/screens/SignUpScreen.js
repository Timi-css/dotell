import React, { useState } from 'react';
import {
        View,
        Text,
        StyleSheet,
        TouchableOpacity,
        TextInput,
        KeyboardAvoidingView,
        Platform,
        ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius } from '../theme';
import { LogoDark, GoogleLogo } from '../theme/logos';
import { api, setToken } from '../services/api';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';

export default function SignUpScreen({ navigation, setIsAuthenticated }) {
        const [displayName, setDisplayName] = useState('');
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        const [showPassword, setShowPassword] = useState(false);
        const [loading, setLoading] = useState(false);
        const { toast, showToast, hideToast } = useToast();

        const handleSignUp = async () => {
                if (!displayName || !email || !password) {
                        showToast('All fields are required', 'error');
                        return;
                }
                if (password.length < 8) {
                        showToast('Password must be at least 8 characters', 'error');
                        return;
                }
                setLoading(true);
                try {
                        const data = await api.post('/auth/register', { displayName, email, password });
                        await setToken(data.token);
                        navigation.navigate('VerifyEmail', { email });
                } catch (err) {
                        showToast(err.message, 'error');
                } finally {
                        setLoading(false);
                }
        };

        return (
                <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
                        <KeyboardAvoidingView
                                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                                style={styles.inner}
                        >
                                <ScrollView showsVerticalScrollIndicator={false}>
                                        <LogoDark width={150} height={157} style={styles.logo} />

                                        <Text style={styles.headline}>Join the{'\n'}conversation.</Text>
                                        <Text style={styles.subtext}>Create an account to start reviewing.</Text>

                                        <Toast
                                                visible={toast.visible}
                                                message={toast.message}
                                                type={toast.type}
                                                onHide={hideToast}
                                        />

                                        <View style={styles.fields}>
                                                <View style={styles.field}>
                                                        <Text style={styles.label}>FULL NAME</Text>
                                                        <TextInput
                                                                style={styles.input}
                                                                placeholder="Your name"
                                                                placeholderTextColor={colors.text.stone}
                                                                value={displayName}
                                                                onChangeText={setDisplayName}
                                                        />
                                                </View>

                                                <View style={styles.field}>
                                                        <Text style={styles.label}>EMAIL</Text>
                                                        <TextInput
                                                                style={styles.input}
                                                                placeholder="you@example.com"
                                                                placeholderTextColor={colors.text.stone}
                                                                value={email}
                                                                onChangeText={setEmail}
                                                                autoCapitalize="none"
                                                                keyboardType="email-address"
                                                        />
                                                </View>

                                                <View style={styles.field}>
                                                        <Text style={styles.label}>PASSWORD</Text>
                                                        <View style={styles.passwordWrapper}>
                                                                <TextInput
                                                                        style={styles.passwordInput}
                                                                        placeholder="At least 8 characters"
                                                                        placeholderTextColor={colors.text.stone}
                                                                        value={password}
                                                                        onChangeText={setPassword}
                                                                        secureTextEntry={!showPassword}
                                                                        autoCapitalize="none"
                                                                />
                                                                <TouchableOpacity
                                                                        onPress={() => setShowPassword(!showPassword)}
                                                                        style={styles.eyeBtn}
                                                                >
                                                                        <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁'}</Text>
                                                                </TouchableOpacity>
                                                        </View>
                                                </View>
                                        </View>

                                        <TouchableOpacity
                                                style={[styles.btn, loading && styles.btnDisabled]}
                                                onPress={handleSignUp}
                                                disabled={loading}
                                        >
                                                <Text style={styles.btnText}>
                                                        {loading ? 'Creating account...' : 'Create account'}
                                                </Text>
                                        </TouchableOpacity>

                                        <View style={styles.dividerRow}>
                                                <View style={styles.dividerLine} />
                                                <Text style={styles.dividerText}>or</Text>
                                                <View style={styles.dividerLine} />
                                        </View>

                                        <TouchableOpacity style={styles.googleBtn} onPress={() => showToast('Google sign in coming soon', 'info')}>
                                                <View style={styles.googleBtnInner}>
                                                        <GoogleLogo width={20} height={20} />
                                                        <Text style={styles.googleBtnText}>Continue with Google</Text>
                                                </View>
                                        </TouchableOpacity>

                                        <View style={styles.loginRow}>
                                                <Text style={styles.loginText}>Already have an account? </Text>
                                                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                                        <Text style={styles.loginLink}>Log in</Text>
                                                </TouchableOpacity>
                                        </View>
                                </ScrollView>
                        </KeyboardAvoidingView>
                </SafeAreaView>
        );
}

const styles = StyleSheet.create({
        container: {
                flex: 1,
                backgroundColor: colors.surface.cream,
        },
        inner: {
                flex: 1,
                paddingHorizontal: spacing.xl,
        },
        logo: {
                marginTop: spacing.lg,
                marginBottom: spacing.xl,
        },
        headline: {
                fontFamily: 'CabinetGrotesk-Bold',
                fontSize: typography.sizes.displayHero,
                color: colors.text.ink,
                lineHeight: 36,
                marginBottom: spacing.sm,
        },
        subtext: {
                fontFamily: 'GeneralSans-Regular',
                fontSize: typography.sizes.bodyRegular,
                color: colors.text.ink,
                marginBottom: spacing.huge,
        },
        errorText: {
                fontFamily: 'GeneralSans-Regular',
                fontSize: typography.sizes.bodySmall,
                color: colors.semantic.rejected,
                marginBottom: spacing.md,
        },
        fields: {
                gap: spacing.lg,
                marginBottom: spacing.xl,
        },
        field: {
                gap: spacing.xs,
        },
        label: {
                fontFamily: 'GeneralSans-Semibold',
                fontSize: typography.sizes.labelCaps,
                color: colors.text.ink,
                letterSpacing: 1.8,
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
        btn: {
                height: 52,
                backgroundColor: colors.brand.ember,
                borderRadius: radius.lg,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: spacing.xl,
        },
        btnDisabled: {
                opacity: 0.6,
        },
        btnText: {
                fontFamily: 'CabinetGrotesk-Bold',
                fontSize: typography.sizes.h2,
                color: '#fff',
        },
        dividerRow: {
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
                marginBottom: spacing.xl,
        },
        dividerLine: {
                flex: 1,
                height: 0.5,
                backgroundColor: colors.surface.border,
        },
        dividerText: {
                fontFamily: 'GeneralSans-Regular',
                fontSize: typography.sizes.bodySmall,
                color: colors.text.stone,
        },
        googleBtn: {
                height: 52,
                backgroundColor: colors.surface.white,
                borderRadius: radius.lg,
                borderWidth: 0.5,
                borderColor: colors.surface.border,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: spacing.xl,
        },
        googleBtnInner: {
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.sm,
        },
        googleBtnText: {
                fontFamily: 'CabinetGrotesk-Bold',
                fontSize: typography.sizes.h2,
                color: colors.text.ink,
        },
        loginRow: {
                flexDirection: 'row',
                justifyContent: 'center',
                marginBottom: spacing.xl,
        },
        loginText: {
                fontFamily: 'GeneralSans-Regular',
                fontSize: typography.sizes.bodySmall,
                color: colors.text.stone,
        },
        loginLink: {
                fontFamily: 'GeneralSans-Semibold',
                fontSize: typography.sizes.bodySmall,
                color: colors.brand.ember,
        }
});
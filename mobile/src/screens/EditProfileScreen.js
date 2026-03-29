import React, { useState } from 'react';
import {
        View,
        Text,
        StyleSheet,
        TouchableOpacity,
        TextInput,
        ActivityIndicator,
        Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CaretLeft } from 'phosphor-react-native';
import { colors, typography, spacing, radius } from '../theme';
import { api } from '../services/api';
import { FadeInView } from '../components/FadeInView';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';

export default function EditProfileScreen({ navigation, route }) {
        const { user } = route.params;
        const [displayName, setDisplayName] = useState(user?.displayName || '');
        const [saving, setSaving] = useState(false);
        const [saved, setSaved] = useState(false);
        const { toast, showToast, hideToast } = useToast();

        const handleSave = async () => {
                if (!displayName.trim()) {
                        showToast('Display name is required', 'error');
                        return;
                }
                setSaving(true);
                try {
                        const data = await api.patch('/auth/profile', { displayName });
                        route.params?.onSave?.(data.user);
                        showToast('Profile updated successfully', 'success');
                        setTimeout(() => navigation.goBack(), 1500);
                } catch (err) {
                        showToast(err.message, 'error');
                } finally {
                        setSaving(false);
                }
        };

        return (
                <SafeAreaView style={styles.container} edges={['top']}>
                        <FadeInView delay={0}>
                                <View style={styles.header}>
                                        <TouchableOpacity
                                                style={styles.backBtn}
                                                onPress={() => navigation.goBack()}
                                        >
                                                <CaretLeft size={16} color={colors.text.ink} />
                                        </TouchableOpacity>
                                        <Text style={styles.headerTitle}>Edit profile</Text>
                                </View>
                        </FadeInView>

                        <FadeInView delay={80}>
                                <View style={styles.section}>
                                        <Toast
                                                visible={toast.visible}
                                                message={toast.message}
                                                type={toast.type}
                                                onHide={hideToast}
                                        />

                                        <View style={styles.field}>
                                                <Text style={styles.label}>DISPLAY NAME</Text>
                                                <TextInput
                                                        style={styles.input}
                                                        value={displayName}
                                                        onChangeText={setDisplayName}
                                                        placeholder="Your name"
                                                        placeholderTextColor={colors.text.stone}
                                                />
                                        </View>

                                        <View style={styles.field}>
                                                <Text style={styles.label}>EMAIL</Text>
                                                <View style={styles.inputDisabled}>
                                                        <Text style={styles.inputDisabledText}>{user?.email}</Text>
                                                </View>
                                                <Text style={styles.fieldNote}>Email cannot be changed.</Text>
                                        </View>

                                        <TouchableOpacity
                                                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                                                onPress={handleSave}
                                                disabled={saving}
                                        >
                                                {saving ? (
                                                        <ActivityIndicator color="#fff" />
                                                ) : (
                                                        <Text style={styles.saveBtnText}>Save changes</Text>
                                                )}
                                        </TouchableOpacity>
                                </View>
                        </FadeInView>
                </SafeAreaView>
        );
}

const styles = StyleSheet.create({
        container: {
                flex: 1,
                backgroundColor: colors.surface.cream,
        },
        header: {
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
                paddingHorizontal: spacing.xl,
                paddingTop: spacing.lg,
                paddingBottom: spacing.md,
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
        headerTitle: {
                fontFamily: 'CabinetGrotesk-Bold',
                fontSize: typography.sizes.h1,
                color: colors.text.ink,
        },
        section: {
                paddingHorizontal: spacing.xl,
                paddingTop: spacing.lg,
        },
        errorText: {
                fontFamily: 'GeneralSans-Regular',
                fontSize: typography.sizes.bodySmall,
                color: colors.semantic.rejected,
                marginBottom: spacing.md,
        },
        field: {
                marginBottom: spacing.lg,
        },
        label: {
                fontFamily: 'GeneralSans-Semibold',
                fontSize: typography.sizes.labelCaps,
                color: colors.text.ink,
                letterSpacing: 1.0,
                marginBottom: spacing.sm,
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
        inputDisabled: {
                height: 44,
                backgroundColor: colors.surface.linen,
                borderRadius: radius.md,
                borderWidth: 0.5,
                borderColor: colors.surface.border,
                paddingHorizontal: spacing.md,
                justifyContent: 'center',
        },
        inputDisabledText: {
                fontFamily: 'GeneralSans-Regular',
                fontSize: typography.sizes.bodyRegular,
                color: colors.text.stone,
        },
        fieldNote: {
                fontFamily: 'GeneralSans-Regular',
                fontSize: typography.sizes.bodySmall,
                color: colors.text.stone,
                marginTop: 4,
        },
        saveBtn: {
                height: 52,
                backgroundColor: colors.brand.ember,
                borderRadius: radius.lg,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: spacing.md,
        },
        saveBtnDisabled: {
                opacity: 0.6,
        },
        saveBtnText: {
                fontFamily: 'CabinetGrotesk-Bold',
                fontSize: typography.sizes.h2,
                color: '#fff',
        },
});
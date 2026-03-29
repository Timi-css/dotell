import React from 'react';
import {
        View,
        Text,
        StyleSheet,
        TouchableOpacity,
        Modal,
        Animated,
} from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { Briefcase, Buildings } from 'phosphor-react-native';

export default function ReviewTypeModal({ visible, company, onSelect, onClose }) {
        return (
                <Modal
                        visible={visible}
                        transparent
                        animationType="slide"
                        onRequestClose={onClose}
                >
                        <TouchableOpacity
                                style={styles.backdrop}
                                activeOpacity={1}
                                onPress={onClose}
                        >
                                <TouchableOpacity
                                        style={styles.sheet}
                                        activeOpacity={1}
                                >
                                        <View style={styles.handle} />

                                        <Text style={styles.title}>
                                                How do you know{'\n'}
                                                <Text style={styles.titleAccent}>{company?.name}</Text>?
                                        </Text>
                                        <Text style={styles.subtitle}>
                                                Choose the type of review you want to leave.
                                        </Text>

                                        <TouchableOpacity
                                                style={styles.option}
                                                onPress={() => onSelect('interview')}
                                                activeOpacity={0.8}
                                        >
                                                <View style={[styles.optionIcon, { backgroundColor: colors.brand.emberLight }]}>
                                                        <Briefcase size={22} color={colors.brand.ember} />
                                                </View>
                                                <View style={styles.optionText}>
                                                        <Text style={styles.optionTitle}>Interviewed here</Text>
                                                        <Text style={styles.optionSub}>Rate the interview process, difficulty and outcome</Text>
                                                </View>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                                style={styles.option}
                                                onPress={() => onSelect('employee')}
                                                activeOpacity={0.8}
                                        >
                                                <View style={[styles.optionIcon, { backgroundColor: '#EEF2FF' }]}>
                                                        <Buildings size={22} color={colors.card.violet} />
                                                </View>
                                                <View style={styles.optionText}>
                                                        <Text style={styles.optionTitle}>Work / worked here</Text>
                                                        <Text style={styles.optionSub}>Rate the culture, management and compensation</Text>
                                                </View>
                                        </TouchableOpacity>

                                        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                                                <Text style={styles.cancelText}>Cancel</Text>
                                        </TouchableOpacity>
                                </TouchableOpacity>
                        </TouchableOpacity>
                </Modal>
        );
}

const styles = StyleSheet.create({
        backdrop: {
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.4)',
                justifyContent: 'flex-end',
        },
        sheet: {
                backgroundColor: colors.surface.cream,
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                padding: spacing.xl,
                paddingBottom: 40,
        },
        handle: {
                width: 36,
                height: 4,
                borderRadius: 2,
                backgroundColor: colors.surface.border,
                alignSelf: 'center',
                marginBottom: spacing.xl,
        },
        title: {
                fontFamily: 'CabinetGrotesk-Bold',
                fontSize: typography.sizes.displayTitle,
                color: colors.text.ink,
                lineHeight: 30,
                marginBottom: spacing.sm,
        },
        titleAccent: {
                color: colors.brand.ember,
        },
        subtitle: {
                fontFamily: 'GeneralSans-Regular',
                fontSize: typography.sizes.bodyRegular,
                color: colors.text.stone,
                marginBottom: spacing.xl,
        },
        option: {
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.lg,
                backgroundColor: colors.surface.white,
                borderRadius: radius.lg,
                borderWidth: 0.5,
                borderColor: colors.surface.border,
                padding: spacing.lg,
                marginBottom: spacing.md,
        },
        optionIcon: {
                width: 48,
                height: 48,
                borderRadius: radius.md,
                alignItems: 'center',
                justifyContent: 'center',
        },
        optionText: {
                flex: 1,
        },
        optionTitle: {
                fontFamily: 'CabinetGrotesk-Bold',
                fontSize: typography.sizes.h2,
                color: colors.text.ink,
                marginBottom: 2,
        },
        optionSub: {
                fontFamily: 'GeneralSans-Regular',
                fontSize: typography.sizes.bodySmall,
                color: colors.text.stone,
                lineHeight: 16,
        },
        cancelBtn: {
                alignItems: 'center',
                paddingVertical: spacing.md,
                marginTop: spacing.sm,
        },
        cancelText: {
                fontFamily: 'GeneralSans-Semibold',
                fontSize: typography.sizes.bodyRegular,
                color: colors.text.stone,
        },
});
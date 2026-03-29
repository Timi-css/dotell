import React, { useState, useEffect } from 'react';
import {
        View,
        Text,
        StyleSheet,
        ScrollView,
        TouchableOpacity,
        ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius } from '../theme';
import { api, removeToken } from '../services/api';
import { FadeInView } from '../components/FadeInView';
import ReviewCard from '../components/ReviewCard';


export default function ProfileScreen({ navigation, setIsAuthenticated }) {
        const [user, setUser] = useState(null);
        const [reviews, setReviews] = useState([]);
        const [loading, setLoading] = useState(true);
        const [activeTab, setActiveTab] = useState('interview');
        const [confirmLogout, setConfirmLogout] = useState(false);

        useEffect(() => {
                loadProfile();
        }, []);

        const loadProfile = async () => {
                try {
                        const [userData, companiesData] = await Promise.all([
                                api.get('/auth/me'),
                                api.get('/companies'),
                        ]);

                        setUser(userData.user);

                        const allReviews = companiesData.companies.flatMap(c => [
                                ...(c.interviewReviews || [])
                                        .filter(r => r.userId === userData.user.id)
                                        .map(r => ({
                                                ...r,
                                                reviewType: 'interview',
                                                company: { id: c.id, name: c.name },
                                        })),
                                ...(c.employeeReviews || [])
                                        .filter(r => r.userId === userData.user.id)
                                        .map(r => ({
                                                ...r,
                                                reviewType: 'employee',
                                                company: { id: c.id, name: c.name },
                                        })),
                        ]);

                        allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                        setReviews(allReviews);
                } catch {
                        setUser(null);
                } finally {
                        setLoading(false);
                }
        };

        const handleLogout = async () => {
                await removeToken();
                setIsAuthenticated(false);
        };

        const interviewReviews = reviews.filter(r => r.reviewType === 'interview');
        const employeeReviews = reviews.filter(r => r.reviewType === 'employee');
        const activeReviews = activeTab === 'interview' ? interviewReviews : employeeReviews;

        const avgRating = () => {
                if (interviewReviews.length === 0) return '—';
                const sum = interviewReviews.reduce((acc, r) => acc + r.rating, 0);
                return (sum / interviewReviews.length).toFixed(1);
        };

        const uniqueCompanies = () => {
                const ids = new Set(reviews.map(r => r.companyId));
                return ids.size;
        };

        if (loading) {
                return (
                        <View style={styles.loadingContainer}>
                                <ActivityIndicator color={colors.brand.ember} size="large" />
                        </View>
                );
        }

        const initials = user?.displayName
                ?.split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2) || '?';

        return (
                <SafeAreaView style={styles.container} edges={['top']}>
                        <ScrollView showsVerticalScrollIndicator={false}>

                                {/* Hero card */}
                                <FadeInView delay={0}>
                                        <View style={styles.heroCard}>
                                                <View style={styles.heroDeco} />
                                                <View style={styles.avatar}>
                                                        <Text style={styles.avatarText}>{initials}</Text>
                                                </View>
                                                <Text style={styles.heroName}>{user?.displayName}</Text>
                                                <Text style={styles.heroEmail}>{user?.email}</Text>
                                                <View style={styles.statsRow}>
                                                        <View style={styles.statPill}>
                                                                <Text style={styles.statNum}>{reviews.length}</Text>
                                                                <Text style={styles.statLbl}>Reviews</Text>
                                                        </View>
                                                        <View style={styles.statPill}>
                                                                <Text style={styles.statNum}>{uniqueCompanies()}</Text>
                                                                <Text style={styles.statLbl}>Companies</Text>
                                                        </View>
                                                        <View style={styles.statPill}>
                                                                <Text style={styles.statNum}>{avgRating()}</Text>
                                                                <Text style={styles.statLbl}>Avg rating</Text>
                                                        </View>
                                                </View>
                                        </View>
                                </FadeInView>

                                {/* Tabs */}
                                <FadeInView delay={80}>
                                        <View style={styles.tabRow}>
                                                <TouchableOpacity
                                                        style={[styles.tab, activeTab === 'interview' && styles.tabActive]}
                                                        onPress={() => setActiveTab('interview')}
                                                >
                                                        <Text style={[styles.tabText, activeTab === 'interview' && styles.tabTextActive]}>
                                                                Interview ({interviewReviews.length})
                                                        </Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                        style={[styles.tab, activeTab === 'employee' && styles.tabActive]}
                                                        onPress={() => setActiveTab('employee')}
                                                >
                                                        <Text style={[styles.tabText, activeTab === 'employee' && styles.tabTextActive]}>
                                                                Employee ({employeeReviews.length})
                                                        </Text>
                                                </TouchableOpacity>
                                        </View>
                                </FadeInView>

                                {/* Reviews */}
                                <View style={styles.reviewsSection}>
                                        {activeReviews.length > 0 ? (
                                                activeReviews.map((review, index) => (
                                                        <FadeInView key={review.id} delay={120 + index * 60}>
                                                                <ReviewCard
                                                                        review={review}
                                                                        index={index}
                                                                        variant="row"
                                                                        onPress={() => navigation.navigate('CompanyProfile', {
                                                                                companyId: review.companyId,
                                                                                companyName: review.company?.name,
                                                                        })}
                                                                />
                                                        </FadeInView>
                                                ))
                                        ) : (
                                                <FadeInView delay={120}>
                                                        <View style={styles.emptyState}>
                                                                <Text style={styles.emptyTitle}>No reviews yet.</Text>
                                                                <Text style={styles.emptySub}>
                                                                        {activeTab === 'interview'
                                                                                ? 'Share your interview experiences.'
                                                                                : 'Share your experience as an employee.'}
                                                                </Text>
                                                                <TouchableOpacity
                                                                        style={styles.writeBtn}
                                                                        onPress={() => navigation.navigate('Write')}
                                                                >
                                                                        <Text style={styles.writeBtnText}>Write a review</Text>
                                                                </TouchableOpacity>
                                                        </View>
                                                </FadeInView>
                                        )}
                                </View>

                                {/* Settings */}
                                <FadeInView delay={200}>
                                        <View style={styles.settingsSection}>
                                                <Text style={styles.sectionLabel}>SETTINGS</Text>
                                                <TouchableOpacity
                                                        style={styles.settingsRow}
                                                        onPress={() => navigation.navigate('EditProfile', {
                                                                user,
                                                                onSave: (updatedUser) => setUser(updatedUser),
                                                        })}
                                                >
                                                        <Text style={styles.settingsRowLabel}>Edit profile</Text>
                                                        <Text style={styles.settingsArrow}>›</Text>
                                                </TouchableOpacity>
                                                {!confirmLogout ? (
                                                        <TouchableOpacity
                                                                style={styles.logoutRow}
                                                                onPress={() => setConfirmLogout(true)}
                                                        >
                                                                <Text style={styles.logoutLabel}>Log out</Text>
                                                        </TouchableOpacity>
                                                ) : (
                                                        <View style={styles.confirmRow}>
                                                                <Text style={styles.confirmText}>Are you sure?</Text>
                                                                <View style={styles.confirmButtons}>
                                                                        <TouchableOpacity
                                                                                style={styles.cancelBtn}
                                                                                onPress={() => setConfirmLogout(false)}
                                                                        >
                                                                                <Text style={styles.cancelBtnText}>Cancel</Text>
                                                                        </TouchableOpacity>
                                                                        <TouchableOpacity
                                                                                style={styles.confirmLogoutBtn}
                                                                                onPress={handleLogout}
                                                                        >
                                                                                <Text style={styles.confirmLogoutText}>Log out</Text>
                                                                        </TouchableOpacity>
                                                                </View>
                                                        </View>
                                                )}
                                        </View>
                                </FadeInView>

                        </ScrollView>
                </SafeAreaView>
        );
}

const styles = StyleSheet.create({
        container: {
                flex: 1,
                backgroundColor: colors.surface.cream,
        },
        loadingContainer: {
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.surface.cream,
        },
        heroCard: {
                backgroundColor: colors.brand.ember,
                marginHorizontal: spacing.xl,
                marginTop: spacing.lg,
                borderRadius: radius.xl,
                padding: spacing.lg,
                marginBottom: spacing.lg,
                overflow: 'hidden',
                position: 'relative',
        },
        heroDeco: {
                position: 'absolute',
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: 'rgba(255,255,255,0.08)',
                top: -30,
                right: -30,
        },
        avatar: {
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: 'rgba(255,255,255,0.25)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: spacing.sm,
        },
        avatarText: {
                fontFamily: 'CabinetGrotesk-Bold',
                fontSize: typography.sizes.h1,
                color: '#fff',
        },
        heroName: {
                fontFamily: 'CabinetGrotesk-Bold',
                fontSize: typography.sizes.displayTitle,
                color: '#fff',
                marginBottom: 4,
        },
        heroEmail: {
                fontFamily: 'GeneralSans-Regular',
                fontSize: typography.sizes.bodySmall,
                color: 'rgba(255,255,255,0.65)',
                marginBottom: spacing.lg,
        },
        statsRow: {
                flexDirection: 'row',
                gap: spacing.sm,
        },
        statPill: {
                flex: 1,
                backgroundColor: 'rgba(255,255,255,0.18)',
                borderRadius: radius.md,
                padding: spacing.sm,
                alignItems: 'center',
        },
        statNum: {
                fontFamily: 'CabinetGrotesk-Bold',
                fontSize: typography.sizes.h1,
                color: '#fff',
        },
        statLbl: {
                fontFamily: 'GeneralSans-Regular',
                fontSize: typography.sizes.labelTag,
                color: 'rgba(255,255,255,0.65)',
        },
        tabRow: {
                flexDirection: 'row',
                gap: spacing.sm,
                paddingHorizontal: spacing.xl,
                marginBottom: spacing.lg,
        },
        tab: {
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.sm,
                borderRadius: radius.pill,
                backgroundColor: colors.surface.linen,
                borderWidth: 0.5,
                borderColor: colors.surface.border,
        },
        tabActive: {
                backgroundColor: colors.text.ink,
                borderColor: colors.text.ink,
        },
        tabText: {
                fontFamily: 'GeneralSans-Semibold',
                fontSize: typography.sizes.bodySmall,
                color: colors.text.stone,
        },
        tabTextActive: {
                color: '#fff',
        },
        reviewsSection: {
                paddingHorizontal: spacing.xl,
                marginBottom: spacing.xl,
        },
        emptyState: {
                alignItems: 'center',
                paddingVertical: spacing.huge,
                gap: spacing.md,
        },
        emptyTitle: {
                fontFamily: 'CabinetGrotesk-Bold',
                fontSize: typography.sizes.h1,
                color: colors.text.ink,
        },
        emptySub: {
                fontFamily: 'GeneralSans-Regular',
                fontSize: typography.sizes.bodyRegular,
                color: colors.text.stone,
                textAlign: 'center',
        },
        writeBtn: {
                backgroundColor: colors.brand.ember,
                borderRadius: radius.lg,
                paddingHorizontal: spacing.xl,
                paddingVertical: spacing.md,
                marginTop: spacing.sm,
        },
        writeBtnText: {
                fontFamily: 'CabinetGrotesk-Bold',
                fontSize: typography.sizes.bodyRegular,
                color: '#fff',
        },
        settingsSection: {
                paddingHorizontal: spacing.xl,
                paddingBottom: spacing.huge,
        },
        sectionLabel: {
                fontFamily: 'GeneralSans-Semibold',
                fontSize: typography.sizes.labelCaps,
                color: colors.text.stone,
                letterSpacing: 1.0,
                marginBottom: spacing.md,
        },
        settingsRow: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: colors.surface.white,
                borderRadius: radius.lg,
                borderWidth: 0.5,
                borderColor: colors.surface.border,
                padding: spacing.md,
                marginBottom: spacing.sm,
        },
        settingsRowLabel: {
                fontFamily: 'GeneralSans-Semibold',
                fontSize: typography.sizes.bodyRegular,
                color: colors.text.ink,
                textAlign: 'center',
        },
        settingsArrow: {
                fontSize: 18,
                color: colors.surface.border,
        },
        logoutRow: {
                backgroundColor: colors.semantic.rejected + '15',
                borderRadius: radius.lg,
                borderWidth: 0.5,
                borderColor: colors.semantic.rejected + '40',
                padding: spacing.md,
                alignItems: 'center',
        },
        logoutLabel: {
                fontFamily: 'GeneralSans-Semibold',
                fontSize: typography.sizes.bodyRegular,
                color: colors.semantic.rejected,
        },
        confirmRow: {
                backgroundColor: colors.semantic.rejected + '15',
                borderRadius: radius.lg,
                borderWidth: 0.5,
                borderColor: colors.semantic.rejected + '40',
                padding: spacing.md,
        },
        confirmText: {
                fontFamily: 'CabinetGrotesk-Bold',
                fontSize: typography.sizes.bodyRegular,
                color: colors.semantic.rejected,
                marginBottom: spacing.md,
                textAlign: 'center',
        },
        confirmButtons: {
                flexDirection: 'row',
                gap: spacing.sm,
        },
        cancelBtn: {
                flex: 1,
                height: 40,
                backgroundColor: colors.surface.linen,
                borderRadius: radius.md,
                borderWidth: 0.5,
                borderColor: colors.surface.border,
                alignItems: 'center',
                justifyContent: 'center',
        },
        cancelBtnText: {
                fontFamily: 'GeneralSans-Semibold',
                fontSize: typography.sizes.bodySmall,
                color: colors.text.ink,
        },
        confirmLogoutBtn: {
                flex: 1,
                height: 40,
                backgroundColor: colors.semantic.rejected,
                borderRadius: radius.md,
                alignItems: 'center',
                justifyContent: 'center',
        },
        confirmLogoutText: {
                fontFamily: 'GeneralSans-Semibold',
                fontSize: typography.sizes.bodySmall,
                color: '#fff',
        },
});
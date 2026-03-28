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
import { CaretLeft } from 'phosphor-react-native';
import { colors, typography, spacing, radius } from '../theme';
import { api } from '../services/api';
import ReviewCard from '../components/ReviewCard';
import ReviewTypeModal from '../components/modals/ReviewTypeModal';
import { FadeInView, ScaleInView } from '../components/FadeInView';

export default function CompanyProfileScreen({ route, navigation }) {
        const { companyId, companyName } = route.params;
        const [company, setCompany] = useState(null);
        const [loading, setLoading] = useState(true);
        const [activeTab, setActiveTab] = useState('interview');
        const [modalVisible, setModalVisible] = useState(false);

        useEffect(() => {
                loadCompany();
        }, []);

        const loadCompany = async () => {
                try {
                        const data = await api.get(`/companies/${companyId}`);
                        setCompany(data.company);
                } catch {
                        setCompany(null);
                } finally {
                        setLoading(false);
                }
        };

        const handleReviewTypeSelect = (type) => {
                setModalVisible(false);
                navigation.navigate('Tabs', {
                        screen: 'Write',
                        params: {
                                selectedCompany: { id: companyId, name: companyName },
                                reviewType: type,
                        },
                });
        };

        const avgRating = (reviews) => {
                if (!reviews || reviews.length === 0) return null;
                const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
                return (sum / reviews.length).toFixed(1);
        };

        const offerRate = (reviews) => {
                if (!reviews || reviews.length === 0) return null;
                const offers = reviews.filter(r => r.outcome === 'OFFER').length;
                return Math.round((offers / reviews.length) * 100);
        };

        if (loading) {
                return (
                        <View style={styles.loadingContainer}>
                                <ActivityIndicator color={colors.brand.ember} size="large" />
                        </View>
                );
        }

        const interviewReviews = company?.interviewReviews || [];
        const employeeReviews = company?.employeeReviews || [];
        const activeReviews = activeTab === 'interview' ? interviewReviews : employeeReviews;
        const totalReviews = interviewReviews.length + employeeReviews.length

        return (
                <SafeAreaView style={styles.container} edges={['top']}>
                        <ScrollView showsVerticalScrollIndicator={false}>

                                {/* Back button */}
                                <FadeInView delay={0}>
                                        <View style={styles.topBar}>
                                                <TouchableOpacity
                                                        style={styles.backBtn}
                                                        onPress={() => navigation.goBack()}
                                                >
                                                        <CaretLeft size={18} color={colors.text.ink} />
                                                </TouchableOpacity>
                                        </View>
                                </FadeInView>

                                {/* Hero card */}
                                <FadeInView delay={60}>
                                        <View style={styles.hero}>
                                                <View style={styles.heroAvatar}>
                                                        <Text style={styles.heroAvatarText}>
                                                                {companyName?.[0] || '?'}
                                                        </Text>
                                                </View>
                                                <Text style={styles.heroName}>{companyName}</Text>
                                                {company?.industry && (
                                                        <Text style={styles.heroMeta}>
                                                                {company.industry}
                                                                {company.location ? ` · ${company.location}` : ''}
                                                        </Text>
                                                )}

                                                <View style={styles.statsRow}>
                                                        <View style={styles.statPill}>
                                                                <Text style={styles.statNum}>
                                                                        {avgRating(interviewReviews) || '—'}
                                                                </Text>
                                                                <Text style={styles.statLbl}>Avg rating</Text>
                                                        </View>
                                                        <View style={styles.statPill}>
                                                                <Text style={styles.statNum}>
                                                                        {totalReviews}
                                                                </Text>
                                                                <Text style={styles.statLbl}>Reviews</Text>
                                                        </View>
                                                        <View style={styles.statPill}>
                                                                <Text style={styles.statNum}>
                                                                        {offerRate(interviewReviews) !== null
                                                                                ? `${offerRate(interviewReviews)}%`
                                                                                : '—'}
                                                                </Text>
                                                                <Text style={styles.statLbl}>Offer rate</Text>
                                                        </View>
                                                </View>
                                        </View>
                                </FadeInView>

                                {/* Leave a review button */}
                                <FadeInView delay={120}>
                                        <TouchableOpacity
                                                style={styles.leaveReviewBtn}
                                                onPress={() => setModalVisible(true)}
                                        >
                                                <Text style={styles.leaveReviewText}>Leave a review</Text>
                                        </TouchableOpacity>
                                </FadeInView>

                                {/* Tabs */}
                                <FadeInView delay={160}>
                                        <View style={styles.tabRow}>
                                                <TouchableOpacity
                                                        style={[styles.tab, activeTab === 'interview' && styles.tabActive]}
                                                        onPress={() => setActiveTab('interview')}
                                                >
                                                        <Text style={[
                                                                styles.tabText,
                                                                activeTab === 'interview' && styles.tabTextActive
                                                        ]}>
                                                                Interview
                                                        </Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                        style={[styles.tab, activeTab === 'employee' && styles.tabActive]}
                                                        onPress={() => setActiveTab('employee')}
                                                >
                                                        <Text style={[
                                                                styles.tabText,
                                                                activeTab === 'employee' && styles.tabTextActive
                                                        ]}>
                                                                Employee
                                                        </Text>
                                                </TouchableOpacity>
                                        </View>
                                </FadeInView>

                                {/* Reviews */}
                                <View style={styles.reviewsSection}>
                                        {activeReviews.length > 0 ? (
                                                activeReviews.map((review, index) => (
                                                        <ScaleInView key={review.id} delay={200 + index * 80}>
                                                                <ReviewCard
                                                                        review={{
                                                                                ...review,
                                                                                company: { id: companyId, name: companyName },
                                                                        }}
                                                                        index={index}
                                                                        onPress={() => { }}
                                                                />
                                                        </ScaleInView>
                                                ))
                                        ) : (
                                                <FadeInView delay={200}>
                                                        <View style={styles.emptyState}>
                                                                <Text style={styles.emptyTitle}>No reviews yet.</Text>
                                                                <Text style={styles.emptySub}>
                                                                        Be the first to spill about {companyName}.
                                                                </Text>
                                                                <TouchableOpacity
                                                                        style={styles.emptyBtn}
                                                                        onPress={() => setModalVisible(true)}
                                                                >
                                                                        <Text style={styles.emptyBtnText}>Write a review</Text>
                                                                </TouchableOpacity>
                                                        </View>
                                                </FadeInView>
                                        )}
                                </View>
                        </ScrollView>

                        <ReviewTypeModal
                                visible={modalVisible}
                                company={{ id: companyId, name: companyName }}
                                onSelect={handleReviewTypeSelect}
                                onClose={() => setModalVisible(false)}
                        />
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
        topBar: {
                paddingHorizontal: spacing.xl,
                paddingTop: spacing.md,
                paddingBottom: spacing.sm,
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
        hero: {
                backgroundColor: colors.card.violet,
                marginHorizontal: spacing.xl,
                borderRadius: radius.xl,
                padding: spacing.lg,
                marginBottom: spacing.md,
        },
        heroAvatar: {
                width: 48,
                height: 48,
                borderRadius: radius.md,
                backgroundColor: 'rgba(255,255,255,0.25)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: spacing.sm,
        },
        heroAvatarText: {
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
        heroMeta: {
                fontFamily: 'GeneralSans-Regular',
                fontSize: typography.sizes.bodySmall,
                color: 'rgba(255,255,255,0.7)',
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
        leaveReviewBtn: {
                marginHorizontal: spacing.xl,
                height: 48,
                backgroundColor: colors.brand.ember,
                borderRadius: radius.lg,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: spacing.lg,
        },
        leaveReviewText: {
                fontFamily: 'CabinetGrotesk-Bold',
                fontSize: typography.sizes.h2,
                color: '#fff',
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
                paddingBottom: spacing.huge,
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
        emptyBtn: {
                backgroundColor: colors.brand.ember,
                borderRadius: radius.lg,
                paddingHorizontal: spacing.xl,
                paddingVertical: spacing.md,
                marginTop: spacing.sm,
        },
        emptyBtnText: {
                fontFamily: 'CabinetGrotesk-Bold',
                fontSize: typography.sizes.bodyRegular,
                color: '#fff',
        },
});
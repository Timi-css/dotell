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
import { api } from '../services/api';
import { FadeInView } from '../components/FadeInView';

const INDUSTRIES = ['All', 'Tech', 'Finance', 'Health', 'Retail', 'AI', 'Other'];

const AVATAR_COLORS = [
        { bg: '#FFF0EB', text: '#F05A28' },
        { bg: '#EEF2FF', text: '#7C3AED' },
        { bg: '#ECFDF5', text: '#059669' },
        { bg: '#FEF9C3', text: '#CA8A04' },
        { bg: '#FDF2F8', text: '#F4538A' },
        { bg: '#EFF6FF', text: '#0284C7' },
];

export default function ExploreScreen({ navigation }) {
        const [companies, setCompanies] = useState([]);
        const [filtered, setFiltered] = useState([]);
        const [activeFilter, setActiveFilter] = useState('All');
        const [loading, setLoading] = useState(true);

        useEffect(() => {
                loadCompanies();
        }, []);

        useEffect(() => {
                if (activeFilter === 'All') {
                        setFiltered(companies);
                } else {
                        setFiltered(
                                companies.filter(c =>
                                        c.industry?.toLowerCase().includes(activeFilter.toLowerCase())
                                )
                        );
                }
        }, [activeFilter, companies]);

        const loadCompanies = async () => {
                try {
                        const data = await api.get('/companies');
                        const sorted = data.companies.sort((a, b) =>
                                (b._count?.interviewReviews + b._count?.employeeReviews) -
                                (a._count?.interviewReviews + a._count?.employeeReviews)
                        );
                        setCompanies(sorted);
                        setFiltered(sorted);
                } catch {
                        setCompanies([]);
                } finally {
                        setLoading(false);
                }
        };

        const avgRating = (company) => {
                const reviews = company.interviewReviews || [];
                if (reviews.length === 0) return null;
                const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
                return (sum / reviews.length).toFixed(1);
        };

        const offerRate = (company) => {
                const reviews = company.interviewReviews || [];
                if (reviews.length === 0) return null;
                const offers = reviews.filter(r => r.outcome === 'OFFER').length;
                return Math.round((offers / reviews.length) * 100);
        };

        const totalReviews = (company) => {
                return (company._count?.interviewReviews || 0) +
                        (company._count?.employeeReviews || 0);
        };

        return (
                <SafeAreaView style={styles.container} edges={['top']}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                                <FadeInView delay={0}>
                                        <View style={styles.header}>
                                                <Text style={styles.title}>
                                                        Explore <Text style={styles.titleAccent}>companies.</Text>
                                                </Text>
                                                <Text style={styles.subtitle}>Discover what others are saying</Text>
                                        </View>
                                </FadeInView>

                                <FadeInView delay={80}>
                                        <ScrollView
                                                horizontal
                                                showsHorizontalScrollIndicator={false}
                                                contentContainerStyle={styles.filterRow}
                                        >
                                                {INDUSTRIES.map(industry => (
                                                        <TouchableOpacity
                                                                key={industry}
                                                                style={[
                                                                        styles.filterChip,
                                                                        activeFilter === industry && styles.filterChipActive,
                                                                ]}
                                                                onPress={() => setActiveFilter(industry)}
                                                        >
                                                                <Text style={[
                                                                        styles.filterChipText,
                                                                        activeFilter === industry && styles.filterChipTextActive,
                                                                ]}>
                                                                        {industry}
                                                                </Text>
                                                        </TouchableOpacity>
                                                ))}
                                        </ScrollView>
                                </FadeInView>

                                <View style={styles.list}>
                                        {loading ? (
                                                <ActivityIndicator
                                                        color={colors.brand.ember}
                                                        style={{ marginTop: spacing.xl }}
                                                />
                                        ) : filtered.length > 0 ? (
                                                filtered.map((company, index) => {
                                                        const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];
                                                        const rating = avgRating(company);
                                                        const offer = offerRate(company);
                                                        const reviews = totalReviews(company);

                                                        return (
                                                                <FadeInView key={company.id} delay={100 + index * 60}>
                                                                        <TouchableOpacity
                                                                                style={styles.companyCard}
                                                                                onPress={() => navigation.navigate('CompanyProfile', {
                                                                                        companyId: company.id,
                                                                                        companyName: company.name,
                                                                                })}
                                                                                activeOpacity={0.8}
                                                                        >
                                                                                <View style={[styles.avatar, { backgroundColor: avatarColor.bg }]}>
                                                                                        <Text style={[styles.avatarText, { color: avatarColor.text }]}>
                                                                                                {company.name[0]}
                                                                                        </Text>
                                                                                </View>
                                                                                <View style={styles.companyInfo}>
                                                                                        <Text style={styles.companyName}>{company.name}</Text>
                                                                                        <Text style={styles.companyInd}>
                                                                                                {company.industry || 'Company'}
                                                                                                {company.location ? ` · ${company.location}` : ''}
                                                                                        </Text>
                                                                                        <View style={styles.statsRow}>
                                                                                                {rating && (
                                                                                                        <Text style={styles.stat}>
                                                                                                                <Text style={styles.statVal}>{rating}</Text> rating
                                                                                                        </Text>
                                                                                                )}
                                                                                                <Text style={styles.stat}>
                                                                                                        <Text style={styles.statVal}>{reviews}</Text> reviews
                                                                                                </Text>
                                                                                                {offer !== null && (
                                                                                                        <Text style={styles.stat}>
                                                                                                                <Text style={styles.statVal}>{offer}%</Text> offer
                                                                                                        </Text>
                                                                                                )}
                                                                                        </View>
                                                                                </View>
                                                                                <Text style={styles.arrow}>›</Text>
                                                                        </TouchableOpacity>
                                                                </FadeInView>
                                                        );
                                                })
                                        ) : (
                                                <FadeInView delay={200}>
                                                        <View style={styles.emptyState}>
                                                                <Text style={styles.emptyTitle}>No companies found.</Text>
                                                                <Text style={styles.emptySub}>
                                                                        Try a different filter or add a company when writing a review.
                                                                </Text>
                                                        </View>
                                                </FadeInView>
                                        )}
                                </View>
                        </ScrollView>
                </SafeAreaView>
        );
}

const styles = StyleSheet.create({
        container: {
                flex: 1,
                backgroundColor: colors.surface.cream,
        },
        header: {
                paddingHorizontal: spacing.xl,
                paddingTop: spacing.huge,
                paddingBottom: spacing.md,
        },
        title: {
                fontFamily: 'CabinetGrotesk-Bold',
                fontSize: typography.sizes.displayHero,
                color: colors.text.ink,
                lineHeight: 36,
                marginBottom: 4,
        },
        titleAccent: {
                color: colors.brand.ember,
        },
        subtitle: {
                fontFamily: 'GeneralSans-Regular',
                fontSize: typography.sizes.bodyRegular,
                color: colors.text.stone,
        },
        filterRow: {
                paddingHorizontal: spacing.xl,
                paddingBottom: spacing.lg,
                gap: spacing.sm,
        },
        filterChip: {
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                borderRadius: radius.pill,
                backgroundColor: colors.surface.white,
                borderWidth: 0.5,
                borderColor: colors.surface.border,
        },
        filterChipActive: {
                backgroundColor: colors.text.ink,
                borderColor: colors.text.ink,
        },
        filterChipText: {
                fontFamily: 'GeneralSans-Semibold',
                fontSize: typography.sizes.bodySmall,
                color: colors.text.mid,
        },
        filterChipTextActive: {
                color: '#fff',
        },
        list: {
                paddingHorizontal: spacing.xl,
                paddingBottom: spacing.huge,
        },
        companyCard: {
                backgroundColor: colors.surface.white,
                borderRadius: radius.lg,
                borderWidth: 0.5,
                borderColor: colors.surface.border,
                padding: spacing.md,
                marginBottom: spacing.sm,
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
        },
        avatar: {
                width: 40,
                height: 40,
                borderRadius: radius.md,
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
        },
        avatarText: {
                fontFamily: 'CabinetGrotesk-Bold',
                fontSize: typography.sizes.h2,
        },
        companyInfo: {
                flex: 1,
        },
        companyName: {
                fontFamily: 'CabinetGrotesk-Bold',
                fontSize: typography.sizes.bodyRegular,
                color: colors.text.ink,
                marginBottom: 2,
        },
        companyInd: {
                fontFamily: 'GeneralSans-Regular',
                fontSize: typography.sizes.bodySmall,
                color: colors.text.stone,
                marginBottom: 4,
        },
        statsRow: {
                flexDirection: 'row',
                gap: spacing.md,
        },
        stat: {
                fontFamily: 'GeneralSans-Regular',
                fontSize: typography.sizes.bodySmall,
                color: colors.text.mid,
        },
        statVal: {
                fontFamily: 'GeneralSans-Semibold',
                color: colors.brand.ember,
        },
        arrow: {
                fontSize: 18,
                color: colors.surface.border,
        },
        emptyState: {
                alignItems: 'center',
                paddingVertical: spacing.huge,
                gap: spacing.sm,
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
});
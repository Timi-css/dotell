import React, { useState, useEffect } from 'react';
import {
        View,
        Text,
        StyleSheet,
        ScrollView,
        TouchableOpacity,
        TextInput,
        ActivityIndicator,
        RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius } from '../theme';
import { api } from '../services/api';
import { MagnifyingGlass } from 'phosphor-react-native';
import ReviewCard from '../components/ReviewCard';

const CARD_COLORS = [
        colors.card.violet,
        colors.card.pink,
        colors.card.lime,
        colors.card.sky,
        colors.card.amber,
        colors.card.ink,
];

const OUTCOME_LABELS = {
        OFFER: 'Got the offer',
        REJECTED: 'Rejected',
        GHOSTED: 'Ghosted',
        WITHDREW: 'Withdrew',
};

export default function HomeScreen({ navigation }) {
        const [reviews, setReviews] = useState([]);
        const [companies, setCompanies] = useState([]);
        const [search, setSearch] = useState('');
        const [loading, setLoading] = useState(true);
        const [refreshing, setRefreshing] = useState(false);
        const [searchResults, setSearchResults] = useState([]);
        const [searching, setSearching] = useState(false);

        useEffect(() => {
                loadData();
        }, []);

        useEffect(() => {
                if (search.length > 1) {
                        handleSearch();
                } else {
                        setSearchResults([]);
                        setSearching(false);
                }
        }, [search]);

        const loadData = async () => {
                try {
                        const data = await api.get('/companies');
                        setCompanies(data.companies);
                        const allReviews = data.companies.flatMap(c =>
                                (c.interviewReviews || []).map(r => ({ ...r, company: { id: c.id, name: c.name } }))
                        );
                        setReviews(allReviews);
                } catch {
                        setReviews([]);
                } finally {
                        setLoading(false);
                        setRefreshing(false);
                }
        };

        const [user, setUser] = useState(null);

        useEffect(() => {
                loadData();
                loadUser();
        }, []);

        const loadUser = async () => {
                try {
                        const data = await api.get('/auth/me');
                        setUser(data.user);
                } catch {
                        setUser(null);
                }
        };

        const handleSearch = async () => {
                setSearching(true);
                try {
                        const data = await api.get(`/companies?search=${search}`);
                        setSearchResults(data.companies);
                } catch {
                        setSearchResults([]);
                } finally {
                        setSearching(false);
                }
        };

        const onRefresh = () => {
                setRefreshing(true);
                loadData();
        };

        return (
                <SafeAreaView style={styles.container} edges={['top']}>
                        <ScrollView
                                showsVerticalScrollIndicator={false}
                                refreshControl={
                                        <RefreshControl
                                                refreshing={refreshing}
                                                onRefresh={onRefresh}
                                                tintColor={colors.brand.ember}
                                        />
                                }
                        >
                                <View style={styles.header}>
                                        <Text style={styles.greeting}>
                                                Hey {user?.displayName ? `${user.displayName.split(' ')[0]},` : ','}{' '}
                                                <Text style={styles.greetingAccent}>spill it.</Text>
                                        </Text>
                                        <Text style={styles.subtext}>What happened in your last interview?</Text>
                                </View>

                                <View style={styles.searchContainer}>
                                        <View style={styles.searchBar}>
                                                <MagnifyingGlass size={16} color={colors.text.stone} />
                                                <TextInput
                                                        style={styles.searchInput}
                                                        placeholder="Search a company..."
                                                        placeholderTextColor={colors.text.stone}
                                                        value={search}
                                                        onChangeText={setSearch}
                                                />
                                        </View>

                                        {search.length > 1 && (
                                                <View style={styles.searchDropdown}>
                                                        {searching ? (
                                                                <ActivityIndicator color={colors.brand.ember} style={{ padding: spacing.md }} />
                                                        ) : searchResults.length > 0 ? (
                                                                searchResults.map(company => (
                                                                        <TouchableOpacity
                                                                                key={company.id}
                                                                                style={styles.searchResult}
                                                                                onPress={() => {
                                                                                        setSearch('');
                                                                                        navigation.navigate('CompanyProfile', { companyId: company.id, companyName: company.name });
                                                                                }}
                                                                        >
                                                                                <View style={styles.searchResultAvatar}>
                                                                                        <Text style={styles.searchResultAvatarText}>{company.name[0]}</Text>
                                                                                </View>
                                                                                <View>
                                                                                        <Text style={styles.searchResultName}>{company.name}</Text>
                                                                                        {company.industry && (
                                                                                                <Text style={styles.searchResultIndustry}>{company.industry}</Text>
                                                                                        )}
                                                                                </View>
                                                                        </TouchableOpacity>
                                                                ))
                                                        ) : (
                                                                <Text style={styles.noResults}>No companies found</Text>
                                                        )}
                                                </View>
                                        )}
                                </View>

                                <View style={styles.section}>
                                        <Text style={styles.sectionLabel}>HOT RIGHT NOW</Text>
                                        {loading ? (
                                                <ActivityIndicator color={colors.brand.ember} style={{ marginTop: spacing.xl }} />
                                        ) : reviews.length > 0 ? (
                                                reviews.map((review, index) => (
                                                        <ReviewCard
                                                                key={review.id}
                                                                review={review}
                                                                index={index}
                                                                onPress={() => navigation.navigate('CompanyProfile', {
                                                                        companyId: review.companyId,
                                                                        companyName: review.company?.name,
                                                                })}
                                                        />
                                                ))
                                        ) : (
                                                <View style={styles.emptyState}>
                                                        <Text style={styles.emptyTitle}>No reviews yet.</Text>
                                                        <Text style={styles.emptySubtext}>Be the first to spill.</Text>
                                                </View>
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
                paddingBottom: spacing.huge,
        },
        greeting: {
                fontFamily: 'CabinetGrotesk-Bold',
                fontSize: typography.sizes.displayHero,
                color: colors.text.ink,
                lineHeight: 36,
                marginBottom: spacing.xs,
        },
        greetingAccent: {
                color: colors.brand.ember,
        },
        subtext: {
                fontFamily: 'GeneralSans-Regular',
                fontSize: typography.sizes.bodyRegular,
                color: colors.text.ink,
        },
        searchContainer: {
                paddingHorizontal: spacing.xl,
                marginBottom: spacing.lg,
                zIndex: 10,
        },
        searchBar: {
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.surface.linen,
                borderRadius: radius.md + 2,
                borderWidth: 0.5,
                borderColor: colors.surface.border,
                paddingHorizontal: spacing.md,
                height: 44,
                gap: spacing.sm,
        },
        searchIcon: {
                fontSize: 14,
                color: colors.text.stone,
        },
        searchInput: {
                flex: 1,
                fontFamily: 'GeneralSans-Regular',
                fontSize: typography.sizes.bodyRegular,
                color: colors.text.ink,
        },
        searchDropdown: {
                backgroundColor: colors.surface.white,
                borderRadius: radius.md,
                borderWidth: 0.5,
                borderColor: colors.surface.border,
                marginTop: spacing.xs,
        },
        searchResult: {
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
                padding: spacing.md,
                borderBottomWidth: 0.5,
                borderBottomColor: colors.surface.border,
        },
        searchResultAvatar: {
                width: 32,
                height: 32,
                borderRadius: radius.sm + 2,
                backgroundColor: colors.brand.emberLight,
                alignItems: 'center',
                justifyContent: 'center',
        },
        searchResultAvatarText: {
                fontFamily: 'CabinetGrotesk-Bold',
                fontSize: typography.sizes.bodySmall,
                color: colors.brand.ember,
        },
        searchResultName: {
                fontFamily: 'CabinetGrotesk-Bold',
                fontSize: typography.sizes.bodyRegular,
                color: colors.text.ink,
        },
        searchResultIndustry: {
                fontFamily: 'GeneralSans-Regular',
                fontSize: typography.sizes.bodySmall,
                color: colors.text.stone,
        },
        noResults: {
                fontFamily: 'GeneralSans-Regular',
                fontSize: typography.sizes.bodySmall,
                color: colors.text.stone,
                padding: spacing.md,
                textAlign: 'center',
        },
        section: {
                paddingHorizontal: spacing.xl,
                paddingBottom: spacing.xl,
        },
        sectionLabel: {
                fontFamily: 'GeneralSans-Semibold',
                fontSize: typography.sizes.labelCaps,
                color: colors.text.ink,
                letterSpacing: 1.0,
                marginBottom: spacing.md,
        },
        card: {
                borderRadius: radius.xl,
                padding: spacing.lg,
                paddingBottom: spacing.xxxl,
                marginBottom: spacing.md,
                overflow: 'hidden',
                position: 'relative',
        },
        cardDeco: {
                position: 'absolute',
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: 'rgba(255,255,255,0.08)',
                right: -20,
                bottom: -20,
        },
        cardTop: {
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.sm,
                marginBottom: spacing.md,
        },
        cardAvatar: {
                width: 32,
                height: 32,
                borderRadius: radius.sm + 2,
                backgroundColor: 'rgba(255,255,255,0.25)',
                alignItems: 'center',
                justifyContent: 'center',
        },
        cardAvatarText: {
                fontFamily: 'CabinetGrotesk-Bold',
                fontSize: typography.sizes.bodySmall,
                color: '#fff',
        },
        cardMeta: {
                flex: 1,
        },
        cardCompany: {
                fontFamily: 'CabinetGrotesk-Bold',
                fontSize: typography.sizes.h2,
                fontWeight: typography.weights.medium,
                color: '#fff',
        },
        cardRole: {
                fontFamily: 'GeneralSans-Regular',
                fontSize: typography.sizes.bodySmall,
                color: 'rgba(255,255,255,0.7)',
        },
        cardStars: {
                flexDirection: 'row',
                gap: 8,
        },
        star: {
                fontSize: 10,
                color: '#fff',
        },
        cardText: {
                fontFamily: 'GeneralSans-Regular',
                fontSize: typography.sizes.bodySmall,
                color: 'rgba(255,255,255,0.9)',
                lineHeight: 18,
                marginBottom: spacing.md,
        },
        cardBottom: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: spacing.md,
        },
        cardAuthor: {
                fontFamily: 'GeneralSans-Regular',
                fontSize: typography.sizes.bodySmall,
                color: 'rgba(255,255,255,0.6)',
        },
        outcomeTag: {
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: radius.pill,
                paddingHorizontal: spacing.md,
                paddingVertical: 4,
        },
        outcomeText: {
                fontFamily: 'GeneralSans-Semibold',
                fontSize: typography.sizes.labelTag,
                color: '#fff',
        },
        emptyState: {
                alignItems: 'center',
                paddingVertical: spacing.huge,
        },
        emptyTitle: {
                fontFamily: 'CabinetGrotesk-Bold',
                fontSize: typography.sizes.h1,
                color: colors.text.ink,
                marginBottom: spacing.xs,
        },
        emptySubtext: {
                fontFamily: 'GeneralSans-Regular',
                fontSize: typography.sizes.bodyRegular,
                color: colors.text.stone,
        },
});
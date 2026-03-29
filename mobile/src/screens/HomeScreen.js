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
import { FadeInView, ScaleInView } from '../components/FadeInView';

export default function HomeScreen({ navigation }) {
        const [reviews, setReviews] = useState([]);
        const [companies, setCompanies] = useState([]);
        const [search, setSearch] = useState('');
        const [loading, setLoading] = useState(true);
        const [refreshing, setRefreshing] = useState(false);
        const [searchResults, setSearchResults] = useState([]);
        const [searching, setSearching] = useState(false);
        const [user, setUser] = useState(null);

        useEffect(() => {
                loadData();
                loadUser();
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
                        const allReviews = data.companies.flatMap(c => [
                                ...(c.interviewReviews || []).map(r => ({
                                        ...r,
                                        reviewType: 'interview',
                                        company: { id: c.id, name: c.name },
                                })),
                                ...(c.employeeReviews || []).map(r => ({
                                        ...r,
                                        reviewType: 'employee',
                                        company: { id: c.id, name: c.name },
                                })),
                        ]);
                        allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                        setReviews(allReviews);
                } catch {
                        setReviews([]);
                } finally {
                        setLoading(false);
                        setRefreshing(false);
                }
        };

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
                                <FadeInView delay={0}>
                                        <View style={styles.header}>
                                                <Text style={styles.greeting}>
                                                        Hey {user?.displayName ? `${user.displayName.split(' ')[0]},` : ','}{' '}
                                                        <Text style={styles.greetingAccent}>spill it.</Text>
                                                </Text>
                                                <Text style={styles.subtext}>What happened in your last interview?</Text>
                                        </View>
                                </FadeInView>

                                <FadeInView delay={100}>
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
                                                                        <ActivityIndicator
                                                                                color={colors.brand.ember}
                                                                                style={{ padding: spacing.md }}
                                                                        />
                                                                ) : searchResults.length > 0 ? (
                                                                        searchResults.map(company => (
                                                                                <TouchableOpacity
                                                                                        key={company.id}
                                                                                        style={styles.searchResult}
                                                                                        onPress={() => {
                                                                                                setSearch('');
                                                                                                navigation.navigate('CompanyProfile', {
                                                                                                        companyId: company.id,
                                                                                                        companyName: company.name,
                                                                                                });
                                                                                        }}
                                                                                >
                                                                                        <View style={styles.searchResultAvatar}>
                                                                                                <Text style={styles.searchResultAvatarText}>
                                                                                                        {company.name[0]}
                                                                                                </Text>
                                                                                        </View>
                                                                                        <View>
                                                                                                <Text style={styles.searchResultName}>{company.name}</Text>
                                                                                                {company.industry && (
                                                                                                        <Text style={styles.searchResultIndustry}>
                                                                                                                {company.industry}
                                                                                                        </Text>
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
                                </FadeInView>

                                <View style={styles.section}>
                                        <FadeInView delay={200}>
                                                <Text style={styles.sectionLabel}>HOT RIGHT NOW</Text>
                                        </FadeInView>

                                        {loading ? (
                                                <ActivityIndicator
                                                        color={colors.brand.ember}
                                                        style={{ marginTop: spacing.xl }}
                                                />
                                        ) : reviews.length > 0 ? (
                                                reviews.map((review, index) => (
                                                        <ScaleInView key={review.id} delay={250 + index * 80}>
                                                                <ReviewCard
                                                                        review={review}
                                                                        index={index}
                                                                        onPress={() =>
                                                                                navigation.navigate('CompanyProfile', {
                                                                                        companyId: review.companyId,
                                                                                        companyName: review.company?.name,
                                                                                })
                                                                        }
                                                                />
                                                        </ScaleInView>
                                                ))
                                        ) : (
                                                <FadeInView delay={300}>
                                                        <View style={styles.emptyState}>
                                                                <Text style={styles.emptyTitle}>No reviews yet.</Text>
                                                                <Text style={styles.emptySubtext}>Be the first to spill.</Text>
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
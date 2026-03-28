import React, { useState, useEffect, useRef } from 'react';
import {
        View,
        Text,
        StyleSheet,
        TouchableOpacity,
        TextInput,
        ScrollView,
        KeyboardAvoidingView,
        Platform,
        ActivityIndicator,
        Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MagnifyingGlass, CaretLeft } from 'phosphor-react-native';
import { colors, typography, spacing, radius } from '../theme';
import { api } from '../services/api';
import { ScrollView as HorizontalScroll } from 'react-native';
import ReviewCard from '../components/ReviewCard';
import { FadeInView } from '../components/FadeInView';
import ReviewTypeModal from '../components/modals/ReviewTypeModal';

const OUTCOMES = [
        { label: 'Got offer', value: 'OFFER' },
        { label: 'Rejected', value: 'REJECTED' },
        { label: 'Ghosted', value: 'GHOSTED' },
        { label: 'Withdrew', value: 'WITHDREW' },
];

export default function WriteReviewScreen({ navigation, route }) {
        const [step, setStep] = useState(1);
        const [companySearch, setCompanySearch] = useState('');
        const [searchResults, setSearchResults] = useState([]);
        const [selectedCompany, setSelectedCompany] = useState(null);
        const [searching, setSearching] = useState(false);
        const [reviewType, setReviewType] = useState(null);
        const [modalVisible, setModalVisible] = useState(false);
        const [role, setRole] = useState('');
        const [rating, setRating] = useState(0);
        const [difficulty, setDifficulty] = useState(0);
        const [outcome, setOutcome] = useState('');
        const [reviewText, setReviewText] = useState('');
        const [isAnonymous, setIsAnonymous] = useState(false);
        const [cultureRating, setCultureRating] = useState(0);
        const [managementRating, setManagementRating] = useState(0);
        const [compensationRating, setCompensationRating] = useState(0);
        const [submitting, setSubmitting] = useState(false);
        const [error, setError] = useState('');
        const [trending, setTrending] = useState([]);
        const [recentReviews, setRecentReviews] = useState([]);
        const [loadingData, setLoadingData] = useState(true);
        const toggleAnim = useRef(new Animated.Value(0)).current;

        useEffect(() => {
                loadDiscoveryData();
        }, []);

        useEffect(() => {
                Animated.spring(toggleAnim, {
                        toValue: isAnonymous ? 1 : 0,
                        useNativeDriver: true,
                        damping: 15,
                        stiffness: 120,
                }).start();
        }, [isAnonymous]);

        useEffect(() => {
                if (route?.params?.selectedCompany) {
                        setSelectedCompany(route.params.selectedCompany);
                        setReviewType(route.params.reviewType);
                        setModalVisible(false);
                        setStep(2);
                }
        }, [route?.params]);

        const loadDiscoveryData = async () => {
                try {
                        const data = await api.get('/companies');
                        const companies = data.companies;
                        const sorted = [...companies].sort((a, b) =>
                                (b._count?.interviewReviews + b._count?.employeeReviews) -
                                (a._count?.interviewReviews + a._count?.employeeReviews)
                        );
                        setTrending(sorted.slice(0, 6));
                        const reviews = companies.flatMap(c =>
                                (c.interviewReviews || []).map(r => ({
                                        ...r,
                                        company: { id: c.id, name: c.name },
                                }))
                        );
                        reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                        setRecentReviews(reviews.slice(0, 5));
                } catch {
                        setTrending([]);
                        setRecentReviews([]);
                } finally {
                        setLoadingData(false);
                }
        };

        const handleSearch = async (text) => {
                setCompanySearch(text);
                if (text.length < 2) {
                        setSearchResults([]);
                        return;
                }
                setSearching(true);
                try {
                        const data = await api.get(`/companies?search=${text}`);
                        setSearchResults(data.companies);
                } catch {
                        setSearchResults([]);
                } finally {
                        setSearching(false);
                }
        };

        const handleSelectCompany = (company) => {
                setSelectedCompany(company);
                setCompanySearch('');
                setSearchResults([]);
                setModalVisible(true);
        };

        const handleReviewTypeSelect = (type) => {
                setReviewType(type);
                setModalVisible(false);
                setStep(2);
        };

        const handleSubmit = async () => {
                setError('');
                setSubmitting(true);
                try {
                        if (reviewType === 'interview') {
                                if (!role || !rating || !difficulty || !outcome || !reviewText) {
                                        setError('Please fill in all fields');
                                        setSubmitting(false);
                                        return;
                                }
                                await api.post(`/companies/${selectedCompany.id}/interview-reviews`, {
                                        role, rating, difficulty, outcome, reviewText, isAnonymous,
                                });
                        } else {
                                if (!role || !cultureRating || !managementRating || !compensationRating || !reviewText) {
                                        setError('Please fill in all fields');
                                        setSubmitting(false);
                                        return;
                                }
                                await api.post(`/companies/${selectedCompany.id}/employee-reviews`, {
                                        role, cultureRating, managementRating, compensationRating,
                                        reviewText, isAnonymous,
                                });
                        }
                        navigation.navigate('Success', { companyName: selectedCompany.name });
                } catch (err) {
                        setError(err.message);
                } finally {
                        setSubmitting(false);
                }
        };

        const timeAgo = (dateStr) => {
                const diff = Date.now() - new Date(dateStr).getTime();
                const mins = Math.floor(diff / 60000);
                const hours = Math.floor(diff / 3600000);
                const days = Math.floor(diff / 86400000);
                if (mins < 60) return `${mins}m ago`;
                if (hours < 24) return `${hours}h ago`;
                return `${days}d ago`;
        };

        const promptColor = reviewType === 'employee' ? colors.card.ink : colors.card.violet;
        const promptTitle = reviewType === 'employee' ? 'What\'s it like?' : 'How did it go?';
        const promptSub = reviewType === 'employee'
                ? 'Be honest. Others are deciding if they should work here.'
                : 'Others are counting on your honesty. Spill it.';

        return (
                <SafeAreaView style={styles.container} edges={['top']}>
                        <KeyboardAvoidingView
                                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                                style={styles.inner}
                        >
                                <ScrollView showsVerticalScrollIndicator={false}>

                                        {/* STEP 1 */}
                                        {step === 1 && (
                                                <View style={styles.section}>
                                                        <FadeInView delay={0}>
                                                                <Text style={styles.headline}>Who did you{'\n'}interview with?</Text>
                                                                <Text style={styles.subtext}>Search for the company below.</Text>
                                                        </FadeInView>

                                                        <FadeInView delay={80}>
                                                                <View style={styles.searchBar}>
                                                                        <MagnifyingGlass size={16} color={colors.text.stone} />
                                                                        <TextInput
                                                                                style={styles.searchInput}
                                                                                placeholder="Search a company..."
                                                                                placeholderTextColor={colors.text.stone}
                                                                                value={companySearch}
                                                                                onChangeText={handleSearch}
                                                                        />
                                                                </View>
                                                        </FadeInView>

                                                        {searching && (
                                                                <ActivityIndicator color={colors.brand.ember} style={{ marginTop: spacing.md }} />
                                                        )}

                                                        {searchResults.length > 0 && (
                                                                <View style={styles.searchDropdown}>
                                                                        {searchResults.map(company => (
                                                                                <TouchableOpacity
                                                                                        key={company.id}
                                                                                        style={styles.searchResult}
                                                                                        onPress={() => handleSelectCompany(company)}
                                                                                >
                                                                                        <View style={styles.resultAvatar}>
                                                                                                <Text style={styles.resultAvatarText}>{company.name[0]}</Text>
                                                                                        </View>
                                                                                        <View>
                                                                                                <Text style={styles.resultName}>{company.name}</Text>
                                                                                                {company.industry && (
                                                                                                        <Text style={styles.resultIndustry}>{company.industry}</Text>
                                                                                                )}
                                                                                        </View>
                                                                                </TouchableOpacity>
                                                                        ))}
                                                                </View>
                                                        )}

                                                        {companySearch.length > 1 && searchResults.length === 0 && !searching && (
                                                                <View style={styles.noResultsBox}>
                                                                        <Text style={styles.noResultsText}>
                                                                                Can't find "{companySearch}"?
                                                                        </Text>
                                                                        <TouchableOpacity
                                                                                style={styles.addCompanyBtn}
                                                                                onPress={async () => {
                                                                                        try {
                                                                                                const data = await api.post('/companies', { name: companySearch });
                                                                                                handleSelectCompany(data.company);
                                                                                        } catch (err) {
                                                                                                setError(err.message);
                                                                                        }
                                                                                }}
                                                                        >
                                                                                <Text style={styles.addCompanyText}>
                                                                                        Add "{companySearch}" and continue
                                                                                </Text>
                                                                        </TouchableOpacity>
                                                                </View>
                                                        )}

                                                        {companySearch.length === 0 && (
                                                                <>
                                                                        {trending.length > 0 && (
                                                                                <FadeInView delay={160}>
                                                                                        <View style={styles.discoverySection}>
                                                                                                <Text style={styles.discoveryLabel}>TRENDING</Text>
                                                                                                <HorizontalScroll
                                                                                                        horizontal
                                                                                                        showsHorizontalScrollIndicator={false}
                                                                                                        contentContainerStyle={styles.chipsScroll}
                                                                                                >
                                                                                                        {trending.map(company => (
                                                                                                                <TouchableOpacity
                                                                                                                        key={company.id}
                                                                                                                        style={styles.trendingChip}
                                                                                                                        onPress={() => handleSelectCompany(company)}
                                                                                                                >
                                                                                                                        <Text style={styles.trendingChipText}>{company.name}</Text>
                                                                                                                </TouchableOpacity>
                                                                                                        ))}
                                                                                                </HorizontalScroll>
                                                                                        </View>
                                                                                </FadeInView>
                                                                        )}

                                                                        {recentReviews.length > 0 && (
                                                                                <FadeInView delay={240}>
                                                                                        <View style={styles.discoverySection}>
                                                                                                <Text style={styles.discoveryLabel}>RECENTLY REVIEWED</Text>
                                                                                                {recentReviews.map((review, index) => (
                                                                                                        <FadeInView key={review.id} delay={240 + index * 60}>
                                                                                                                <ReviewCard
                                                                                                                        review={review}
                                                                                                                        index={index}
                                                                                                                        variant="row"
                                                                                                                        onPress={() => handleSelectCompany(review.company)}
                                                                                                                />
                                                                                                        </FadeInView>
                                                                                                ))}
                                                                                        </View>
                                                                                </FadeInView>
                                                                        )}

                                                                        {loadingData && (
                                                                                <ActivityIndicator color={colors.brand.ember} style={{ marginTop: spacing.xl }} />
                                                                        )}
                                                                </>
                                                        )}
                                                </View>
                                        )}

                                        {/* STEP 2 */}
                                        {step === 2 && (
                                                <View style={styles.section}>
                                                        <FadeInView delay={0}>
                                                                <View style={styles.header}>
                                                                        <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
                                                                                <CaretLeft size={16} color={colors.text.ink} />
                                                                        </TouchableOpacity>
                                                                        <Text style={styles.headerCompany}>{selectedCompany?.name}</Text>
                                                                </View>
                                                        </FadeInView>

                                                        <FadeInView delay={60}>
                                                                <View style={[styles.promptCard, { backgroundColor: promptColor }]}>
                                                                        <View style={styles.promptDeco} />
                                                                        <Text style={styles.promptTitle}>{promptTitle}</Text>
                                                                        <Text style={styles.promptSub}>{promptSub}</Text>
                                                                </View>
                                                        </FadeInView>

                                                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

                                                        <FadeInView delay={120}>
                                                                <View style={styles.field}>
                                                                        <Text style={styles.label}>YOUR ROLE</Text>
                                                                        <TextInput
                                                                                style={styles.input}
                                                                                placeholder={reviewType === 'employee' ? 'e.g. Senior Engineer' : 'e.g. Software Engineer, Backend'}
                                                                                placeholderTextColor={colors.text.stone}
                                                                                value={role}
                                                                                onChangeText={setRole}
                                                                        />
                                                                </View>
                                                        </FadeInView>

                                                        {/* INTERVIEW FIELDS */}
                                                        {reviewType === 'interview' && (
                                                                <>
                                                                        <FadeInView delay={160}>
                                                                                <View style={styles.field}>
                                                                                        <Text style={styles.label}>OVERALL RATING</Text>
                                                                                        <View style={styles.starsRow}>
                                                                                                {[1, 2, 3, 4, 5].map(i => (
                                                                                                        <TouchableOpacity key={i} onPress={() => setRating(i)}>
                                                                                                                <Text style={[styles.starBtn, { opacity: i <= rating ? 1 : 0.2 }]}>★</Text>
                                                                                                        </TouchableOpacity>
                                                                                                ))}
                                                                                        </View>
                                                                                </View>
                                                                        </FadeInView>

                                                                        <FadeInView delay={200}>
                                                                                <View style={styles.field}>
                                                                                        <Text style={styles.label}>INTERVIEW DIFFICULTY</Text>
                                                                                        <View style={styles.starsRow}>
                                                                                                {[1, 2, 3, 4, 5].map(i => (
                                                                                                        <TouchableOpacity key={i} onPress={() => setDifficulty(i)}>
                                                                                                                <Text style={[styles.starBtn, { opacity: i <= difficulty ? 1 : 0.2 }]}>★</Text>
                                                                                                        </TouchableOpacity>
                                                                                                ))}
                                                                                        </View>
                                                                                        <View style={styles.difficultyLabels}>
                                                                                                <Text style={styles.difficultyLabel}>Easy</Text>
                                                                                                <Text style={styles.difficultyLabel}>Very Hard</Text>
                                                                                        </View>
                                                                                </View>
                                                                        </FadeInView>

                                                                        <FadeInView delay={240}>
                                                                                <View style={styles.field}>
                                                                                        <Text style={styles.label}>WHAT HAPPENED</Text>
                                                                                        <View style={styles.chipsRow}>
                                                                                                {OUTCOMES.map(o => (
                                                                                                        <TouchableOpacity
                                                                                                                key={o.value}
                                                                                                                style={[styles.chip, outcome === o.value && styles.chipSelected]}
                                                                                                                onPress={() => setOutcome(o.value)}
                                                                                                        >
                                                                                                                <Text style={[styles.chipText, outcome === o.value && styles.chipTextSelected]}>
                                                                                                                        {o.label}
                                                                                                                </Text>
                                                                                                        </TouchableOpacity>
                                                                                                ))}
                                                                                        </View>
                                                                                </View>
                                                                        </FadeInView>
                                                                </>
                                                        )}

                                                        {/* EMPLOYEE FIELDS */}
                                                        {reviewType === 'employee' && (
                                                                <>
                                                                        <FadeInView delay={160}>
                                                                                <View style={styles.field}>
                                                                                        <Text style={styles.label}>CULTURE RATING</Text>
                                                                                        <View style={styles.starsRow}>
                                                                                                {[1, 2, 3, 4, 5].map(i => (
                                                                                                        <TouchableOpacity key={i} onPress={() => setCultureRating(i)}>
                                                                                                                <Text style={[styles.starBtn, { opacity: i <= cultureRating ? 1 : 0.2 }]}>★</Text>
                                                                                                        </TouchableOpacity>
                                                                                                ))}
                                                                                        </View>
                                                                                </View>
                                                                        </FadeInView>

                                                                        <FadeInView delay={200}>
                                                                                <View style={styles.field}>
                                                                                        <Text style={styles.label}>MANAGEMENT RATING</Text>
                                                                                        <View style={styles.starsRow}>
                                                                                                {[1, 2, 3, 4, 5].map(i => (
                                                                                                        <TouchableOpacity key={i} onPress={() => setManagementRating(i)}>
                                                                                                                <Text style={[styles.starBtn, { opacity: i <= managementRating ? 1 : 0.2 }]}>★</Text>
                                                                                                        </TouchableOpacity>
                                                                                                ))}
                                                                                        </View>
                                                                                </View>
                                                                        </FadeInView>

                                                                        <FadeInView delay={240}>
                                                                                <View style={styles.field}>
                                                                                        <Text style={styles.label}>COMPENSATION RATING</Text>
                                                                                        <View style={styles.starsRow}>
                                                                                                {[1, 2, 3, 4, 5].map(i => (
                                                                                                        <TouchableOpacity key={i} onPress={() => setCompensationRating(i)}>
                                                                                                                <Text style={[styles.starBtn, { opacity: i <= compensationRating ? 1 : 0.2 }]}>★</Text>
                                                                                                        </TouchableOpacity>
                                                                                                ))}
                                                                                        </View>
                                                                                </View>
                                                                        </FadeInView>
                                                                </>
                                                        )}

                                                        <FadeInView delay={280}>
                                                                <View style={styles.field}>
                                                                        <Text style={styles.label}>TELL THE STORY</Text>
                                                                        <TextInput
                                                                                style={styles.textarea}
                                                                                placeholder='"What actually happened..."'
                                                                                placeholderTextColor={colors.text.stone}
                                                                                value={reviewText}
                                                                                onChangeText={setReviewText}
                                                                                multiline
                                                                                numberOfLines={5}
                                                                                textAlignVertical="top"
                                                                        />
                                                                </View>
                                                        </FadeInView>

                                                        <FadeInView delay={320}>
                                                                <View style={styles.toggleRow}>
                                                                        <View style={styles.toggleLabels}>
                                                                                <Text style={styles.toggleTitle}>Post anonymously</Text>
                                                                                <Text style={styles.toggleSub}>Your name stays out of it.</Text>
                                                                        </View>
                                                                        <TouchableOpacity
                                                                                style={[styles.toggleTrack, isAnonymous && styles.toggleTrackActive]}
                                                                                onPress={() => setIsAnonymous(!isAnonymous)}
                                                                                activeOpacity={0.9}
                                                                        >
                                                                                <Animated.View
                                                                                        style={[
                                                                                                styles.toggleKnob,
                                                                                                {
                                                                                                        transform: [{
                                                                                                                translateX: toggleAnim.interpolate({
                                                                                                                        inputRange: [0, 1],
                                                                                                                        outputRange: [0, 22],
                                                                                                                }),
                                                                                                        }],
                                                                                                },
                                                                                        ]}
                                                                                />
                                                                        </TouchableOpacity>
                                                                </View>
                                                        </FadeInView>

                                                        <FadeInView delay={360}>
                                                                <TouchableOpacity
                                                                        style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
                                                                        onPress={handleSubmit}
                                                                        disabled={submitting}
                                                                >
                                                                        {submitting ? (
                                                                                <ActivityIndicator color="#fff" />
                                                                        ) : (
                                                                                <Text style={styles.submitBtnText}>Spill it</Text>
                                                                        )}
                                                                </TouchableOpacity>
                                                        </FadeInView>
                                                </View>
                                        )}
                                </ScrollView>
                        </KeyboardAvoidingView>

                        <ReviewTypeModal
                                visible={modalVisible}
                                company={selectedCompany}
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
        inner: {
                flex: 1,
        },
        section: {
                paddingHorizontal: spacing.xl,
                paddingTop: spacing.huge,
                paddingBottom: spacing.huge,
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
                color: colors.text.stone,
                marginBottom: spacing.xl,
        },
        searchBar: {
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.surface.white,
                borderRadius: radius.md,
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
                marginTop: spacing.sm,
        },
        searchResult: {
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
                padding: spacing.md,
                borderBottomWidth: 0.5,
                borderBottomColor: colors.surface.border,
        },
        resultAvatar: {
                width: 36,
                height: 36,
                borderRadius: radius.sm + 2,
                backgroundColor: colors.brand.emberLight,
                alignItems: 'center',
                justifyContent: 'center',
        },
        resultAvatarText: {
                fontFamily: 'CabinetGrotesk-Bold',
                fontSize: typography.sizes.bodyRegular,
                color: colors.brand.ember,
        },
        resultName: {
                fontFamily: 'CabinetGrotesk-Bold',
                fontSize: typography.sizes.bodyRegular,
                color: colors.text.ink,
        },
        resultIndustry: {
                fontFamily: 'GeneralSans-Regular',
                fontSize: typography.sizes.bodySmall,
                color: colors.text.stone,
        },
        noResultsBox: {
                marginTop: spacing.lg,
                padding: spacing.lg,
                backgroundColor: colors.surface.linen,
                borderRadius: radius.lg,
                borderWidth: 0.5,
                borderColor: colors.surface.border,
                gap: spacing.md,
        },
        noResultsText: {
                fontFamily: 'GeneralSans-Regular',
                fontSize: typography.sizes.bodyRegular,
                color: colors.text.mid,
        },
        addCompanyBtn: {
                backgroundColor: colors.brand.ember,
                borderRadius: radius.md,
                padding: spacing.md,
                alignItems: 'center',
        },
        addCompanyText: {
                fontFamily: 'GeneralSans-Semibold',
                fontSize: typography.sizes.bodySmall,
                color: '#fff',
        },
        header: {
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
                marginBottom: spacing.lg,
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
        headerCompany: {
                fontFamily: 'CabinetGrotesk-Bold',
                fontSize: typography.sizes.h2,
                color: colors.text.ink,
        },
        promptCard: {
                borderRadius: radius.xl,
                padding: spacing.lg,
                marginBottom: spacing.lg,
                overflow: 'hidden',
                position: 'relative',
        },
        promptDeco: {
                position: 'absolute',
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: 'rgba(255,255,255,0.08)',
                right: -20,
                top: -20,
        },
        promptTitle: {
                fontFamily: 'CabinetGrotesk-Bold',
                fontSize: typography.sizes.displayTitle,
                color: '#fff',
                marginBottom: spacing.xs,
        },
        promptSub: {
                fontFamily: 'GeneralSans-Regular',
                fontSize: typography.sizes.bodySmall,
                color: 'rgba(255,255,255,0.75)',
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
        starsRow: {
                flexDirection: 'row',
                gap: spacing.sm,
        },
        starBtn: {
                fontSize: 24,
                color: colors.brand.ember,
        },
        difficultyLabels: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: spacing.xs,
        },
        difficultyLabel: {
                fontFamily: 'GeneralSans-Regular',
                fontSize: typography.sizes.bodySmall,
                color: colors.text.stone,
        },
        chipsRow: {
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: spacing.sm,
        },
        chip: {
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                borderRadius: radius.pill,
                borderWidth: 0.5,
                borderColor: colors.surface.border,
                backgroundColor: colors.surface.white,
        },
        chipSelected: {
                backgroundColor: colors.text.ink,
                borderColor: colors.text.ink,
        },
        chipText: {
                fontFamily: 'GeneralSans-Semibold',
                fontSize: typography.sizes.bodySmall,
                color: colors.text.mid,
        },
        chipTextSelected: {
                color: '#fff',
        },
        textarea: {
                backgroundColor: colors.surface.white,
                borderRadius: radius.md,
                borderWidth: 0.5,
                borderColor: colors.surface.border,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.md,
                fontFamily: 'GeneralSans-Regular',
                fontSize: typography.sizes.bodyRegular,
                color: colors.text.ink,
                minHeight: 120,
        },
        toggleRow: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: spacing.xl,
                paddingVertical: spacing.sm,
        },
        toggleLabels: {
                flex: 1,
        },
        toggleTitle: {
                fontFamily: 'GeneralSans-Semibold',
                fontSize: typography.sizes.bodyRegular,
                color: colors.text.ink,
                marginBottom: 2,
        },
        toggleSub: {
                fontFamily: 'GeneralSans-Regular',
                fontSize: typography.sizes.bodySmall,
                color: colors.text.stone,
        },
        toggleTrack: {
                width: 52,
                height: 30,
                borderRadius: 15,
                backgroundColor: colors.surface.border,
                padding: 3,
                justifyContent: 'center',
        },
        toggleTrackActive: {
                backgroundColor: colors.brand.ember,
        },
        toggleKnob: {
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: '#fff',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.15,
                shadowRadius: 2,
                elevation: 2,
        },
        submitBtn: {
                height: 52,
                backgroundColor: colors.brand.ember,
                borderRadius: radius.lg,
                alignItems: 'center',
                justifyContent: 'center',
        },
        submitBtnDisabled: {
                opacity: 0.6,
        },
        submitBtnText: {
                fontFamily: 'CabinetGrotesk-Bold',
                fontSize: typography.sizes.h2,
                color: '#fff',
        },
        discoverySection: {
                marginTop: spacing.xl,
        },
        discoveryLabel: {
                fontFamily: 'GeneralSans-Semibold',
                fontSize: typography.sizes.labelCaps,
                color: colors.text.stone,
                letterSpacing: 1.0,
                marginBottom: spacing.md,
        },
        chipsScroll: {
                gap: spacing.sm,
                paddingRight: spacing.xl,
        },
        trendingChip: {
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                borderRadius: radius.pill,
                backgroundColor: colors.surface.white,
                borderWidth: 0.5,
                borderColor: colors.surface.border,
        },
        trendingChipText: {
                fontFamily: 'GeneralSans-Semibold',
                fontSize: typography.sizes.bodySmall,
                color: colors.text.ink,
        },
});
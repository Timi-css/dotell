import React, { useState } from 'react';
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
        Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MagnifyingGlass, CaretLeft } from 'phosphor-react-native';
import { colors, typography, spacing, radius } from '../theme';
import { api } from '../services/api';

const OUTCOMES = [
        { label: 'Got offer', value: 'OFFER' },
        { label: 'Rejected', value: 'REJECTED' },
        { label: 'Ghosted', value: 'GHOSTED' },
        { label: 'Withdrew', value: 'WITHDREW' },
];

export default function WriteReviewScreen({ navigation }) {
        const [step, setStep] = useState(1);
        const [companySearch, setCompanySearch] = useState('');
        const [searchResults, setSearchResults] = useState([]);
        const [selectedCompany, setSelectedCompany] = useState(null);
        const [searching, setSearching] = useState(false);
        const [role, setRole] = useState('');
        const [rating, setRating] = useState(0);
        const [difficulty, setDifficulty] = useState(0);
        const [outcome, setOutcome] = useState('');
        const [reviewText, setReviewText] = useState('');
        const [isAnonymous, setIsAnonymous] = useState(false);
        const [submitting, setSubmitting] = useState(false);
        const [error, setError] = useState('');

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
                setStep(2);
        };

        const handleSubmit = async () => {
                setError('');
                if (!role || !rating || !difficulty || !outcome || !reviewText) {
                        setError('Please fill in all fields');
                        return;
                }
                setSubmitting(true);
                try {
                        await api.post(`/companies/${selectedCompany.id}/interview-reviews`, {
                                role,
                                rating,
                                difficulty,
                                outcome,
                                reviewText,
                                isAnonymous,
                        });
                        navigation.navigate('Success');
                } catch (err) {
                        setError(err.message);
                } finally {
                        setSubmitting(false);
                }
        };

        return (
                <SafeAreaView style={styles.container} edges={['top']}>
                        <KeyboardAvoidingView
                                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                                style={styles.inner}
                        >
                                <ScrollView showsVerticalScrollIndicator={false}>

                                        {/* STEP 1 — Select company */}
                                        {step === 1 && (
                                                <View style={styles.section}>
                                                        <Text style={styles.headline}>Who did you{'\n'}interview with?</Text>
                                                        <Text style={styles.subtext}>Search for the company below.</Text>

                                                        <View style={styles.searchBar}>
                                                                <MagnifyingGlass size={16} color={colors.text.stone} />
                                                                <TextInput
                                                                        style={styles.searchInput}
                                                                        placeholder="Search a company..."
                                                                        placeholderTextColor={colors.text.stone}
                                                                        value={companySearch}
                                                                        onChangeText={handleSearch}
                                                                        autoFocus
                                                                />
                                                        </View>

                                                        {searching && (
                                                                <ActivityIndicator
                                                                        color={colors.brand.ember}
                                                                        style={{ marginTop: spacing.md }}
                                                                />
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
                                                                                                <Text style={styles.resultAvatarText}>
                                                                                                        {company.name[0]}
                                                                                                </Text>
                                                                                        </View>
                                                                                        <View>
                                                                                                <Text style={styles.resultName}>{company.name}</Text>
                                                                                                {company.industry && (
                                                                                                        <Text style={styles.resultIndustry}>
                                                                                                                {company.industry}
                                                                                                        </Text>
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
                                                                                                const data = await api.post('/companies', {
                                                                                                        name: companySearch,
                                                                                                });
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
                                                </View>
                                        )}

                                        {/* STEP 2 — Write review */}
                                        {step === 2 && (
                                                <View style={styles.section}>

                                                        {/* Header */}
                                                        <View style={styles.header}>
                                                                <TouchableOpacity
                                                                        style={styles.backBtn}
                                                                        onPress={() => setStep(1)}
                                                                >
                                                                        <CaretLeft size={16} color={colors.text.ink} />
                                                                </TouchableOpacity>
                                                                <Text style={styles.headerCompany}>
                                                                        {selectedCompany?.name}
                                                                </Text>
                                                        </View>

                                                        {/* Prompt card */}
                                                        <View style={styles.promptCard}>
                                                                <View style={styles.promptDeco} />
                                                                <Text style={styles.promptTitle}>How did it go?</Text>
                                                                <Text style={styles.promptSub}>
                                                                        Others are counting on your honesty. Spill it.
                                                                </Text>
                                                        </View>

                                                        {error ? (
                                                                <Text style={styles.errorText}>{error}</Text>
                                                        ) : null}

                                                        {/* Role */}
                                                        <View style={styles.field}>
                                                                <Text style={styles.label}>ROLE APPLIED FOR</Text>
                                                                <TextInput
                                                                        style={styles.input}
                                                                        placeholder="Software Engineer, Backend"
                                                                        placeholderTextColor={colors.text.stone}
                                                                        value={role}
                                                                        onChangeText={setRole}
                                                                />
                                                        </View>

                                                        {/* Overall rating */}
                                                        <View style={styles.field}>
                                                                <Text style={styles.label}>OVERALL RATING</Text>
                                                                <View style={styles.starsRow}>
                                                                        {[1, 2, 3, 4, 5].map(i => (
                                                                                <TouchableOpacity key={i} onPress={() => setRating(i)}>
                                                                                        <Text
                                                                                                style={[
                                                                                                        styles.starBtn,
                                                                                                        { opacity: i <= rating ? 1 : 0.2 },
                                                                                                ]}
                                                                                        >
                                                                                                ★
                                                                                        </Text>
                                                                                </TouchableOpacity>
                                                                        ))}
                                                                </View>
                                                        </View>

                                                        {/* Difficulty */}
                                                        <View style={styles.field}>
                                                                <Text style={styles.label}>INTERVIEW DIFFICULTY</Text>
                                                                <View style={styles.starsRow}>
                                                                        {[1, 2, 3, 4, 5].map(i => (
                                                                                <TouchableOpacity key={i} onPress={() => setDifficulty(i)}>
                                                                                        <Text
                                                                                                style={[
                                                                                                        styles.starBtn,
                                                                                                        { opacity: i <= difficulty ? 1 : 0.2 },
                                                                                                ]}
                                                                                        >
                                                                                                ★
                                                                                        </Text>
                                                                                </TouchableOpacity>
                                                                        ))}
                                                                </View>
                                                                <View style={styles.difficultyLabels}>
                                                                        <Text style={styles.difficultyLabel}>Easy</Text>
                                                                        <Text style={styles.difficultyLabel}>Very Hard</Text>
                                                                </View>
                                                        </View>

                                                        {/* Outcome */}
                                                        <View style={styles.field}>
                                                                <Text style={styles.label}>WHAT HAPPENED</Text>
                                                                <View style={styles.chipsRow}>
                                                                        {OUTCOMES.map(o => (
                                                                                <TouchableOpacity
                                                                                        key={o.value}
                                                                                        style={[
                                                                                                styles.chip,
                                                                                                outcome === o.value && styles.chipSelected,
                                                                                        ]}
                                                                                        onPress={() => setOutcome(o.value)}
                                                                                >
                                                                                        <Text
                                                                                                style={[
                                                                                                        styles.chipText,
                                                                                                        outcome === o.value && styles.chipTextSelected,
                                                                                                ]}
                                                                                        >
                                                                                                {o.label}
                                                                                        </Text>
                                                                                </TouchableOpacity>
                                                                        ))}
                                                                </View>
                                                        </View>

                                                        {/* Review text */}
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

                                                        {/* Anonymous toggle */}
                                                        <View style={styles.toggleRow}>
                                                                <View style={styles.toggleLabels}>
                                                                        <Text style={styles.toggleTitle}>Post anonymously</Text>
                                                                        <Text style={styles.toggleSub}>Your name stays out of it.</Text>
                                                                </View>
                                                                <Switch
                                                                        value={isAnonymous}
                                                                        onValueChange={setIsAnonymous}
                                                                        trackColor={{
                                                                                false: colors.surface.border,
                                                                                true: colors.brand.ember,
                                                                        }}
                                                                        thumbColor="#fff"
                                                                />
                                                        </View>

                                                        {/* Submit */}
                                                        <TouchableOpacity
                                                                style={[
                                                                        styles.submitBtn,
                                                                        submitting && styles.submitBtnDisabled,
                                                                ]}
                                                                onPress={handleSubmit}
                                                                disabled={submitting}
                                                        >
                                                                {submitting ? (
                                                                        <ActivityIndicator color="#fff" />
                                                                ) : (
                                                                        <Text style={styles.submitBtnText}>Spill it</Text>
                                                                )}
                                                        </TouchableOpacity>
                                                </View>
                                        )}
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
        },
        section: {
                paddingHorizontal: spacing.xl,
                paddingTop: spacing.xxl,
                paddingBottom: spacing.xl,
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
                backgroundColor: colors.card.violet,
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
});
import React, { useState } from 'react';
import {
        View,
        Text,
        StyleSheet,
        TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius } from '../theme';
import { LogoWhite } from '../theme/logos';

const slides = [
        {
                id: '1',
                background: colors.card.violet,
                headline: 'Interviews are a\ntwo-way street.',
                subtext: 'Companies judge you. Now you judge them back.',
        },
        {
                id: '2',
                background: colors.card.pink,
                headline: 'No filters.\nNo corporate spin.',
                subtext: 'Real reviews from real people who\'ve been in that chair.',
        },
        {
                id: '3',
                background: colors.card.ink,
                headline: 'Your voice.\nAnonymous if you want.',
                subtext: 'Spill what happened. Others are counting on you.',
        },
];

export default function OnboardingScreen({ navigation }) {
        const [activeIndex, setActiveIndex] = useState(0);

        const handleNext = () => {
                if (activeIndex < slides.length - 1) {
                        setActiveIndex(activeIndex + 1);
                } else {
                        navigation.navigate('Login');
                }
        };

        const handleSkip = () => {
                navigation.navigate('Login');
        };

        const slide = slides[activeIndex];
        const isLastSlide = activeIndex === slides.length - 1;

        return (
                <View style={[styles.container, { backgroundColor: slide.background }]}>
                        <View style={styles.decoCircle1} />
                        <View style={styles.decoCircle2} />

                        <SafeAreaView style={styles.inner} edges={['top', 'bottom']}>

                                <View style={styles.topRow}>
                                        <LogoWhite width={140} height={147} />
                                        {!isLastSlide && (
                                                <TouchableOpacity onPress={handleSkip}>
                                                        <Text style={styles.skipText}>Skip</Text>
                                                </TouchableOpacity>
                                        )}
                                </View>

                                <View style={styles.textBlock}>
                                        <Text style={styles.headline}>{slide.headline}</Text>
                                        <Text style={styles.subtext}>{slide.subtext}</Text>
                                </View>

                                <View style={styles.footer}>
                                        <View style={styles.dots}>
                                                {slides.map((_, i) => (
                                                        <View
                                                                key={i}
                                                                style={[
                                                                        styles.dot,
                                                                        i === activeIndex ? styles.dotActive : styles.dotInactive,
                                                                ]}
                                                        />
                                                ))}
                                        </View>
                                        <TouchableOpacity
                                                style={[
                                                        styles.btn,
                                                        {
                                                                backgroundColor: isLastSlide
                                                                        ? colors.brand.ember
                                                                        : 'rgba(255,255,255,0.2)',
                                                        },
                                                ]}
                                                onPress={handleNext}
                                        >
                                                <Text style={styles.btnText}>
                                                        {isLastSlide ? 'Get started' : 'Next'}
                                                </Text>
                                        </TouchableOpacity>
                                </View>

                        </SafeAreaView>
                </View>
        );
}

const styles = StyleSheet.create({
        container: {
                flex: 1,
                overflow: 'hidden',
        },
        decoCircle1: {
                position: 'absolute',
                width: 280,
                height: 280,
                borderRadius: 140,
                backgroundColor: 'rgba(255,255,255,0.08)',
                top: -60,
                right: -60,
        },
        decoCircle2: {
                position: 'absolute',
                width: 280,
                height: 280,
                borderRadius: 140,
                backgroundColor: 'rgba(255,255,255,0.07)',
                top: 360,
                left: -80,
        },
        inner: {
                flex: 1,
                paddingHorizontal: spacing.xl,
                justifyContent: 'space-between',
        },
        topRow: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: spacing.md,
        },
        skipText: {
                fontSize: typography.sizes.bodySmall,
                color: 'rgba(255,255,255,0.5)',
        },
        textBlock: {
                flex: 1,
                justifyContent: 'flex-start',
                paddingTop: spacing.huge * 1.5,
        },
        headline: {
                fontFamily: 'CabinetGrotesk-Bold',
                fontSize: typography.sizes.displayHero,
                color: '#fff',
                lineHeight: 36,
                marginBottom: spacing.lg,
        },
        subtext: {
                fontFamily: 'GeneralSans-Regular',
                fontSize: typography.sizes.bodyRegular,
                color: 'rgba(255,255,255,0.7)',
                lineHeight: typography.lineHeights.bodyRegular,
        },
        footer: {
                paddingBottom: spacing.huge * 1.5,
        },
        dots: {
                flexDirection: 'row',
                justifyContent: 'center',
                gap: spacing.sm,
                marginBottom: spacing.xl,
        },
        dot: {
                height: 4,
                borderRadius: radius.pill,
        },
        dotActive: {
                width: 24,
                backgroundColor: '#fff',
        },
        dotInactive: {
                width: 8,
                backgroundColor: 'rgba(255,255,255,0.3)',
        },
        btn: {
                height: 52,
                borderRadius: radius.lg,
                alignItems: 'center',
                justifyContent: 'center',
        },
        btnText: {
                fontSize: typography.sizes.h2,
                fontWeight: '600',
                color: '#fff',
        },
});
import React, { useEffect, useRef } from 'react';
import {
        View,
        Text,
        StyleSheet,
        TouchableOpacity,
        Animated,
        Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius } from '../theme';
import { FadeInView, ScaleInView } from '../components/FadeInView';
import { ArrowBendUpRightIcon } from 'phosphor-react-native';
import * as Clipboard from 'expo-clipboard';

export default function SuccessScreen({ navigation, route }) {
        const scaleAnim = useRef(new Animated.Value(0)).current;
        const companyName = route?.params?.companyName;

        useEffect(() => {
                Animated.spring(scaleAnim, {
                        toValue: 1,
                        delay: 300,
                        damping: 12,
                        stiffness: 100,
                        useNativeDriver: true,
                }).start();
        }, []);

        const handleCopyLink = async () => {
                await Clipboard.setStringAsync('https://dotell.app/reviews');
                alert('Link copied!');
        };

        const handleShare = async () => {
                try {
                        await Share.share({
                                message: `I just left an honest review on DoTell. Check out what people are saying about companies before you apply. 🔥 https://dotell.app`,
                        });
                } catch { }
        };

        return (
                <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
                        <View style={styles.inner}>

                                {/* Main success card */}
                                <ScaleInView delay={0} style={styles.heroCard}>
                                        <View style={styles.heroDeco} />
                                        <View style={styles.heroDeco2} />

                                        <Animated.View style={[styles.checkCircle, { transform: [{ scale: scaleAnim }] }]}>
                                                <Text style={styles.checkMark}>✓</Text>
                                        </Animated.View>

                                        <FadeInView delay={400}>
                                                <Text style={styles.heroTitle}>Spilled.</Text>
                                                <Text style={styles.heroSub}>
                                                        Thanks for keeping it real.{'\n'}
                                                        You just helped someone make a better career move.
                                                </Text>
                                        </FadeInView>
                                </ScaleInView>

                                {/* Share card */}
                                <FadeInView delay={500}>
                                        <View style={styles.shareCard}>
                                                <Text style={styles.shareTitle}>Share your review</Text>
                                                <Text style={styles.shareSub}>
                                                        Let others know where to find honest reviews.
                                                </Text>
                                                <View style={styles.shareButtons}>
                                                        <TouchableOpacity
                                                                style={styles.copyBtn}
                                                                onPress={handleCopyLink}
                                                        >
                                                                <Text style={styles.copyBtnText}>Copy link</Text>
                                                        </TouchableOpacity>
                                                        <TouchableOpacity
                                                                style={styles.shareBtn}
                                                                onPress={handleShare}
                                                        >
                                                                <Text style={styles.shareBtnText}>Share</Text>
                                                        </TouchableOpacity>
                                                </View>
                                        </View>
                                </FadeInView>

                                {/* Review another card */}
                                <FadeInView delay={600}>
                                        <TouchableOpacity
                                                style={styles.anotherCard}
                                                onPress={() => navigation.navigate('Tabs', { screen: 'Write' })}
                                                activeOpacity={0.85}
                                        >
                                                <View style={styles.anotherDeco} />
                                                <View style={styles.anotherContent}>
                                                        <Text style={styles.anotherTitle}>Review another company?</Text>
                                                        <Text style={styles.anotherSub}>
                                                                The more you share, the better DoTell gets.
                                                        </Text>
                                                </View>
                                                <ArrowBendUpRightIcon size={18} color={colors.surface.white} />
                                        </TouchableOpacity>
                                </FadeInView>

                                {/* Go home */}
                                <FadeInView delay={700}>
                                        <TouchableOpacity
                                                style={styles.homeBtn}
                                                onPress={() => navigation.navigate('Tabs', { screen: 'Home' })}
                                        >
                                                <Text style={styles.homeBtnText}>Back to home</Text>
                                        </TouchableOpacity>
                                </FadeInView>

                        </View>
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
                paddingHorizontal: spacing.xl,
                paddingTop: spacing.lg,
                paddingBottom: spacing.xl,
                gap: spacing.md,
        },
        heroCard: {
                backgroundColor: colors.card.lime,
                borderRadius: radius.xl,
                padding: spacing.xl,
                alignItems: 'center',
                overflow: 'hidden',
                position: 'relative',
                flex: 1,
                justifyContent: 'center',
        },
        heroDeco: {
                position: 'absolute',
                width: 200,
                height: 200,
                borderRadius: 100,
                backgroundColor: 'rgba(255,255,255,0.08)',
                top: -60,
                right: -60,
        },
        heroDeco2: {
                position: 'absolute',
                width: 140,
                height: 140,
                borderRadius: 70,
                backgroundColor: 'rgba(255,255,255,0.06)',
                bottom: -40,
                left: -40,
        },
        checkCircle: {
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: 'rgba(255,255,255,0.25)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: spacing.lg,
        },
        checkMark: {
                fontSize: 28,
                color: '#fff',
                fontWeight: '700',
        },
        heroTitle: {
                fontFamily: 'CabinetGrotesk-Bold',
                fontSize: 40,
                color: '#fff',
                textAlign: 'center',
                marginBottom: spacing.md,
        },
        heroSub: {
                fontFamily: 'GeneralSans-Regular',
                fontSize: typography.sizes.bodyRegular,
                color: 'rgba(255,255,255,0.8)',
                textAlign: 'center',
                lineHeight: 22,
        },
        shareCard: {
                backgroundColor: colors.surface.white,
                borderRadius: radius.xl,
                padding: spacing.lg,
                borderWidth: 0.5,
                borderColor: colors.surface.border,
        },
        shareTitle: {
                fontFamily: 'CabinetGrotesk-Bold',
                fontSize: typography.sizes.h2,
                color: colors.text.ink,
                marginBottom: 4,
        },
        shareSub: {
                fontFamily: 'GeneralSans-Regular',
                fontSize: typography.sizes.bodySmall,
                color: colors.text.stone,
                marginBottom: spacing.md,
        },
        shareButtons: {
                flexDirection: 'row',
                gap: spacing.sm,
        },
        copyBtn: {
                flex: 1,
                height: 40,
                backgroundColor: colors.surface.linen,
                borderRadius: radius.md,
                borderWidth: 0.5,
                borderColor: colors.surface.border,
                alignItems: 'center',
                justifyContent: 'center',
        },
        copyBtnText: {
                fontFamily: 'GeneralSans-Semibold',
                fontSize: typography.sizes.bodySmall,
                color: colors.text.ink,
        },
        shareBtn: {
                flex: 1,
                height: 40,
                backgroundColor: colors.brand.ember,
                borderRadius: radius.md,
                alignItems: 'center',
                justifyContent: 'center',
        },
        shareBtnText: {
                fontFamily: 'GeneralSans-Semibold',
                fontSize: typography.sizes.bodySmall,
                color: '#fff',
        },
        anotherCard: {
                backgroundColor: colors.card.sky,
                borderRadius: radius.xl,
                padding: spacing.lg,
                flexDirection: 'row',
                alignItems: 'center',
                overflow: 'hidden',
                position: 'relative',
        },
        anotherDeco: {
                position: 'absolute',
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: 'rgba(255,255,255,0.08)',
                right: -20,
                top: -20,
        },
        anotherContent: {
                flex: 1,
        },
        anotherTitle: {
                fontFamily: 'CabinetGrotesk-Bold',
                fontSize: typography.sizes.h2,
                color: '#fff',
                marginBottom: 2,
        },
        anotherSub: {
                fontFamily: 'GeneralSans-Regular',
                fontSize: typography.sizes.bodySmall,
                color: 'rgba(255,255,255,0.75)',
        },
        homeBtn: {
                alignItems: 'center',
                paddingVertical: spacing.md,
        },
        homeBtnText: {
                fontFamily: 'GeneralSans-Semibold',
                fontSize: typography.sizes.bodyRegular,
                color: colors.text.stone,
        },
});
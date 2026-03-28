import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, radius } from '../theme';

const CARD_COLORS = [
        colors.brand.ember,
        colors.card.lime,
        colors.card.violet,
        colors.card.pink,
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

function CardVariant({ review, index, onPress }) {
        const bgColor = CARD_COLORS[index % CARD_COLORS.length];

        return (
                <TouchableOpacity
                        style={[styles.card, { backgroundColor: bgColor }]}
                        onPress={onPress}
                        activeOpacity={0.9}
                >
                        <View style={styles.cardDeco} />
                        <View style={styles.cardTop}>
                                <View style={styles.cardAvatar}>
                                        <Text style={styles.cardAvatarText}>
                                                {review.company?.name?.[0] || '?'}
                                        </Text>
                                </View>
                                <View style={styles.cardMeta}>
                                        <Text style={styles.cardCompany}>{review.company?.name}</Text>
                                        <Text style={styles.cardRole}>{review.role}</Text>
                                </View>
                        </View>
                        <Text style={styles.cardText} numberOfLines={3}>
                                "{review.reviewText}"
                        </Text>
                        <View style={styles.cardBottom}>
                                <View style={styles.cardStars}>
                                        {[1, 2, 3, 4, 5].map(i => (
                                                <Text
                                                        key={i}
                                                        style={[styles.star, { opacity: i <= review.rating ? 1 : 0.3 }]}
                                                >
                                                        ★
                                                </Text>
                                        ))}
                                </View>
                                {review.outcome && (
                                        <View style={styles.outcomeTag}>
                                                <Text style={styles.outcomeText}>
                                                        {OUTCOME_LABELS[review.outcome] || review.outcome}
                                                </Text>
                                        </View>
                                )}
                        </View>
                </TouchableOpacity>
        );
}

function RowVariant({ review, index, onPress }) {
        const bgColor = CARD_COLORS[index % CARD_COLORS.length];

        const timeAgo = (dateStr) => {
                const diff = Date.now() - new Date(dateStr).getTime();
                const mins = Math.floor(diff / 60000);
                const hours = Math.floor(diff / 3600000);
                const days = Math.floor(diff / 86400000);
                if (mins < 60) return `${mins}m ago`;
                if (hours < 24) return `${hours}h ago`;
                return `${days}d ago`;
        };

        return (
                <TouchableOpacity
                        style={styles.row}
                        onPress={onPress}
                        activeOpacity={0.7}
                >
                        <View style={[styles.rowAvatar, { backgroundColor: bgColor }]}>
                                <Text style={styles.rowAvatarText}>
                                        {review.company?.name?.[0] || '?'}
                                </Text>
                        </View>
                        <View style={styles.rowMeta}>
                                <Text style={styles.rowCompany}>{review.company?.name}</Text>
                                <Text style={styles.rowRole}>{review.role}</Text>
                        </View>
                        <View style={styles.rowRight}>
                                <Text style={styles.rowTime}>{timeAgo(review.createdAt)}</Text>
                                {review.outcome && (
                                        <View style={[styles.rowOutcome, { backgroundColor: bgColor + '22' }]}>
                                                <Text style={[styles.rowOutcomeText, { color: bgColor }]}>
                                                        {OUTCOME_LABELS[review.outcome] || review.outcome}
                                                </Text>
                                        </View>
                                )}
                        </View>
                </TouchableOpacity>
        );
}

export default function ReviewCard({ review, index = 0, onPress, variant = 'card' }) {
        if (variant === 'row') {
                return <RowVariant review={review} index={index} onPress={onPress} />;
        }
        return <CardVariant review={review} index={index} onPress={onPress} />;
}

const styles = StyleSheet.create({
        card: {
                borderRadius: radius.xl,
                padding: spacing.lg,
                paddingBottom: spacing.xl,
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
                color: '#fff',
        },
        cardRole: {
                fontFamily: 'GeneralSans-Regular',
                fontSize: typography.sizes.bodySmall,
                color: 'rgba(255,255,255,0.7)',
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
        cardStars: {
                flexDirection: 'row',
                gap: 2,
        },
        star: {
                fontSize: 16,
                color: '#fff',
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

        row: {
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
                paddingVertical: spacing.md,
                borderBottomWidth: 0.5,
                borderBottomColor: colors.surface.border,
        },
        rowAvatar: {
                width: 40,
                height: 40,
                borderRadius: radius.md,
                alignItems: 'center',
                justifyContent: 'center',
        },
        rowAvatarText: {
                fontFamily: 'CabinetGrotesk-Bold',
                fontSize: typography.sizes.bodyRegular,
                color: '#fff',
        },
        rowMeta: {
                flex: 1,
        },
        rowCompany: {
                fontFamily: 'CabinetGrotesk-Bold',
                fontSize: typography.sizes.bodyRegular,
                color: colors.text.ink,
        },
        rowRole: {
                fontFamily: 'GeneralSans-Regular',
                fontSize: typography.sizes.bodySmall,
                color: colors.text.stone,
        },
        rowRight: {
                alignItems: 'flex-end',
                gap: 4,
        },
        rowTime: {
                fontFamily: 'GeneralSans-Regular',
                fontSize: typography.sizes.bodySmall,
                color: colors.text.stone,
        },
        rowOutcome: {
                paddingHorizontal: spacing.sm,
                paddingVertical: 2,
                borderRadius: radius.pill,
        },
        rowOutcomeText: {
                fontFamily: 'GeneralSans-Semibold',
                fontSize: typography.sizes.labelTag,
        },
});
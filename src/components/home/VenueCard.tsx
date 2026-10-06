import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { radius, spacing, layout } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Venue } from '../../types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - layout.screenPadding * 2;

interface VenueCardProps {
  venue: Venue;
  onPress: () => void;
  onFavorite?: () => void;
  isFavorite?: boolean;
}

export const VenueCard: React.FC<VenueCardProps> = ({
  venue,
  onPress,
  onFavorite,
  isFavorite = false,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={onPress}
      style={styles.card}
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: venue.photos?.[0] || 'https://via.placeholder.com/400x240' }}
          style={styles.image}
          resizeMode="cover"
        />
        
        {/* Top badges */}
        <View style={styles.topBadges}>
          {venue.next_free_session && (
            <View style={styles.freeBadge}>
              <View style={styles.greenDot} />
              <Text style={styles.freeBadgeText}>{venue.next_free_session}</Text>
            </View>
          )}
          <TouchableOpacity
            onPress={onFavorite}
            style={styles.favoriteBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorite ? colors.primary : colors.white}
            />
          </TouchableOpacity>
        </View>

        {/* Photo count */}
        <View style={styles.photoCount}>
          <Ionicons name="images-outline" size={12} color={colors.white} />
          <Text style={styles.photoCountText}>
            {venue.photos?.length || 0} surat
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>
            {venue.name}
          </Text>
          <View style={styles.rating}>
            <Ionicons name="star" size={13} color="#F59E0B" />
            <Text style={styles.ratingText}>{venue.rating.toFixed(1)}</Text>
          </View>
        </View>

        <Text style={styles.meta} numberOfLines={1}>
          {venue.address} · {venue.distance_km?.toFixed(1)} km ·{' '}
          {venue.capacity_min}–{venue.capacity_max} mehmon
        </Text>

        <Text style={styles.price}>
          {formatPrice(venue.price_from)} – {formatPrice(venue.price_to)} so‘m / kishi
        </Text>
      </View>
    </TouchableOpacity>
  );
};

function formatPrice(value?: number) {
  if (!value) return '—';
  return value.toLocaleString('uz-UZ');
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.white,
    borderRadius: radius.card,
    marginBottom: spacing[4],
    overflow: 'hidden',
    // Soft premium shadow
    shadowColor: colors.shadowStrong,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: colors.surfaceSecondary,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  topBadges: {
    position: 'absolute',
    top: spacing[3],
    left: spacing[3],
    right: spacing[3],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  freeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: spacing[2],
    paddingVertical: 5,
    borderRadius: radius.full,
    gap: 5,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  freeBadgeText: {
    ...typography.captionMedium,
    color: colors.text,
    fontSize: 12,
  },
  favoriteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoCount: {
    position: 'absolute',
    bottom: spacing[3],
    left: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: spacing[2],
    paddingVertical: 4,
    borderRadius: radius.full,
    gap: 4,
  },
  photoCountText: {
    ...typography.caption,
    color: colors.white,
    fontSize: 11,
  },
  content: {
    padding: spacing[4],
    gap: spacing[1],
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[2],
  },
  name: {
    ...typography.h4,
    color: colors.text,
    flex: 1,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    ...typography.captionMedium,
    color: colors.text,
  },
  meta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  price: {
    ...typography.bodySemiBold,
    color: colors.text,
    marginTop: spacing[1],
  },
});

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, spacing, radius, layout, typography } from '../../src/theme';
import { Button } from '../../src/components/ui/Button';
import { Chip } from '../../src/components/ui/Chip';
import {
  mockVenues,
  mockSessions,
  mockMenuPackages,
  mockVendors,
} from '../../src/data/mockVenues';

const { width } = Dimensions.get('window');

export default function VenueDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const venue = mockVenues.find((v) => v.slug === slug) || mockVenues[0];

  const [selectedSession, setSelectedSession] = useState('evening');
  const [selectedMenu, setSelectedMenu] = useState('prem');
  const [guests, setGuests] = useState(400);
  const [selectedVideo, setSelectedVideo] = useState<string | null>('v1');
  const [selectedCortege, setSelectedCortege] = useState<string | null>('c2');
  const [selectedDate] = useState('2026-10-09');

  const menu = mockMenuPackages.find((m) => m.id === selectedMenu)!;
  const session = mockSessions.find((s) => s.code === selectedSession)!;

  // Price calculation (simplified from TZ rules)
  const pricePerGuest = Math.round(menu.price * (selectedSession === 'evening' ? 1.15 : selectedSession === 'morning' ? 0.6 : 1));
  const venueTotal = pricePerGuest * guests;
  const videoPrice = selectedVideo ? mockVendors.video.find((v) => v.id === selectedVideo)?.price || 0 : 0;
  const cortegePrice = selectedCortege ? mockVendors.cortege.find((c) => c.id === selectedCortege)?.price || 0 : 0;
  const total = venueTotal + videoPrice + cortegePrice;
  const deposit = Math.round(total * 0.3);

  // Calendar mock (October 2026)
  const calendarDays = useMemo(() => {
    const days = [];
    for (let d = 1; d <= 31; d++) {
      const isSelected = d === 9;
      const isFree = d >= 6 && d !== 10 && d !== 15;
      days.push({ day: d, isSelected, isFree, isPast: d < 6 });
    }
    return days;
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Gallery */}
        <View style={styles.gallery}>
          <View style={styles.galleryPlaceholder}>
            <Ionicons name="business-outline" size={64} color={colors.primary} />
            <Text style={styles.galleryLabel}>Surat: Asosiy zal</Text>
          </View>
          <SafeAreaView style={styles.galleryTop} edges={['top']}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={22} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.galleryActions}>
              <TouchableOpacity style={styles.iconBtn}>
                <Ionicons name="share-outline" size={20} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn}>
                <Ionicons name="heart-outline" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
          <View style={styles.photoCounter}>
            <Text style={styles.photoCounterText}>1 / 12</Text>
          </View>
        </View>

        {/* Thumbnails */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbs}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View key={i} style={[styles.thumb, i === 0 && styles.thumbActive]} />
          ))}
        </ScrollView>

        {/* Info */}
        <View style={styles.section}>
          <View style={styles.titleRow}>
            <Text style={styles.name}>{venue.name}</Text>
            <View style={styles.rating}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.ratingText}>{venue.rating} ({venue.reviews_count})</Text>
            </View>
          </View>
          <Text style={styles.address}>
            {venue.address} · sizdan {venue.distance_km} km
          </Text>

          <View style={styles.infoChips}>
            <View style={styles.infoChip}>
              <Text style={styles.infoChipValue}>{venue.capacity_min}–{venue.capacity_max}</Text>
              <Text style={styles.infoChipLabel}>mehmon</Text>
            </View>
            <View style={styles.infoChip}>
              <Text style={styles.infoChipValue}>{venue.halls_count} zal</Text>
              <Text style={styles.infoChipLabel}>katta va kichik</Text>
            </View>
            <View style={styles.infoChip}>
              <Text style={styles.infoChipValue}>{venue.parking_spots}</Text>
              <Text style={styles.infoChipLabel}>parking</Text>
            </View>
          </View>
        </View>

        {/* Calendar */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bo'sh kunlar</Text>
            <View style={styles.monthNav}>
              <Text style={styles.monthText}>Oktabr 2026</Text>
              <TouchableOpacity><Ionicons name="chevron-back" size={20} color={colors.text} /></TouchableOpacity>
              <TouchableOpacity><Ionicons name="chevron-forward" size={20} color={colors.text} /></TouchableOpacity>
            </View>
          </View>

          <View style={styles.weekDays}>
            {['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'].map((d) => (
              <Text key={d} style={styles.weekDay}>{d}</Text>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {calendarDays.map(({ day, isSelected, isFree, isPast }) => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayCell,
                  isSelected && styles.daySelected,
                  isFree && !isSelected && styles.dayFree,
                  isPast && styles.dayPast,
                ]}
                disabled={isPast}
              >
                <Text style={[
                  styles.dayNum,
                  isSelected && styles.dayNumSelected,
                  isPast && styles.dayNumPast,
                ]}>
                  {day}
                </Text>
                {!isPast && (
                  <View style={styles.dots}>
                    <View style={[styles.dot, { backgroundColor: isFree ? colors.success : colors.booked }]} />
                    <View style={[styles.dot, { backgroundColor: isFree ? colors.success : colors.booked }]} />
                    <View style={[styles.dot, { backgroundColor: day === 9 ? colors.success : colors.booked }]} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, { backgroundColor: colors.freeBg }]} />
              <Text style={styles.legendText}>Hammasi bo'sh</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border }]} />
              <Text style={styles.legendText}>Qisman band</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, { backgroundColor: colors.bookedBg }]} />
              <Text style={styles.legendText}>To'liq band</Text>
            </View>
          </View>
        </View>

        {/* Sessions */}
        <View style={styles.section}>
          <Text style={styles.dateLabel}>9-oktabr, juma</Text>
          {mockSessions.map((s) => (
            <TouchableOpacity
              key={s.code}
              style={[
                styles.sessionCard,
                selectedSession === s.code && styles.sessionSelected,
                s.status === 'booked' && styles.sessionBooked,
              ]}
              onPress={() => s.status === 'free' && setSelectedSession(s.code)}
              disabled={s.status === 'booked'}
            >
              <View style={styles.sessionLeft}>
                <View style={[
                  styles.radio,
                  selectedSession === s.code && styles.radioSelected,
                ]} />
                <View>
                  <Text style={styles.sessionTitle}>
                    {s.label} · {s.time}
                  </Text>
                  <Text style={styles.sessionSub}>
                    {s.code === 'evening' ? "Kechki to'y · Nikoh to'yi" : s.label}
                  </Text>
                </View>
              </View>
              <View style={styles.sessionRight}>
                <Text style={styles.sessionPrice}>
                  {(s.price / 1000).toFixed(0)} ming
                </Text>
                <Text style={[
                  styles.sessionStatus,
                  s.status === 'free' ? styles.statusFree : styles.statusBooked,
                ]}>
                  {s.status === 'free' ? 'Tanlandi' : 'Band'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Menyu va narx</Text>
          <View style={styles.menuTabs}>
            {mockMenuPackages.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={[styles.menuTab, selectedMenu === m.id && styles.menuTabActive]}
                onPress={() => setSelectedMenu(m.id)}
              >
                <Text style={[styles.menuTabName, selectedMenu === m.id && styles.menuTabNameActive]}>
                  {m.name}
                </Text>
                <Text style={[styles.menuTabPrice, selectedMenu === m.id && styles.menuTabNameActive]}>
                  {(m.price / 1000).toFixed(0)} ming
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.menuItems}>{menu.items}</Text>

          <View style={styles.guestsRow}>
            <Text style={styles.guestsLabel}>Mehmonlar</Text>
            <Text style={styles.guestsRange}>150 – 900 kishi</Text>
            <View style={styles.guestsControl}>
              <TouchableOpacity
                style={styles.guestBtn}
                onPress={() => setGuests(Math.max(150, guests - 50))}
              >
                <Ionicons name="remove" size={18} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.guestsValue}>{guests}</Text>
              <TouchableOpacity
                style={[styles.guestBtn, styles.guestBtnPrimary]}
                onPress={() => setGuests(Math.min(900, guests + 50))}
              >
                <Ionicons name="add" size={18} color={colors.white} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.pricePerGuest}>
            <Text style={styles.pricePerGuestLabel}>1 kishi uchun · kechki seans</Text>
            <Text style={styles.pricePerGuestValue}>
              {pricePerGuest.toLocaleString()} so'm
            </Text>
          </View>
        </View>

        {/* Amenities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Qulayliklar</Text>
          <View style={styles.amenities}>
            {venue.amenities.map((a) => (
              <View key={a} style={styles.amenityChip}>
                <Ionicons name="checkmark" size={14} color={colors.success} />
                <Text style={styles.amenityText}>{a}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Videographers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Videochilar</Text>
            <Text style={styles.optional}>ixtiyoriy · 1 tasini tanlang</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {mockVendors.video.map((v) => (
              <TouchableOpacity
                key={v.id}
                style={[styles.vendorCard, selectedVideo === v.id && styles.vendorSelected]}
                onPress={() => setSelectedVideo(selectedVideo === v.id ? null : v.id)}
              >
                <View style={styles.vendorIcon}>
                  <Ionicons name="videocam-outline" size={28} color={colors.primary} />
                </View>
                <Text style={styles.vendorName}>{v.name}</Text>
                <Text style={styles.vendorDesc}>{v.description}</Text>
                <View style={styles.vendorFooter}>
                  <Text style={styles.vendorPrice}>
                    {(v.price / 1000000).toFixed(1)} mln so'm
                  </Text>
                  {selectedVideo === v.id && (
                    <View style={styles.selectedBadge}>
                      <Ionicons name="checkmark" size={12} color={colors.white} />
                      <Text style={styles.selectedBadgeText}>Tanlandi</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Cortege */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Kortej</Text>
            <Text style={styles.optional}>ixtiyoriy · 1 tasini tanlang</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {mockVendors.cortege.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[styles.vendorCard, selectedCortege === c.id && styles.vendorSelected]}
                onPress={() => setSelectedCortege(selectedCortege === c.id ? null : c.id)}
              >
                <View style={styles.vendorIcon}>
                  <Ionicons name="car-outline" size={28} color={colors.primary} />
                </View>
                <Text style={styles.vendorName}>{c.name}</Text>
                <Text style={styles.vendorDesc}>{c.description}</Text>
                <View style={styles.vendorFooter}>
                  <Text style={styles.vendorPrice}>
                    {(c.price / 1000000).toFixed(1)} mln so'm
                  </Text>
                  {selectedCortege === c.id ? (
                    <View style={styles.selectedBadge}>
                      <Ionicons name="checkmark" size={12} color={colors.white} />
                      <Text style={styles.selectedBadgeText}>Tanlandi</Text>
                    </View>
                  ) : (
                    <Text style={styles.tanlash}>Tanlash</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hisob</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>To'yxona · {menu.name}</Text>
              <Text style={styles.summaryValue}>{venueTotal.toLocaleString()} so'm</Text>
            </View>
            <Text style={styles.summarySub}>{guests} × {pricePerGuest.toLocaleString()} so'm</Text>

            {videoPrice > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Videochi</Text>
                <Text style={styles.summaryValue}>{videoPrice.toLocaleString()} so'm</Text>
              </View>
            )}
            {cortegePrice > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Kortej</Text>
                <Text style={styles.summaryValue}>{cortegePrice.toLocaleString()} so'm</Text>
              </View>
            )}

            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Jami</Text>
              <Text style={styles.totalValue}>{total.toLocaleString()} so'm</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.depositLabel}>Bron uchun avans 30%</Text>
              <Text style={styles.depositValue}>{deposit.toLocaleString()} so'm</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky bar */}
      <View style={styles.stickyBar}>
        <View>
          <Text style={styles.stickyDate}>9-oktabr · Kechki 18:00–23:00</Text>
          <Text style={styles.stickyTotal}>{total.toLocaleString()} so'm</Text>
        </View>
        <Button title="Bron qilish" onPress={() => {}} size="md" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  gallery: { height: 280, backgroundColor: colors.primarySoft },
  galleryPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  galleryLabel: { ...typography.caption, color: colors.primary, marginTop: 8 },
  galleryTop: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center', justifyContent: 'center',
  },
  galleryActions: { flexDirection: 'row', gap: 8 },
  photoCounter: {
    position: 'absolute', bottom: 12, right: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  photoCounterText: { ...typography.caption, color: colors.white },
  thumbs: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.white },
  thumb: {
    width: 56, height: 40, borderRadius: 8,
    backgroundColor: colors.surfaceSecondary, marginRight: 8,
  },
  thumbActive: { borderWidth: 2, borderColor: colors.primary },
  section: {
    backgroundColor: colors.white, padding: 16, marginBottom: 8,
  },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { ...typography.h2, color: colors.text },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { ...typography.captionMedium },
  address: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
  infoChips: { flexDirection: 'row', gap: 10, marginTop: 16 },
  infoChip: {
    flex: 1, backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md, padding: 12, alignItems: 'center',
  },
  infoChipValue: { ...typography.bodySemiBold, color: colors.text },
  infoChipLabel: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { ...typography.h4, color: colors.text },
  monthNav: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  monthText: { ...typography.captionMedium },
  weekDays: { flexDirection: 'row', marginBottom: 8 },
  weekDay: { flex: 1, textAlign: 'center', ...typography.caption, color: colors.textTertiary },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    width: `${100 / 7}%`, aspectRatio: 1,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 10, marginBottom: 4,
  },
  daySelected: { backgroundColor: colors.text },
  dayFree: { backgroundColor: colors.freeBg },
  dayPast: { opacity: 0.4 },
  dayNum: { ...typography.captionMedium, color: colors.text },
  dayNumSelected: { color: colors.white },
  dayNumPast: { color: colors.textTertiary },
  dots: { flexDirection: 'row', gap: 2, marginTop: 2 },
  dot: { width: 4, height: 4, borderRadius: 2 },
  legend: { flexDirection: 'row', gap: 16, marginTop: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendBox: { width: 14, height: 14, borderRadius: 4 },
  legendText: { ...typography.caption, color: colors.textSecondary },
  dateLabel: { ...typography.bodySemiBold, marginBottom: 12 },
  sessionCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 14, borderRadius: radius.lg, borderWidth: 1.5,
    borderColor: colors.border, marginBottom: 10,
  },
  sessionSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  sessionBooked: { opacity: 0.55 },
  sessionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: colors.border,
  },
  radioSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
  sessionTitle: { ...typography.bodySemiBold },
  sessionSub: { ...typography.caption, color: colors.textSecondary },
  sessionRight: { alignItems: 'flex-end' },
  sessionPrice: { ...typography.bodySemiBold },
  sessionStatus: { ...typography.caption, marginTop: 2 },
  statusFree: { color: colors.success },
  statusBooked: { color: colors.textTertiary },
  menuTabs: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  menuTab: {
    flex: 1, padding: 12, borderRadius: radius.md,
    backgroundColor: colors.surfaceSecondary, alignItems: 'center',
  },
  menuTabActive: { backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.primary },
  menuTabName: { ...typography.captionMedium, color: colors.textSecondary },
  menuTabNameActive: { color: colors.primary },
  menuTabPrice: { ...typography.bodySemiBold, marginTop: 2 },
  menuItems: { ...typography.caption, color: colors.textSecondary, marginBottom: 16 },
  guestsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  guestsLabel: { ...typography.bodySemiBold },
  guestsRange: { ...typography.caption, color: colors.textSecondary, flex: 1 },
  guestsControl: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  guestBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center', justifyContent: 'center',
  },
  guestBtnPrimary: { backgroundColor: colors.text },
  guestsValue: { ...typography.h4, minWidth: 40, textAlign: 'center' },
  pricePerGuest: {
    flexDirection: 'row', justifyContent: 'space-between',
    backgroundColor: colors.primarySoft, padding: 12, borderRadius: radius.md,
  },
  pricePerGuestLabel: { ...typography.caption, color: colors.primary },
  pricePerGuestValue: { ...typography.bodySemiBold, color: colors.primary },
  amenities: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenityChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.surfaceSecondary, paddingHorizontal: 12,
    paddingVertical: 8, borderRadius: radius.full,
  },
  amenityText: { ...typography.caption },
  optional: { ...typography.caption, color: colors.textTertiary },
  vendorCard: {
    width: 160, backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg, padding: 14, marginRight: 12,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  vendorSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  vendorIcon: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
  },
  vendorName: { ...typography.bodySemiBold },
  vendorDesc: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  vendorFooter: { marginTop: 10, gap: 6 },
  vendorPrice: { ...typography.bodySemiBold },
  selectedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.primary, alignSelf: 'flex-start',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full,
  },
  selectedBadgeText: { ...typography.caption, color: colors.white, fontSize: 11 },
  tanlash: { ...typography.caption, color: colors.primary },
  summaryCard: {
    backgroundColor: colors.surfaceSecondary, borderRadius: radius.lg, padding: 16,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  summaryLabel: { ...typography.body },
  summaryValue: { ...typography.bodySemiBold },
  summarySub: { ...typography.caption, color: colors.textSecondary, marginBottom: 10 },
  totalRow: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10, marginTop: 4 },
  totalLabel: { ...typography.h4 },
  totalValue: { ...typography.price },
  depositLabel: { ...typography.caption, color: colors.textSecondary },
  depositValue: { ...typography.bodySemiBold, color: colors.primary },
  stickyBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 28,
  },
  stickyDate: { ...typography.caption, color: colors.textSecondary },
  stickyTotal: { ...typography.h4, color: colors.text },
});

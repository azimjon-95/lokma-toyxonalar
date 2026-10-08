import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Linking, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, fontFamily, radius, typography } from '../src/theme';
import { useLokma } from '../src/lib/lokma';
import { formatDayLong, SESSION_LABEL, toISODate, startOfToday } from '../src/lib/dates';
import { formatNumber } from '../src/lib/format';
import { EmptyState, ErrorState } from '../src/components/ui/ScreenState';

/*
 * BRONLARIM — Lokma foydalanuvchisining to'yxona bronlari.
 * Bronlar telefon raqami bo'yicha topiladi (Lokma profilidagi raqam): so'rov
 * ota ilova → Lokma serveri → to'yxona serveri yo'li bilan ketadi (src/lib/lokma.tsx rpc).
 */
interface MyBooking {
  id: string; number: string; status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  venue_name: string; hall_name: string; date: string; session: keyof typeof SESSION_LABEL;
  guests: number; menu_name?: string; total: number; deposit: number; payment_url?: string | null; cancel_reason?: string;
}
const STATUS: Record<MyBooking['status'], { label: string; bg: string; fg: string }> = {
  pending: { label: 'Kutilmoqda', bg: '#FFF4D6', fg: '#8A5A00' },
  confirmed: { label: 'Tasdiqlangan', bg: colors.successBg, fg: colors.success },
  completed: { label: "O'tgan", bg: colors.surfaceSecondary, fg: colors.textSecondary },
  cancelled: { label: 'Bekor qilingan', bg: colors.errorBg, fg: colors.error },
};
const SOFT = { shadowColor: '#2A0F1C', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 2 } as const;

export default function MyBookingsScreen() {
  const router = useRouter();
  const lokma = useLokma();
  const [items, setItems] = useState<MyBooking[] | null>(null);
  const [needsPhone, setNeedsPhone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setItems(null);
    setError(null);
    try {
      const r = await lokma.rpc<{ bookings: MyBooking[]; needsPhone: boolean }>('myBookings');
      setItems(r.bookings || []); setNeedsPhone(Boolean(r.needsPhone));
    } catch (e) { setError((e as Error).message); setItems([]); }
  }, [lokma]);
  useEffect(() => { load(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cancel = async (b: MyBooking) => {
    const ok = typeof window !== 'undefined' ? window.confirm(`${b.venue_name} · ${b.date}\nBronni bekor qilasizmi?`) : true;
    if (!ok) return;
    setBusyId(b.id);
    try { await lokma.rpc('cancelBooking', { id: b.id }); await load(true); }
    catch (e) { setError((e as Error).message); }
    finally { setBusyId(null); }
  };

  const today = toISODate(startOfToday());

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back} accessibilityRole="button" accessibilityLabel="Orqaga">
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Bronlarim</Text>
      </View>

      {!lokma.embedded ? (
        <EmptyState title="Lokma Go orqali oching" subtitle="Bronlar Lokma profilingizdagi telefon raqami bo'yicha ko'rsatiladi" />
      ) : items === null ? (
        <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>
      ) : error && items.length === 0 ? (
        <ErrorState message={error} onRetry={() => load()} />
      ) : needsPhone ? (
        <EmptyState title="Telefon raqami kerak" subtitle="Bronlarni ko'rish uchun profilda telefon raqamingizni kiriting"
          action={<Pressable onPress={() => router.push('/profile')} style={styles.btn}><Text style={styles.btnText}>Profilga o'tish</Text></Pressable>} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(b) => b.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} tintColor={colors.primary} onRefresh={async () => { setRefreshing(true); await load(true); setRefreshing(false); }} />}
          ListHeaderComponent={error ? <Text style={styles.err}>{error}</Text> : null}
          ListEmptyComponent={<EmptyState title="Hali bron yo'q" subtitle="To'yxona tanlang va birinchi bronni qiling" />}
          renderItem={({ item: b }) => {
            const st = STATUS[b.status];
            const upcoming = b.date >= today && (b.status === 'pending' || b.status === 'confirmed');
            return (
              <View style={[styles.card, SOFT]}>
                <View style={styles.cardHead}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.venue} numberOfLines={1}>{b.venue_name}</Text>
                    <Text style={styles.sub} numberOfLines={1}>{b.hall_name} · #{b.number}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: st.bg }]}><Text style={[styles.badgeText, { color: st.fg }]}>{st.label}</Text></View>
                </View>
                <View style={styles.facts}>
                  <Fact icon="calendar-outline" text={`${formatDayLong(b.date)}`} />
                  <Fact icon="time-outline" text={SESSION_LABEL[b.session] ?? b.session} />
                  <Fact icon="people-outline" text={`${b.guests} mehmon`} />
                </View>
                {!!b.menu_name && <Text style={styles.menu} numberOfLines={1}>Menyu: {b.menu_name}</Text>}
                <View style={styles.money}>
                  <View><Text style={styles.moneyLabel}>Jami</Text><Text style={styles.moneyValue}>{formatNumber(b.total)} so'm</Text></View>
                  <View style={{ alignItems: 'flex-end' }}><Text style={styles.moneyLabel}>Avans</Text><Text style={styles.moneyValue}>{formatNumber(b.deposit)} so'm</Text></View>
                </View>
                {b.status === 'cancelled' && !!b.cancel_reason && b.cancel_reason !== 'customer' && <Text style={styles.reason}>Sabab: {b.cancel_reason}</Text>}
                {upcoming && (
                  <View style={styles.actions}>
                    {b.status === 'pending' && !!b.payment_url && (
                      <Pressable onPress={() => Linking.openURL(b.payment_url as string)} style={[styles.btn, { flex: 1 }]} accessibilityRole="button">
                        <Text style={styles.btnText}>Avansni to'lash</Text>
                      </Pressable>
                    )}
                    <Pressable onPress={() => cancel(b)} disabled={busyId === b.id} style={[styles.outBtn, { flex: 1 }, busyId === b.id && { opacity: 0.5 }]} accessibilityRole="button">
                      {busyId === b.id ? <ActivityIndicator size="small" color={colors.error} /> : <Text style={styles.outText}>Bronni bekor qilish</Text>}
                    </Pressable>
                  </View>
                )}
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

function Fact({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.fact}>
      <Ionicons name={icon} size={15} color={colors.textTertiary} />
      <Text style={styles.factText} numberOfLines={1}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 },
  back: { width: 40, height: 40, borderRadius: 14, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.borderLight },
  title: { fontFamily: fontFamily.extraBold, fontSize: 22, color: colors.text },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: 16, paddingBottom: 32, paddingTop: 4 },
  err: { ...typography.caption, color: colors.error, marginBottom: 10 },
  card: { backgroundColor: colors.white, borderRadius: 22, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: colors.borderLight, gap: 10 },
  cardHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  venue: { fontFamily: fontFamily.extraBold, fontSize: 18, color: colors.text },
  sub: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  badge: { borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontFamily: fontFamily.bold, fontSize: 11.5 },
  facts: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  fact: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  factText: { ...typography.caption, fontSize: 13, color: colors.textSecondary },
  menu: { ...typography.caption, color: colors.textSecondary },
  money: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.primarySoft, borderRadius: 14, padding: 12 },
  moneyLabel: { ...typography.caption, fontSize: 11.5, color: colors.textSecondary },
  moneyValue: { fontFamily: fontFamily.extraBold, fontSize: 16, color: colors.primary, marginTop: 1 },
  reason: { ...typography.caption, color: colors.error },
  actions: { flexDirection: 'row', gap: 10 },
  btn: { minHeight: 44, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  btnText: { fontFamily: fontFamily.bold, fontSize: 14.5, color: colors.white },
  outBtn: { minHeight: 44, borderRadius: 14, borderWidth: 1, borderColor: colors.errorBg, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  outText: { fontFamily: fontFamily.semiBold, fontSize: 14, color: colors.error },
});

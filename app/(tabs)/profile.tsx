import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, fontFamily, radius, typography } from '../../src/theme';
import { useLokma } from '../../src/lib/lokma';
import { getLang, setLang as setUiLang, NO_TR, type Lang } from '../../src/lib/i18n';
import { useFavorites } from '../../src/store/favorites';
import { formatPhone, isValidPhone } from '../../src/lib/format';

/*
 * ═══ PROFIL — Lokma Go profil sahifasining aynan nusxasi ═══
 * Ma'lumot va amallar Lokma Go'dan keladi (ota ilova): ism, telefon,
 * manzillar, til, taklif (referral) — to'yxona saytida alohida foydalanuvchi
 * saqlanmaydi. O'zgartirish ota ilovaga so'rov (rpc) sifatida ketadi va yangi
 * ma'lumot avtomatik qaytadi (src/lib/lokma.tsx).
 * Bu yerda faqat "Bronlarim" boshqacha: to'yxona bronlari.
 */
const LANGS: { code: Lang; label: string }[] = [
  { code: 'uz', label: `O'zbekcha${NO_TR}` }, // til nomlari tarjima qilinmaydi
  { code: 'uzc', label: 'Ўзбекча' },
  { code: 'ru', label: 'Русский' },
];
const ADDR_TYPES = ['Uy', 'Ish', 'Boshqa'];
const SOFT = { shadowColor: '#2A0F1C', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 2 } as const;

interface ReferralInfo { enabled?: boolean; referralLink?: string; referralCount?: number; referralPoints?: number; reward?: number }
const som = (n?: number) => Math.round(n ?? 0).toLocaleString('ru-RU').replace(/,/g, ' ');

export default function ProfileScreen() {
  const router = useRouter();
  const lokma = useLokma();
  const { ids: favIds } = useFavorites();
  const user = lokma.user;
  const [editing, setEditing] = useState<null | 'name' | 'phone'>(null);
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [phone, setPhone] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [addrTitle, setAddrTitle] = useState('Uy');
  const [addrText, setAddrText] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Lokma ichida emas — profil mavjud emas
  if (!lokma.embedded) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.center}>
          <Ionicons name="person-circle-outline" size={64} color={colors.textTertiary} />
          <Text style={styles.centerText}>Profil Lokma Go orqali ochiladi</Text>
          <Pressable onPress={() => lokma.goToLokma('/')} style={styles.primaryBtn}><Text style={styles.primaryText}>Lokma Go</Text></Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const run = async (key: string, fn: () => Promise<unknown>) => {
    setBusy(key); setErr(null);
    try { await fn(); return true; } catch (e) { setErr((e as Error).message); return false; } finally { setBusy(null); }
  };

  const saveName = async () => {
    if (!first.trim()) { setErr('Ismni kiriting'); return; }
    if (await run('name', () => lokma.rpc('updateUser', { firstName: first.trim(), lastName: last.trim() }))) setEditing(null);
  };
  const savePhone = async () => {
    if (!isValidPhone(phone)) { setErr("Telefon raqamni to'liq kiriting"); return; }
    const digits = phone.replace(/\D/g, '').replace(/^998/, '');
    if (await run('phone', () => lokma.rpc('updateUser', { phone: `+998${digits}` }))) setEditing(null);
  };
  const addAddress = async () => {
    if (addrText.trim().length < 5) return;
    if (await run('add', () => lokma.rpc('addAddress', { title: addrTitle, address: addrText.trim() }))) {
      setAddOpen(false); setAddrTitle('Uy'); setAddrText('');
    }
  };
  const pickLang = (code: Lang) => {
    if (code === getLang()) return;
    setUiLang(code); // darhol; Lokma Go ham yangilanadi
    lokma.rpc('setLang', { lang: code }).catch(() => {});
  };

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Mehmon';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.pageTitle}>Profil</Text>

        {/* Hero */}
        <View style={[styles.hero, SOFT]}>
          <View style={styles.avatarRing}>
            {user?.photoUrl ? (
              <Image source={user.photoUrl} style={styles.avatar} contentFit="cover" />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}><Text style={styles.avatarText}>{user?.photoInitials || fullName.slice(0, 2).toUpperCase()}</Text></View>
            )}
          </View>
          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.handle}>{user?.username ? `@${user.username}` : `ID: ${user?.telegramId ?? '—'}`}</Text>
          <View style={styles.stats}>
            <View style={styles.stat}><Text style={styles.statValue}>{lokma.addresses.length}</Text><Text style={styles.statLabel}>Manzil</Text></View>
            <View style={styles.sep} />
            <View style={styles.stat}><Text style={styles.statValue}>{favIds.length}</Text><Text style={styles.statLabel}>Saralangan</Text></View>
          </View>
        </View>

        <ReferralCard />

        {/* Til */}
        <Text style={styles.sectionLabel}>Til</Text>
        <View style={styles.langRow}>
          {LANGS.map((l) => {
            const on = (lokma.lang ?? getLang()) === l.code;
            return (
              <Pressable key={l.code} onPress={() => pickLang(l.code)} style={[styles.langBtn, on && styles.langOn]} accessibilityRole="button" accessibilityState={{ selected: on }}>
                <Text style={[styles.langText, on && { color: colors.white }]}>{l.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Tez havolalar */}
        <View style={[styles.group, SOFT]}>
          <Row icon="heart-outline" title="Saralangan" sub="Saqlangan to'yxonalar" onPress={() => router.push('/favorites')} />
          <View style={styles.divider} />
          <Row icon="calendar-outline" title="Bronlarim" sub="To'yxona bronlari tarixi" onPress={() => router.push('/my-bookings')} />
        </View>

        {!!err && <Text style={styles.err}>{err}</Text>}

        {/* Sozlamalar */}
        <Text style={styles.sectionLabel}>Sozlamalar</Text>
        <View style={[styles.group, SOFT]}>
          {editing === 'name' ? (
            <View style={styles.form}>
              <TextInput style={styles.input} value={first} onChangeText={setFirst} placeholder="Ism" placeholderTextColor={colors.textTertiary} />
              <TextInput style={styles.input} value={last} onChangeText={setLast} placeholder="Familiya" placeholderTextColor={colors.textTertiary} />
              <FormButtons onCancel={() => setEditing(null)} onSave={saveName} busy={busy === 'name'} />
            </View>
          ) : (
            <Row icon="create-outline" title={fullName} sub="Profil" onPress={() => { setFirst(user?.firstName || ''); setLast(user?.lastName || ''); setErr(null); setEditing('name'); }} />
          )}
          <View style={styles.divider} />
          {editing === 'phone' ? (
            <View style={styles.form}>
              <TextInput style={styles.input} value={phone} onChangeText={(v) => setPhone(formatPhone(v))} keyboardType="phone-pad" placeholder="+998 90 123 45 67" placeholderTextColor={colors.textTertiary} />
              <FormButtons onCancel={() => setEditing(null)} onSave={savePhone} busy={busy === 'phone'} />
            </View>
          ) : (
            <Row icon="call-outline" title={user?.phone || 'Telefon kiriting'} sub="Telefon" required={!user?.phone}
              onPress={() => { setPhone(user?.phone ? formatPhone(user.phone) : '+998'); setErr(null); setEditing('phone'); }} />
          )}
        </View>

        {/* Manzillar */}
        <Text style={styles.sectionLabel}>Mening manzillarim</Text>
        {lokma.addresses.map((a) => {
          const isDefault = a.id === lokma.defaultAddressId;
          return (
            <View key={a.id} style={[styles.addr, SOFT]}>
              <Ionicons name="location-outline" size={22} color={colors.primary} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={[styles.addrTitle, isDefault && { color: colors.primary }]} numberOfLines={1}>{a.title || 'Manzil'}{isDefault ? ' ✓' : ''}</Text>
                <Text style={styles.addrText} numberOfLines={2}>{a.address || a.city}</Text>
              </View>
              {!isDefault && (
                <Pressable onPress={() => run(`def${a.id}`, () => lokma.rpc('setDefaultAddress', { id: a.id }))} hitSlop={8} accessibilityRole="button">
                  <Text style={styles.addrSet}>Asosiy qilish</Text>
                </Pressable>
              )}
              <Pressable onPress={() => run(`del${a.id}`, () => lokma.rpc('removeAddress', { id: a.id }))} hitSlop={8} accessibilityRole="button" accessibilityLabel="O'chirish">
                {busy === `del${a.id}` ? <ActivityIndicator size="small" color={colors.error} /> : <Ionicons name="trash-outline" size={19} color={colors.error} />}
              </Pressable>
            </View>
          );
        })}
        {addOpen ? (
          <View style={[styles.group, SOFT, styles.form]}>
            <View style={styles.typeRow}>
              {ADDR_TYPES.map((tp) => (
                <Pressable key={tp} onPress={() => setAddrTitle(tp)} style={[styles.typeChip, addrTitle === tp && styles.typeOn]}>
                  <Text style={[styles.typeText, addrTitle === tp && { color: colors.white }]}>{tp}</Text>
                </Pressable>
              ))}
            </View>
            <TextInput style={[styles.input, { minHeight: 64 }]} value={addrText} onChangeText={setAddrText} multiline placeholder="To'liq manzil" placeholderTextColor={colors.textTertiary} />
            <FormButtons onCancel={() => setAddOpen(false)} onSave={addAddress} busy={busy === 'add'} disabled={addrText.trim().length < 5} saveLabel="Qo'shish" />
          </View>
        ) : (
          <Pressable onPress={() => { setErr(null); setAddOpen(true); }} style={styles.addBtn} accessibilityRole="button">
            <Ionicons name="add" size={20} color={colors.textSecondary} />
            <Text style={styles.addBtnText}>Qo'shish</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ icon, title, sub, onPress, required }: { icon: keyof typeof Ionicons.glyphMap; title: string; sub?: string; onPress: () => void; required?: boolean }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.surfaceSecondary }]} accessibilityRole="button">
      <Ionicons name={icon} size={22} color={required ? colors.error : colors.primary} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[styles.rowTitle, required && { color: colors.error }]} numberOfLines={1}>{title}</Text>
        {!!sub && <Text style={styles.rowSub} numberOfLines={1}>{sub}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
    </Pressable>
  );
}

function FormButtons({ onCancel, onSave, busy, disabled, saveLabel = 'Saqlash' }: { onCancel: () => void; onSave: () => void; busy?: boolean; disabled?: boolean; saveLabel?: string }) {
  return (
    <View style={styles.btnRow}>
      <Pressable onPress={onCancel} style={[styles.secondaryBtn, { flex: 1 }]} accessibilityRole="button"><Text style={styles.secondaryText}>Bekor</Text></Pressable>
      <Pressable onPress={onSave} disabled={busy || disabled} style={[styles.primaryBtn, { flex: 1.5 }, (busy || disabled) && { opacity: 0.5 }]} accessibilityRole="button">
        {busy ? <ActivityIndicator size="small" color={colors.white} /> : <Text style={styles.primaryText}>{saveLabel}</Text>}
      </Pressable>
    </View>
  );
}

/* Do'stlarni taklif qilish — Lokma Go bilan bir xil ma'lumot (server: /referral/me) */
function ReferralCard() {
  const lokma = useLokma();
  const [info, setInfo] = useState<ReferralInfo | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    lokma.rpc<ReferralInfo>('referral').then(setInfo).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const share = useCallback(() => { lokma.rpc('shareReferral').catch(() => {}); }, [lokma]);
  const copy = useCallback(async () => {
    if (!info?.referralLink) return;
    try {
      await (navigator as Navigator).clipboard.writeText(info.referralLink);
      setCopied(true); setTimeout(() => setCopied(false), 1800);
    } catch { /* ruxsat yo'q */ }
  }, [info]);

  if (info && info.enabled === false) return null;
  return (
    <View style={[styles.ref, SOFT]}>
      <View style={styles.refHead}>
        <View style={styles.refTitleRow}>
          <Ionicons name="people-outline" size={19} color={colors.primary} />
          <Text style={styles.refTitle}>Do'stlarni taklif qiling</Text>
        </View>
        {(info?.reward ?? 0) > 0 && <View style={styles.refBadge}><Text style={styles.refBadgeText}>+{som(info?.reward)} ball</Text></View>}
      </View>
      <Text style={styles.refDesc}>Har bir do'stingiz kanalga obuna bo'lib qo'shilsa — ikkalangizga ham ball beriladi. Ballar hozircha to'planadi, keyinchalik pul qiymati e'lon qilinadi.</Text>
      <View style={styles.refStats}>
        <View style={styles.refStat}><Text style={styles.refStatValue}>{info?.referralCount ?? 0}</Text><Text style={styles.refStatLabel}>Taklif qilingan</Text></View>
        <View style={styles.refStat}><Text style={styles.refStatValue}>{som(info?.referralPoints)}</Text><Text style={styles.refStatLabel}>Ballar</Text></View>
      </View>
      <View style={styles.btnRow}>
        <Pressable onPress={share} style={[styles.primaryBtn, { flex: 1 }]} accessibilityRole="button">
          <Ionicons name="paper-plane-outline" size={17} color={colors.white} />
          <Text style={styles.primaryText}>Do'stlarga yuborish</Text>
        </Pressable>
        <Pressable onPress={copy} style={styles.copyBtn} accessibilityRole="button" accessibilityLabel="Nusxalash">
          <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={19} color={colors.text} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: 16, paddingBottom: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24 },
  centerText: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  pageTitle: { fontFamily: fontFamily.extraBold, fontSize: 24, color: colors.text, paddingTop: 14, paddingBottom: 12 },
  hero: { backgroundColor: colors.white, borderRadius: 24, alignItems: 'center', paddingVertical: 22, paddingHorizontal: 16, borderWidth: 1, borderColor: colors.borderLight },
  avatarRing: { width: 92, height: 92, borderRadius: 46, padding: 3, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 86, height: 86, borderRadius: 43 },
  avatarFallback: { backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fontFamily.extraBold, fontSize: 28, color: colors.white },
  name: { fontFamily: fontFamily.extraBold, fontSize: 21, color: colors.text, marginTop: 12, textAlign: 'center' },
  handle: { ...typography.body, color: colors.primary, marginTop: 2 },
  stats: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch', marginTop: 16 },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontFamily: fontFamily.extraBold, fontSize: 22, color: colors.text },
  statLabel: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  sep: { width: 1, height: 32, backgroundColor: colors.border },
  ref: { backgroundColor: colors.primarySoft, borderRadius: 22, padding: 16, marginTop: 14, borderWidth: 1, borderColor: colors.primaryLight, gap: 10 },
  refHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  refTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  refTitle: { fontFamily: fontFamily.bold, fontSize: 16, color: colors.text, flexShrink: 1 },
  refBadge: { backgroundColor: colors.primary, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  refBadgeText: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.white },
  refDesc: { ...typography.caption, fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  refStats: { flexDirection: 'row', gap: 10 },
  refStat: { flex: 1, backgroundColor: colors.white, borderRadius: 16, paddingVertical: 12, alignItems: 'center' },
  refStatValue: { fontFamily: fontFamily.extraBold, fontSize: 20, color: colors.primary },
  refStatLabel: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  btnRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  primaryBtn: { minHeight: 46, borderRadius: 14, backgroundColor: colors.primary, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  primaryText: { fontFamily: fontFamily.bold, fontSize: 15, color: colors.white },
  secondaryBtn: { minHeight: 46, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { fontFamily: fontFamily.semiBold, fontSize: 15, color: colors.textSecondary },
  copyBtn: { width: 46, height: 46, borderRadius: 14, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  sectionLabel: { ...typography.caption, fontFamily: fontFamily.bold, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 22, marginBottom: 8, marginLeft: 4 },
  langRow: { flexDirection: 'row', gap: 8 },
  langBtn: { flex: 1, minHeight: 46, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  langOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  langText: { fontFamily: fontFamily.semiBold, fontSize: 14, color: colors.textSecondary },
  group: { backgroundColor: colors.white, borderRadius: 20, borderWidth: 1, borderColor: colors.borderLight, marginTop: 14, overflow: 'hidden' },
  divider: { height: 1, backgroundColor: colors.borderLight, marginLeft: 50 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 16 },
  rowTitle: { fontFamily: fontFamily.semiBold, fontSize: 16, color: colors.text },
  rowSub: { ...typography.caption, color: colors.textSecondary, marginTop: 1 },
  form: { padding: 14, gap: 10 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: colors.text, backgroundColor: colors.background, fontFamily: fontFamily.regular, ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null) },
  err: { ...typography.caption, color: colors.error, marginTop: 10, marginLeft: 4 },
  addr: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderRadius: 18, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.borderLight },
  addrTitle: { fontFamily: fontFamily.bold, fontSize: 16, color: colors.text },
  addrText: { ...typography.caption, fontSize: 13, color: colors.textSecondary, marginTop: 1 },
  addrSet: { fontFamily: fontFamily.semiBold, fontSize: 12.5, color: colors.primary },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white },
  typeOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeText: { fontFamily: fontFamily.semiBold, fontSize: 14, color: colors.textSecondary },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 52, borderRadius: 18, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.border },
  addBtnText: { fontFamily: fontFamily.semiBold, fontSize: 15, color: colors.textSecondary },
});

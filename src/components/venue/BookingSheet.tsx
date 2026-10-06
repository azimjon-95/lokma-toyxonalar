import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Linking, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, fontFamily } from '../../theme';
import type { BookingRequest } from '../../types';
import { useCreateBooking } from '../../hooks/queries';
import { formatPhone, formatSum, isValidPhone } from '../../lib/format';
import { Button } from '../ui/Button';

interface Props {
  visible: boolean;
  onClose: () => void;
  request: Omit<BookingRequest, 'customer_name' | 'customer_phone'> | null;
  summary: { title: string; subtitle: string; total: number; deposit: number };
}

export function BookingSheet({ visible, onClose, request, summary }: Props) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [touched, setTouched] = useState(false);
  const booking = useCreateBooking();

  useEffect(() => {
    if (visible) booking.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const nameOk = name.trim().length >= 2;
  const phoneOk = isValidPhone(phone);

  const submit = () => {
    setTouched(true);
    if (!request || !nameOk || !phoneOk) return;
    booking.mutate(
      { ...request, customer_name: name.trim(), customer_phone: phone.replace(/\s/g, '') },
      { onSuccess: (b) => b.payment_url && Linking.openURL(b.payment_url) },
    );
  };

  const done = booking.data;
  const holdTime = done ? new Date(done.hold_until).toTimeString().slice(0, 5) : '';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Yopish" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing[4] }]}>
          <View style={styles.handle} />
          {done ? (
            <View style={styles.success}>
              <View style={styles.okIcon}>
                <Ionicons name="checkmark" size={32} color="#1F7A47" />
              </View>
              <Text style={styles.title}>Bron qabul qilindi</Text>
              <Text style={styles.sub}>
                №{done.number} · {summary.subtitle}. Seans {holdTime} gacha siz uchun band qilib turiladi — avansni shu vaqtgacha to‘lang. Administrator tez orada bog‘lanadi.
              </Text>
              <Button title="Yopish" variant="outline" fullWidth onPress={onClose} />
            </View>
          ) : (
            <View style={{ gap: spacing[3] }}>
              <Text style={styles.title}>Bronni tasdiqlang</Text>
              <View style={styles.summary}>
                <Text style={styles.sTitle}>{summary.title}</Text>
                <Text style={styles.sSub}>{summary.subtitle}</Text>
                <Text style={styles.sTotal}>Jami {formatSum(summary.total)} · avans {formatSum(summary.deposit)}</Text>
              </View>
              <View>
                <Text style={styles.label}>Ism</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Ismingiz"
                  placeholderTextColor={colors.textTertiary}
                  style={[styles.input, touched && !nameOk && styles.inputErr]}
                  autoComplete="name"
                  textContentType="name"
                />
              </View>
              <View>
                <Text style={styles.label}>Telefon</Text>
                <TextInput
                  value={phone}
                  onChangeText={(t) => setPhone(formatPhone(t))}
                  keyboardType="phone-pad"
                  style={[styles.input, touched && !phoneOk && styles.inputErr]}
                  autoComplete="tel"
                  textContentType="telephoneNumber"
                />
                {touched && !phoneOk && <Text style={styles.err}>Telefon raqamni to‘liq kiriting</Text>}
              </View>
              {booking.isError && <Text style={styles.err}>{(booking.error as Error).message}</Text>}
              <View style={styles.actions}>
                <Button title="Bekor" variant="outline" style={{ flex: 1 }} onPress={onClose} />
                <Button title="Avansni to‘lash" style={{ flex: 2 }} loading={booking.isPending} onPress={submit} />
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay },
  sheet: { backgroundColor: colors.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: spacing[4], paddingTop: spacing[3] },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: colors.border, marginBottom: spacing[3] },
  title: { ...typography.h3, fontFamily: fontFamily.extraBold, color: colors.text },
  sub: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  summary: { backgroundColor: colors.background, borderRadius: 16, padding: 14, gap: 4 },
  sTitle: { ...typography.bodySemiBold, fontFamily: fontFamily.bold, color: colors.text },
  sSub: { ...typography.caption, color: colors.textSecondary },
  sTotal: { ...typography.bodySemiBold, fontFamily: fontFamily.extraBold, fontSize: 14, color: colors.text },
  label: { ...typography.captionMedium, color: colors.textSecondary, marginBottom: 6 },
  input: { height: 50, borderRadius: 14, borderWidth: 1, borderColor: '#DADCE1', paddingHorizontal: 14, ...typography.body, color: colors.text },
  inputErr: { borderColor: colors.error },
  err: { ...typography.caption, color: colors.error, marginTop: 4 },
  actions: { flexDirection: 'row', gap: spacing[2], marginTop: spacing[2] },
  success: { alignItems: 'center', gap: spacing[3], paddingVertical: spacing[2] },
  okIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.successBg, alignItems: 'center', justifyContent: 'center' },
});

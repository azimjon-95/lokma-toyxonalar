import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography, fontFamily } from '../../theme';
import type { QuoteResponse } from '../../types';
import { formatNumber, formatSum } from '../../lib/format';

export function QuoteSummary({ quote, guests, menuName, depositPercent }: {
  quote: QuoteResponse | undefined;
  guests: number;
  menuName: string;
  depositPercent: number;
}) {
  if (!quote) return null;
  const video = quote.extras.find((e) => e.type === 'video');
  const car = quote.extras.find((e) => e.type === 'cortege');
  return (
    <View style={{ gap: spacing[3] }}>
      <Text style={styles.h}>Hisob</Text>
      <View style={styles.box}>
        <Row title={`To‘yxona · ${menuName}`} sub={`${guests} × ${formatNumber(quote.price_per_guest)} so‘m`} value={formatSum(quote.venue_total)} />
        <Row title="Videochi" sub={video?.name ?? 'tanlanmagan'} value={video ? formatSum(video.price) : '—'} muted={!video} />
        <Row title="Kortej" sub={car?.name ?? 'tanlanmagan'} value={car ? formatSum(car.price) : '—'} muted={!car} />
        <View style={styles.total}>
          <Text style={styles.totalLabel}>Jami</Text>
          <Text style={styles.totalValue}>{formatSum(quote.total)}</Text>
        </View>
        <View style={styles.dep}>
          <Text style={styles.depLabel}>Bron uchun avans {depositPercent}%</Text>
          <Text style={styles.depValue}>{formatSum(quote.deposit)}</Text>
        </View>
      </View>
    </View>
  );
}

function Row({ title, sub, value, muted }: { title: string; sub: string; value: string; muted?: boolean }) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rTitle}>{title}</Text>
        <Text style={styles.rSub}>{sub}</Text>
      </View>
      <Text style={[styles.rValue, muted && { color: '#9A9EA8' }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  h: { ...typography.h3, fontFamily: fontFamily.extraBold, color: colors.text },
  box: { borderWidth: 1, borderColor: colors.border, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 6 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F1F3', gap: 12 },
  rTitle: { ...typography.bodySemiBold, fontSize: 14, color: colors.text },
  rSub: { ...typography.caption, fontSize: 12, color: colors.textSecondary },
  rValue: { ...typography.bodySemiBold, fontFamily: fontFamily.bold, fontSize: 14, color: colors.text },
  total: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 14, paddingBottom: 6 },
  totalLabel: { ...typography.bodySemiBold, fontFamily: fontFamily.extraBold, fontSize: 16, color: colors.text },
  totalValue: { ...typography.h3, fontFamily: fontFamily.extraBold, color: colors.text },
  dep: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 12 },
  depLabel: { ...typography.caption, color: colors.textSecondary },
  depValue: { ...typography.captionMedium, fontFamily: fontFamily.bold, color: colors.text },
});

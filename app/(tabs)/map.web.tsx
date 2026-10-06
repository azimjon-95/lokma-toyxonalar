// Web uchun: react-native-maps web'ni qo'llamaydi. Server/Mini App versiyasida
// bu yerga Yandex yoki Google Maps JS qo'yiladi; hozircha ro'yxat + tashqi xarita havolasi.
import React from 'react';
import { FlatList, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, layout, spacing, typography, fontFamily } from '../../src/theme';
import { useVenues } from '../../src/hooks/queries';
import { useLocation } from '../../src/store/location';
import { VenuePreview } from '../../src/components/map/VenuePreview';
import { Loading } from '../../src/components/ui/ScreenState';

const RADII = [10, 20, 50];

export default function MapWeb() {
  const router = useRouter();
  const loc = useLocation();
  const { data = [], isLoading } = useVenues({ sort: 'distance' });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.head}>
        <Text style={styles.title}>Atrofimda · {data.length} ta to‘yxona</Text>
        <Text style={styles.sub}>{loc.label}</Text>
        <View style={styles.segment}>
          {RADII.map((r) => (
            <Pressable key={r} onPress={() => loc.setRadiusKm(r)} style={[styles.segBtn, loc.radiusKm === r && styles.segActive]}>
              <Text style={[styles.segText, loc.radiusKm === r && { color: colors.white }]}>{r} km</Text>
            </Pressable>
          ))}
        </View>
      </View>
      {isLoading ? (
        <Loading />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(v) => v.id}
          contentContainerStyle={{ padding: layout.screenPadding, gap: spacing[3] }}
          renderItem={({ item }) => (
            <View style={{ gap: 6 }}>
              <VenuePreview venue={item} onOpen={() => router.push({ pathname: '/venue/[slug]', params: { slug: item.slug } })} />
              <Pressable onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lng}`)}>
                <Text style={styles.link}>Xaritada ochish ↗</Text>
              </Pressable>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  head: { padding: layout.screenPadding, gap: 4, backgroundColor: colors.white },
  title: { ...typography.h3, fontFamily: fontFamily.extraBold, color: colors.text },
  sub: { ...typography.caption, color: colors.textSecondary },
  segment: { flexDirection: 'row', gap: 6, marginTop: spacing[2] },
  segBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, borderWidth: 1, borderColor: colors.border },
  segActive: { backgroundColor: colors.text, borderColor: colors.text },
  segText: { ...typography.captionMedium, color: colors.text },
  link: { ...typography.captionMedium, color: colors.primary, paddingHorizontal: 4 },
});

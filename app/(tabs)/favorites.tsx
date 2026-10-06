import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, layout, spacing, typography, fontFamily } from '../../src/theme';
import { useVenues } from '../../src/hooks/queries';
import { useFavorites } from '../../src/store/favorites';
import { VenueCard } from '../../src/components/home/VenueCard';
import { EmptyState, Loading } from '../../src/components/ui/ScreenState';

export default function FavoritesScreen() {
  const router = useRouter();
  const { ids } = useFavorites();
  // Saralanganlar radiusdan qat'i nazar ko'rinishi uchun keng radius
  const { data = [], isLoading } = useVenues({ sort: 'distance', radiusKm: 500 });
  const list = useMemo(() => data.filter((v) => ids.includes(v.id)), [data, ids]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>Saralangan</Text>
      {isLoading ? (
        <Loading />
      ) : (
        <FlatList
          data={list}
          keyExtractor={(v) => v.id}
          contentContainerStyle={{ padding: layout.screenPadding }}
          renderItem={({ item }) => (
            <VenueCard venue={item} onPress={() => router.push({ pathname: '/venue/[slug]', params: { slug: item.slug } })} />
          )}
          ListEmptyComponent={
            <EmptyState title="Hali saralangan to‘yxona yo‘q" subtitle="Kartadagi ♡ belgisini bosib saqlab qo‘ying" />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  title: { ...typography.h2, fontFamily: fontFamily.extraBold, color: colors.text, paddingHorizontal: layout.screenPadding, paddingTop: spacing[3] },
});

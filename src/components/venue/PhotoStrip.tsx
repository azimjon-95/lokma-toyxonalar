import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily } from '../../theme';
import { PhotoViewer } from './PhotoViewer';

/*
 * Suratlar qatori: katta birinchi surat (video bo'lsa — ▶), 3 ta kichik va "+N".
 * Istalganini bossangiz — to'liq ekranli galereya shu suratdan ochiladi.
 */
export function PhotoStrip({ photos, hasVideo, onShare, isFavorite, onFavorite }: {
  photos: string[]; hasVideo?: boolean; onShare: () => void; isFavorite: boolean; onFavorite: () => void;
}) {
  const [open, setOpen] = useState<number | null>(null);
  if (!photos.length) return null;
  const small = photos.slice(1, 4);
  const rest = photos.length - 1 - small.length;
  const lastThumb = rest > 0 ? photos[4] ?? photos[photos.length - 1] : null;

  return (
    <View style={styles.row}>
      <Tile uri={photos[0]} flex={2.1} onPress={() => setOpen(0)} label="1-surat">
        {hasVideo && (
          <View style={styles.play}><Ionicons name="play" size={18} color={colors.text} style={{ marginLeft: 2 }} /></View>
        )}
      </Tile>
      {small.map((p, i) => <Tile key={p + i} uri={p} flex={i === 2 ? 0.75 : 1} onPress={() => setOpen(i + 1)} label={`${i + 2}-surat`} />)}
      {lastThumb && (
        <Tile uri={lastThumb} flex={0.5} onPress={() => setOpen(4)} label={`Yana ${rest} ta surat`}>
          <View style={styles.moreShade}><Text style={styles.more}>+{rest}</Text></View>
        </Tile>
      )}

      <PhotoViewer
        visible={open !== null}
        photos={photos}
        initialIndex={open ?? 0}
        onClose={() => setOpen(null)}
        onShare={onShare}
        isFavorite={isFavorite}
        onFavorite={onFavorite}
      />
    </View>
  );
}

function Tile({ uri, flex, onPress, label, children }: { uri: string; flex: number; onPress: () => void; label: string; children?: React.ReactNode }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="imagebutton" accessibilityLabel={label} style={({ pressed }) => [styles.tile, { flex }, pressed && { opacity: 0.88 }]}>
      <Image source={uri} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }} />
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 7, paddingHorizontal: 16, height: 74 },
  tile: { borderRadius: 14, overflow: 'hidden', backgroundColor: colors.creamDeep, minWidth: 0 },
  play: {
    position: 'absolute', left: 9, bottom: 9, width: 30, height: 30, borderRadius: 15, backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center',
  },
  moreShade: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(28,24,24,0.62)', alignItems: 'center', justifyContent: 'center' },
  more: { fontFamily: fontFamily.semiBold, fontSize: 14, color: colors.white },
});

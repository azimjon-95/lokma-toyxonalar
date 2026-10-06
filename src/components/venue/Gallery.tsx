import React, { useRef, useState } from 'react';
import { FlatList, NativeScrollEvent, NativeSyntheticEvent, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { colors, layout, spacing, typography } from '../../theme';
import { IconButton } from '../ui/IconButton';

const HEIGHT = 330;

export function Gallery({ photos, topInset, onBack, onShare, isFavorite, onFavorite }: {
  photos: string[];
  topInset: number;
  onBack: () => void;
  onShare: () => void;
  isFavorite: boolean;
  onFavorite: () => void;
}) {
  const { width } = useWindowDimensions();
  const ref = useRef<FlatList<string>>(null);
  const thumbsRef = useRef<FlatList<string>>(null);
  const [index, setIndex] = useState(0);

  const go = (i: number) => {
    const next = (i + photos.length) % photos.length;
    setIndex(next);
    ref.current?.scrollToIndex({ index: next, animated: true });
    thumbsRef.current?.scrollToIndex({ index: next, animated: true, viewPosition: 0.5 });
  };
  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndex(i);
    thumbsRef.current?.scrollToIndex({ index: i, animated: true, viewPosition: 0.5 });
  };

  return (
    <View>
      <View style={{ height: HEIGHT, backgroundColor: colors.primaryLight }}>
        <FlatList
          ref={ref}
          data={photos}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(p, i) => `${i}-${p}`}
          onMomentumScrollEnd={onEnd}
          getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
          renderItem={({ item, index: i }) => (
            <Image source={item} style={{ width, height: HEIGHT }} contentFit="cover" transition={150} accessibilityLabel={`Surat ${i + 1}`} />
          )}
        />
        <View style={[styles.topRow, { top: topInset + spacing[2] }]}>
          <IconButton icon="chevron-back" label="Orqaga" onPress={onBack} />
          <View style={styles.topActions}>
            <IconButton icon="share-outline" label="Ulashish" onPress={onShare} />
            <IconButton icon={isFavorite ? 'heart' : 'heart-outline'} color={isFavorite ? colors.primary : colors.text} label="Saralanganlar" onPress={onFavorite} />
          </View>
        </View>
        {photos.length > 1 && (
          <>
            <IconButton icon="chevron-back" label="Oldingi surat" variant="translucent" size={40} style={[styles.arrow, { left: 14 }]} onPress={() => go(index - 1)} />
            <IconButton icon="chevron-forward" label="Keyingi surat" variant="translucent" size={40} style={[styles.arrow, { right: 14 }]} onPress={() => go(index + 1)} />
          </>
        )}
        <View style={styles.counter}>
          <Text style={styles.counterText}>{index + 1} / {photos.length}</Text>
        </View>
      </View>
      <FlatList
        ref={thumbsRef}
        data={photos}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(p, i) => `t${i}-${p}`}
        contentContainerStyle={{ paddingHorizontal: layout.screenPadding, paddingTop: 10, gap: 8 }}
        getItemLayout={(_, i) => ({ length: 68, offset: layout.screenPadding + 68 * i, index: i })}
        renderItem={({ item, index: i }) => (
          <Pressable onPress={() => go(i)} accessibilityLabel={`Surat ${i + 1}`} style={[styles.thumb, i === index && styles.thumbActive]}>
            <Image source={item} style={StyleSheet.absoluteFill} contentFit="cover" />
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  topRow: { position: 'absolute', left: 14, right: 14, flexDirection: 'row', justifyContent: 'space-between' },
  topActions: { flexDirection: 'row', gap: 8 },
  arrow: { position: 'absolute', top: HEIGHT / 2 - 20 },
  counter: { position: 'absolute', right: 14, bottom: 14, backgroundColor: colors.text, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 5 },
  counterText: { ...typography.captionMedium, fontSize: 12, color: colors.white },
  thumb: { width: 60, height: 60, borderRadius: 14, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent', opacity: 0.7, backgroundColor: colors.primaryLight },
  thumbActive: { borderColor: colors.text, opacity: 1 },
});

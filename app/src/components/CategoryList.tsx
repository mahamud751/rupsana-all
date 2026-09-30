import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Category } from '../api/types';
import { imageUri } from '../api/config';
import { colors, SCREEN_WIDTH } from '../theme';

const GAP = 6;
const TILE_WIDTH = (SCREEN_WIDTH - 32 - GAP * 4) / 5;
const CIRCLE = TILE_WIDTH - 10;

export default function CategoryList({
  categories,
  onSelect,
}: {
  categories?: Category[];
  onSelect?: (slug: string) => void;
}) {
  // Placeholder tiles while loading keep the layout from jumping.
  const items = categories ?? Array.from({ length: 5 }, () => null);
  return (
    <View style={styles.row}>
      {items.slice(0, 5).map((c, i) => (
        <Pressable
          key={c?.id ?? i}
          disabled={!c}
          onPress={() => c && onSelect?.(c.slug)}
          style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
        >
          <View style={styles.circle}>
            {c && (
              <Image
                source={{ uri: imageUri(c.imageUrl) }}
                style={styles.image}
              />
            )}
          </View>
          <View style={styles.labelBox}>
            <Text style={styles.label} numberOfLines={2}>
              {c?.name ?? ' '}
            </Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: GAP,
    marginHorizontal: 16,
    marginTop: 12,
  },
  tile: {
    width: TILE_WIDTH,
    alignItems: 'center',
    paddingTop: 5,
    paddingBottom: 6,
    borderRadius: 14,
    backgroundColor: colors.tile,
    borderWidth: 1,
    borderColor: '#F3E4D5',
  },
  pressed: { transform: [{ scale: 0.96 }] },
  circle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    overflow: 'hidden',
    backgroundColor: colors.blush,
  },
  image: { width: '100%', height: '100%' },
  labelBox: {
    height: 28,
    justifyContent: 'center',
    marginTop: 3,
  },
  label: {
    fontSize: 10.5,
    lineHeight: 13,
    color: colors.text,
    textAlign: 'center',
  },
});

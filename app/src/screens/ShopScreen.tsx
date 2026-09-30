import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import { SearchBar } from '../components/Header';
import ProductCard from '../components/ProductCard';
import ScreenTitle from '../components/ScreenTitle';
import { EmptyState, Screen } from '../components/ui';
import { categories, CategoryId, products } from '../data';
import { TabScreenProps } from '../navigation/types';
import { colors, SCREEN_WIDTH } from '../theme';

const COLUMN_GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - 32 - COLUMN_GAP) / 2;

type Filter = CategoryId | 'all';
type Sort = 'featured' | 'low' | 'high';

const SORTS: { id: Sort; label: string }[] = [
  { id: 'featured', label: 'Featured' },
  { id: 'low', label: 'Price: Low' },
  { id: 'high', label: 'Price: High' },
];

export default function ShopScreen({ route }: TabScreenProps<'Shop'>) {
  const requested = route.params?.category;
  const [filter, setFilter] = useState<Filter>(requested ?? 'all');
  const [sort, setSort] = useState<Sort>('featured');
  const [query, setQuery] = useState('');

  // Follow category links from Home / the menu.
  useEffect(() => {
    setFilter(requested ?? 'all');
  }, [requested]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = products.filter(
      p =>
        (filter === 'all' || p.category === filter) &&
        (!q || `${p.name} ${p.subtitle}`.toLowerCase().includes(q)),
    );
    if (sort === 'low') {
      return [...list].sort((a, b) => a.price - b.price);
    }
    if (sort === 'high') {
      return [...list].sort((a, b) => b.price - a.price);
    }
    return list;
  }, [filter, query, sort]);

  const chips: { id: Filter; label: string }[] = [
    { id: 'all', label: 'All' },
    ...categories.map(c => ({ id: c.id, label: c.label.replace('\n', ' ') })),
  ];

  return (
    <Screen>
      <FlatList
        data={visible}
        numColumns={2}
        keyExtractor={p => p.id}
        columnWrapperStyle={styles.column}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            <ScreenTitle
              title="Shop"
              subtitle="Curated bridal & beauty essentials"
            />
            <SearchBar value={query} onChangeText={setQuery} />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
            >
              {chips.map(chip => {
                const active = chip.id === filter;
                return (
                  <Pressable
                    key={chip.id}
                    onPress={() => setFilter(chip.id)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text
                      style={[styles.chipText, active && styles.chipTextActive]}
                    >
                      {chip.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <Text style={styles.count}>
              {visible.length} {visible.length === 1 ? 'product' : 'products'}
              {'   ·   '}
              {SORTS.map((s, i) => (
                <Text
                  key={s.id}
                  onPress={() => setSort(s.id)}
                  style={sort === s.id ? styles.sortActive : styles.sort}
                >
                  {s.label}
                  {i < SORTS.length - 1 ? '   ' : ''}
                </Text>
              ))}
            </Text>
          </>
        }
        ListEmptyComponent={
          <EmptyState
            icon="search"
            title="No products found"
            text="Try another category or search term."
          />
        }
        renderItem={({ item }) => (
          <ProductCard product={item} width={CARD_WIDTH} />
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 24 },
  column: { gap: COLUMN_GAP, paddingHorizontal: 16, marginBottom: COLUMN_GAP },
  chips: { gap: 8, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  chipText: { fontSize: 13, color: colors.brownSoft },
  chipTextActive: { color: colors.white, fontWeight: '600' },
  count: {
    marginHorizontal: 16,
    marginBottom: 12,
    fontSize: 12.5,
    color: colors.textMuted,
  },
  sort: { color: colors.textMuted },
  sortActive: { color: colors.gold, fontWeight: '700' },
});

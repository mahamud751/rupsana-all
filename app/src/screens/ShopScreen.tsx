import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import { SearchBar } from '../components/Header';
import ProductCard from '../components/ProductCard';
import ScreenTitle from '../components/ScreenTitle';
import { EmptyState, ErrorView, LoadingView, Screen } from '../components/ui';
import { ProductFilters, useCategories, useProducts } from '../api/hooks';
import { errorMessage } from '../api/client';
import { TabScreenProps } from '../navigation/types';
import { colors, SCREEN_WIDTH } from '../theme';
import { useDebounced } from '../utils';

const COLUMN_GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - 32 - COLUMN_GAP) / 2;

type Sort = NonNullable<ProductFilters['sort']>;
const SORTS: { id: Sort; label: string }[] = [
  { id: 'featured', label: 'Featured' },
  { id: 'price_asc', label: 'Price: Low' },
  { id: 'price_desc', label: 'Price: High' },
  { id: 'newest', label: 'Newest' },
];

export default function ShopScreen({ route }: TabScreenProps<'Shop'>) {
  const requested = route.params?.category;
  const [category, setCategory] = useState<string | undefined>(requested);
  const [sort, setSort] = useState<Sort>('featured');
  const [query, setQuery] = useState('');
  const q = useDebounced(query.trim(), 350);

  // Follow category links from Home / the menu.
  useEffect(() => {
    setCategory(requested);
  }, [requested]);

  const categories = useCategories();
  const products = useProducts({ category, q: q || undefined, sort });
  const items = products.data?.items ?? [];

  const chips = [
    { slug: undefined as string | undefined, name: 'All' },
    ...(categories.data ?? []),
  ];

  return (
    <Screen>
      <FlatList
        data={items}
        numColumns={2}
        keyExtractor={p => p.id}
        columnWrapperStyle={styles.column}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={products.isRefetching && !products.isPlaceholderData}
            onRefresh={() => {
              products.refetch();
            }}
            tintColor={colors.gold}
            colors={[colors.gold]}
          />
        }
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
                const active = chip.slug === category;
                return (
                  <Pressable
                    key={chip.slug ?? 'all'}
                    onPress={() => setCategory(chip.slug)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text
                      style={[styles.chipText, active && styles.chipTextActive]}
                    >
                      {chip.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sortRow}
            >
              <Text style={styles.count}>
                {products.data
                  ? `${products.data.total} ${
                      products.data.total === 1 ? 'product' : 'products'
                    }`
                  : ' '}
              </Text>
              {SORTS.map(s => (
                <Pressable key={s.id} onPress={() => setSort(s.id)} hitSlop={6}>
                  <Text style={sort === s.id ? styles.sortActive : styles.sort}>
                    {s.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </>
        }
        ListEmptyComponent={
          products.isLoading ? (
            <LoadingView />
          ) : products.error ? (
            <ErrorView
              message={errorMessage(products.error)}
              onRetry={() => products.refetch()}
            />
          ) : (
            <EmptyState
              icon="search"
              title="No products found"
              text="Try another category or search term."
            />
          )
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
  sortRow: {
    gap: 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
    alignItems: 'center',
  },
  count: { fontSize: 12.5, color: colors.textMuted, marginRight: 4 },
  sort: { fontSize: 12.5, color: colors.textMuted },
  sortActive: { fontSize: 12.5, color: colors.gold, fontWeight: '700' },
});

import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Icon from '../components/Icon';
import ProductCard from '../components/ProductCard';
import { EmptyState, Screen } from '../components/ui';
import { categories, products } from '../data';
import { RootScreenProps } from '../navigation/types';
import { colors, SCREEN_WIDTH } from '../theme';

const GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - 32 - GAP) / 2;
const POPULAR = ['Jewellery', 'Lipstick', 'Foundation', 'Hair', 'Clutch'];

export default function SearchScreen({
  navigation,
}: RootScreenProps<'Search'>) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!q) {
      return [];
    }
    return products.filter(p => {
      const category = categories.find(c => c.id === p.category)?.label ?? '';
      return `${p.name} ${p.subtitle} ${category}`.toLowerCase().includes(q);
    });
  }, [q]);

  return (
    <Screen>
      <View style={styles.bar}>
        <Pressable hitSlop={10} onPress={() => navigation.goBack()}>
          <Icon
            name="chevronLeft"
            size={24}
            color={colors.brown}
            strokeWidth={2}
          />
        </Pressable>
        <View style={styles.input}>
          <Icon name="search" size={20} color={colors.brownSoft} />
          <TextInput
            autoFocus
            value={query}
            onChangeText={setQuery}
            placeholder="Search bridal & beauty"
            placeholderTextColor={colors.textMuted}
            style={styles.text}
            returnKeyType="search"
          />
          {!!query && (
            <Pressable hitSlop={8} onPress={() => setQuery('')}>
              <Icon name="close" size={18} color={colors.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      {!q ? (
        <View style={styles.popular}>
          <Text style={styles.heading}>Popular searches</Text>
          <View style={styles.chips}>
            {POPULAR.map(term => (
              <Pressable
                key={term}
                onPress={() => setQuery(term)}
                style={styles.chip}
              >
                <Text style={styles.chipText}>{term}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.heading}>Browse categories</Text>
          {categories.map(c => (
            <Pressable
              key={c.id}
              onPress={() =>
                navigation.navigate('Tabs', {
                  screen: 'Shop',
                  params: { category: c.id },
                })
              }
              style={styles.catRow}
            >
              <Text style={styles.catText}>{c.label.replace('\n', ' ')}</Text>
              <Icon name="chevronRight" size={18} />
            </Pressable>
          ))}
        </View>
      ) : (
        <FlatList
          data={results}
          numColumns={2}
          keyExtractor={p => p.id}
          keyboardShouldPersistTaps="handled"
          columnWrapperStyle={styles.column}
          contentContainerStyle={styles.results}
          ListHeaderComponent={
            <Text style={styles.count}>
              {results.length} {results.length === 1 ? 'result' : 'results'} for
              “{query.trim()}”
            </Text>
          }
          ListEmptyComponent={
            <EmptyState
              icon="search"
              title="No results"
              text="Try a different word, like “necklace” or “makeup”."
            />
          }
          renderItem={({ item }) => (
            <ProductCard product={item} width={CARD_WIDTH} />
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 46,
    paddingHorizontal: 14,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  text: { flex: 1, fontSize: 15, color: colors.text, paddingVertical: 0 },
  popular: { paddingHorizontal: 16 },
  heading: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.brownSoft,
    letterSpacing: 0.5,
    marginTop: 18,
    marginBottom: 10,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: colors.tile,
  },
  chipText: { color: colors.brown, fontSize: 13 },
  catRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  catText: { fontSize: 15, color: colors.text },
  results: { paddingBottom: 24 },
  column: { gap: GAP, paddingHorizontal: 16, marginBottom: GAP },
  count: {
    marginHorizontal: 16,
    marginVertical: 10,
    fontSize: 13,
    color: colors.textMuted,
  },
});

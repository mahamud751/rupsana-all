import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import ProductCard from '../components/ProductCard';
import { EmptyState, Screen, StackHeader } from '../components/ui';
import { useStore } from '../context/StoreContext';
import { getProduct, Product } from '../data';
import { RootScreenProps } from '../navigation/types';
import { SCREEN_WIDTH } from '../theme';

const GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - 32 - GAP) / 2;

export default function WishlistScreen({
  navigation,
}: RootScreenProps<'Wishlist'>) {
  const { wishlist } = useStore();
  const items = wishlist.map(getProduct).filter((p): p is Product => !!p);

  return (
    <Screen>
      <StackHeader title="Wishlist" />
      <FlatList
        data={items}
        numColumns={2}
        keyExtractor={p => p.id}
        columnWrapperStyle={styles.column}
        contentContainerStyle={styles.content}
        ListEmptyComponent={
          <EmptyState
            icon="heart"
            title="Your wishlist is empty"
            text="Tap the heart on any product to save it here."
            action="Explore Products"
            onAction={() =>
              navigation.navigate('Tabs', {
                screen: 'Shop',
                params: { category: undefined },
              })
            }
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
  content: { paddingTop: 8, paddingBottom: 24 },
  column: { gap: GAP, paddingHorizontal: 16, marginBottom: GAP },
});

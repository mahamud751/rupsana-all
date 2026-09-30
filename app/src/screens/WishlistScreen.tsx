import React from 'react';
import { FlatList, RefreshControl, StyleSheet } from 'react-native';
import ProductCard from '../components/ProductCard';
import {
  EmptyState,
  ErrorView,
  LoadingView,
  Screen,
  StackHeader,
} from '../components/ui';
import { useWishlist } from '../api/hooks';
import { errorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { RootScreenProps } from '../navigation/types';
import { colors, SCREEN_WIDTH } from '../theme';

const GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - 32 - GAP) / 2;

export default function WishlistScreen({
  navigation,
}: RootScreenProps<'Wishlist'>) {
  const { user } = useAuth();
  const wishlist = useWishlist();
  // Only show products that are still liked (hearts update instantly).
  const items =
    wishlist.data?.products.filter(p =>
      wishlist.data?.productIds.includes(p.id),
    ) ?? [];

  return (
    <Screen>
      <StackHeader title="Wishlist" />
      {!user ? (
        <EmptyState
          icon="heart"
          title="Sign in to use your wishlist"
          text="Save your favourite bridal pieces and find them on any device."
          action="Sign In"
          onAction={() => navigation.navigate('SignIn')}
        />
      ) : wishlist.isLoading ? (
        <LoadingView />
      ) : wishlist.error ? (
        <ErrorView
          message={errorMessage(wishlist.error)}
          onRetry={() => wishlist.refetch()}
        />
      ) : (
        <FlatList
          data={items}
          numColumns={2}
          keyExtractor={p => p.id}
          columnWrapperStyle={styles.column}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={wishlist.isRefetching}
              onRefresh={() => {
                wishlist.refetch();
              }}
              tintColor={colors.gold}
              colors={[colors.gold]}
            />
          }
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
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 8, paddingBottom: 24 },
  column: { gap: GAP, paddingHorizontal: 16, marginBottom: GAP },
});

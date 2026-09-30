import React from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { Header, SearchBar } from '../components/Header';
import HeroCarousel from '../components/HeroCarousel';
import CategoryList from '../components/CategoryList';
import ProductCard from '../components/ProductCard';
import {
  AppointmentBanner,
  InfoStrip,
  SectionHeader,
} from '../components/Promo';
import { ErrorView, LoadingView, Screen } from '../components/ui';
import { useBanners, useCategories, useProducts } from '../api/hooks';
import { errorMessage } from '../api/client';
import { TabScreenProps } from '../navigation/types';
import { colors, SCREEN_WIDTH } from '../theme';

const CARD_GAP = 8;
// Show ~3.3 cards so the row visibly scrolls, like the design.
const CARD_WIDTH = Math.round((SCREEN_WIDTH - 16) / 3.3 - CARD_GAP);

const Separator = () => <View style={{ width: CARD_GAP }} />;

export default function HomeScreen({ navigation }: TabScreenProps<'Home'>) {
  const queryClient = useQueryClient();
  const banners = useBanners();
  const categories = useCategories();
  const bestsellers = useProducts({ bestseller: true });
  const [refreshing, setRefreshing] = React.useState(false);

  const openShop = (category?: string) =>
    navigation.navigate('Shop', { category });

  const refresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries();
    setRefreshing(false);
  };

  const failed = banners.error ?? categories.error ?? bestsellers.error;

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.gold}
            colors={[colors.gold]}
          />
        }
      >
        <Header />
        <SearchBar onPress={() => navigation.navigate('Search')} />
        {failed && !banners.data ? (
          <ErrorView message={errorMessage(failed)} onRetry={refresh} />
        ) : (
          <>
            <HeroCarousel
              banners={banners.data}
              onOpen={b => openShop(b.categorySlug ?? undefined)}
            />
            <CategoryList categories={categories.data} onSelect={openShop} />

            <SectionHeader title="Bestsellers" onViewAll={() => openShop()} />
            {bestsellers.data ? (
              <FlatList
                data={bestsellers.data.items}
                horizontal
                keyExtractor={p => p.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.productRow}
                ItemSeparatorComponent={Separator}
                renderItem={({ item }) => (
                  <ProductCard product={item} width={CARD_WIDTH} />
                )}
              />
            ) : (
              <LoadingView style={styles.loading} />
            )}

            <AppointmentBanner onBook={() => navigation.navigate('Book')} />
            <InfoStrip />
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 16 },
  productRow: { paddingHorizontal: 16 },
  loading: { height: 260 },
});

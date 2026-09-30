import React from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { Header, SearchBar } from '../components/Header';
import HeroCarousel from '../components/HeroCarousel';
import CategoryList from '../components/CategoryList';
import ProductCard from '../components/ProductCard';
import {
  AppointmentBanner,
  InfoStrip,
  SectionHeader,
} from '../components/Promo';
import { Screen } from '../components/ui';
import { products } from '../data';
import { TabScreenProps } from '../navigation/types';
import { SCREEN_WIDTH } from '../theme';

const CARD_GAP = 8;
// Show ~3.3 cards so the row visibly scrolls, like the design.
const CARD_WIDTH = Math.round((SCREEN_WIDTH - 16) / 3.3 - CARD_GAP);

const Separator = () => <View style={{ width: CARD_GAP }} />;

const bestsellers = products.filter(p => p.bestseller);

export default function HomeScreen({ navigation }: TabScreenProps<'Home'>) {
  const openShop = (category?: (typeof products)[number]['category']) =>
    navigation.navigate('Shop', { category });

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Header />
        <SearchBar onPress={() => navigation.navigate('Search')} />
        <HeroCarousel onShop={() => openShop()} />
        <CategoryList onSelect={openShop} />

        <SectionHeader title="Bestsellers" onViewAll={() => openShop()} />
        <FlatList
          data={bestsellers}
          horizontal
          keyExtractor={p => p.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productRow}
          ItemSeparatorComponent={Separator}
          renderItem={({ item }) => (
            <ProductCard product={item} width={CARD_WIDTH} />
          )}
        />

        <AppointmentBanner onBook={() => navigation.navigate('Book')} />
        <InfoStrip />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 16 },
  productRow: { paddingHorizontal: 16 },
});

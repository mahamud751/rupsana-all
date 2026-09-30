import React, { useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import ProductCard from '../components/ProductCard';
import { InfoStrip } from '../components/Promo';
import {
  categories,
  categoryDescriptions,
  getProduct,
  products,
} from '../data';
import { useStore } from '../context/StoreContext';
import { EmptyState, Screen, StackHeader } from '../components/ui';
import { RootScreenProps } from '../navigation/types';
import { colors, fonts, formatPrice, SCREEN_WIDTH } from '../theme';

// The photos come from the design mockup and have a heart icon baked into
// their top edge, so the photo is bottom-anchored and its top is cropped off.
const PHOTO_WIDTH = SCREEN_WIDTH - 32;

const RELATED_WIDTH = Math.round((SCREEN_WIDTH - 16) / 2.6 - 8);

export default function ProductDetailScreen({
  navigation,
  route,
}: RootScreenProps<'ProductDetail'>) {
  const product = getProduct(route.params.productId);
  if (!product) {
    return (
      <Screen>
        <StackHeader title="Product" />
        <EmptyState
          icon="bag"
          title="Product not found"
          text="This product is no longer available."
        />
      </Screen>
    );
  }
  return <ProductDetail product={product} navigation={navigation} />;
}

function ProductDetail({
  product,
  navigation,
}: {
  product: NonNullable<ReturnType<typeof getProduct>>;
  navigation: RootScreenProps<'ProductDetail'>['navigation'];
}) {
  const insets = useSafeAreaInsets();
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const liked = isWishlisted(product.id);
  const category = categories.find(c => c.id === product.category);
  const related = products.filter(
    p => p.id !== product.id && p.category === product.category,
  );
  const alsoLike = related.length
    ? related
    : products.filter(p => p.id !== product.id).slice(0, 4);

  const addQuantity = () => addToCart(product, quantity);

  const handleAdd = () => {
    addQuantity();
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    addQuantity();
    navigation.navigate('Tabs', { screen: 'Bag' });
  };

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.imageWrap}>
          <Image source={product.image} style={styles.image} />
          <View style={styles.topBar}>
            <Pressable
              onPress={() => navigation.goBack()}
              hitSlop={8}
              style={styles.roundBtn}
            >
              <Icon
                name="chevronLeft"
                size={22}
                color={colors.brown}
                strokeWidth={2}
              />
            </Pressable>
            <Pressable
              onPress={() => toggleWishlist(product.id)}
              hitSlop={8}
              style={styles.roundBtn}
            >
              <Icon
                name="heart"
                size={20}
                color={liked ? colors.rose : colors.brown}
                filled={liked}
                strokeWidth={1.8}
              />
            </Pressable>
          </View>
        </View>

        <View style={styles.body}>
          {category && (
            <Text style={styles.category}>
              {category.label.replace('\n', ' ').toUpperCase()}
            </Text>
          )}
          <Text style={styles.name}>
            {product.name} {product.subtitle}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
            {product.bestseller && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Bestseller</Text>
              </View>
            )}
          </View>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            {categoryDescriptions[product.category]}
          </Text>

          <View style={styles.qtyRow}>
            <Text style={styles.sectionTitleInline}>Quantity</Text>
            <View style={styles.stepper}>
              <Pressable
                hitSlop={6}
                onPress={() => setQuantity(q => Math.max(1, q - 1))}
                style={styles.stepBtn}
              >
                <Icon name="minus" size={16} strokeWidth={2} />
              </Pressable>
              <Text style={styles.qty}>{quantity}</Text>
              <Pressable
                hitSlop={6}
                onPress={() => setQuantity(q => q + 1)}
                style={styles.stepBtn}
              >
                <Icon name="plus" size={16} strokeWidth={2} />
              </Pressable>
            </View>
          </View>
        </View>

        <InfoStrip />

        <Text style={[styles.sectionTitle, styles.alsoLike]}>
          You may also like
        </Text>
        <FlatList
          data={alsoLike}
          horizontal
          keyExtractor={p => p.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.relatedRow}
          renderItem={({ item }) => (
            <ProductCard product={item} width={RELATED_WIDTH} />
          )}
        />
      </ScrollView>

      <View
        style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}
      >
        <Pressable
          onPress={handleAdd}
          style={({ pressed }) => [styles.addBtn, pressed && styles.pressed]}
        >
          <Icon name={added ? 'check' : 'bag'} size={18} strokeWidth={1.8} />
          <Text style={styles.addText}>{added ? 'Added' : 'Add to Bag'}</Text>
        </Pressable>
        <Pressable
          onPress={handleBuyNow}
          style={({ pressed }) => [styles.flex, pressed && styles.pressed]}
        >
          <LinearGradient colors={['#C99A4E', '#A97A33']} style={styles.buyBtn}>
            <Text style={styles.buyText}>
              Buy Now · {formatPrice(product.price * quantity)}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingBottom: 24 },
  imageWrap: {
    marginHorizontal: 16,
    height: PHOTO_WIDTH * 0.95,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.blush,
  },
  image: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: PHOTO_WIDTH * 1.16,
  },
  topBar: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roundBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { paddingHorizontal: 16, paddingTop: 16 },
  category: {
    fontSize: 11,
    letterSpacing: 2,
    color: colors.gold,
    fontWeight: '600',
  },
  name: {
    fontFamily: fonts.serifMedium,
    fontSize: 26,
    lineHeight: 32,
    color: colors.brown,
    marginTop: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  price: { fontSize: 22, fontWeight: '700', color: colors.price },
  badge: {
    backgroundColor: colors.blush,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: { fontSize: 11, color: colors.brown, fontWeight: '600' },
  sectionTitle: {
    fontFamily: fonts.serifMedium,
    fontSize: 18,
    color: colors.brown,
    marginTop: 18,
    marginBottom: 6,
  },
  sectionTitleInline: {
    fontFamily: fonts.serifMedium,
    fontSize: 18,
    color: colors.brown,
  },
  description: { fontSize: 14, lineHeight: 21, color: colors.brownSoft },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.tile,
  },
  qty: { fontSize: 16, color: colors.text, minWidth: 18, textAlign: 'center' },
  alsoLike: { marginHorizontal: 16, marginBottom: 10 },
  relatedRow: { paddingHorizontal: 16, gap: 8 },
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 50,
    paddingHorizontal: 18,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: colors.gold,
    backgroundColor: colors.surface,
  },
  addText: { color: colors.gold, fontSize: 15, fontWeight: '600' },
  buyBtn: {
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyText: { color: colors.white, fontSize: 15, fontWeight: '600' },
  pressed: { opacity: 0.85 },
});

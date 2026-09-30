import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { StackActions, useNavigation } from '@react-navigation/native';
import Icon from './Icon';
import { Product } from '../data';
import { useStore } from '../context/StoreContext';
import { colors, formatPrice } from '../theme';

type Props = {
  product: Product;
  width: number;
};

// Product photos keep the proportions of the design (~160x186), and the
// wishlist button sits where the design places it (~87% x, ~10% y).
const IMAGE_RATIO = 186 / 160;
const HEART_SIZE = 26;

export default function ProductCard({ product, width }: Props) {
  const navigation = useNavigation();
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const [justAdded, setJustAdded] = useState(false);
  const liked = isWishlisted(product.id);
  const imageWidth = width - 8;
  const imageHeight = imageWidth * IMAGE_RATIO;

  const handleAdd = () => {
    addToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <View style={[styles.card, { width }]}>
      <Pressable
        onPress={() =>
          navigation.dispatch(
            StackActions.push('ProductDetail', { productId: product.id }),
          )
        }
        style={({ pressed }) => pressed && styles.pressed}
      >
        <View style={[styles.imageWrap, { height: imageHeight }]}>
          <Image
            source={product.image}
            style={styles.image}
            resizeMode="cover"
          />
          <Pressable
            hitSlop={8}
            onPress={() => toggleWishlist(product.id)}
            style={[
              styles.heart,
              {
                left: imageWidth * 0.87 - HEART_SIZE / 2,
                top: imageHeight * 0.1 - HEART_SIZE / 2,
              },
            ]}
          >
            <Icon
              name="heart"
              size={15}
              color={liked ? colors.rose : colors.brownSoft}
              filled={liked}
              strokeWidth={1.8}
            />
          </Pressable>
        </View>

        <Text style={styles.name} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1} adjustsFontSizeToFit>
          {product.subtitle}
        </Text>
        <Text style={styles.price}>{formatPrice(product.price)}</Text>
      </Pressable>

      <Pressable
        onPress={handleAdd}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <LinearGradient
          colors={['#C99A4E', '#A97A33']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.button}
        >
          <Icon
            name={justAdded ? 'check' : 'bag'}
            size={15}
            color={colors.white}
            strokeWidth={1.8}
          />
          <Text style={styles.buttonText}>
            {justAdded ? 'Added' : 'Add to Bag'}
          </Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 4,
    paddingBottom: 6,
    borderWidth: 1,
    borderColor: '#F2E6D8',
  },
  imageWrap: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.blush,
  },
  image: { width: '100%', height: '100%' },
  heart: {
    position: 'absolute',
    width: HEART_SIZE,
    height: HEART_SIZE,
    borderRadius: HEART_SIZE / 2,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    marginTop: 6,
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 11,
    lineHeight: 15,
    color: colors.text,
    textAlign: 'center',
    marginTop: 1,
  },
  price: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.price,
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 7,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    height: 30,
    borderRadius: 7,
  },
  buttonText: {
    color: colors.white,
    fontSize: 11.5,
    fontWeight: '500',
  },
  pressed: { opacity: 0.85 },
});

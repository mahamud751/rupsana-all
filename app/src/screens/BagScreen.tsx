import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from '../components/Icon';
import ScreenTitle from '../components/ScreenTitle';
import { InfoStrip } from '../components/Promo';
import {
  EmptyState,
  GoldButton,
  ProductThumb,
  Screen,
  SummaryRow,
} from '../components/ui';
import { useStore } from '../context/StoreContext';
import { TabScreenProps } from '../navigation/types';
import { colors, formatPrice } from '../theme';

export default function BagScreen({ navigation }: TabScreenProps<'Bag'>) {
  const { cart, cartCount, cartTotal, updateQuantity, removeFromCart } =
    useStore();

  if (cart.length === 0) {
    return (
      <Screen>
        <ScreenTitle title="Your Bag" />
        <EmptyState
          icon="bag"
          title="Your bag is empty"
          text="Discover bridal jewellery, makeup and more."
          action="Start Shopping"
          onAction={() => navigation.navigate('Shop', { category: undefined })}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <FlatList
        data={cart}
        keyExtractor={i => i.product.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <ScreenTitle
            title="Your Bag"
            subtitle={`${cartCount} ${cartCount === 1 ? 'item' : 'items'}`}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Pressable
              onPress={() =>
                navigation.navigate('ProductDetail', {
                  productId: item.product.id,
                })
              }
            >
              <ProductThumb
                source={item.product.image}
                width={76}
                height={86}
              />
            </Pressable>
            <View style={styles.flex}>
              <Text style={styles.name} numberOfLines={2}>
                {item.product.name} {item.product.subtitle}
              </Text>
              <Text style={styles.price}>
                {formatPrice(item.product.price)}
              </Text>
              <View style={styles.qtyRow}>
                <Pressable
                  hitSlop={6}
                  onPress={() => updateQuantity(item.product.id, -1)}
                  style={styles.qtyBtn}
                >
                  <Icon name="minus" size={14} strokeWidth={2} />
                </Pressable>
                <Text style={styles.qty}>{item.quantity}</Text>
                <Pressable
                  hitSlop={6}
                  onPress={() => updateQuantity(item.product.id, 1)}
                  style={styles.qtyBtn}
                >
                  <Icon name="plus" size={14} strokeWidth={2} />
                </Pressable>
              </View>
            </View>
            <Pressable
              hitSlop={8}
              onPress={() => removeFromCart(item.product.id)}
            >
              <Icon name="trash" size={20} color={colors.textMuted} />
            </Pressable>
          </View>
        )}
        ListFooterComponent={<InfoStrip />}
      />

      <View style={styles.summary}>
        <SummaryRow label="Subtotal" value={formatPrice(cartTotal)} />
        <Text style={styles.note}>
          Delivery charge and promo codes are applied at checkout.
        </Text>
        <GoldButton
          title={`Checkout · ${formatPrice(cartTotal)}`}
          onPress={() => navigation.navigate('Checkout')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { paddingHorizontal: 16, paddingBottom: 16 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  name: { fontSize: 14, color: colors.text, fontWeight: '500' },
  price: {
    fontSize: 15,
    color: colors.price,
    fontWeight: '700',
    marginTop: 4,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qty: { fontSize: 15, color: colors.text, minWidth: 16, textAlign: 'center' },
  summary: {
    padding: 16,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  note: { color: colors.textMuted, fontSize: 12, marginBottom: 12 },
});

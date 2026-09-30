import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from '../components/Icon';
import { EmptyState, Screen, StackHeader, StatusPill } from '../components/ui';
import { useStore } from '../context/StoreContext';
import { RootScreenProps } from '../navigation/types';
import { colors, formatPrice } from '../theme';
import { formatDate } from '../utils';

export default function OrdersScreen({
  navigation,
}: RootScreenProps<'Orders'>) {
  const { orders } = useStore();

  return (
    <Screen>
      <StackHeader title="My Orders" />
      <FlatList
        data={orders}
        keyExtractor={o => o.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="box"
            title="No orders yet"
            text="When you place an order, you can track it here."
            action="Start Shopping"
            onAction={() =>
              navigation.navigate('Tabs', {
                screen: 'Shop',
                params: { category: undefined },
              })
            }
          />
        }
        renderItem={({ item }) => {
          const count = item.items.reduce((s, i) => s + i.quantity, 0);
          return (
            <Pressable
              onPress={() =>
                navigation.navigate('OrderDetail', { orderId: item.id })
              }
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            >
              <View style={styles.row}>
                <View style={styles.icon}>
                  <Icon name="box" size={22} />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.id}>Order #{item.id}</Text>
                  <Text style={styles.meta}>
                    {formatDate(item.createdAt)} · {count}{' '}
                    {count === 1 ? 'item' : 'items'}
                  </Text>
                </View>
                <StatusPill status={item.status} />
              </View>
              <View style={styles.bottom}>
                <Text style={styles.names} numberOfLines={1}>
                  {item.items.map(i => i.name).join(', ')}
                </Text>
                <Text style={styles.total}>{formatPrice(item.total)}</Text>
              </View>
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: 16, gap: 10, flexGrow: 1 },
  card: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pressed: { opacity: 0.85 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.tile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  id: { fontSize: 15, fontWeight: '600', color: colors.text },
  meta: { fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    gap: 10,
  },
  names: { flex: 1, fontSize: 13, color: colors.brownSoft },
  total: { fontSize: 16, fontWeight: '700', color: colors.price },
});

import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import Icon from '../components/Icon';
import {
  Card,
  EmptyState,
  OutlineButton,
  ProductThumb,
  Screen,
  SectionTitle,
  StackHeader,
  StatusPill,
  SummaryRow,
} from '../components/ui';
import { OrderStatus, useStore } from '../context/StoreContext';
import { getProduct } from '../data';
import { RootScreenProps } from '../navigation/types';
import { colors, formatPrice } from '../theme';
import { formatDateTime } from '../utils';

const STEPS: { status: OrderStatus; label: string; text: string }[] = [
  {
    status: 'placed',
    label: 'Order placed',
    text: 'We have received your order',
  },
  {
    status: 'confirmed',
    label: 'Confirmed',
    text: 'Our team has confirmed it by phone',
  },
  { status: 'shipped', label: 'Shipped', text: 'Your order is on the way' },
  { status: 'delivered', label: 'Delivered', text: 'Enjoy your purchase!' },
];

export default function OrderDetailScreen({
  navigation,
  route,
}: RootScreenProps<'OrderDetail'>) {
  const { orders, cancelOrder } = useStore();
  const order = orders.find(o => o.id === route.params.orderId);

  if (!order) {
    return (
      <Screen>
        <StackHeader title="Order" />
        <EmptyState
          icon="box"
          title="Order not found"
          text="This order no longer exists."
        />
      </Screen>
    );
  }

  const cancelled = order.status === 'cancelled';
  const reached = STEPS.findIndex(s => s.status === order.status);

  const confirmCancel = () =>
    Alert.alert('Cancel this order?', 'This cannot be undone.', [
      { text: 'Keep order', style: 'cancel' },
      {
        text: 'Cancel order',
        style: 'destructive',
        onPress: () => cancelOrder(order.id),
      },
    ]);

  return (
    <Screen>
      <StackHeader title={`Order #${order.id}`} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <View style={styles.topRow}>
            <Text style={styles.date}>{formatDateTime(order.createdAt)}</Text>
            <StatusPill status={order.status} />
          </View>
          {cancelled ? (
            <Text style={styles.cancelled}>This order was cancelled.</Text>
          ) : (
            <View style={styles.timeline}>
              {STEPS.map((step, i) => {
                const done = i <= reached;
                const last = i === STEPS.length - 1;
                return (
                  <View key={step.status} style={styles.step}>
                    <View style={styles.rail}>
                      <View style={[styles.dot, done && styles.dotDone]}>
                        {done && (
                          <Icon
                            name="check"
                            size={12}
                            color={colors.white}
                            strokeWidth={2.6}
                          />
                        )}
                      </View>
                      {!last && (
                        <View
                          style={[styles.line, i < reached && styles.lineDone]}
                        />
                      )}
                    </View>
                    <View style={styles.stepText}>
                      <Text style={[styles.stepLabel, !done && styles.muted]}>
                        {step.label}
                      </Text>
                      <Text style={styles.stepSub}>{step.text}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </Card>

        <SectionTitle>Items</SectionTitle>
        <Card>
          {order.items.map(item => {
            const product = getProduct(item.productId);
            return (
              <View key={item.productId} style={styles.item}>
                {product && (
                  <ProductThumb source={product.image} width={48} height={54} />
                )}
                <View style={styles.flex}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.name} {item.subtitle}
                  </Text>
                  <Text style={styles.itemQty}>
                    {item.quantity} × {formatPrice(item.price)}
                  </Text>
                </View>
                <Text style={styles.itemTotal}>
                  {formatPrice(item.price * item.quantity)}
                </Text>
              </View>
            );
          })}
          <View style={styles.divider} />
          <SummaryRow label="Subtotal" value={formatPrice(order.subtotal)} />
          <SummaryRow
            label="Delivery"
            value={order.deliveryFee ? formatPrice(order.deliveryFee) : 'Free'}
          />
          {order.discount > 0 && (
            <SummaryRow
              label={`Discount (${order.promoCode})`}
              value={`− ${formatPrice(order.discount)}`}
              accent
            />
          )}
          <View style={styles.divider} />
          <SummaryRow label="Total" value={formatPrice(order.total)} strong />
        </Card>

        <SectionTitle>Delivery address</SectionTitle>
        <Card>
          <Text style={styles.addrName}>{order.address.fullName}</Text>
          <Text style={styles.addr}>{order.address.phone}</Text>
          <Text style={styles.addr}>
            {order.address.line}, {order.address.city}
          </Text>
          <Text style={styles.addr}>
            {order.address.area === 'inside' ? 'Inside Dhaka' : 'Outside Dhaka'}
          </Text>
          {!!order.address.note && (
            <Text style={styles.addrNote}>Note: {order.address.note}</Text>
          )}
        </Card>

        <SectionTitle>Payment</SectionTitle>
        <Card style={styles.payRow}>
          <Icon
            name={order.payment.method === 'cod' ? 'cash' : 'wallet'}
            size={22}
          />
          <View style={styles.flex}>
            <Text style={styles.addrName}>
              {order.payment.method === 'cod' ? 'Cash on Delivery' : 'bKash'}
            </Text>
            {order.payment.trxId && (
              <Text style={styles.addr}>TrxID: {order.payment.trxId}</Text>
            )}
          </View>
        </Card>

        <View style={styles.actions}>
          {order.status === 'placed' && (
            <OutlineButton
              title="Cancel Order"
              danger
              icon="close"
              onPress={confirmCancel}
            />
          )}
          <OutlineButton
            title="Need help with this order?"
            icon="help"
            onPress={() => navigation.navigate('Help')}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  date: { fontSize: 13, color: colors.textMuted },
  cancelled: { marginTop: 12, color: colors.price, fontSize: 14 },
  timeline: { marginTop: 16 },
  step: { flexDirection: 'row', gap: 12 },
  rail: { alignItems: 'center', width: 22 },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: { backgroundColor: colors.gold, borderColor: colors.gold },
  line: { width: 2, flex: 1, minHeight: 22, backgroundColor: colors.border },
  lineDone: { backgroundColor: colors.gold },
  stepText: { flex: 1, paddingBottom: 16 },
  stepLabel: { fontSize: 14.5, fontWeight: '600', color: colors.text },
  muted: { color: colors.textMuted },
  stepSub: { fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  itemName: { fontSize: 13.5, color: colors.text },
  itemQty: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  itemTotal: { fontSize: 14, fontWeight: '600', color: colors.text },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  addrName: { fontSize: 15, fontWeight: '600', color: colors.text },
  addr: { fontSize: 13.5, color: colors.brownSoft, marginTop: 3 },
  addrNote: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 6,
    fontStyle: 'italic',
  },
  payRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  actions: { gap: 10, marginTop: 24 },
});

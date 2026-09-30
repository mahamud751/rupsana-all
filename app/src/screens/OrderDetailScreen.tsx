import React from 'react';
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Icon from '../components/Icon';
import {
  Card,
  ErrorView,
  LoadingView,
  OutlineButton,
  ProductThumb,
  Screen,
  SectionTitle,
  StackHeader,
  StatusPill,
  SummaryRow,
} from '../components/ui';
import { useCancelOrder, useOrder } from '../api/hooks';
import { errorMessage } from '../api/client';
import { OrderStatus } from '../api/types';
import { RootScreenProps } from '../navigation/types';
import { colors, formatPrice } from '../theme';
import { formatDateTime } from '../utils';

const STEPS: { status: OrderStatus; label: string; text: string }[] = [
  {
    status: 'PLACED',
    label: 'Order placed',
    text: 'We have received your order',
  },
  {
    status: 'CONFIRMED',
    label: 'Confirmed',
    text: 'Our team has confirmed it by phone',
  },
  { status: 'SHIPPED', label: 'Shipped', text: 'Your order is on the way' },
  { status: 'DELIVERED', label: 'Delivered', text: 'Enjoy your purchase!' },
];

export default function OrderDetailScreen({
  navigation,
  route,
}: RootScreenProps<'OrderDetail'>) {
  const query = useOrder(route.params.orderId);
  const cancel = useCancelOrder();
  const order = query.data;

  if (!order) {
    return (
      <Screen>
        <StackHeader title="Order" />
        {query.isLoading ? (
          <LoadingView />
        ) : (
          <ErrorView
            message={errorMessage(query.error)}
            onRetry={() => query.refetch()}
          />
        )}
      </Screen>
    );
  }

  const cancelled = order.status === 'CANCELLED';
  const reached = STEPS.findIndex(s => s.status === order.status);
  const whenReached = (status: OrderStatus) =>
    order.history.find(h => h.status === status)?.createdAt;

  const confirmCancel = () =>
    Alert.alert('Cancel this order?', 'This cannot be undone.', [
      { text: 'Keep order', style: 'cancel' },
      {
        text: 'Cancel order',
        style: 'destructive',
        onPress: () =>
          cancel.mutate(order.id, {
            onError: e => Alert.alert('Could not cancel', errorMessage(e)),
          }),
      },
    ]);

  return (
    <Screen>
      <StackHeader title={`Order ${order.reference}`} />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching}
            onRefresh={() => {
              query.refetch();
            }}
            tintColor={colors.gold}
            colors={[colors.gold]}
          />
        }
      >
        <Card>
          <View style={styles.topRow}>
            <Text style={styles.date}>{formatDateTime(order.createdAt)}</Text>
            <StatusPill status={order.status} />
          </View>
          {cancelled ? (
            <Text style={styles.cancelled}>
              This order was cancelled
              {whenReached('CANCELLED')
                ? ` on ${formatDateTime(whenReached('CANCELLED')!)}`
                : ''}
              .
            </Text>
          ) : (
            <View style={styles.timeline}>
              {STEPS.map((step, i) => {
                const done = i <= reached;
                const last = i === STEPS.length - 1;
                const at = whenReached(step.status);
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
                      <Text style={styles.stepSub}>
                        {at ? formatDateTime(at) : step.text}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </Card>

        <SectionTitle>Items</SectionTitle>
        <Card>
          {order.items.map(item => (
            <Pressable
              key={item.id}
              onPress={() =>
                navigation.push('ProductDetail', { productId: item.productId })
              }
              style={styles.item}
            >
              <ProductThumb source={item.imageUrl} width={48} height={54} />
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
            </Pressable>
          ))}
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
          <Text style={styles.addrName}>{order.shipName}</Text>
          <Text style={styles.addr}>{order.shipPhone}</Text>
          <Text style={styles.addr}>
            {order.shipLine}, {order.shipCity}
          </Text>
          <Text style={styles.addr}>
            {order.shipArea === 'INSIDE_DHAKA'
              ? 'Inside Dhaka'
              : 'Outside Dhaka'}
          </Text>
          {!!order.shipNote && (
            <Text style={styles.addrNote}>Note: {order.shipNote}</Text>
          )}
        </Card>

        <SectionTitle>Payment</SectionTitle>
        <Card style={styles.payRow}>
          <Icon
            name={order.paymentMethod === 'COD' ? 'cash' : 'wallet'}
            size={22}
          />
          <View style={styles.flex}>
            <Text style={styles.addrName}>
              {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'bKash'}
            </Text>
            {order.bkashTrxId && (
              <Text style={styles.addr}>TrxID: {order.bkashTrxId}</Text>
            )}
          </View>
          <StatusPill status={order.paymentStatus} />
        </Card>

        <View style={styles.actions}>
          {order.status === 'PLACED' && (
            <OutlineButton
              title={cancel.isPending ? 'Cancelling…' : 'Cancel Order'}
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

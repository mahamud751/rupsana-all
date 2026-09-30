import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { CommonActions } from '@react-navigation/native';
import {
  Card,
  GoldButton,
  OutlineButton,
  Screen,
  SummaryRow,
} from '../components/ui';
import { useOrder, useSettings } from '../api/hooks';
import { RootScreenProps } from '../navigation/types';
import { colors, fonts, formatPrice } from '../theme';
import { formatDateTime } from '../utils';

export default function OrderSuccessScreen({
  navigation,
  route,
}: RootScreenProps<'OrderSuccess'>) {
  const order = useOrder(route.params.orderId).data;
  const settings = useSettings().data;

  const goHome = () =>
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: 'Tabs' }] }),
    );

  const viewOrder = () =>
    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [
          { name: 'Tabs' },
          { name: 'OrderDetail', params: { orderId: route.params.orderId } },
        ],
      }),
    );

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Svg
          width={110}
          height={110}
          viewBox="0 0 110 110"
          style={styles.check}
        >
          <Circle cx={55} cy={55} r={52} fill="#F6E7D3" />
          <Circle cx={55} cy={55} r={40} fill={colors.gold} />
          <Path
            d="M37 56l12 12 24-26"
            stroke={colors.white}
            strokeWidth={6}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>
        <Text style={styles.title}>Thank you!</Text>
        <Text style={styles.subtitle}>
          Your order has been placed successfully. Our team will call you
          shortly to confirm it.
        </Text>

        {order && (
          <Card style={styles.card}>
            <SummaryRow label="Order number" value={order.reference} />
            <SummaryRow
              label="Placed on"
              value={formatDateTime(order.createdAt)}
            />
            <SummaryRow
              label="Payment"
              value={
                order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'bKash'
              }
            />
            <SummaryRow label="Deliver to" value={order.shipCity} />
            <View style={styles.divider} />
            <SummaryRow label="Total" value={formatPrice(order.total)} strong />
            <Text style={styles.note}>
              {order.paymentMethod === 'COD'
                ? `Please keep ${formatPrice(
                    order.total,
                  )} ready in cash when the rider arrives.`
                : `We'll verify your bKash payment (TrxID ${order.bkashTrxId}) before shipping.`}
            </Text>
          </Card>
        )}

        <GoldButton title="View Order" onPress={viewOrder} style={styles.btn} />
        <OutlineButton
          title="Continue Shopping"
          onPress={goHome}
          style={styles.btn}
        />
        {settings && (
          <Text style={styles.help}>
            Questions? Call us at {settings.phone}
          </Text>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, alignItems: 'stretch', paddingBottom: 40 },
  check: { alignSelf: 'center', marginTop: 30 },
  title: {
    fontFamily: fonts.serifMedium,
    fontSize: 32,
    color: colors.brown,
    textAlign: 'center',
    marginTop: 18,
  },
  subtitle: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 14.5,
    lineHeight: 21,
    marginTop: 8,
    paddingHorizontal: 10,
  },
  card: { marginTop: 24 },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  note: { fontSize: 12.5, color: colors.brownSoft, marginTop: 4 },
  btn: { marginTop: 14 },
  help: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 12.5,
    marginTop: 18,
  },
});

import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon, { IconName } from '../components/Icon';
import {
  Card,
  Field,
  GoldButton,
  ProductThumb,
  Screen,
  SectionTitle,
  StackHeader,
  SummaryRow,
} from '../components/ui';
import { Address, PaymentMethod, useStore } from '../context/StoreContext';
import {
  DeliveryArea,
  deliveryFees,
  PromoCode,
  promoCodes,
  storeConfig,
} from '../config';
import { RootScreenProps } from '../navigation/types';
import { colors, formatPrice } from '../theme';
import { isValidPhone } from '../utils';

type Errors = Partial<Record<keyof Address | 'trxId', string>>;

const PAYMENTS: {
  id: PaymentMethod;
  title: string;
  text: string;
  icon: IconName;
}[] = [
  {
    id: 'cod',
    title: 'Cash on Delivery',
    text: 'Pay in cash when your order arrives',
    icon: 'cash',
  },
  {
    id: 'bkash',
    title: 'bKash',
    text: 'Pay now with bKash Send Money',
    icon: 'wallet',
  },
];

export default function CheckoutScreen({
  navigation,
}: RootScreenProps<'Checkout'>) {
  const insets = useSafeAreaInsets();
  const { cart, cartTotal, profile, address, saveAddress, placeOrder } =
    useStore();

  const [form, setForm] = useState<Address>(
    address ?? {
      fullName: profile?.name ?? '',
      phone: profile?.phone ?? '',
      area: 'inside',
      city: 'Dhaka',
      line: '',
      note: '',
    },
  );
  const [remember, setRemember] = useState(true);
  const [payment, setPayment] = useState<PaymentMethod>('cod');
  const [trxId, setTrxId] = useState('');
  const [promoInput, setPromoInput] = useState('');
  const [promo, setPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const placed = useRef(false);

  // If the bag is emptied elsewhere, there is nothing to check out.
  useEffect(() => {
    if (cart.length === 0 && !placed.current) {
      navigation.goBack();
    }
  }, [cart.length, navigation]);

  const set = (key: keyof Address) => (value: string) =>
    setForm(f => ({ ...f, [key]: value }));

  const deliveryFee = promo?.freeDelivery ? 0 : deliveryFees[form.area];
  const discount = promo?.percentOff
    ? Math.round((cartTotal * promo.percentOff) / 100)
    : 0;
  const total = cartTotal + deliveryFee - discount;

  const applyPromo = () => {
    const found = promoCodes.find(
      p => p.code === promoInput.trim().toUpperCase(),
    );
    if (found) {
      setPromo(found);
      setPromoError('');
    } else {
      setPromo(null);
      setPromoError('This promo code is not valid.');
    }
  };

  const validate = () => {
    const e: Errors = {};
    if (form.fullName.trim().length < 2) {
      e.fullName = 'Please enter your full name.';
    }
    if (!isValidPhone(form.phone)) {
      e.phone = 'Enter a valid mobile number, e.g. 017XXXXXXXX.';
    }
    if (form.city.trim().length < 2) {
      e.city = 'Please enter your city or district.';
    }
    if (form.line.trim().length < 6) {
      e.line = 'Please enter your full address (house, road, area).';
    }
    if (payment === 'bkash' && trxId.trim().length < 6) {
      e.trxId = 'Enter the bKash Transaction ID from your payment SMS.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) {
      return;
    }
    const cleaned: Address = {
      ...form,
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      city: form.city.trim(),
      line: form.line.trim(),
      note: form.note.trim(),
    };
    placed.current = true;
    if (remember) {
      saveAddress(cleaned);
    }
    const order = placeOrder({
      subtotal: cartTotal,
      deliveryFee,
      discount,
      total,
      promoCode: promo?.code,
      address: cleaned,
      payment:
        payment === 'bkash'
          ? { method: 'bkash', trxId: trxId.trim().toUpperCase() }
          : { method: 'cod' },
    });
    navigation.replace('OrderSuccess', { orderId: order.id });
  };

  const areaChip = (area: DeliveryArea, label: string) => {
    const active = form.area === area;
    return (
      <Pressable
        onPress={() => setForm(f => ({ ...f, area }))}
        style={[styles.areaChip, active && styles.areaChipActive]}
      >
        <Text style={[styles.areaTitle, active && styles.onGold]}>{label}</Text>
        <Text style={[styles.areaFee, active && styles.onGold]}>
          {formatPrice(deliveryFees[area])} ·{' '}
          {area === 'inside' ? '1–3' : '3–5'} days
        </Text>
      </Pressable>
    );
  };

  return (
    <Screen>
      <StackHeader title="Checkout" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <SectionTitle>Delivery address</SectionTitle>
          <Field
            label="Full name"
            value={form.fullName}
            onChangeText={set('fullName')}
            placeholder="e.g. Nusrat Jahan"
            autoCapitalize="words"
            error={errors.fullName}
          />
          <Field
            label="Mobile number"
            value={form.phone}
            onChangeText={set('phone')}
            placeholder="01XXXXXXXXX"
            keyboardType="phone-pad"
            error={errors.phone}
          />
          <Text style={styles.fieldLabel}>Delivery area</Text>
          <View style={styles.areaRow}>
            {areaChip('inside', 'Inside Dhaka')}
            {areaChip('outside', 'Outside Dhaka')}
          </View>
          <Field
            label="City / District"
            value={form.city}
            onChangeText={set('city')}
            placeholder="e.g. Dhaka"
            autoCapitalize="words"
            error={errors.city}
          />
          <Field
            label="Full address"
            value={form.line}
            onChangeText={set('line')}
            placeholder="House, road, area, landmark"
            multiline
            error={errors.line}
          />
          <Field
            label="Order note (optional)"
            value={form.note}
            onChangeText={set('note')}
            placeholder="e.g. Please call before delivery"
          />
          <View style={styles.rememberRow}>
            <Text style={styles.rememberText}>Save this address</Text>
            <Switch
              value={remember}
              onValueChange={setRemember}
              trackColor={{ true: colors.gold, false: colors.border }}
              thumbColor={colors.white}
            />
          </View>

          <SectionTitle>Payment method</SectionTitle>
          {PAYMENTS.map(p => {
            const active = payment === p.id;
            return (
              <Pressable
                key={p.id}
                onPress={() => setPayment(p.id)}
                style={[styles.payment, active && styles.paymentActive]}
              >
                <View style={styles.paymentIcon}>
                  <Icon name={p.icon} size={22} />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.paymentTitle}>{p.title}</Text>
                  <Text style={styles.paymentText}>{p.text}</Text>
                </View>
                <View style={[styles.radio, active && styles.radioActive]}>
                  {active && <View style={styles.radioDot} />}
                </View>
              </Pressable>
            );
          })}
          {payment === 'bkash' && (
            <Card style={styles.bkash}>
              <Text style={styles.bkashStep}>
                1. Open bKash and choose{' '}
                <Text style={styles.bold}>Send Money</Text>
              </Text>
              <Text style={styles.bkashStep}>
                2. Send <Text style={styles.bold}>{formatPrice(total)}</Text> to{' '}
                <Text style={styles.bold}>{storeConfig.bkashNumber}</Text>
              </Text>
              <Text style={styles.bkashStep}>
                3. Enter the Transaction ID from your bKash SMS below
              </Text>
              <Field
                label="Transaction ID"
                value={trxId}
                onChangeText={setTrxId}
                placeholder="e.g. 9A7B6C5D4E"
                autoCapitalize="none"
                error={errors.trxId}
              />
            </Card>
          )}

          <SectionTitle>Promo code</SectionTitle>
          <View style={styles.promoRow}>
            <View style={styles.promoInput}>
              <Icon name="tag" size={18} color={colors.textMuted} />
              <TextInput
                value={promoInput}
                onChangeText={setPromoInput}
                placeholder="Enter code"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="characters"
                style={styles.promoText}
              />
            </View>
            <Pressable onPress={applyPromo} style={styles.applyBtn}>
              <Text style={styles.applyText}>Apply</Text>
            </Pressable>
          </View>
          {promo && (
            <Text style={styles.promoOk}>
              ✓ {promo.code} applied — {promo.label}
            </Text>
          )}
          {!!promoError && <Text style={styles.promoErr}>{promoError}</Text>}

          <SectionTitle>Order summary</SectionTitle>
          <Card>
            {cart.map(i => (
              <View key={i.product.id} style={styles.line}>
                <ProductThumb source={i.product.image} width={44} height={50} />
                <View style={styles.flex}>
                  <Text style={styles.lineName} numberOfLines={1}>
                    {i.product.name} {i.product.subtitle}
                  </Text>
                  <Text style={styles.lineQty}>
                    {i.quantity} × {formatPrice(i.product.price)}
                  </Text>
                </View>
                <Text style={styles.lineTotal}>
                  {formatPrice(i.quantity * i.product.price)}
                </Text>
              </View>
            ))}
            <View style={styles.divider} />
            <SummaryRow label="Subtotal" value={formatPrice(cartTotal)} />
            <SummaryRow
              label={`Delivery (${
                form.area === 'inside' ? 'Inside' : 'Outside'
              } Dhaka)`}
              value={deliveryFee ? formatPrice(deliveryFee) : 'Free'}
              accent={!deliveryFee}
            />
            {discount > 0 && (
              <SummaryRow
                label={`Discount (${promo?.code})`}
                value={`− ${formatPrice(discount)}`}
                accent
              />
            )}
            <View style={styles.divider} />
            <SummaryRow label="Total" value={formatPrice(total)} strong />
          </Card>
        </ScrollView>

        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom, 12) },
          ]}
        >
          <GoldButton
            title={`Place Order · ${formatPrice(total)}`}
            onPress={submit}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 24 },
  fieldLabel: {
    fontSize: 13,
    color: colors.brownSoft,
    marginBottom: 6,
    fontWeight: '500',
  },
  areaRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  areaChip: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  areaChipActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  areaTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  areaFee: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  onGold: { color: colors.white },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rememberText: { fontSize: 14, color: colors.text },
  payment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: 8,
  },
  paymentActive: { borderColor: colors.gold, backgroundColor: '#FBF0E2' },
  paymentIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.tile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  paymentText: { fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: colors.gold },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.gold,
  },
  bkash: { marginTop: 4, backgroundColor: '#FDF1F4', borderColor: '#F3CAD5' },
  bkashStep: { fontSize: 13.5, color: colors.text, marginBottom: 8 },
  bold: { fontWeight: '700' },
  promoRow: { flexDirection: 'row', gap: 10 },
  promoInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 48,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  promoText: { flex: 1, fontSize: 15, color: colors.text, paddingVertical: 0 },
  applyBtn: {
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: colors.brown,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyText: { color: colors.white, fontWeight: '600' },
  promoOk: { color: '#2E7D4F', marginTop: 8, fontSize: 13 },
  promoErr: { color: colors.price, marginTop: 8, fontSize: 13 },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  lineName: { fontSize: 13.5, color: colors.text },
  lineQty: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  lineTotal: { fontSize: 14, fontWeight: '600', color: colors.text },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: 10,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
});

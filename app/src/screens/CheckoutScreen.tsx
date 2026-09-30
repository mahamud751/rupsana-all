import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  useAddresses,
  usePlaceOrder,
  useQuote,
  useSettings,
} from '../api/hooks';
import { errorMessage } from '../api/client';
import {
  Address,
  AddressInput,
  DeliveryArea,
  PaymentMethod,
} from '../api/types';
import { RootScreenProps } from '../navigation/types';
import { colors, formatPrice } from '../theme';
import { isValidPhone } from '../utils';

type Errors = Partial<Record<keyof AddressInput | 'trxId', string>>;

const PAYMENTS: {
  id: PaymentMethod;
  title: string;
  text: string;
  icon: IconName;
}[] = [
  {
    id: 'COD',
    title: 'Cash on Delivery',
    text: 'Pay in cash when your order arrives',
    icon: 'cash',
  },
  {
    id: 'BKASH',
    title: 'bKash',
    text: 'Pay now with bKash Send Money',
    icon: 'wallet',
  },
];

const emptyForm: AddressInput = {
  fullName: '',
  phone: '',
  area: 'INSIDE_DHAKA',
  city: 'Dhaka',
  line: '',
  note: '',
};

const fromAddress = (a: Address): AddressInput => ({
  fullName: a.fullName,
  phone: a.phone,
  area: a.area,
  city: a.city,
  line: a.line,
  note: a.note ?? '',
});

export default function CheckoutScreen({
  navigation,
}: RootScreenProps<'Checkout'>) {
  const insets = useSafeAreaInsets();
  const cart = useCart();
  const { user } = useAuth();
  const settings = useSettings();
  const addresses = useAddresses();
  const placeOrder = usePlaceOrder();

  const [form, setForm] = useState<AddressInput>(emptyForm);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [remember, setRemember] = useState(true);
  const [payment, setPayment] = useState<PaymentMethod>('COD');
  const [trxId, setTrxId] = useState('');
  const [promoInput, setPromoInput] = useState('');
  const [promoCode, setPromoCode] = useState<string | undefined>();
  const [errors, setErrors] = useState<Errors>({});
  const placed = useRef(false);

  // Start from the default saved address.
  const prefilled = useRef(false);
  useEffect(() => {
    if (!prefilled.current && addresses.data) {
      prefilled.current = true;
      const def = addresses.data.find(a => a.isDefault) ?? addresses.data[0];
      if (def) {
        setForm(fromAddress(def));
        setSelectedId(def.id);
      } else if (user) {
        setForm(f => ({ ...f, fullName: user.name, phone: user.phone }));
      }
    }
  }, [addresses.data, user]);

  // Nothing to check out if the bag was emptied.
  useEffect(() => {
    if (cart.items.length === 0 && !placed.current) {
      navigation.goBack();
    }
  }, [cart.items.length, navigation]);

  const lines = useMemo(
    () =>
      cart.items.map(i => ({ productId: i.productId, quantity: i.quantity })),
    [cart.items],
  );
  const quote = useQuote(lines, form.area, promoCode);
  const q = quote.data;

  // Keep the bag's stored prices in line with the server.
  const { sync } = cart;
  useEffect(() => {
    if (q) {
      sync(q.lines);
    }
  }, [q, sync]);

  const set = (key: keyof AddressInput) => (value: string) => {
    setSelectedId(null);
    setForm(f => ({ ...f, [key]: value }));
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
    if (payment === 'BKASH' && !/^[A-Za-z0-9]{8,12}$/.test(trxId.trim())) {
      e.trxId = 'Enter the 8–12 character Transaction ID from your bKash SMS.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate() || !q) {
      return;
    }
    placeOrder.mutate(
      {
        items: lines,
        address: {
          ...form,
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          city: form.city.trim(),
          line: form.line.trim(),
          note: form.note?.trim() || undefined,
        },
        saveAddress: remember && !selectedId,
        paymentMethod: payment,
        bkashTrxId: payment === 'BKASH' ? trxId.trim() : undefined,
        promoCode: q.promo?.code,
      },
      {
        onSuccess: order => {
          placed.current = true;
          cart.clear();
          navigation.replace('OrderSuccess', { orderId: order.id });
        },
        onError: e => {
          Alert.alert('Could not place order', errorMessage(e));
          quote.refetch();
        },
      },
    );
  };

  const areaChip = (area: DeliveryArea, label: string, fee?: number) => {
    const active = form.area === area;
    return (
      <Pressable
        onPress={() => set('area')(area)}
        style={[styles.areaChip, active && styles.areaChipActive]}
      >
        <Text style={[styles.areaTitle, active && styles.onGold]}>{label}</Text>
        <Text style={[styles.areaFee, active && styles.onGold]}>
          {fee !== undefined ? formatPrice(fee) : '…'} ·{' '}
          {area === 'INSIDE_DHAKA' ? '1–3' : '3–5'} days
        </Text>
      </Pressable>
    );
  };

  const blocked = !q || q.errors.length > 0;

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
          {!!addresses.data?.length && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.saved}
            >
              {addresses.data.map(a => {
                const active = a.id === selectedId;
                return (
                  <Pressable
                    key={a.id}
                    onPress={() => {
                      setForm(fromAddress(a));
                      setSelectedId(a.id);
                      setErrors({});
                    }}
                    style={[styles.savedCard, active && styles.savedActive]}
                  >
                    <Text style={styles.savedName} numberOfLines={1}>
                      {a.fullName}
                    </Text>
                    <Text style={styles.savedLine} numberOfLines={2}>
                      {a.line}, {a.city}
                    </Text>
                  </Pressable>
                );
              })}
              <Pressable
                onPress={() => {
                  setForm(f => ({
                    ...emptyForm,
                    fullName: f.fullName,
                    phone: f.phone,
                  }));
                  setSelectedId(null);
                }}
                style={[styles.savedCard, styles.newCard]}
              >
                <Icon name="plus" size={20} />
                <Text style={styles.savedLine}>New address</Text>
              </Pressable>
            </ScrollView>
          )}
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
            {areaChip(
              'INSIDE_DHAKA',
              'Inside Dhaka',
              settings.data?.deliveryInside,
            )}
            {areaChip(
              'OUTSIDE_DHAKA',
              'Outside Dhaka',
              settings.data?.deliveryOutside,
            )}
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
            value={form.note ?? ''}
            onChangeText={set('note')}
            placeholder="e.g. Please call before delivery"
          />
          {!selectedId && (
            <View style={styles.rememberRow}>
              <Text style={styles.rememberText}>Save this address</Text>
              <Switch
                value={remember}
                onValueChange={setRemember}
                trackColor={{ true: colors.gold, false: colors.border }}
                thumbColor={colors.white}
              />
            </View>
          )}

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
          {payment === 'BKASH' && (
            <Card style={styles.bkash}>
              <Text style={styles.bkashStep}>
                1. Open bKash and choose{' '}
                <Text style={styles.bold}>Send Money</Text>
              </Text>
              <Text style={styles.bkashStep}>
                2. Send{' '}
                <Text style={styles.bold}>
                  {q ? formatPrice(q.total) : '…'}
                </Text>{' '}
                to{' '}
                <Text style={styles.bold}>
                  {settings.data?.bkashNumber ?? '…'}
                </Text>
              </Text>
              <Text style={styles.bkashStep}>
                3. Enter the Transaction ID from your bKash SMS below
              </Text>
              <Field
                label="Transaction ID"
                value={trxId}
                onChangeText={setTrxId}
                placeholder="e.g. 9A7B6C5D4E"
                autoCapitalize="characters"
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
            {promoCode ? (
              <Pressable
                onPress={() => {
                  setPromoCode(undefined);
                  setPromoInput('');
                }}
                style={[styles.applyBtn, styles.removeBtn]}
              >
                <Text style={styles.removeText}>Remove</Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={() =>
                  promoInput.trim() &&
                  setPromoCode(promoInput.trim().toUpperCase())
                }
                style={styles.applyBtn}
              >
                <Text style={styles.applyText}>Apply</Text>
              </Pressable>
            )}
          </View>
          {q?.promo && (
            <Text style={styles.promoOk}>
              ✓ {q.promo.code} applied — {q.promo.description}
            </Text>
          )}
          {!!promoCode && q?.promoError && (
            <Text style={styles.promoErr}>{q.promoError}</Text>
          )}

          <SectionTitle>Order summary</SectionTitle>
          <Card>
            {quote.isLoading && !q ? (
              <ActivityIndicator color={colors.gold} style={styles.loading} />
            ) : quote.error && !q ? (
              <Text style={styles.promoErr}>{errorMessage(quote.error)}</Text>
            ) : q ? (
              <>
                {q.lines.map(l => (
                  <View key={l.productId} style={styles.line}>
                    <ProductThumb source={l.imageUrl} width={44} height={50} />
                    <View style={styles.flex}>
                      <Text style={styles.lineName} numberOfLines={1}>
                        {l.name} {l.subtitle}
                      </Text>
                      <Text
                        style={[styles.lineQty, !l.available && styles.lineBad]}
                      >
                        {l.available
                          ? `${l.quantity} × ${formatPrice(l.price)}`
                          : l.stock > 0
                          ? `Only ${l.stock} left — reduce quantity in your bag`
                          : 'Out of stock — remove from your bag'}
                      </Text>
                    </View>
                    <Text style={styles.lineTotal}>
                      {formatPrice(l.lineTotal)}
                    </Text>
                  </View>
                ))}
                <View style={styles.divider} />
                <SummaryRow label="Subtotal" value={formatPrice(q.subtotal)} />
                <SummaryRow
                  label={`Delivery (${
                    form.area === 'INSIDE_DHAKA' ? 'Inside' : 'Outside'
                  } Dhaka)`}
                  value={q.deliveryFee ? formatPrice(q.deliveryFee) : 'Free'}
                  accent={!q.deliveryFee}
                />
                {q.discount > 0 && (
                  <SummaryRow
                    label={`Discount (${q.promo?.code})`}
                    value={`− ${formatPrice(q.discount)}`}
                    accent
                  />
                )}
                <View style={styles.divider} />
                <SummaryRow label="Total" value={formatPrice(q.total)} strong />
              </>
            ) : null}
          </Card>
          {!!q?.errors.length && (
            <View style={styles.errorBox}>
              {q.errors.map(e => (
                <Text key={e} style={styles.errorText}>
                  • {e}
                </Text>
              ))}
            </View>
          )}
        </ScrollView>

        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom, 12) },
          ]}
        >
          <GoldButton
            title={
              placeOrder.isPending
                ? 'Placing order…'
                : `Place Order · ${q ? formatPrice(q.total) : '…'}`
            }
            onPress={submit}
            disabled={blocked || placeOrder.isPending}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 24 },
  loading: { marginVertical: 20 },
  saved: { gap: 10, paddingBottom: 14 },
  savedCard: {
    width: 170,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  savedActive: { borderColor: colors.gold, backgroundColor: '#FBF0E2' },
  newCard: {
    width: 110,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  savedName: { fontSize: 14, fontWeight: '600', color: colors.text },
  savedLine: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
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
  removeBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  removeText: { color: colors.price, fontWeight: '600' },
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
  lineBad: { color: colors.price },
  lineTotal: { fontSize: 14, fontWeight: '600', color: colors.text },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: 10,
  },
  errorBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F8E0E2',
  },
  errorText: { color: colors.price, fontSize: 13, lineHeight: 19 },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
});

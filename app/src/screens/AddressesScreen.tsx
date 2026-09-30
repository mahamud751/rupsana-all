import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Icon from '../components/Icon';
import {
  EmptyState,
  ErrorView,
  Field,
  GoldButton,
  LoadingView,
  Screen,
  StackHeader,
} from '../components/ui';
import { useAddresses, useDeleteAddress, useSaveAddress } from '../api/hooks';
import { errorMessage } from '../api/client';
import { Address, AddressInput, DeliveryArea } from '../api/types';
import { colors } from '../theme';
import { isValidPhone } from '../utils';

type Editing = { id?: string; form: AddressInput } | null;

export default function AddressesScreen() {
  const addresses = useAddresses();
  const save = useSaveAddress();
  const remove = useDeleteAddress();
  const [editing, setEditing] = useState<Editing>(null);

  if (editing) {
    return (
      <AddressForm
        initial={editing}
        busy={save.isPending}
        onCancel={() => setEditing(null)}
        onSave={form =>
          save.mutate(
            { id: editing.id, ...form },
            {
              onSuccess: () => setEditing(null),
              onError: e => Alert.alert('Could not save', errorMessage(e)),
            },
          )
        }
      />
    );
  }

  const confirmDelete = (a: Address) =>
    Alert.alert('Delete this address?', `${a.line}, ${a.city}`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => remove.mutate(a.id),
      },
    ]);

  const newAddress = () =>
    setEditing({
      form: {
        fullName: '',
        phone: '',
        area: 'INSIDE_DHAKA',
        city: 'Dhaka',
        line: '',
        note: '',
      },
    });

  return (
    <Screen>
      <StackHeader
        title="Saved Addresses"
        right={
          <Pressable hitSlop={8} onPress={newAddress}>
            <Icon name="plus" size={24} color={colors.brown} strokeWidth={2} />
          </Pressable>
        }
      />
      {addresses.isLoading ? (
        <LoadingView />
      ) : addresses.error ? (
        <ErrorView
          message={errorMessage(addresses.error)}
          onRetry={() => addresses.refetch()}
        />
      ) : (
        <FlatList
          data={addresses.data}
          keyExtractor={a => a.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState
              icon="pin"
              title="No saved addresses"
              text="Add an address for faster checkout."
              action="Add Address"
              onAction={newAddress}
            />
          }
          renderItem={({ item }) => (
            <View style={[styles.card, item.isDefault && styles.cardDefault]}>
              <View style={styles.row}>
                <Text style={styles.name}>{item.fullName}</Text>
                {item.isDefault && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>Default</Text>
                  </View>
                )}
              </View>
              <Text style={styles.addr}>{item.phone}</Text>
              <Text style={styles.addr}>
                {item.line}, {item.city} ·{' '}
                {item.area === 'INSIDE_DHAKA'
                  ? 'Inside Dhaka'
                  : 'Outside Dhaka'}
              </Text>
              <View style={styles.actions}>
                {!item.isDefault && (
                  <Pressable
                    hitSlop={6}
                    onPress={() =>
                      save.mutate({ id: item.id, isDefault: true })
                    }
                  >
                    <Text style={styles.action}>Make default</Text>
                  </Pressable>
                )}
                <Pressable
                  hitSlop={6}
                  onPress={() =>
                    setEditing({
                      id: item.id,
                      form: {
                        fullName: item.fullName,
                        phone: item.phone,
                        area: item.area,
                        city: item.city,
                        line: item.line,
                        note: item.note ?? '',
                      },
                    })
                  }
                >
                  <Text style={styles.action}>Edit</Text>
                </Pressable>
                <Pressable hitSlop={6} onPress={() => confirmDelete(item)}>
                  <Text style={[styles.action, styles.danger]}>Delete</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      )}
    </Screen>
  );
}

function AddressForm({
  initial,
  busy,
  onSave,
  onCancel,
}: {
  initial: NonNullable<Editing>;
  busy: boolean;
  onSave: (form: AddressInput) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(initial.form);
  const [errors, setErrors] = useState<
    Partial<Record<keyof AddressInput, string>>
  >({});
  const set = (key: keyof AddressInput) => (value: string) =>
    setForm(f => ({ ...f, [key]: value }));

  const submit = () => {
    const e: typeof errors = {};
    if (form.fullName.trim().length < 2) e.fullName = 'Please enter a name.';
    if (!isValidPhone(form.phone)) e.phone = 'Enter a valid mobile number.';
    if (form.city.trim().length < 2)
      e.city = 'Please enter the city or district.';
    if (form.line.trim().length < 6) e.line = 'Please enter the full address.';
    setErrors(e);
    if (Object.keys(e).length === 0) {
      onSave({
        ...form,
        fullName: form.fullName.trim(),
        city: form.city.trim(),
        line: form.line.trim(),
        note: form.note?.trim() || undefined,
      });
    }
  };

  const area = (value: DeliveryArea, label: string) => (
    <Pressable
      onPress={() => setForm(f => ({ ...f, area: value }))}
      style={[styles.areaChip, form.area === value && styles.areaActive]}
    >
      <Text style={[styles.areaText, form.area === value && styles.onGold]}>
        {label}
      </Text>
    </Pressable>
  );

  return (
    <Screen>
      <StackHeader
        title={initial.id ? 'Edit Address' : 'New Address'}
        icon="close"
        onBack={onCancel}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          <Field
            label="Full name"
            value={form.fullName}
            onChangeText={set('fullName')}
            autoCapitalize="words"
            error={errors.fullName}
          />
          <Field
            label="Mobile number"
            value={form.phone}
            onChangeText={set('phone')}
            keyboardType="phone-pad"
            placeholder="01XXXXXXXXX"
            error={errors.phone}
          />
          <Text style={styles.label}>Delivery area</Text>
          <View style={styles.areaRow}>
            {area('INSIDE_DHAKA', 'Inside Dhaka')}
            {area('OUTSIDE_DHAKA', 'Outside Dhaka')}
          </View>
          <Field
            label="City / District"
            value={form.city}
            onChangeText={set('city')}
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
            label="Note (optional)"
            value={form.note ?? ''}
            onChangeText={set('note')}
          />
          <GoldButton
            title={busy ? 'Saving…' : 'Save Address'}
            onPress={submit}
            disabled={busy}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: 16, gap: 10, flexGrow: 1 },
  form: { padding: 16, paddingBottom: 40 },
  card: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cardDefault: { borderColor: colors.goldLight },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontSize: 15, fontWeight: '600', color: colors.text },
  badge: {
    backgroundColor: colors.blush,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: { fontSize: 11, color: colors.brown, fontWeight: '600' },
  addr: { fontSize: 13.5, color: colors.brownSoft, marginTop: 3 },
  actions: { flexDirection: 'row', gap: 18, marginTop: 12 },
  action: { color: colors.gold, fontWeight: '600', fontSize: 13.5 },
  danger: { color: colors.price },
  label: {
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
    alignItems: 'center',
  },
  areaActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  areaText: { fontSize: 14, fontWeight: '600', color: colors.text },
  onGold: { color: colors.white },
});

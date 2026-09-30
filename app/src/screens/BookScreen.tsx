import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Icon from '../components/Icon';
import ScreenTitle from '../components/ScreenTitle';
import {
  ErrorView,
  Field,
  GoldButton,
  LoadingView,
  Screen,
} from '../components/ui';
import {
  useAppointments,
  useAvailability,
  useBookAppointment,
  useRequireAuth,
  useServices,
} from '../api/hooks';
import { errorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { TabScreenProps } from '../navigation/types';
import { colors, fonts, formatPrice } from '../theme';
import { isValidPhone, toDateKey } from '../utils';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function nextDays(count: number) {
  const today = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i + 1);
    return d;
  });
}

export default function BookScreen({ navigation }: TabScreenProps<'Book'>) {
  const { user } = useAuth();
  const requireAuth = useRequireAuth();
  const days = useMemo(() => nextDays(21), []);
  const services = useServices();
  const appointments = useAppointments();
  const book = useBookAppointment();

  const [serviceId, setServiceId] = useState<string | null>(null);
  const [dayIndex, setDayIndex] = useState(0);
  const [slot, setSlot] = useState<string | null>(null);
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [note, setNote] = useState('');

  const day = days[dayIndex];
  const dateKey = toDateKey(day);
  const availability = useAvailability(dateKey);

  // Prefill contact details once the user signs in.
  useEffect(() => {
    if (user) {
      setName(n => n || user.name);
      setPhone(p => p || user.phone);
    }
  }, [user]);

  // Default to the first service.
  useEffect(() => {
    if (!serviceId && services.data?.length) {
      setServiceId(services.data[0].id);
    }
  }, [serviceId, services.data]);

  // A new day has different free slots.
  useEffect(() => setSlot(null), [dateKey]);

  const service = services.data?.find(s => s.id === serviceId);
  const upcoming =
    appointments.data?.filter(
      a => a.status === 'REQUESTED' || a.status === 'CONFIRMED',
    ).length ?? 0;
  const canBook =
    !!service && !!slot && name.trim().length > 1 && isValidPhone(phone);

  const confirm = () =>
    requireAuth(() => {
      if (!service || !slot) {
        return;
      }
      book.mutate(
        {
          serviceId: service.id,
          date: dateKey,
          slot,
          name: name.trim(),
          phone: phone.trim(),
          note: note.trim() || undefined,
        },
        {
          onSuccess: () => {
            setSlot(null);
            setNote('');
            Alert.alert(
              'Appointment requested',
              `${service.name} on ${
                DAY_NAMES[day.getDay()]
              }, ${day.getDate()} ${
                MONTHS[day.getMonth()]
              } at ${slot}.\n\nOur team will call ${phone.trim()} to confirm.`,
              [
                { text: 'OK' },
                {
                  text: 'View appointments',
                  onPress: () => navigation.navigate('Appointments'),
                },
              ],
            );
          },
          onError: e => Alert.alert('Could not book', errorMessage(e)),
        },
      );
    });

  if (services.isLoading) {
    return (
      <Screen>
        <LoadingView />
      </Screen>
    );
  }
  if (services.error) {
    return (
      <Screen>
        <ErrorView
          message={errorMessage(services.error)}
          onRetry={() => services.refetch()}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          <ScreenTitle
            title="Book Appointment"
            subtitle="Expert consultation, professional makeup & complete bridal styling at our salon."
          />

          {upcoming > 0 && (
            <Pressable
              onPress={() => navigation.navigate('Appointments')}
              style={styles.myBookings}
            >
              <Icon name="calendar" size={18} />
              <Text style={styles.myBookingsText}>
                You have {upcoming} upcoming{' '}
                {upcoming === 1 ? 'appointment' : 'appointments'}
              </Text>
              <Icon name="chevronRight" size={16} />
            </Pressable>
          )}

          <Text style={styles.label}>Choose a service</Text>
          {services.data?.map(s => {
            const active = s.id === serviceId;
            return (
              <Pressable
                key={s.id}
                onPress={() => setServiceId(s.id)}
                style={[styles.service, active && styles.serviceActive]}
              >
                <View style={[styles.radio, active && styles.radioActive]}>
                  {active && <View style={styles.radioDot} />}
                </View>
                <View style={styles.flex}>
                  <Text style={styles.serviceName}>{s.name}</Text>
                  <View style={styles.row}>
                    <Icon name="clock" size={13} color={colors.textMuted} />
                    <Text style={styles.muted}>{s.durationLabel}</Text>
                  </View>
                </View>
                <Text style={styles.servicePrice}>
                  {s.price ? formatPrice(s.price) : 'Free'}
                </Text>
              </Pressable>
            );
          })}

          <Text style={styles.label}>Pick a date</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.days}
          >
            {days.map((d, i) => {
              const active = i === dayIndex;
              return (
                <Pressable
                  key={d.toDateString()}
                  onPress={() => setDayIndex(i)}
                  style={[styles.day, active && styles.dayActive]}
                >
                  <Text style={[styles.dayName, active && styles.onGold]}>
                    {DAY_NAMES[d.getDay()]}
                  </Text>
                  <Text style={[styles.dayNum, active && styles.onGold]}>
                    {d.getDate()}
                  </Text>
                  <Text style={[styles.dayName, active && styles.onGold]}>
                    {MONTHS[d.getMonth()]}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Text style={styles.label}>Pick a time</Text>
          {availability.isLoading ? (
            <ActivityIndicator color={colors.gold} style={styles.slotLoading} />
          ) : availability.error ? (
            <Text style={styles.phoneError}>
              {errorMessage(availability.error)}
            </Text>
          ) : (
            <View style={styles.slots}>
              {availability.data?.slots.map(s => {
                const active = s.slot === slot;
                return (
                  <Pressable
                    key={s.slot}
                    disabled={!s.available}
                    onPress={() => setSlot(s.slot)}
                    style={[
                      styles.slot,
                      active && styles.dayActive,
                      !s.available && styles.slotFull,
                    ]}
                  >
                    <Text
                      style={[
                        styles.slotText,
                        active && styles.onGold,
                        !s.available && styles.slotFullText,
                      ]}
                    >
                      {s.slot}
                    </Text>
                    {!s.available && <Text style={styles.fullLabel}>Full</Text>}
                  </Pressable>
                );
              })}
            </View>
          )}

          <Text style={styles.label}>Your details</Text>
          <Field
            label="Full name"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Nusrat Jahan"
            autoCapitalize="words"
          />
          <Field
            label="Mobile number"
            value={phone}
            onChangeText={setPhone}
            placeholder="01XXXXXXXXX"
            keyboardType="phone-pad"
            error={
              phone.length >= 11 && !isValidPhone(phone)
                ? 'Enter a valid mobile number, e.g. 017XXXXXXXX'
                : undefined
            }
          />
          <Field
            label="Note (optional)"
            value={note}
            onChangeText={setNote}
            placeholder="e.g. Wedding date, look you want"
            multiline
          />

          <GoldButton
            title={
              book.isPending
                ? 'Booking…'
                : user
                ? 'Request Appointment'
                : 'Sign in to Book'
            }
            icon="calendar"
            disabled={(!canBook && !!user) || book.isPending}
            onPress={confirm}
            style={styles.cta}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingBottom: 28 },
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  myBookings: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.tile,
  },
  myBookingsText: { flex: 1, color: colors.brown, fontSize: 13.5 },
  phoneError: { color: colors.price, fontSize: 12, marginBottom: 6 },
  label: {
    fontFamily: fonts.serifMedium,
    fontSize: 18,
    color: colors.brown,
    marginTop: 18,
    marginBottom: 10,
  },
  service: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: 8,
  },
  serviceActive: { borderColor: colors.gold, backgroundColor: '#FBF0E2' },
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
  serviceName: { fontSize: 15, color: colors.text, fontWeight: '500' },
  servicePrice: { fontSize: 14, color: colors.price, fontWeight: '700' },
  muted: { fontSize: 12, color: colors.textMuted },
  days: { gap: 8 },
  day: {
    width: 62,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  dayActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  dayName: { fontSize: 11, color: colors.textMuted },
  dayNum: {
    fontFamily: fonts.serifSemiBold,
    fontSize: 22,
    color: colors.brown,
    marginVertical: 2,
  },
  onGold: { color: colors.white },
  slotLoading: { marginVertical: 20 },
  slots: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slot: {
    width: '31.5%',
    paddingVertical: 11,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  slotFull: { backgroundColor: colors.tile, borderColor: colors.tile },
  slotText: { fontSize: 13, color: colors.text },
  slotFullText: { color: colors.textMuted, textDecorationLine: 'line-through' },
  fullLabel: { fontSize: 10, color: colors.textMuted, marginTop: 2 },
  cta: { marginTop: 10 },
});

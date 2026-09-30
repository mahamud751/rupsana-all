import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from '../components/Icon';
import ScreenTitle from '../components/ScreenTitle';
import { Screen } from '../components/ui';
import { useStore } from '../context/StoreContext';
import { TabScreenProps } from '../navigation/types';
import { isValidPhone } from '../utils';
import { bridalServices, timeSlots } from '../data';
import { colors, fonts, formatPrice } from '../theme';

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
  const { profile, addAppointment, appointments } = useStore();
  const days = useMemo(() => nextDays(14), []);
  const [serviceId, setServiceId] = useState(bridalServices[0].id);
  const [dayIndex, setDayIndex] = useState(0);
  const [slot, setSlot] = useState<string | null>(null);
  const [name, setName] = useState(profile?.name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');

  const service = bridalServices.find(s => s.id === serviceId)!;
  const day = days[dayIndex];
  const canBook = !!slot && name.trim().length > 1 && isValidPhone(phone);
  const upcoming = appointments.filter(a => a.status === 'requested').length;

  const confirm = () => {
    if (!slot) {
      return;
    }
    addAppointment({
      serviceName: service.name,
      price: service.price,
      date: day.toISOString(),
      slot,
      name: name.trim(),
      phone: phone.trim(),
    });
    setSlot(null);
    Alert.alert(
      'Appointment requested',
      `${service.name} on ${DAY_NAMES[day.getDay()]}, ${day.getDate()} ${
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
  };

  return (
    <Screen>
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
        {bridalServices.map(s => {
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
                  <Text style={styles.muted}>{s.duration}</Text>
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
        <View style={styles.slots}>
          {timeSlots.map(t => {
            const active = t === slot;
            return (
              <Pressable
                key={t}
                onPress={() => setSlot(t)}
                style={[styles.slot, active && styles.dayActive]}
              >
                <Text style={[styles.slotText, active && styles.onGold]}>
                  {t}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Your details</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Full name"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="Phone (01XXXXXXXXX)"
          placeholderTextColor={colors.textMuted}
          keyboardType="phone-pad"
          style={styles.input}
        />
        {phone.length >= 11 && !isValidPhone(phone) && (
          <Text style={styles.phoneError}>
            Enter a valid mobile number, e.g. 017XXXXXXXX
          </Text>
        )}

        <Pressable disabled={!canBook} onPress={confirm}>
          <LinearGradient
            colors={canBook ? ['#C99A4E', '#A97A33'] : ['#DCC9AE', '#D2BD9F']}
            style={styles.cta}
          >
            <Icon name="calendar" size={20} color={colors.white} />
            <Text style={styles.ctaText}>Request Appointment</Text>
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingBottom: 28 },
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
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
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
  slotText: { fontSize: 13, color: colors.text },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.text,
    marginBottom: 10,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 26,
    marginTop: 10,
  },
  ctaText: { color: colors.white, fontSize: 16, fontWeight: '600' },
});

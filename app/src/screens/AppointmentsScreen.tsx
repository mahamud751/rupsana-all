import React from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Icon from '../components/Icon';
import { EmptyState, Screen, StackHeader, StatusPill } from '../components/ui';
import { useStore } from '../context/StoreContext';
import { RootScreenProps } from '../navigation/types';
import { colors, fonts, formatPrice } from '../theme';
import { formatDay } from '../utils';

export default function AppointmentsScreen({
  navigation,
}: RootScreenProps<'Appointments'>) {
  const { appointments, cancelAppointment } = useStore();

  const confirmCancel = (id: string) =>
    Alert.alert('Cancel appointment?', 'You can always book again later.', [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Cancel appointment',
        style: 'destructive',
        onPress: () => cancelAppointment(id),
      },
    ]);

  return (
    <Screen>
      <StackHeader title="My Appointments" />
      <FlatList
        data={appointments}
        keyExtractor={a => a.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="calendar"
            title="No appointments yet"
            text="Book a bridal makeup, hair styling or consultation session at our salon."
            action="Book Appointment"
            onAction={() => navigation.navigate('Tabs', { screen: 'Book' })}
          />
        }
        renderItem={({ item }) => {
          const d = new Date(item.date);
          return (
            <View style={styles.card}>
              <View style={styles.dateBox}>
                <Text style={styles.dateDay}>{d.getDate()}</Text>
                <Text style={styles.dateMon}>
                  {d.toLocaleString('en-US', { month: 'short' })}
                </Text>
              </View>
              <View style={styles.flex}>
                <Text style={styles.service}>{item.serviceName}</Text>
                <View style={styles.row}>
                  <Icon name="clock" size={13} color={colors.textMuted} />
                  <Text style={styles.meta}>
                    {formatDay(item.date)} · {item.slot}
                  </Text>
                </View>
                <Text style={styles.meta}>
                  {item.price ? formatPrice(item.price) : 'Free consultation'}
                </Text>
                <View style={styles.footer}>
                  <StatusPill status={item.status} />
                  {item.status === 'requested' && (
                    <Pressable
                      hitSlop={8}
                      onPress={() => confirmCancel(item.id)}
                    >
                      <Text style={styles.cancel}>Cancel</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            </View>
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
    flexDirection: 'row',
    gap: 14,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  dateBox: {
    width: 58,
    height: 64,
    borderRadius: 14,
    backgroundColor: colors.blush,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateDay: {
    fontFamily: fonts.serifSemiBold,
    fontSize: 24,
    color: colors.brown,
  },
  dateMon: { fontSize: 12, color: colors.brownSoft },
  service: { fontSize: 15.5, fontWeight: '600', color: colors.text },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  meta: { fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancel: { color: colors.price, fontWeight: '600', fontSize: 13 },
});

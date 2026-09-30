import React from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Icon from '../components/Icon';
import {
  EmptyState,
  ErrorView,
  LoadingView,
  Screen,
  StackHeader,
  StatusPill,
} from '../components/ui';
import { useAppointments, useCancelAppointment } from '../api/hooks';
import { errorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { RootScreenProps } from '../navigation/types';
import { colors, fonts, formatPrice } from '../theme';
import { formatDay } from '../utils';

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

export default function AppointmentsScreen({
  navigation,
}: RootScreenProps<'Appointments'>) {
  const { user } = useAuth();
  const appointments = useAppointments();
  const cancel = useCancelAppointment();

  const confirmCancel = (id: string) =>
    Alert.alert('Cancel appointment?', 'You can always book again later.', [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Cancel appointment',
        style: 'destructive',
        onPress: () =>
          cancel.mutate(id, {
            onError: e => Alert.alert('Could not cancel', errorMessage(e)),
          }),
      },
    ]);

  return (
    <Screen>
      <StackHeader title="My Appointments" />
      {!user ? (
        <EmptyState
          icon="user"
          title="Sign in to see your appointments"
          text="Your bookings are saved to your account."
          action="Sign In"
          onAction={() => navigation.navigate('SignIn')}
        />
      ) : appointments.isLoading ? (
        <LoadingView />
      ) : appointments.error ? (
        <ErrorView
          message={errorMessage(appointments.error)}
          onRetry={() => appointments.refetch()}
        />
      ) : (
        <FlatList
          data={appointments.data}
          keyExtractor={a => a.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={appointments.isRefetching}
              onRefresh={() => {
                appointments.refetch();
              }}
              tintColor={colors.gold}
              colors={[colors.gold]}
            />
          }
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
            const active =
              item.status === 'REQUESTED' || item.status === 'CONFIRMED';
            return (
              <View style={styles.card}>
                <View style={styles.dateBox}>
                  <Text style={styles.dateDay}>{d.getUTCDate()}</Text>
                  <Text style={styles.dateMon}>{MONTHS[d.getUTCMonth()]}</Text>
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
                    {active && (
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
      )}
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

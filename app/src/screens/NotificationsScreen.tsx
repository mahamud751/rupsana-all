import React, { useEffect } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import Icon from '../components/Icon';
import { EmptyState, Screen, StackHeader } from '../components/ui';
import { useStore } from '../context/StoreContext';
import { colors } from '../theme';
import { formatDateTime } from '../utils';

export default function NotificationsScreen() {
  const { notices, markNoticesRead } = useStore();
  // Snapshot which ones were unread when the screen opened, for highlighting.
  const [unread] = React.useState(
    () => new Set(notices.filter(n => !n.read).map(n => n.id)),
  );

  useEffect(() => {
    markNoticesRead();
    // Only on open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Screen>
      <StackHeader title="Notifications" />
      <FlatList
        data={notices}
        keyExtractor={n => n.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="bell"
            title="No notifications"
            text="Order updates and offers will appear here."
          />
        }
        renderItem={({ item }) => (
          <View style={[styles.card, unread.has(item.id) && styles.unread]}>
            <View style={styles.icon}>
              <Icon name="bell" size={20} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
              <Text style={styles.time}>{formatDateTime(item.createdAt)}</Text>
            </View>
            {unread.has(item.id) && <View style={styles.dot} />}
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: 16, gap: 10, flexGrow: 1 },
  card: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  unread: { backgroundColor: '#FBF0E2', borderColor: colors.goldLight },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.tile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 15, fontWeight: '600', color: colors.text },
  body: {
    fontSize: 13.5,
    color: colors.brownSoft,
    marginTop: 3,
    lineHeight: 19,
  },
  time: { fontSize: 11.5, color: colors.textMuted, marginTop: 6 },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.rose,
    marginTop: 4,
  },
});

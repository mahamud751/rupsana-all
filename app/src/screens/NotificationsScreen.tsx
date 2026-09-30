import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import Icon from '../components/Icon';
import {
  EmptyState,
  ErrorView,
  LoadingView,
  Screen,
  StackHeader,
} from '../components/ui';
import { useMarkNoticesRead, useNotifications } from '../api/hooks';
import { errorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { RootScreenProps } from '../navigation/types';
import { colors } from '../theme';
import { formatDateTime } from '../utils';

export default function NotificationsScreen({
  navigation,
}: RootScreenProps<'Notifications'>) {
  const { user } = useAuth();
  const notices = useNotifications();
  const markRead = useMarkNoticesRead();
  // Remember which were unread when the screen opened, for highlighting.
  const [unread, setUnread] = useState<Set<string> | null>(null);

  const { mutate } = markRead;
  useEffect(() => {
    if (notices.data && unread === null) {
      const ids = notices.data.filter(n => !n.read).map(n => n.id);
      setUnread(new Set(ids));
      if (ids.length) {
        mutate();
      }
    }
  }, [notices.data, unread, mutate]);

  return (
    <Screen>
      <StackHeader title="Notifications" />
      {!user ? (
        <EmptyState
          icon="bell"
          title="Sign in for updates"
          text="Order updates, appointment confirmations and offers appear here."
          action="Sign In"
          onAction={() => navigation.navigate('SignIn')}
        />
      ) : notices.isLoading ? (
        <LoadingView />
      ) : notices.error ? (
        <ErrorView
          message={errorMessage(notices.error)}
          onRetry={() => notices.refetch()}
        />
      ) : (
        <FlatList
          data={notices.data}
          keyExtractor={n => n.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={notices.isRefetching}
              onRefresh={() => {
                notices.refetch();
              }}
              tintColor={colors.gold}
              colors={[colors.gold]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="bell"
              title="No notifications"
              text="Order updates and offers will appear here."
            />
          }
          renderItem={({ item }) => {
            const isNew = !!unread?.has(item.id);
            return (
              <View style={[styles.card, isNew && styles.unread]}>
                <View style={styles.icon}>
                  <Icon name="bell" size={20} />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.body}>{item.body}</Text>
                  <Text style={styles.time}>
                    {formatDateTime(item.createdAt)}
                  </Text>
                </View>
                {isNew && <View style={styles.dot} />}
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

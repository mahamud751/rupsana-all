import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Icon, { IconName } from '../components/Icon';
import Logo from '../components/Logo';
import { Screen } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useCategories, useSettings, useUnreadCount } from '../api/hooks';
import { RootScreenProps } from '../navigation/types';
import { colors, fonts } from '../theme';

export default function MenuScreen({ navigation }: RootScreenProps<'Menu'>) {
  const { user: profile } = useAuth();
  const cartCount = useCart().count;
  const unreadCount = useUnreadCount().data?.unread ?? 0;
  const categories = useCategories().data ?? [];
  const storeConfig = useSettings().data;

  const go = (fn: () => void) => () => {
    navigation.goBack();
    fn();
  };

  const items: {
    icon: IconName;
    label: string;
    badge?: number;
    onPress: () => void;
  }[] = [
    {
      icon: 'home',
      label: 'Home',
      onPress: go(() => navigation.navigate('Tabs', { screen: 'Home' })),
    },
    {
      icon: 'grid',
      label: 'All Products',
      onPress: go(() =>
        navigation.navigate('Tabs', {
          screen: 'Shop',
          params: { category: undefined },
        }),
      ),
    },
    {
      icon: 'calendar',
      label: 'Book Appointment',
      onPress: go(() => navigation.navigate('Tabs', { screen: 'Book' })),
    },
    {
      icon: 'bag',
      label: 'My Bag',
      badge: cartCount,
      onPress: go(() => navigation.navigate('Tabs', { screen: 'Bag' })),
    },
    {
      icon: 'box',
      label: 'My Orders',
      onPress: () => navigation.replace('Orders'),
    },
    {
      icon: 'clock',
      label: 'My Appointments',
      onPress: () => navigation.replace('Appointments'),
    },
    {
      icon: 'heart',
      label: 'Wishlist',
      onPress: () => navigation.replace('Wishlist'),
    },
    {
      icon: 'bell',
      label: 'Notifications',
      badge: unreadCount,
      onPress: () => navigation.replace('Notifications'),
    },
    {
      icon: 'help',
      label: 'Help & Support',
      onPress: () => navigation.replace('Help'),
    },
    {
      icon: 'info',
      label: 'About Rupsuhana',
      onPress: () => navigation.replace('About'),
    },
  ];

  return (
    <Screen>
      <View style={styles.top}>
        <Logo />
        <Pressable
          hitSlop={10}
          onPress={() => navigation.goBack()}
          style={styles.close}
        >
          <Icon name="close" size={22} color={colors.brown} strokeWidth={2} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable
          onPress={() => navigation.replace('Profile')}
          style={styles.user}
        >
          <View style={styles.avatar}>
            {profile ? (
              <Text style={styles.avatarText}>
                {profile.name.charAt(0).toUpperCase()}
              </Text>
            ) : (
              <Icon name="user" size={24} color={colors.white} />
            )}
          </View>
          <View style={styles.flex}>
            <Text style={styles.hello}>
              {profile ? `Hello, ${profile.name.split(' ')[0]}` : 'Welcome!'}
            </Text>
            <Text style={styles.sub}>
              {profile ? 'View your profile' : 'Sign in for faster checkout'}
            </Text>
          </View>
          <Icon name="chevronRight" size={18} />
        </Pressable>

        {items.map(item => (
          <Pressable
            key={item.label}
            onPress={item.onPress}
            style={styles.item}
          >
            <Icon name={item.icon} size={22} />
            <Text style={styles.label}>{item.label}</Text>
            {!!item.badge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            )}
          </Pressable>
        ))}

        <Text style={styles.section}>Shop by category</Text>
        <View style={styles.cats}>
          {categories.map(c => (
            <Pressable
              key={c.id}
              onPress={go(() =>
                navigation.navigate('Tabs', {
                  screen: 'Shop',
                  params: { category: c.slug },
                }),
              )}
              style={styles.cat}
            >
              <Text style={styles.catText}>{c.name}</Text>
            </Pressable>
          ))}
        </View>

        {storeConfig && (
          <Text style={styles.footer}>
            {storeConfig.salonHours}
            {'\n'}
            {storeConfig.phone}
          </Text>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  top: { alignItems: 'center', paddingTop: 8, paddingBottom: 8 },
  close: {
    position: 'absolute',
    right: 16,
    top: 14,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.tile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { padding: 16, paddingBottom: 40 },
  user: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: colors.blush,
    marginBottom: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fonts.serifSemiBold,
    fontSize: 22,
    color: colors.white,
  },
  hello: { fontFamily: fonts.serifMedium, fontSize: 19, color: colors.brown },
  sub: { fontSize: 12.5, color: colors.brownSoft, marginTop: 2 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 13,
    paddingHorizontal: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  label: { flex: 1, fontSize: 15.5, color: colors.text },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    backgroundColor: colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: colors.white, fontSize: 11, fontWeight: '700' },
  section: {
    fontFamily: fonts.serifMedium,
    fontSize: 18,
    color: colors.brown,
    marginTop: 22,
    marginBottom: 10,
  },
  cats: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cat: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  catText: { fontSize: 13, color: colors.brown },
  footer: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 28,
    lineHeight: 18,
  },
});

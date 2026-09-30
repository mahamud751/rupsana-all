import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Icon, { IconName } from './Icon';
import { useStore } from '../context/StoreContext';
import { colors } from '../theme';

const TABS: Record<string, { label: string; icon: IconName }> = {
  Home: { label: 'Home', icon: 'home' },
  Shop: { label: 'Shop', icon: 'shop' },
  Book: { label: 'Book', icon: 'calendar' },
  Bag: { label: 'Bag', icon: 'bag' },
};

export default function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { cartCount } = useStore();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {state.routes.map((route, index) => {
        const tab = TABS[route.name];
        const focused = state.index === index;
        const tint = focused ? colors.gold : colors.brownSoft;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            // Tapping the Shop tab always shows every category.
            navigation.navigate(
              route.name,
              route.name === 'Shop' ? { category: undefined } : undefined,
            );
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={styles.tab}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
          >
            <View>
              <Icon
                name={tab.icon}
                size={30}
                color={tint}
                filled={focused && route.name === 'Home'}
                strokeWidth={1.5}
              />
              {route.name === 'Bag' && cartCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {cartCount > 9 ? '9+' : cartCount}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.label, { color: tint }]}>{tab.label}</Text>
            <View style={[styles.underline, focused && styles.underlineOn]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  tab: { flex: 1, alignItems: 'center' },
  label: { fontSize: 13, marginTop: 2 },
  underline: {
    marginTop: 4,
    height: 2,
    width: 56,
    borderRadius: 1,
    backgroundColor: 'transparent',
  },
  underlineOn: { backgroundColor: colors.gold },
  badge: {
    position: 'absolute',
    top: -6,
    right: -9,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.background,
  },
  badgeText: { color: colors.white, fontSize: 10, fontWeight: '700' },
});

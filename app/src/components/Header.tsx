import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Icon from './Icon';
import Logo from './Logo';
import { useNavigation } from '@react-navigation/native';
import { useUnreadCount } from '../api/hooks';
import { colors } from '../theme';

export function Header() {
  const navigation = useNavigation();
  const unreadCount = useUnreadCount().data?.unread ?? 0;
  return (
    <View style={styles.header}>
      <Pressable
        hitSlop={10}
        onPress={() => navigation.navigate('Menu')}
        style={styles.side}
      >
        <Icon name="menu" size={28} strokeWidth={1.8} />
      </Pressable>
      <Logo />
      <View style={[styles.side, styles.right]}>
        <Pressable hitSlop={8} onPress={() => navigation.navigate('Wishlist')}>
          <Icon name="heart" size={27} />
        </Pressable>
        <Pressable
          hitSlop={8}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Icon name="bell" size={27} />
          {unreadCount > 0 && <View style={styles.dot} />}
        </Pressable>
      </View>
    </View>
  );
}

type SearchProps = {
  value?: string;
  onChangeText?: (text: string) => void;
  // When set, the bar is a button (e.g. on Home) rather than a text field.
  onPress?: () => void;
};

export function SearchBar({ value, onChangeText, onPress }: SearchProps) {
  return (
    <Pressable style={styles.search} onPress={onPress} disabled={!onPress}>
      <Icon name="search" size={22} color={colors.brownSoft} />
      {onPress ? (
        <Text style={[styles.input, styles.placeholder]}>
          {'Search bridal & beauty'}
        </Text>
      ) : (
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Search bridal & beauty"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          returnKeyType="search"
        />
      )}
      <Pressable hitSlop={8}>
        <Icon name="camera" size={22} color={colors.brownSoft} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 8,
  },
  side: { width: 76 },
  right: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 14,
  },
  dot: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.rose,
    borderWidth: 1.5,
    borderColor: colors.background,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: 10,
  },
  placeholder: { color: colors.textMuted },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    paddingVertical: 0,
  },
});

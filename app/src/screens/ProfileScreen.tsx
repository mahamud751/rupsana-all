import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Icon, { IconName } from '../components/Icon';
import {
  Card,
  Field,
  GoldButton,
  OutlineButton,
  Screen,
  SectionTitle,
  StackHeader,
} from '../components/ui';
import { Profile, useStore } from '../context/StoreContext';
import { RootScreenProps } from '../navigation/types';
import { colors, fonts } from '../theme';
import { isValidEmail, isValidPhone } from '../utils';

type Errors = Partial<Record<keyof Profile, string>>;

export default function ProfileScreen({
  navigation,
}: RootScreenProps<'Profile'>) {
  const {
    profile,
    address,
    orders,
    appointments,
    wishlist,
    saveProfile,
    signOut,
  } = useStore();
  const [editing, setEditing] = useState(!profile);
  const [form, setForm] = useState<Profile>(
    profile ?? { name: '', phone: '', email: '' },
  );
  const [errors, setErrors] = useState<Errors>({});

  const save = () => {
    const e: Errors = {};
    if (form.name.trim().length < 2) {
      e.name = 'Please enter your name.';
    }
    if (!isValidPhone(form.phone)) {
      e.phone = 'Enter a valid mobile number, e.g. 017XXXXXXXX.';
    }
    if (form.email.trim() && !isValidEmail(form.email)) {
      e.email = 'Enter a valid email address.';
    }
    setErrors(e);
    if (Object.keys(e).length) {
      return;
    }
    saveProfile({
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
    });
    setEditing(false);
  };

  const confirmSignOut = () =>
    Alert.alert(
      'Sign out?',
      'Your saved name, phone and address will be removed from this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out',
          style: 'destructive',
          onPress: () => {
            signOut();
            setForm({ name: '', phone: '', email: '' });
            setEditing(true);
          },
        },
      ],
    );

  if (editing) {
    return (
      <Screen>
        <StackHeader title={profile ? 'Edit Profile' : 'Sign In'} />
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            {!profile && (
              <Text style={styles.intro}>
                Add your details for faster checkout and appointment booking.
              </Text>
            )}
            <Field
              label="Full name"
              value={form.name}
              onChangeText={name => setForm(f => ({ ...f, name }))}
              placeholder="e.g. Nusrat Jahan"
              autoCapitalize="words"
              error={errors.name}
            />
            <Field
              label="Mobile number"
              value={form.phone}
              onChangeText={phone => setForm(f => ({ ...f, phone }))}
              placeholder="01XXXXXXXXX"
              keyboardType="phone-pad"
              error={errors.phone}
            />
            <Field
              label="Email (optional)"
              value={form.email}
              onChangeText={email => setForm(f => ({ ...f, email }))}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />
            <GoldButton title="Save" onPress={save} style={styles.saveBtn} />
            {profile && (
              <OutlineButton
                title="Cancel"
                onPress={() => {
                  setForm(profile);
                  setErrors({});
                  setEditing(false);
                }}
                style={styles.saveBtn}
              />
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </Screen>
    );
  }

  const links: {
    icon: IconName;
    label: string;
    count?: number;
    route: 'Orders' | 'Appointments' | 'Wishlist' | 'Help';
  }[] = [
    { icon: 'box', label: 'My Orders', count: orders.length, route: 'Orders' },
    {
      icon: 'calendar',
      label: 'My Appointments',
      count: appointments.length,
      route: 'Appointments',
    },
    {
      icon: 'heart',
      label: 'Wishlist',
      count: wishlist.length,
      route: 'Wishlist',
    },
    { icon: 'help', label: 'Help & Support', route: 'Help' },
  ];

  return (
    <Screen>
      <StackHeader
        title="My Profile"
        right={
          <Pressable hitSlop={8} onPress={() => setEditing(true)}>
            <Icon name="edit" size={22} color={colors.brown} />
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile!.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{profile!.name}</Text>
          <Text style={styles.meta}>{profile!.phone}</Text>
          {!!profile!.email && (
            <Text style={styles.meta}>{profile!.email}</Text>
          )}
        </View>

        <Card style={styles.linksCard}>
          {links.map((l, i) => (
            <Pressable
              key={l.route}
              onPress={() => navigation.navigate(l.route)}
              style={[styles.link, i < links.length - 1 && styles.linkBorder]}
            >
              <Icon name={l.icon} size={21} />
              <Text style={styles.linkText}>{l.label}</Text>
              {!!l.count && <Text style={styles.count}>{l.count}</Text>}
              <Icon name="chevronRight" size={16} color={colors.textMuted} />
            </Pressable>
          ))}
        </Card>

        <SectionTitle>Saved address</SectionTitle>
        <Card>
          {address ? (
            <>
              <Text style={styles.addrName}>{address.fullName}</Text>
              <Text style={styles.addr}>{address.phone}</Text>
              <Text style={styles.addr}>
                {address.line}, {address.city}
              </Text>
            </>
          ) : (
            <Text style={styles.addr}>
              No saved address yet. It will be saved when you check out.
            </Text>
          )}
        </Card>

        <OutlineButton
          title="Sign Out"
          icon="logout"
          danger
          onPress={confirmSignOut}
          style={styles.signOut}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  intro: {
    fontSize: 14,
    color: colors.brownSoft,
    marginBottom: 18,
    lineHeight: 20,
  },
  saveBtn: { marginTop: 10 },
  hero: { alignItems: 'center', paddingVertical: 10 },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.blush,
  },
  avatarText: {
    fontFamily: fonts.serifSemiBold,
    fontSize: 36,
    color: colors.white,
  },
  name: {
    fontFamily: fonts.serifMedium,
    fontSize: 24,
    color: colors.brown,
    marginTop: 10,
  },
  meta: { fontSize: 13.5, color: colors.textMuted, marginTop: 2 },
  linksCard: { marginTop: 16, paddingVertical: 4 },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  linkBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  linkText: { flex: 1, fontSize: 15, color: colors.text },
  count: {
    fontSize: 12,
    color: colors.brown,
    backgroundColor: colors.tile,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  addrName: { fontSize: 15, fontWeight: '600', color: colors.text },
  addr: { fontSize: 13.5, color: colors.brownSoft, marginTop: 3 },
  signOut: { marginTop: 24 },
});

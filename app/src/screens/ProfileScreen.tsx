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
  EmptyState,
  Field,
  GoldButton,
  OutlineButton,
  Screen,
  StackHeader,
} from '../components/ui';
import { useAuth } from '../context/AuthContext';
import {
  useAddresses,
  useAppointments,
  useChangePassword,
  useOrders,
  useUpdateProfile,
  useWishlist,
} from '../api/hooks';
import { errorMessage } from '../api/client';
import { RootScreenProps } from '../navigation/types';
import { colors, fonts } from '../theme';
import { isValidEmail } from '../utils';

type Mode = 'view' | 'edit' | 'password';

export default function ProfileScreen({
  navigation,
}: RootScreenProps<'Profile'>) {
  const { user, signOut } = useAuth();
  const orders = useOrders();
  const appointments = useAppointments();
  const wishlist = useWishlist();
  const addresses = useAddresses();
  const [mode, setMode] = useState<Mode>('view');

  if (!user) {
    return (
      <Screen>
        <StackHeader title="My Profile" />
        <EmptyState
          icon="user"
          title="Welcome to Rupsuhana"
          text="Sign in or create an account to check out, book appointments and track orders."
          action="Sign In"
          onAction={() => navigation.navigate('SignIn')}
        />
        <Pressable
          onPress={() => navigation.navigate('Register')}
          style={styles.registerLink}
        >
          <Text style={styles.registerText}>
            New here? <Text style={styles.bold}>Create an account</Text>
          </Text>
        </Pressable>
      </Screen>
    );
  }

  if (mode === 'edit') {
    return <EditProfile onDone={() => setMode('view')} />;
  }
  if (mode === 'password') {
    return <ChangePassword onDone={() => setMode('view')} />;
  }

  const defaultAddress =
    addresses.data?.find(a => a.isDefault) ?? addresses.data?.[0];

  const links: {
    icon: IconName;
    label: string;
    count?: number;
    onPress: () => void;
  }[] = [
    {
      icon: 'box',
      label: 'My Orders',
      count: orders.data?.length,
      onPress: () => navigation.navigate('Orders'),
    },
    {
      icon: 'calendar',
      label: 'My Appointments',
      count: appointments.data?.length,
      onPress: () => navigation.navigate('Appointments'),
    },
    {
      icon: 'heart',
      label: 'Wishlist',
      count: wishlist.data?.productIds.length,
      onPress: () => navigation.navigate('Wishlist'),
    },
    {
      icon: 'pin',
      label: 'Saved Addresses',
      count: addresses.data?.length,
      onPress: () => navigation.navigate('Addresses'),
    },
    {
      icon: 'edit',
      label: 'Change Password',
      onPress: () => setMode('password'),
    },
    {
      icon: 'help',
      label: 'Help & Support',
      onPress: () => navigation.navigate('Help'),
    },
  ];

  const confirmSignOut = () =>
    Alert.alert('Sign out?', 'You can sign in again any time.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => signOut() },
    ]);

  return (
    <Screen>
      <StackHeader
        title="My Profile"
        right={
          <Pressable hitSlop={8} onPress={() => setMode('edit')}>
            <Icon name="edit" size={22} color={colors.brown} />
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.meta}>{user.phone}</Text>
          {!!user.email && <Text style={styles.meta}>{user.email}</Text>}
        </View>

        <Card style={styles.linksCard}>
          {links.map((l, i) => (
            <Pressable
              key={l.label}
              onPress={l.onPress}
              style={[styles.link, i < links.length - 1 && styles.linkBorder]}
            >
              <Icon name={l.icon} size={21} />
              <Text style={styles.linkText}>{l.label}</Text>
              {!!l.count && <Text style={styles.count}>{l.count}</Text>}
              <Icon name="chevronRight" size={16} color={colors.textMuted} />
            </Pressable>
          ))}
        </Card>

        {defaultAddress && (
          <Card style={styles.addressCard}>
            <Text style={styles.addressLabel}>DEFAULT ADDRESS</Text>
            <Text style={styles.addrName}>{defaultAddress.fullName}</Text>
            <Text style={styles.addr}>
              {defaultAddress.line}, {defaultAddress.city}
            </Text>
          </Card>
        )}

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

function EditProfile({ onDone }: { onDone: () => void }) {
  const { user } = useAuth();
  const update = useUpdateProfile();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const save = () => {
    const e: typeof errors = {};
    if (name.trim().length < 2) e.name = 'Please enter your name.';
    if (email.trim() && !isValidEmail(email))
      e.email = 'Enter a valid email address.';
    setErrors(e);
    if (Object.keys(e).length) return;
    update.mutate(
      { name: name.trim(), email: email.trim() },
      {
        onSuccess: onDone,
        onError: err => Alert.alert('Could not save', errorMessage(err)),
      },
    );
  };

  return (
    <Screen>
      <StackHeader title="Edit Profile" icon="close" onBack={onDone} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Field
            label="Full name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            error={errors.name}
          />
          <Field
            label="Email (optional)"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />
          <Text style={styles.hint}>
            Your mobile number ({user?.phone}) is your sign-in ID and can't be
            changed here. Contact us if you need to change it.
          </Text>
          <GoldButton
            title={update.isPending ? 'Saving…' : 'Save'}
            onPress={save}
            disabled={update.isPending}
            style={styles.saveBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function ChangePassword({ onDone }: { onDone: () => void }) {
  const change = useChangePassword();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const save = () => {
    if (next.length < 6)
      return setError('New password must be at least 6 characters.');
    if (next !== confirm) return setError('New passwords do not match.');
    setError('');
    change.mutate(
      { currentPassword: current, newPassword: next },
      {
        onSuccess: () => {
          Alert.alert(
            'Password changed',
            'Use your new password next time you sign in.',
          );
          onDone();
        },
        onError: e => setError(errorMessage(e)),
      },
    );
  };

  return (
    <Screen>
      <StackHeader title="Change Password" icon="close" onBack={onDone} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Field
          label="Current password"
          value={current}
          onChangeText={setCurrent}
          secureTextEntry
          autoCapitalize="none"
        />
        <Field
          label="New password"
          value={next}
          onChangeText={setNext}
          secureTextEntry
          autoCapitalize="none"
        />
        <Field
          label="Confirm new password"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          autoCapitalize="none"
        />
        {!!error && <Text style={styles.error}>{error}</Text>}
        <GoldButton
          title={change.isPending ? 'Saving…' : 'Change Password'}
          onPress={save}
          disabled={change.isPending}
          style={styles.saveBtn}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  bold: { fontWeight: '700', color: colors.gold },
  registerLink: { alignItems: 'center', marginTop: 16 },
  registerText: { color: colors.textMuted, fontSize: 14 },
  saveBtn: { marginTop: 10 },
  hint: {
    fontSize: 12.5,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: 8,
  },
  error: { color: colors.price, fontSize: 13, marginBottom: 8 },
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
  addressCard: { marginTop: 14 },
  addressLabel: {
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.gold,
    fontWeight: '600',
    marginBottom: 6,
  },
  addrName: { fontSize: 15, fontWeight: '600', color: colors.text },
  addr: { fontSize: 13.5, color: colors.brownSoft, marginTop: 3 },
  signOut: { marginTop: 24 },
});

import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import Logo from '../components/Logo';
import { Field, GoldButton, Screen, StackHeader } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../api/client';
import { RootScreenProps } from '../navigation/types';
import { colors } from '../theme';
import { isValidPhone } from '../utils';

export default function SignInScreen({
  navigation,
}: RootScreenProps<'SignIn'>) {
  const { signIn } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!isValidPhone(phone)) {
      setError('Enter a valid mobile number, e.g. 017XXXXXXXX.');
      return;
    }
    if (!password) {
      setError('Enter your password.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await signIn(phone.trim(), password);
      navigation.goBack();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <StackHeader title="Sign In" icon="close" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Logo />
          <Text style={styles.intro}>
            Sign in to check out, book appointments and track your orders.
          </Text>
          <Field
            label="Mobile number"
            value={phone}
            onChangeText={setPhone}
            placeholder="01XXXXXXXXX"
            keyboardType="phone-pad"
          />
          <Field
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Your password"
            secureTextEntry
            autoCapitalize="none"
          />
          {!!error && <Text style={styles.error}>{error}</Text>}
          <GoldButton
            title={busy ? 'Signing in…' : 'Sign In'}
            onPress={submit}
            disabled={busy}
            style={styles.btn}
          />
          <Pressable
            onPress={() => navigation.replace('Register')}
            style={styles.link}
          >
            <Text style={styles.linkText}>
              New to Rupsuhana?{' '}
              <Text style={styles.linkBold}>Create an account</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

export const authStyles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  intro: {
    textAlign: 'center',
    color: colors.brownSoft,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
    marginBottom: 24,
  },
  error: { color: colors.price, fontSize: 13, marginBottom: 8 },
  btn: { marginTop: 8 },
  link: { alignItems: 'center', marginTop: 20, padding: 6 },
  linkText: { color: colors.textMuted, fontSize: 14 },
  linkBold: { color: colors.gold, fontWeight: '700' },
});
const styles = authStyles;

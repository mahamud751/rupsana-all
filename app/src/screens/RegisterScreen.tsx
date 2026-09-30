import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
} from 'react-native';
import Logo from '../components/Logo';
import { Field, GoldButton, Screen, StackHeader } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../api/client';
import { RootScreenProps } from '../navigation/types';
import { isValidEmail, isValidPhone } from '../utils';
import { authStyles as styles } from './SignInScreen';

type Errors = Partial<Record<'name' | 'phone' | 'email' | 'password', string>>;

export default function RegisterScreen({
  navigation,
}: RootScreenProps<'Register'>) {
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key: keyof typeof form) => (value: string) =>
    setForm(f => ({ ...f, [key]: value }));

  const submit = async () => {
    const e: Errors = {};
    if (form.name.trim().length < 2) e.name = 'Please enter your name.';
    if (!isValidPhone(form.phone))
      e.phone = 'Enter a valid mobile number, e.g. 017XXXXXXXX.';
    if (form.email.trim() && !isValidEmail(form.email))
      e.email = 'Enter a valid email address.';
    if (form.password.length < 6) e.password = 'Use at least 6 characters.';
    setErrors(e);
    if (Object.keys(e).length) return;

    setBusy(true);
    setError('');
    try {
      await register({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      navigation.goBack();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <StackHeader title="Create Account" icon="close" />
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
            Create your account for faster checkout and bridal bookings.
          </Text>
          <Field
            label="Full name"
            value={form.name}
            onChangeText={set('name')}
            placeholder="e.g. Nusrat Jahan"
            autoCapitalize="words"
            error={errors.name}
          />
          <Field
            label="Mobile number"
            value={form.phone}
            onChangeText={set('phone')}
            placeholder="01XXXXXXXXX"
            keyboardType="phone-pad"
            error={errors.phone}
          />
          <Field
            label="Email (optional)"
            value={form.email}
            onChangeText={set('email')}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />
          <Field
            label="Password"
            value={form.password}
            onChangeText={set('password')}
            placeholder="At least 6 characters"
            secureTextEntry
            autoCapitalize="none"
            error={errors.password}
          />
          {!!error && <Text style={styles.error}>{error}</Text>}
          <GoldButton
            title={busy ? 'Creating account…' : 'Create Account'}
            onPress={submit}
            disabled={busy}
            style={styles.btn}
          />
          <Pressable
            onPress={() => navigation.replace('SignIn')}
            style={styles.link}
          >
            <Text style={styles.linkText}>
              Already have an account?{' '}
              <Text style={styles.linkBold}>Sign in</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

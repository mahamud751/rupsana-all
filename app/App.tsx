/**
 * Rupsuhana — Bridal & Beauty
 *
 * @format
 */

import React from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import RootNavigator from './src/navigation/RootNavigator';
import Logo from './src/components/Logo';
import { colors } from './src/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (count, error) =>
        count < 2 && ((error as { status?: number }).status ?? 0) >= 500,
    },
  },
});

function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <StatusBar barStyle="dark-content" />
            <AppContent />
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const { ready } = useAuth();

  // Brief branded splash while the saved session is restored.
  if (!ready) {
    return (
      <View style={styles.splash}>
        <Logo />
        <ActivityIndicator color={colors.gold} style={styles.spinner} />
      </View>
    );
  }

  return <RootNavigator />;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  spinner: { marginTop: 24 },
});

export default App;

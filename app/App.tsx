/**
 * Rupsuhana — Bridal & Beauty
 *
 * @format
 */

import React from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StoreProvider, useStore } from './src/context/StoreContext';
import RootNavigator from './src/navigation/RootNavigator';
import Logo from './src/components/Logo';
import { colors } from './src/theme';

function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <StatusBar barStyle="dark-content" />
        <AppContent />
      </StoreProvider>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const { hydrated } = useStore();

  // Brief branded splash while saved data loads.
  if (!hydrated) {
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

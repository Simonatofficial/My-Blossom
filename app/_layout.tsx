import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';
import { StoreProvider } from '@/ui/StoreProvider';
import { GrowthProvider } from '@/ui/GrowthProvider';
import { SyncProvider } from '@/core/sync/SyncProvider';

/**
 * Root layout — the providers + nav frame. Order matters: Store + Theme wrap the
 * whole app so every screen reads the same world. Sync (SyncProvider) slots in
 * here later, between Store and the UI, without touching screens.
 */
function Frame() {
  const { theme } = useTheme();
  return (
    <>
      <StatusBar style={theme.barStyle} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.bg } }} />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StoreProvider>
          <GrowthProvider>
            <SyncProvider>
              <ThemeProvider>
                <Frame />
              </ThemeProvider>
            </SyncProvider>
          </GrowthProvider>
        </StoreProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

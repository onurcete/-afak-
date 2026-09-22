// app/_layout.tsx
// UI_SPEC.md: Font yükleme bitmeden ana ekran render edilmez (layout sıçramasını engeller).
// Koyu tema varsayılan deneyimdir.

import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Barlow_400Regular, Barlow_500Medium, Barlow_600SemiBold } from '@expo-google-fonts/barlow';
import { BarlowCondensed_600SemiBold, BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useAppStore } from '../lib/storage';
import { colors } from '../constants/colors';
import { initializePurchases } from '../lib/iap';

// Fontlar hazır olana kadar splash ekranını tut
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Barlow_400Regular,
    Barlow_500Medium,
    Barlow_600SemiBold,
    BarlowCondensed_600SemiBold,
    BarlowCondensed_700Bold,
  });

  const hasCompletedOnboarding = useAppStore((state) => state.hasCompletedOnboarding);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    initializePurchases();
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (!fontsLoaded) return;

    const inOnboarding = segments[0] === 'onboarding';

    if (!hasCompletedOnboarding && !inOnboarding) {
      // Kurulum tamamlanmamışsa onboarding rotasına yönlendir
      router.replace('/onboarding');
    } else if (hasCompletedOnboarding && inOnboarding) {
      // Kurulum tamamlandıysa ana sekmelere yönlendir
      router.replace('/(tabs)');
    }
  }, [fontsLoaded, hasCompletedOnboarding, segments]);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.dark.dawn} />
      </View>
    );
  }

  return (
    <View style={styles.rootContainer}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.dark.bg },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="safak-yolu"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: colors.dark.bg,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.dark.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

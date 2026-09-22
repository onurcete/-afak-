// app/(tabs)/_layout.tsx
// UI_SPEC.md: Ana sekmeler: Ana Ekran (Şafak) ve Ayarlar

import React from 'react';
import { Tabs } from 'expo-router';
import { Text, StyleSheet, View } from 'react-native';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.dark.dawn,
        tabBarInactiveTintColor: colors.dark.mut,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Şafak',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIconBadge, focused && styles.tabIconBadgeFocused]}>
              <Text style={[styles.tabIconText, { color }]}>🇹🇷</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ayarlar',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIconBadge, focused && styles.tabIconBadgeFocused]}>
              <Text style={[styles.tabIconSettings, { color }]}>⚙</Text>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.dark.bgBottom,
    borderTopColor: colors.dark.line,
    borderTopWidth: 1,
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontSize: 12,
    fontFamily: typography.fonts.body.medium,
    letterSpacing: 0.5,
  },
  tabIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconBadgeFocused: {
    backgroundColor: 'rgba(255,214,176,0.15)',
  },
  tabIconText: {
    fontSize: 18,
  },
  tabIconSettings: {
    fontSize: 18,
    fontWeight: '700',
  },
});

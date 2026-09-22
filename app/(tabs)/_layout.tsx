import React from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { useAppStore } from '../../lib/storage';
import { TabIconSafak, TabIconDiary, TabIconSettings } from '../../components/TabIcons';

export default function TabLayout() {
  const themeMode = useAppStore((state) => state.themeMode);
  const isDark = themeMode !== 'light';
  const currentColors = isDark ? colors.dark : colors.light;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: isDark ? colors.dark.bgBottom : '#FFFFFF',
            borderTopColor: currentColors.line,
          },
        ],
        tabBarActiveTintColor: isDark ? currentColors.dawn : '#0F172A',
        tabBarInactiveTintColor: currentColors.mut,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Şafak',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.tabIconBadge,
                focused && {
                  backgroundColor: isDark ? 'rgba(255,214,176,0.15)' : 'rgba(15, 23, 42, 0.08)',
                },
              ]}
            >
              <TabIconSafak color={color} focused={focused} size={22} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="diary"
        options={{
          title: 'Günlük',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.tabIconBadge,
                focused && {
                  backgroundColor: isDark ? 'rgba(255,214,176,0.15)' : 'rgba(15, 23, 42, 0.08)',
                },
              ]}
            >
              <TabIconDiary color={color} focused={focused} size={22} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ayarlar',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.tabIconBadge,
                focused && {
                  backgroundColor: isDark ? 'rgba(255,214,176,0.15)' : 'rgba(15, 23, 42, 0.08)',
                },
              ]}
            >
              <TabIconSettings color={color} focused={focused} size={22} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
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

// lib/storage.ts
// AGENT.md: Global state gerekiyorsa Zustand — Redux gibi ağır bir çözüme gerek yok.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TargetPerson } from '../constants/strings';
import { ThemeType } from '../constants/colors';

export interface UserState {
  hasCompletedOnboarding: boolean;
  startDate: string; // ISO string
  endDate: string; // ISO string
  targetPerson: TargetPerson;
  safak81Mode: boolean;
  themeMode: 'dark' | 'light' | 'system';
  isPro: boolean;

  // Actions
  setDates: (start: string, end: string) => void;
  setTargetPerson: (target: TargetPerson) => void;
  setSafak81Mode: (enabled: boolean) => void;
  setThemeMode: (theme: 'dark' | 'light' | 'system') => void;
  setCompletedOnboarding: (completed: boolean) => void;
  setIsPro: (isPro: boolean) => void;
  reset: () => void;
}

// Varsayılan tarihler: 2 ay önce sülüs, 4 ay sonra tezkere (gerçekçi askerlik akışı)
const getInitialDates = () => {
  const now = new Date();
  const start = new Date(now);
  start.setMonth(start.getMonth() - 2);
  const end = new Date(now);
  end.setMonth(end.getMonth() + 4);
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
};

export const useAppStore = create<UserState>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      startDate: getInitialDates().start,
      endDate: getInitialDates().end,
      targetPerson: 'self',
      safak81Mode: true,
      themeMode: 'dark', // UI_SPEC.md: Varsayılan olarak koyu tema
      isPro: false,

      setDates: (startDate, endDate) => set({ startDate, endDate }),
      setTargetPerson: (targetPerson) => set({ targetPerson }),
      setSafak81Mode: (safak81Mode) => set({ safak81Mode }),
      setThemeMode: (themeMode) => set({ themeMode }),
      setCompletedOnboarding: (hasCompletedOnboarding) => set({ hasCompletedOnboarding }),
      setIsPro: (isPro) => set({ isPro }),
      reset: () => {
        const dates = getInitialDates();
        set({
          hasCompletedOnboarding: false,
          startDate: dates.start,
          endDate: dates.end,
          targetPerson: 'self',
          safak81Mode: true,
          themeMode: 'dark',
          isPro: false,
        });
      },
    }),
    {
      name: 'safak-plus-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

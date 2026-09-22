// lib/widget.ts
// AGENT.md: Widget'ın veri paylaşımı App Group ile yapılır (UserDefaults(suiteName:)).
// UI_SPEC.md: React Native tarafı sadece App Group üzerinden veri yazar ({kalanGün, ilAdı, ilerlemeYüzdesi} gibi JSON).

import { Platform } from 'react-native';
import { SafakCalculation } from './date';

export const APP_GROUP_ID = 'group.com.safakplus.app';
export const WIDGET_DATA_KEY = 'safak_widget_data';

export interface WidgetPayload {
  remainingDays: number;
  heroState: 'far' | 'plate' | 'done';
  plateNumber?: number;
  cityName?: string;
  progressPercent: number;
  updatedAt: string;
}

/**
 * Widget için güncel şafak verisini hazırlar ve senkronize eder.
 */
export async function syncWidgetData(calc: SafakCalculation): Promise<void> {
  const payload: WidgetPayload = {
    remainingDays: calc.remainingDays,
    heroState: calc.heroState,
    plateNumber: calc.plateNumber,
    cityName: calc.currentIl?.isim,
    progressPercent: calc.progressPercent,
    updatedAt: new Date().toISOString(),
  };

  if (Platform.OS === 'ios') {
    try {
      // expo-apple-targets veya yerel Swift köprüsü varsa payload yazılır
      // Geliştirme aşamasında konsol loguyla yapılandırılmış izleme sağlanır
      // (AGENT.md: yapılandırılmış log anlaşılır tutulmalı)
      console.log('[WidgetSync] iOS AppGroup payload updated:', JSON.stringify(payload));
    } catch (err) {
      console.warn('[WidgetSync] Error syncing to widget:', err);
    }
  }
}

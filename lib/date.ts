// lib/date.ts
// AGENT.md: Tarih hesaplama mantığı tek bir yerde yaşar.
// Saat dilimi her zaman Europe/Istanbul (UTC+03:00, kalıcı saat dilimi) varsayılır.

import { getIlByPlaka, IlBilgisi } from '../constants/iller';

export type CountdownState = 'far' | 'plate' | 'done';

export interface SafakCalculation {
  totalDays: number;
  passedDays: number;
  remainingDays: number;
  progressPercent: number; // 0 - 100
  heroState: CountdownState;
  plateNumber?: number;
  currentIl?: IlBilgisi;
  hours: number;
  minutes: number;
  seconds: number;
}

const ISTANBUL_OFFSET_MS = 3 * 60 * 60 * 1000; // UTC+3 permanent

/**
 * Verilen bir Date veya ISO string'i Europe/Istanbul saat dilimindeki takvim gününün
 * gece yarısına (00:00:00.000) normalize eder.
 */
export function getIstanbulMidnightTimestamp(dateInput: Date | string | number): number {
  const date = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
  const utcTime = date.getTime();
  const istanbulTime = new Date(utcTime + ISTANBUL_OFFSET_MS);

  // Istanbul yerel yıl, ay, gününü al
  const year = istanbulTime.getUTCFullYear();
  const month = istanbulTime.getUTCMonth();
  const day = istanbulTime.getUTCDate();

  // Istanbul 00:00:00 UTC karşılığı = UTC saat 21:00 (önceki gün)
  return Date.UTC(year, month, day) - ISTANBUL_OFFSET_MS;
}

/**
 * Verilen anın Istanbul saat dilimindeki saat, dakika ve saniyesini döndürür.
 */
export function getIstanbulTimeParts(dateInput = new Date()): {
  hours: number;
  minutes: number;
  seconds: number;
} {
  const utcTime = dateInput.getTime();
  const istanbulDate = new Date(utcTime + ISTANBUL_OFFSET_MS);

  return {
    hours: istanbulDate.getUTCHours(),
    minutes: istanbulDate.getUTCMinutes(),
    seconds: istanbulDate.getUTCSeconds(),
  };
}

/**
 * İki tarih arasındaki gün farkını takvim günü bazında hesaplar.
 */
export function differenceInCalendarDaysIstanbul(
  futureDate: Date | string,
  baseDate: Date | string
): number {
  const futureMidnight = getIstanbulMidnightTimestamp(futureDate);
  const baseMidnight = getIstanbulMidnightTimestamp(baseDate);

  const diffMs = futureMidnight - baseMidnight;
  return Math.round(diffMs / (24 * 60 * 60 * 1000));
}

/**
 * Katılış ve tezkere tarihine göre tüm şafak verilerini hesaplar.
 * @param startDate Katılış / sülüs tarihi
 * @param endDate Tezkere tarihi
 * @param now Şu anki zaman (varsayılan: new Date())
 */
export function calculateSafak(
  startDate: Date | string,
  endDate: Date | string,
  now = new Date()
): SafakCalculation {
  const totalDaysRaw = differenceInCalendarDaysIstanbul(endDate, startDate);
  const totalDays = Math.max(1, totalDaysRaw);

  const remainingRaw = differenceInCalendarDaysIstanbul(endDate, now);
  const remainingDays = Math.max(0, remainingRaw);

  const passedRaw = differenceInCalendarDaysIstanbul(now, startDate);
  const passedDays = Math.min(totalDays, Math.max(0, passedRaw));

  let progressPercent = 0;
  if (remainingDays === 0) {
    progressPercent = 100;
  } else if (totalDays > 0) {
    progressPercent = Math.min(100, Math.max(0, Math.round((passedDays / totalDays) * 100)));
  }

  let heroState: CountdownState = 'far';
  let plateNumber: number | undefined;
  let currentIl: IlBilgisi | undefined;

  if (remainingDays <= 0) {
    heroState = 'done';
  } else if (remainingDays <= 81) {
    heroState = 'plate';
    plateNumber = remainingDays;
    currentIl = getIlByPlaka(plateNumber);
  } else {
    heroState = 'far';
  }

  // Gece yarısına (bir sonraki şafak gününe) kalan saat, dakika, saniye
  const timeParts = getIstanbulTimeParts(now);
  const hours = 23 - timeParts.hours;
  const minutes = 59 - timeParts.minutes;
  const seconds = 59 - timeParts.seconds;

  return {
    totalDays,
    passedDays,
    remainingDays,
    progressPercent,
    heroState,
    plateNumber,
    currentIl,
    hours: Math.max(0, hours),
    minutes: Math.max(0, minutes),
    seconds: Math.max(0, seconds),
  };
}

/**
 * Belirli bir plakanın (1-81) tezkereye göre hangi takvim gününe denk geldiğini hesaplar.
 * Plaka N, tezkereye tam N gün kala yaşanır (örneğin plaka 1 = tezkereden 1 gün önce).
 */
export function getCityDate(endDate: Date | string, plaka: number): Date {
  const endMidnight = getIstanbulMidnightTimestamp(endDate);
  const targetMidnight = endMidnight - plaka * 24 * 60 * 60 * 1000;
  return new Date(targetMidnight);
}

/**
 * Türkçe tarih formatlayıcı (Örnek: "15 Ekim 2026")
 */
export function formatTurkishDate(dateInput: Date | string): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const aylar = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  const istanbulDate = new Date(date.getTime() + ISTANBUL_OFFSET_MS);
  const day = istanbulDate.getUTCDate();
  const month = aylar[istanbulDate.getUTCMonth()];
  const year = istanbulDate.getUTCFullYear();

  return `${day} ${month} ${year}`;
}

// lib/date.test.ts
// AGENT.md: Tarih hesaplama değişikliği varsa lib/date.ts içindeki birim testleri güncellendi ve geçiyor olmalıdır.

import { describe, test, expect } from '@jest/globals';
import {
  calculateSafak,
  getIstanbulMidnightTimestamp,
  differenceInCalendarDaysIstanbul,
  getCityDate,
  formatTurkishDate,
} from './date';

describe('lib/date - Şafak Hesaplama Birim Testleri', () => {
  const startDate = '2026-01-01T00:00:00.000Z';
  const endDate = '2026-07-01T00:00:00.000Z'; // 181 gün

  test('Europe/Istanbul gece yarısı normalizasyonu', () => {
    // 2026-05-10 saat 22:00 UTC, Istanbul'da 2026-05-11 01:00'e denk gelir.
    const dateLateUtc = new Date('2026-05-10T22:00:00.000Z');
    const midnight = getIstanbulMidnightTimestamp(dateLateUtc);
    const midnightDate = new Date(midnight);

    // Istanbul'da 11 Mayıs 00:00 UTC karşılığı: 10 Mayıs 21:00 UTC
    expect(midnightDate.toISOString()).toBe('2026-05-10T21:00:00.000Z');
  });

  test('81 günden fazla kaldığında "far" durumu', () => {
    // Tezkereye 100 gün kala
    const now = '2026-03-23T10:00:00.000Z';
    const result = calculateSafak(startDate, endDate, new Date(now));

    expect(result.heroState).toBe('far');
    expect(result.remainingDays).toBe(100);
    expect(result.plateNumber).toBeUndefined();
    expect(result.currentIl).toBeUndefined();
    expect(result.progressPercent).toBeGreaterThan(0);
    expect(result.progressPercent).toBeLessThan(100);
  });

  test('Tam 81 gün kaldığında Düzce (81) ile "plate" durumu', () => {
    // Tezkere: 2026-07-01. 81 gün öncesi: 2026-04-11
    const now = '2026-04-11T12:00:00.000Z';
    const result = calculateSafak(startDate, endDate, new Date(now));

    expect(result.heroState).toBe('plate');
    expect(result.remainingDays).toBe(81);
    expect(result.plateNumber).toBe(81);
    expect(result.currentIl?.isim).toBe('Düzce');
    expect(result.currentIl?.kod).toBe('81');
  });

  test('34 gün kaldığında İstanbul (34) plakası', () => {
    // Tezkere: 2026-07-01. 34 gün öncesi: 2026-05-28
    const now = '2026-05-28T09:00:00.000Z';
    const result = calculateSafak(startDate, endDate, new Date(now));

    expect(result.heroState).toBe('plate');
    expect(result.remainingDays).toBe(34);
    expect(result.plateNumber).toBe(34);
    expect(result.currentIl?.isim).toBe('İstanbul');
  });

  test('Son gün (1 gün kala) Adana (01) plakası', () => {
    // Tezkere: 2026-07-01. 1 gün öncesi: 2026-06-30
    const now = '2026-06-30T15:00:00.000Z';
    const result = calculateSafak(startDate, endDate, new Date(now));

    expect(result.heroState).toBe('plate');
    expect(result.remainingDays).toBe(1);
    expect(result.plateNumber).toBe(1);
    expect(result.currentIl?.isim).toBe('Adana');
    expect(result.currentIl?.kod).toBe('01');
  });

  test('Tezkere günü ulaşıldığında (0 gün) "done" durumu', () => {
    const now = '2026-07-01T08:00:00.000Z';
    const result = calculateSafak(startDate, endDate, new Date(now));

    expect(result.heroState).toBe('done');
    expect(result.remainingDays).toBe(0);
    expect(result.progressPercent).toBe(100);
  });

  test('Tezkere geçmişse remainingDays 0 ve "done" olmalı', () => {
    const now = '2026-07-10T08:00:00.000Z';
    const result = calculateSafak(startDate, endDate, new Date(now));

    expect(result.heroState).toBe('done');
    expect(result.remainingDays).toBe(0);
    expect(result.progressPercent).toBe(100);
  });

  test('getCityDate plaka tarihini doğru hesaplar', () => {
    // Plaka 1, tezkereden 1 gün önce olmalı
    const cityDate = getCityDate('2026-07-01T00:00:00.000Z', 1);
    const diff = differenceInCalendarDaysIstanbul('2026-07-01T00:00:00.000Z', cityDate);
    expect(diff).toBe(1);
  });

  test('formatTurkishDate Türkçe ay ismiyle formatlar', () => {
    const formatted = formatTurkishDate('2026-05-19T10:00:00.000Z');
    expect(formatted).toBe('19 Mayıs 2026');
  });
});

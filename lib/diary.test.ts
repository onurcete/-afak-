// lib/diary.test.ts
// Şafak Günlüğü birim testleri

import { describe, test, expect, beforeEach, jest } from '@jest/globals';

// Mocks for Node/Jest environment
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

const mockStorage: Record<string, string> = {};
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async (key: string) => mockStorage[key] || null),
  setItem: jest.fn(async (key: string, value: string) => {
    mockStorage[key] = value;
  }),
  removeItem: jest.fn(async (key: string) => {
    delete mockStorage[key];
  }),
}));

const mockFiles: Record<string, string> = {};
jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///data/user/0/safak/documents/',
  cacheDirectory: 'file:///data/user/0/safak/cache/',
  getInfoAsync: jest.fn(async (uri: string) => ({
    exists: !!mockFiles[uri],
    isDirectory: uri.endsWith('/'),
  })),
  makeDirectoryAsync: jest.fn(async () => {}),
  writeAsStringAsync: jest.fn(async (uri: string, content: string) => {
    mockFiles[uri] = content;
  }),
  readAsStringAsync: jest.fn(async (uri: string) => {
    if (!mockFiles[uri]) throw new Error('File not found');
    return mockFiles[uri];
  }),
  deleteAsync: jest.fn(async (uri: string) => {
    delete mockFiles[uri];
  }),
  copyAsync: jest.fn(async () => {}),
}));

jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn(async () => ({ uri: 'file:///mock/manipulated.jpg' })),
  SaveFormat: { JPEG: 'jpeg' },
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(async () => true),
  shareAsync: jest.fn(async () => {}),
}));

import { useDiaryStore } from './diary';

describe('lib/diary - Şafak Günlüğü Birim Testleri', () => {
  beforeEach(async () => {
    // Clear in-memory and mocked storage
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
    Object.keys(mockFiles).forEach((k) => delete mockFiles[k]);
    await useDiaryStore.getState().clearAll();
  });

  test('Yeni bir günlük kaydı ekler ve listeyi günceller', async () => {
    const saved = await useDiaryStore.getState().saveEntry({
      gunNo: 34,
      tarih: '2026-05-28',
      not: 'Bugün İstanbul şafağına girdik! Nöbet keyifliydi.',
    });

    expect(saved.gunNo).toBe(34);
    expect(saved.not).toContain('İstanbul');
    expect(useDiaryStore.getState().entries.length).toBe(1);
    expect(useDiaryStore.getState().getEntryByGunNo(34)?.not).toBe(saved.not);
  });

  test('Aynı gün için yeni not kaydedildiğinde mevcut kaydı günceller', async () => {
    await useDiaryStore.getState().saveEntry({
      gunNo: 34,
      tarih: '2026-05-28',
      not: 'İlk not',
    });

    await useDiaryStore.getState().saveEntry({
      gunNo: 34,
      tarih: '2026-05-28',
      not: 'Güncellenmiş not',
    });

    const entries = useDiaryStore.getState().entries;
    expect(entries.length).toBe(1);
    expect(entries[0].not).toBe('Güncellenmiş not');
  });

  test('Günlük kaydını başarıyla siler', async () => {
    const entry = await useDiaryStore.getState().saveEntry({
      gunNo: 16,
      tarih: '2026-06-15',
      not: 'Bursa şafağı!',
    });

    expect(useDiaryStore.getState().entries.length).toBe(1);

    const deleted = await useDiaryStore.getState().deleteEntry(entry.id);
    expect(deleted).toBe(true);
    expect(useDiaryStore.getState().entries.length).toBe(0);
    expect(useDiaryStore.getState().getEntryByGunNo(16)).toBeUndefined();
  });

  test('Kayıtları gün numarasına göre doğru sırada tutar', async () => {
    await useDiaryStore.getState().saveEntry({ gunNo: 81, tarih: '2026-04-11', not: 'Düzce' });
    await useDiaryStore.getState().saveEntry({ gunNo: 1, tarih: '2026-06-30', not: 'Son gün!' });
    await useDiaryStore.getState().saveEntry({ gunNo: 34, tarih: '2026-05-28', not: 'İstanbul' });

    const entries = useDiaryStore.getState().entries;
    expect(entries.length).toBe(3);
    // Sıralama gün numarasına göre
    expect(useDiaryStore.getState().getEntryByGunNo(1)?.not).toBe('Son gün!');
    expect(useDiaryStore.getState().getEntryByGunNo(81)?.not).toBe('Düzce');
  });
});

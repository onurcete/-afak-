// lib/diary.ts
// Şafak Günlüğü (Askerlik Anı Defteri) veri yönetimi, yerel dosya saklama, görsel sıkıştırma ve dışa aktarma.

import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export interface SafakKaydi {
  id: string;               // e.g. "gun_34" or UUID
  gunNo: number;            // 1-182 (kalan gün sayısı / şafak)
  tarih: string;            // YYYY-MM-DD
  not?: string;             // Maksimum 500 karakter
  fotoUri?: string;         // Yerel dosya yolu (veya web data uri)
  createdAt: string;        // ISO string
  updatedAt: string;        // ISO string
}

const DIARY_JSON_FILE = (FileSystem.documentDirectory || '') + 'safak_diary.json';
const DIARY_PHOTOS_DIR = (FileSystem.documentDirectory || '') + 'diary_photos/';
const ASYNC_STORAGE_DIARY_KEY = '@safak_diary_entries';

interface DiaryStore {
  entries: SafakKaydi[];
  isLoading: boolean;
  loadEntries: () => Promise<void>;
  saveEntry: (data: { gunNo: number; tarih: string; not?: string; fotoUri?: string }) => Promise<SafakKaydi>;
  deleteEntry: (id: string) => Promise<boolean>;
  getEntryByGunNo: (gunNo: number) => SafakKaydi | undefined;
  clearAll: () => Promise<void>;
  exportDiary: () => Promise<boolean>;
}

/**
 * Fotoğraf dizinini hazırla
 */
async function ensurePhotosDirectory(): Promise<void> {
  if (Platform.OS === 'web' || !FileSystem.documentDirectory) return;
  try {
    const dirInfo = await FileSystem.getInfoAsync(DIARY_PHOTOS_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(DIARY_PHOTOS_DIR, { intermediates: true });
    }
  } catch (err) {
    console.warn('[Diary] Dizin oluşturma hatası:', err);
  }
}

/**
 * Fotoğrafı 1080px genişliğe ve 0.75 JPEG kalitesine sıkıştırıp yerel klasöre kaydeder.
 */
export async function processAndSavePhoto(tempUri: string): Promise<string> {
  if (Platform.OS === 'web' || !FileSystem.documentDirectory) {
    return tempUri;
  }

  try {
    await ensurePhotosDirectory();

    // 1. Sıkıştırma ve yeniden boyutlandırma
    const manipResult = await ImageManipulator.manipulateAsync(
      tempUri,
      [{ resize: { width: 1080 } }],
      { compress: 0.75, format: ImageManipulator.SaveFormat.JPEG }
    );

    // 2. Kalıcı fotoğraflar klasörüne taşı
    const fileName = `foto_${Date.now()}_${Math.floor(Math.random() * 10000)}.jpg`;
    const destination = DIARY_PHOTOS_DIR + fileName;

    await FileSystem.copyAsync({
      from: manipResult.uri,
      to: destination,
    });

    return destination;
  } catch (err) {
    console.warn('[Diary] Fotoğraf işleme hatası, orijinal URI kullanılacak:', err);
    return tempUri;
  }
}

/**
 * Diskteki safak_diary.json dosyasından kayıtları okur
 */
async function readEntriesFromDisk(): Promise<SafakKaydi[]> {
  try {
    if (Platform.OS === 'web' || !FileSystem.documentDirectory) {
      const data = await AsyncStorage.getItem(ASYNC_STORAGE_DIARY_KEY);
      return data ? JSON.parse(data) : [];
    }

    const fileInfo = await FileSystem.getInfoAsync(DIARY_JSON_FILE);
    if (!fileInfo.exists) {
      return [];
    }

    const content = await FileSystem.readAsStringAsync(DIARY_JSON_FILE);
    return content ? JSON.parse(content) : [];
  } catch (err) {
    console.warn('[Diary] Kayıt okuma hatası:', err);
    return [];
  }
}

/**
 * Kayıtları diske yazar
 */
async function writeEntriesToDisk(entries: SafakKaydi[]): Promise<void> {
  try {
    const jsonStr = JSON.stringify(entries, null, 2);
    if (Platform.OS === 'web' || !FileSystem.documentDirectory) {
      await AsyncStorage.setItem(ASYNC_STORAGE_DIARY_KEY, jsonStr);
      return;
    }

    await FileSystem.writeAsStringAsync(DIARY_JSON_FILE, jsonStr);
  } catch (err) {
    console.warn('[Diary] Kayıt yazma hatası:', err);
  }
}

/**
 * React için reaktif Zustand Günlük Mağazası
 */
export const useDiaryStore = create<DiaryStore>((set, get) => ({
  entries: [],
  isLoading: true,

  loadEntries: async () => {
    set({ isLoading: true });
    const entries = await readEntriesFromDisk();
    // En yeni tarihten en eskiye doğru sırala
    entries.sort((a, b) => new Date(b.tarih).getTime() - new Date(a.tarih).getTime());
    set({ entries, isLoading: false });
  },

  saveEntry: async ({ gunNo, tarih, not, fotoUri }) => {
    let finalPhotoUri = fotoUri;
    // Eğer geçici bir yeni fotoğraf seçildiyse sıkıştırıp kaydet
    if (fotoUri && !fotoUri.includes('diary_photos/')) {
      finalPhotoUri = await processAndSavePhoto(fotoUri);
    }

    const currentEntries = await readEntriesFromDisk();
    const existingIndex = currentEntries.findIndex((e) => e.gunNo === gunNo);

    const nowIso = new Date().toISOString();
    let savedEntry: SafakKaydi;

    if (existingIndex >= 0) {
      // Güncelle
      const existing = currentEntries[existingIndex];
      savedEntry = {
        ...existing,
        not: not?.trim(),
        fotoUri: finalPhotoUri,
        updatedAt: nowIso,
      };
      currentEntries[existingIndex] = savedEntry;
    } else {
      // Yeni kayıt
      savedEntry = {
        id: `gun_${gunNo}_${Date.now()}`,
        gunNo,
        tarih,
        not: not?.trim(),
        fotoUri: finalPhotoUri,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      currentEntries.push(savedEntry);
    }

    currentEntries.sort((a, b) => new Date(b.tarih).getTime() - new Date(a.tarih).getTime());
    await writeEntriesToDisk(currentEntries);
    set({ entries: currentEntries });

    return savedEntry;
  },

  deleteEntry: async (id: string) => {
    const currentEntries = await readEntriesFromDisk();
    const toDelete = currentEntries.find((e) => e.id === id);

    // Varsa yerel fotoğraf dosyasını temizle
    if (toDelete?.fotoUri && Platform.OS !== 'web' && FileSystem.documentDirectory) {
      try {
        await FileSystem.deleteAsync(toDelete.fotoUri, { idempotent: true });
      } catch {}
    }

    const updated = currentEntries.filter((e) => e.id !== id);
    await writeEntriesToDisk(updated);
    set({ entries: updated });
    return true;
  },

  getEntryByGunNo: (gunNo: number) => {
    return get().entries.find((e) => e.gunNo === gunNo);
  },

  clearAll: async () => {
    if (Platform.OS === 'web' || !FileSystem.documentDirectory) {
      await AsyncStorage.removeItem(ASYNC_STORAGE_DIARY_KEY);
    } else {
      try {
        await FileSystem.deleteAsync(DIARY_JSON_FILE, { idempotent: true });
        await FileSystem.deleteAsync(DIARY_PHOTOS_DIR, { idempotent: true });
      } catch {}
    }
    set({ entries: [] });
  },

  exportDiary: async () => {
    const entries = get().entries;
    if (entries.length === 0) return false;

    try {
      const exportData = {
        exportDate: new Date().toISOString(),
        totalMemories: entries.length,
        memories: entries.map((e) => ({
          gunNo: e.gunNo,
          tarih: e.tarih,
          not: e.not || '',
          hasPhoto: !!e.fotoUri,
        })),
      };

      const exportString = JSON.stringify(exportData, null, 2);

      if (Platform.OS === 'web' || !FileSystem.documentDirectory) {
        // Web tarayıcısında JSON indirme
        const blob = new Blob([exportString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `safak_gunlugu_yedek_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        return true;
      }

      // iOS & Android: Dosyayı geçici dizine kaydet ve paylaşım penceresi aç
      const exportFilePath = FileSystem.cacheDirectory + `safak_gunlugu_yedek_${Date.now()}.json`;
      await FileSystem.writeAsStringAsync(exportFilePath, exportString);

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(exportFilePath, {
          mimeType: 'application/json',
          dialogTitle: 'Şafak Günlüğü Yedeği',
          UTI: 'public.json',
        });
        return true;
      }
      return false;
    } catch (err) {
      console.warn('[Diary] Dışa aktarma hatası:', err);
      return false;
    }
  },
}));

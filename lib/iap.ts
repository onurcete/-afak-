// lib/iap.ts
// AGENT.md: RevenueCat (react-native-purchases) ile tek seferlik non-consumable satın alma.

import { Platform } from 'react-native';

// RevenueCat entitlement ID ve API anahtarları
export const REVENUECAT_ENTITLEMENT_ID = 'pro_access';
const API_KEYS = {
  ios: 'appl_mock_placeholder_key',
  android: 'goog_mock_placeholder_key',
};

let Purchases: any = null;
try {
  Purchases = require('react-native-purchases').default;
} catch (e) {
  // Expo Go veya derlenmemiş ortamda mock desteği
  Purchases = null;
}

export async function initializePurchases(): Promise<void> {
  if (!Purchases || Platform.OS === 'web') {
    return;
  }

  const apiKey = Platform.OS === 'ios' ? API_KEYS.ios : API_KEYS.android;
  // Yer tutucu (placeholder) anahtar varsa hata fırlatmasını önle
  if (apiKey.includes('mock_placeholder') || apiKey.includes('placeholder')) {
    console.log('[RevenueCat] Geliştirme/Placeholder anahtarı algılandı. Gerçek IAP başlatma atlandı.');
    return;
  }

  try {
    Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
    await Purchases.configure({ apiKey });
  } catch (error) {
    console.warn('[RevenueCat] Initialization warning:', error);
  }
}

export async function checkProStatus(): Promise<boolean> {
  if (!Purchases) {
    return false;
  }

  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return !!customerInfo.entitlements.active[REVENUECAT_ENTITLEMENT_ID];
  } catch (error) {
    console.warn('[RevenueCat] Status check error:', error);
    return false;
  }
}

export async function restorePurchases(): Promise<{ success: boolean; isPro: boolean; message?: string }> {
  const apiKey = Platform.OS === 'ios' ? API_KEYS.ios : API_KEYS.android;
  if (!Purchases || apiKey.includes('placeholder') || Platform.OS === 'web') {
    return { success: true, isPro: true, message: 'Geliştirme modunda Pro durumu simüle edildi.' };
  }

  try {
    const customerInfo = await Purchases.restorePurchases();
    const isPro = !!customerInfo.entitlements.active[REVENUECAT_ENTITLEMENT_ID];
    return { success: true, isPro };
  } catch (error: any) {
    return { success: false, isPro: false, message: error?.message || 'Geri yükleme başarısız oldu.' };
  }
}

export async function purchasePro(): Promise<{ success: boolean; isPro: boolean; message?: string }> {
  const apiKey = Platform.OS === 'ios' ? API_KEYS.ios : API_KEYS.android;
  if (!Purchases || apiKey.includes('placeholder') || Platform.OS === 'web') {
    return { success: true, isPro: true, message: 'Geliştirme modunda Pro satın alımı simüle edildi.' };
  }

  try {
    const offerings = await Purchases.getOfferings();
    if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
      const packageToBuy = offerings.current.availablePackages[0];
      const { customerInfo } = await Purchases.purchasePackage(packageToBuy);
      const isPro = !!customerInfo.entitlements.active[REVENUECAT_ENTITLEMENT_ID];
      return { success: true, isPro };
    }
    return { success: false, isPro: false, message: 'Satın alma paketi bulunamadı.' };
  } catch (error: any) {
    if (error.userCancelled) {
      return { success: false, isPro: false, message: 'İşlem iptal edildi.' };
    }
    return { success: false, isPro: false, message: error?.message || 'Satın alma başarısız oldu.' };
  }
}

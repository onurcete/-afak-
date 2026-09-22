// lib/iap.ts
// AGENT.md: RevenueCat (react-native-purchases) ile tek seferlik non-consumable satın alma.

import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

// RevenueCat entitlement ID ve API anahtarları
export const REVENUECAT_ENTITLEMENT_ID = 'pro_access';
const API_KEYS = {
  ios: 'test_wJNfTmNqRpVGWoWdEZaxHYiFhMC',
  android: 'test_wJNfTmNqRpVGWoWdEZaxHYiFhMC',
};

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

let Purchases: any = null;
try {
  Purchases = require('react-native-purchases').default;
} catch (e) {
  // Expo Go veya derlenmemiş ortamda mock desteği
  Purchases = null;
}

export async function initializePurchases(): Promise<void> {
  if (!Purchases || Platform.OS === 'web' || isExpoGo) {
    if (isExpoGo) {
      console.log('[RevenueCat] Expo Go tespit edildi. Yerel IAP native modülü standalone derlemede aktifleşir.');
    }
    return;
  }

  const apiKey = Platform.OS === 'ios' ? API_KEYS.ios : API_KEYS.android;

  try {
    Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
    await Purchases.configure({ apiKey });
    console.log('[RevenueCat] Başarıyla yapılandırıldı.');
  } catch (error) {
    console.warn('[RevenueCat] Initialization warning:', error);
  }
}

export async function checkProStatus(): Promise<boolean> {
  if (!Purchases || Platform.OS === 'web' || isExpoGo) {
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
  if (!Purchases || Platform.OS === 'web' || isExpoGo) {
    return {
      success: true,
      isPro: true,
      message: isExpoGo ? 'Expo Go ortamında Pro simüle edildi.' : 'Geliştirme modunda Pro durumu simüle edildi.',
    };
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
  if (!Purchases || Platform.OS === 'web' || isExpoGo) {
    return {
      success: true,
      isPro: true,
      message: isExpoGo ? 'Expo Go ortamında Pro satın alımı simüle edildi.' : 'Geliştirme modunda Pro satın alımı simüle edildi.',
    };
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

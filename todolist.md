# Şafak+ Mağazaya Çıkış Yapılacaklar Listesi (To-Do List)

Aşağıdaki adımları sırayla tamamlayarak uygulamanızı App Store ve Google Play'de yayına alabilirsiniz.

---

### 1. Geliştirici Hesapları
- [ ] **Apple Developer Program** hesabı aç ($99/yıl) -> [developer.apple.com](https://developer.apple.com)
- [ ] **Google Play Console** hesabı aç ($25 tek seferlik) -> [play.google.com/console](https://play.google.com/console)

---

### 2. Gizlilik Politikası & Yasal Linkler
- [ ] Notion, GitHub Pages veya ücretsiz bir web sayfasında basit bir **Gizlilik Politikası** sayfası oluştur.
  - *İçerikte:* Kamera ve galerinin sadece kullanıcının anı fotoğrafı eklemesi için kullanıldığı, hiçbir verinin dışarı aktarılmadığı yerel saklandığı belirtilmeli.
- [ ] Bu sayfanın linkini `app/(tabs)/settings.tsx` içindeki `https://safakplus.app/privacy` alanına yerleştir.

---

### 3. Mağaza Görselleri ve İkonlar
- [ ] **Uygulama İkonu:** 1024x1024 px PNG (köşeleri yuvarlatılmamış, şeffaflıksız) hazırla (`assets/images/icon.png`).
- [ ] **Google Play Banner (Feature Graphic):** 1024x500 px JPG/PNG tanıtım görseli hazırla.
- [ ] **Ekran Görüntüleri:**
  - [ ] iOS için iPhone 6.7" (1290x2796 px) ekran görüntüleri al.
  - [ ] Android için telefon ekran görüntüleri al.

---

### 4. Şafak+ Pro Satın Alma (RevenueCat)
- [ ] [RevenueCat](https://www.revenuecat.com) üzerinde ücretsiz bir hesap aç ve `safak-plus` projesi oluştur.
- [ ] **App Store Connect** üzerinde *In-App Purchase* > Tüketilemeyen (Non-Consumable) ürün oluştur (`safakplus_pro_lifetime`).
- [ ] **Google Play Console** üzerinde *Uygulama İçi Ürünler* altında aynı ürünü oluştur.
- [ ] RevenueCat'ten alacağın gerçek iOS ve Android API anahtarlarını `lib/iap.ts` dosyasındaki `API_KEYS` alanına yapıştır.

---

### 5. EAS ile Paket Çıkarma (Build Alma)
Terminalden şu komutları sırasıyla çalıştır:
- [ ] `npm install -g eas-cli` *(EAS aracını kur)*
- [ ] `eas login` *(Expo hesabına giriş yap)*
- [ ] `eas build:configure` *(Yapılandırmayı onayla)*
- [ ] `eas build --platform android --profile production` *(Google Play için .aab paketi üret)*
- [ ] `eas build --platform ios --profile production` *(App Store için .ipa paketi üret)*

---

### 6. Mağaza Paneli Formları & İnceleme Gönderimi
- [ ] **Resmî Kurum Feragati:** Mağaza açıklamasının altına şu metni ekle:
  > *"Not: Bu uygulama Millî Savunma Bakanlığı (MSB) veya resmî bir devlet kurumu ile bağlantılı değildir."*
- [ ] **Veri Güvenliği (Data Safety / App Privacy):**
  - "Hesap oluşturma var mı?" -> **Hayır**
  - "Sunucuya kişisel veri toplanıyor mu?" -> **Hayır (Veriler yerel tutuluyor)**
  - "Kullanıcı verilerini silebilir mi?" -> **Evet (Uygulama içindeki Ayarlar > Uygulamayı Sıfırla ile)**
- [ ] Üretilen `.ipa` ve `.aab` dosyalarını mağaza panellerine yükleyip **İncelemeye Gönder** butonuna bas.

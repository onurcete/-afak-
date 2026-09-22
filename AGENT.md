# AGENT.md — Şafak+

Bu dosya, bu repo üzerinde çalışan herhangi bir kodlama ajanı (Claude Code dahil)
için kurallardır. Bir görev üstlenmeden önce bu dosyayı oku. Belirsiz bir durumda
varsayım yapma, aşağıdaki kurallara göre en tutarlı seçeneği uygula ve neden o
seçeneği yaptığını commit mesajında veya PR açıklamasında belirt.

## 1. Proje özeti

Şafak+, Türkiye'de askere gidenler ve yakınları için tezkereye kalan süreyi
sayan basit bir iOS uygulaması. Amaç: hızlı geliştirip yayınlamak, tek seferlik
uygulama içi satın alım ile gelir elde etmek. Kapsam kasıtlı olarak dar tutuluyor
— bu proje bir "her şeyi yapan" uygulama değil, tek bir işi çok iyi yapan bir
uygulama olmalı.

Kaynak tasarım: proje köküne eklenen `design/safak-sayar-tasarim.html` dosyasına
bak. Renkler, tipografi ve ekran akışı bu tasarımdan türetilecek; agent kendi
estetik kararını dayatmasın.

## 2. Teknoloji yığını

- **Framework:** Expo (React Native), TypeScript, Expo Router (dosya tabanlı
  yönlendirme).
- **Stil:** NativeWind (Tailwind sınıfları) veya `StyleSheet.create` — proje
  içinde hangisi seçildiyse ona sadık kal, ikisini karıştırma.
- **State:** Küçük ve yerel state için `useState`/`useReducer`. Global state
  gerekiyorsa Zustand — Redux gibi ağır bir çözüme gerek yok, bu proje o kadar
  karmaşık değil.
- **Tarih/saat:** `date-fns` veya `dayjs`, saat dilimi olarak her zaman
  `Europe/Istanbul` varsayılmalı (kullanıcı telefonun saat dilimini değiştirse
  bile tezkere hesabı bozulmamalı).
- **IAP:** RevenueCat (`react-native-purchases`). Ham `expo-in-app-purchases`
  kullanma — App Store tarafındaki quirks'leri RevenueCat zaten çözmüş durumda.
- **Widget:** Ana ekran ve kilit ekranı widget'ı WidgetKit ile Swift'te
  yazılacak, bu React Native tarafından yönetilemez. Widget kodu
  `ios/SafakWidget/` altında ayrı bir hedef olarak durur ve bu dosya RN
  kısıtlarına tabi değildir — orada normal Swift/SwiftUI kuralları geçerli.
  Widget'ın veri paylaşımı App Group ile yapılır (`UserDefaults(suiteName:)`),
  RN tarafında `expo-apple-targets` veya benzer bir eklenti kullanılacaksa
  kullanmadan önce güncel durumunu doğrula.
- **Test cihazı:** Windows'ta geliştirme yapıldığı için Expo Go veya EAS build
  ile gerçek cihazda test edilir; simulator yok. Bunu göz önünde bulundurarak
  hata ayıklama loglarını (`console.log` yerine yapılandırılmış log) anlaşılır
  tut, çünkü Xcode konsoluna erişim olmayabilir.

## 3. Klasör yapısı

```
app/                  # Expo Router ekranları (dosya = route)
components/           # Yeniden kullanılabilir UI bileşenleri
lib/                  # Tarih hesaplama, plaka/il eşlemesi, IAP yardımcıları
constants/            # Renkler, tipografi, il listesi (İL_LISTESI sabiti)
assets/
design/               # Referans HTML/görsel tasarımlar (salt referans, derlenmez)
ios/                  # Native proje + SafakWidget hedefi
```

Yeni bir üst düzey klasör açmadan önce mevcut yapının neden yetmediğini
düşün. "Belki lazım olur" diye boş klasör açma.

## 4. Kodlama kuralları

- **TypeScript strict mode açık kalır.** `any` kullanma; gerçekten bilinmeyen
  bir tip varsa `unknown` yaz ve daralt.
- **Bileşenler küçük kalsın.** Bir dosya 200 satırı geçiyorsa muhtemelen
  bölünmesi gerekiyor demektir — istisna: `lib/` altındaki saf hesaplama
  dosyaları.
- **Tarih hesaplama mantığı tek bir yerde yaşar** (`lib/date.ts` gibi). Bunu
  bileşen içine yayma; hem test edilebilirlik hem de widget ile RN tarafının
  aynı mantığı kullanması için tek kaynak şart.
- **İl/plaka eşlemesi sabit bir veri dosyasında** (`constants/iller.ts`), kod
  içine gömülü obje literalleri olarak dağıtılmaz.
- **Yorumlar neden'i açıklar, ne'yi değil.** "Kalan günü hesapla" gibi bariz
  yorumlar yazma; "tezkere gece yarısından önce sayılmasın diye +1" gibi
  gerekçe yaz.
- **Kullanılmayan kodu, TODO yığınını ve `console.log`'ları commit'e bırakma.**

## 5. Yerelleştirme ve içerik

- Uygulama dili Türkçe. Tüm kullanıcıya görünen metinler `strings.ts` gibi tek
  bir dosyada toplanır — component içine hardcode edilmiş Türkçe metin yok.
  Bu, ileride İngilizce sürüm çıkarsa (diaspora kitlesi düşünülebilir) işi
  kolaylaştırır.
- Askerlik süresiyle ilgili net veya kesin ifadeler kullanma ("kesin tezkere
  tarihiniz X'tir" gibi). Süre kullanıcı girdisine dayanır, resmî bir kaynak
  değildir. Uygulama içinde bunu belirten kısa bir not bulunmalı.

## 6. Performans

- Widget ve kilit ekranı verisi saniyede güncellenmez (iOS bunu zaten
  sınırlar) — gün bazlı veya en fazla dakikalık güncelleme yeterli. Ana
  uygulama içindeki canlı sayaç için `setInterval` kullanılabilir ama ekran
  arka plandayken timer'ı durdur (`AppState` dinleyerek).
  yeniden render'ı önle.
- Liste render'larında (şafak yolu / 81 il ızgarası) `FlatList` veya
  `FlashList` kullan, 81 öğeyi `.map` ile doğrudan basmak sorun değil ama
  eğer ileride liste büyürse bu değişmeli — şimdiden not düş.

## 7. IAP ve gelir mantığı

- Tek seferlik kilit açma (`non_consumable`) kullanılacak, abonelik değil.
- Ücretsiz sürümde: temel sayaç ve tek bir tema. Kilitli: il adlarıyla sayım,
  ek temalar, widget, paylaşım kartı özelleştirme.
- Kullanım başına maliyeti olan hiçbir dış API'ye (ör. token bazlı yapay
  zekâ servisi) bağımlılık ekleme — bu, tek seferlik ödeme modeliyle
  çelişir ve maliyet riski doğurur.
- Satın alma durumu cihaz yeniden kurulduğunda "Satın alımları geri yükle"
  ile kurtarılabilmeli; bu akış olmadan App Store incelemesi geçmez.

## 8. Ajanın YAPMAMASI gerekenler

- Kaynağı belirtilmeyen paket ekleme. Yeni bir bağımlılık eklerken neden
  gerektiğini kısaca açıkla.
- Widget hedefini (`ios/SafakWidget/`) React Native tarafından "kolaylaştırma"
  adına JS'e taşımaya çalışma — WidgetKit yerel kalmak zorunda.
- Tasarımdaki renk paletini veya tipografiyi kendi zevkine göre değiştirme;
  değişiklik gerekiyorsa önce sor.
- Askerlik mevzuatına dair (süre, muafiyet, bedelli şartları vb.) kesin
  hukuki/idari bilgi üretme veya kod içi sabit olarak gömme; bu bilgiler
  değişebilir, uygulama bunu bir hesap makinesi gibi sunmalı, resmî kaynak
  gibi değil.

## 9. Definition of done

Bir görev şu şartları karşılamadan tamamlanmış sayılmaz:
- TypeScript hatasız derleniyor (`tsc --noEmit`).
- Yeni eklenen ekran hem açık hem koyu sistem temasında test edildi.
- Gerçek cihazda (simulator değil) en az bir kez çalıştırıldı.
- Tarih hesaplama değişikliği varsa `lib/date.ts` içindeki birim testleri
  güncellendi ve geçiyor.

## 10. Commit ve PR

- Commit mesajları kısa, emir kipinde ve Türkçe: `Şafak yolu ızgarasını ekle`
  gibi.
- Bir PR tek bir konuyu ele alır. Tasarım değişikliği ile mantık değişikliğini
  aynı PR'da karıştırma.

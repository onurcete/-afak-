# UI_SPEC.md — Şafak Sayar arayüz spesifikasyonu

Bu doküman, `design/safak-sayar-tasarim.html` referans tasarımının React
Native'e nasıl çevrileceğini tanımlar. Bir kodlama ajanına arayüzü
uygulatırken bu dosyayı `AGENT.md` ile birlikte ver. Amaç: ajanın kendi
estetik kararlarını almasını değil, burada tanımlanan sistemi uygulamasını
sağlamak.

## 0. Referans

Önce `design/safak-sayar-tasarim.html` dosyasını tarayıcıda aç ve incele.
Bu dosya kaynak niyettir — piksel piksel kopyalanacak bir web sayfası değil,
ama renk, tipografi, oran ve mikro-etkileşim kararlarının kaynağıdır. HTML'de
kullanılan CSS grid/flex düzenleri React Native'e View/flexbox olarak
çevrilir; web'e özgü hover durumları yok sayılır.

## 1. Tasarım token'ları

### Renkler

```ts
// constants/colors.ts
export const colors = {
  dark: {
    bg: '#0A1020',        // uygulama zemini (gece mavisi, tepe)
    bgBottom: '#0E1830',  // zemin gradyanı alt tonu
    ink: '#F3F1EA',       // birincil metin (plaka beyazı)
    mut: '#9DA8BD',       // ikincil metin
    line: 'rgba(243,241,234,0.16)',
    dawn: '#FFD6B0',      // vurgu — şafak şeftalisi
    plateBg: '#F6F6F1',   // plaka zemini
    plateInk: '#101216',  // plaka yazısı
    plateBand: '#1F3FA8', // plaka "TR" bandı
  },
  light: {
    bg: '#E8EAEF',
    ink: '#10131A',
    mut: '#576072',
    line: 'rgba(16,19,26,0.14)',
  },
} as const;
```

Uygulama varsayılan olarak **koyu temada** açılır — tasarımın kimliği
(gece göğü + şafak ışığı) koyu zeminde çalışıyor. Açık tema, sistem
ayarına uyan ikincil bir mod olarak sunulabilir ama koyu tema birincil
deneyimdir; bu iki tema arasında eşit ağırlık verilmiş bir seçim gibi
davranma.

### Tipografi

- **Başlık / rakam ailesi:** Barlow Condensed (600/700 ağırlık). Büyük
  sayılar, plaka rakamı, "şafak yolu" başlıkları hep bu ailede.
- **Gövde ailesi:** Barlow (400/500/600). Etiketler, açıklamalar, buton
  metinleri.
- Expo'da `expo-font` ile Google Fonts'tan yüklenir. Sistem fontuna
  düşmeyi (fallback) unutma — font yüklenene kadar layout sıçramasın diye
  `useFonts` sonucu hazır olmadan ana ekranı render etme.

| Rol | Aile | Ağırlık | Boyut (px) |
|---|---|---|---|
| Plaka rakamı | Barlow Condensed | 700 | 64 (hero'da), 26 (kartlarda) |
| Büyük gün sayısı | Barlow Condensed | 700 | 112 (hero), 30–60 (widget) |
| Ekran başlığı | Barlow Condensed | 700 | 44 |
| İl adı | Barlow Condensed | 600 | 38 |
| Gövde metni | Barlow | 400 | 15 |
| Etiket / mut | Barlow | 500 | 12–13.5 |

### Boşluk ve köşe yuvarlama

- Kart/telefon köşe yarıçapı: 16–18px (butonlar, alanlar), 28–36px (widget,
  büyük kartlar).
- Ekran yatay kenar boşluğu: 22px.
- Dikey ritim: 8px'in katları (8, 10, 12, 16, 20, 22).

## 2. Yeniden kullanılabilir bileşenler

Ajan bu bileşenleri `components/` altında ayrı dosyalar olarak oluşturmalı,
her ekran kendi içinde tekrar çizmemeli.

### `<PlateBadge n={number} size="hero" | "card" | "sm" />`
Plaka görünümü: solda mavi "TR" bandı, sağda büyük rakam, beyaz zemin,
koyu kenarlık. `size` prop'u hero (ana ekran), card (paylaşım/widget) ve
sm (liste/ızgara) ölçeklerini kapsar. Rakam her zaman iki haneli
gösterilir (`01`–`81`), tabular/monospace rakam davranışı şart — rakam
değişirken genişlik oynamamalı.

### `<ProgressArc from={Date} to={Date} now={Date} />`
Katılıştan tezkereye kavisli bir ilerleme çizgisi; üzerinde ilerlemeyle
birlikte kayan bir "güneş" noktası. SVG (`react-native-svg`) ile
uygulanır. Web tasarımındaki quadratic Bezier eğrisinin aynısı kullanılır.
Alt satırda üç etiket: katılış tarihi (sol), yüzde (orta), tezkere tarihi
(sağ).

### `<CountdownHero remainingDays={number} ilAdi?={string} />`
Üç duruma göre içerik değiştiren tek bileşen (state'i component dışına
sızdırma):
- **`far`** (kalan gün > 81): büyük sayı + "gün kaldı".
- **`plate`** (1 ≤ kalan gün ≤ 81): `PlateBadge` + il adı + saat:dakika:saniye
  geri sayımı.
- **`done`** (kalan gün = 0): "Tezkere günü" mesajı, kutlama tonu.

### `<SafakYoluGrid selected={number} onSelect={(n:number)=>void} />`
81 hücrelik ızgara (9×9). Geçmiş şafaklar soluk dolu, gelecekler boş
çerçeveli, bugünün hücresi plaka rengiyle vurgulu. `FlatList`
`numColumns={9}` ile kurulabilir; 81 öğe için performans sorunu
beklenmez.

### `<ShareCard />`
Paylaşım için render edilen, ekran dışı bir görünüm (`react-native-view-shot`
ile PNG'ye çevrilir). Instagram hikâyesi oranında (9:16), tasarımdaki
paylaşım telefonu ekranıyla birebir örtüşür.

## 3. Ekranlar

### 3.1 Kurulum (`app/onboarding.tsx`)
- İki tarih alanı: katılış, tezkere (native `DateTimePicker`).
- "Kendim için / Yakınım için" segment kontrolü — bu sadece dil tonunu
  değiştirir ("tezkeren" / "tezkeresi"), ayrı bir veri modeli gerekmez.
- "Şafak 81'de il adlarıyla say" anahtarı, varsayılan açık.
- Alt CTA: "Saymaya başla" — tarihler geçerli olmadan aktif olmaz
  (tezkere tarihi katılıştan sonra olmalı; basit bir doğrulama).

### 3.2 Ana ekran (`app/(tabs)/index.tsx`)
- Üstte marka rozeti (küçük plaka ikonu + "Şafak").
- Ortada `CountdownHero`.
- Altında `ProgressArc`.
- En altta iki buton: "Paylaş" (birincil, şafak rengi dolgu) ve "Şafak
  yolu" (ikincil, çerçeveli).
- Sağ üstte paylaş ikon butonu (hızlı erişim, alt buton ile aynı işi
  yapar — biri kaldırılabilir, ikisi de tasarımda var çünkü kullanıcı
  davranışı test edilmeden hangisinin daha çok kullanılacağı belli değil).

### 3.3 Şafak yolu (`app/safak-yolu.tsx`)
- Üstte özet ("X şafak geçti, Y kaldı").
- `SafakYoluGrid`.
- Alt bilgi kartı: seçili hücrenin plakası, il adı, tarihi ve bugüne
  göre göreli konumu ("3 gün sonra" / "bugün" / "5 gün önce").

### 3.4 Paylaşım (modal/sheet, ayrı route değil)
- `ShareCard` önizlemesi + "Kaydet" / "Paylaş" (native share sheet)
  butonları.

### 3.5 Ayarlar (`app/(tabs)/settings.tsx`)
Tasarımda ayrı bir ekran olarak çizilmedi ama gerçek uygulamada şart:
tarihleri düzenleme, tema, bildirim tercihi, satın alımları geri yükle,
gizlilik politikası linki. Bu ekranın görsel dili ana ekranla aynı token
setini kullanır, ayrı bir stil icat etme.

## 4. Widget (native, ayrı iş)

Widget'ın görsel dili bu spec'teki token'larla birebir aynı olmalı (aynı
plaka bileşeni, aynı şafak rengi) ama kodu SwiftUI'da, `ios/SafakWidget/`
altında yazılır. React Native tarafı sadece App Group üzerinden veri
yazar (`{kalanGün, ilAdı, ilerlemeYüzdesi}` gibi küçük bir JSON). Widget'ın
kendi layout kararlarını bu dosyadaki renk/tipografi token'larına göre
Swift tarafında yeniden tanımla — token'ları iki kez elle senkronize etmek
yerine tek bir `DesignTokens.swift` + `colors.ts` çiftini kaynak kabul et
ve ikisini birbirinden türetmeyi (ör. bir JSON'dan kod üretme scripti)
ileride değerlendir; ilk sürümde elle senkron tutmak yeterli.

## 5. Animasyon ve mikro-etkileşim

- Sayaç saniyede bir güncellenirken rakam değişimi ani olmamalı; `Reanimated`
  ile hafif bir "kayma" (numeric transition) uygulanabilir, zorunlu değil.
- Plaka rakamı değiştiğinde (gün değiştiğinde) kısa bir vurgulama (ölçek
  1 → 1.05 → 1) uygulanabilir.
- Anahtar (switch) ve buton dokunuşlarında sistem haptics'i kullan
  (`expo-haptics`, hafif dokunuş).
- `prefers-reduced-motion` karşılığı olarak `AccessibilityInfo.isReduceMotionEnabled()`
  kontrol edilmeli; açıksa vurgulama/kayma efektleri devre dışı bırakılır.

## 6. Erişilebilirlik

- Plaka bileşeni ekran okuyucuya "Şafak otuz dört, İstanbul" gibi tek bir
  anlamlı etiketle okunmalı (`accessibilityLabel`), rakam ve il adını ayrı
  ayrı okutma.
- Şafak yolu ızgarasındaki her hücre kendi `accessibilityLabel`'ına sahip
  olmalı ("Şafak 47, Erzurum, geçti" gibi durum bilgisi dahil).
- Renk kontrastı: `ink`/`bg` çifti zaten yüksek kontrastlı; `dawn` vurgu
  rengini küçük metinde tek başına anlam taşıyıcı olarak kullanma (renk
  körü kullanıcılar için ikon/metin ile destekle).

## 7. Ajanın bu dosyayla ilgili YAPMAMASI gerekenler

- Token'ları component içine gömme; her zaman `constants/colors.ts` ve
  tipografi sabitlerinden oku.
- Barlow/Barlow Condensed yerine sistem fontunu "geçici" diye bırakıp
  unutma — font yüklemesi ilk PR'da bitmeli.
- Ekranlardan birini (özellikle Ayarlar) "sonra hallederiz" diyip tasarım
  dilinden bağımsız, hızlıca uydurma bir stille doldurma.

// constants/strings.ts
// AGENT.md: Tüm kullanıcıya görünen metinler tek bir dosyada toplanır; component içinde hardcoded metin barındırılmaz.

export type TargetPerson = 'self' | 'relative';

export const strings = {
  appName: 'Şafak+',
  brandTag: 'ŞAFAK',

  // Onboarding
  onboarding: {
    title: 'Şafak Sayar',
    subtitle: 'Tezkereye kalan her anı takip edin.',
    targetLabel: 'Kimin için sayıyorsun?',
    targetSelf: 'Kendim için',
    targetRelative: 'Yakınım için',
    startDateLabel: 'Sülüs / Katılış Tarihi',
    endDateLabel: 'Tahmini Tezkere Tarihi',
    safak81Toggle: 'Şafak 81’de plaka ile say',
    safak81Hint: 'Son 81 gün kaldığında Türkiye illeriyle geri sayım başlar.',
    submitButton: 'Saymaya Başla',
    dateError: 'Tezkere tarihi katılış tarihinden sonraki bir tarih olmalıdır.',
    disclaimer: 'Not: Hesaplamalar girdiğiniz tarihlere dayanır, resmî terhis belgesi niteliği taşımaz.',
  },

  // Ana Ekran (Home)
  home: {
    plateLabel: 'Şafak',
    daysRemaining: 'GÜN KALDI',
    hoursShort: 'sa',
    minutesShort: 'dk',
    secondsShort: 'sn',
    progressStart: 'Katılış',
    progressEnd: (target: TargetPerson) => (target === 'self' ? 'Tezkeren' : 'Tezkeresi'),
    shareButton: 'Şafağı Paylaş',
    safakYoluButton: 'Şafak Yolu',
    doneTitle: 'Hayırlı Tezkereler!',
    doneSubtitle: (target: TargetPerson) =>
      target === 'self'
        ? 'Vatani görevini başarıyla tamamladın. Yolun açık olsun!'
        : 'Vatani görev başarıyla tamamlandı. Hayırlı olsun!',
    doneBadge: 'TEZKERECİ',
    farStatusPrefix: 'Şafak',
    relativeRemaining: (target: TargetPerson) => (target === 'self' ? 'Tezkerene kalan' : 'Tezkeresine kalan'),
  },

  // Şafak Yolu (Safak-yolu screen)
  safakYolu: {
    title: 'Şafak Yolu',
    summary: (passed: number, remaining: number) => `${passed} şafak geçti, ${remaining} kaldı`,
    todayBadge: 'Bugün',
    pastStatus: 'Geçti',
    futureStatus: 'Gelecek',
    daysAgo: (d: number) => `${d} gün önce`,
    daysLater: (d: number) => `${d} gün sonra`,
    cityDateLabel: 'Tahmini Tarih',
    closeButton: 'Kapat',
    selectHint: 'Detay görmek için bir ile dokunun',
  },

  // Paylaşım (ShareCard & ShareModal)
  share: {
    modalTitle: 'Şafağı Paylaş',
    storyFormat: 'Hikaye Formatı (9:16)',
    saveButton: 'Görseli Kaydet',
    shareSheetButton: 'Paylaş',
    cardFooter: 'Şafak+ uygulaması ile sayıldı',
    sharingError: 'Görsel paylaşılırken bir hata oluştu.',
    shareSubject: (target: TargetPerson, remaining: number, ilAdi?: string) =>
      ilAdi
        ? `Şafak: ${ilAdi} (${remaining} gün)! 🇹🇷`
        : `Tezkereye ${remaining} gün kaldı! 🇹🇷`,
  },

  // Ayarlar (Settings)
  settings: {
    title: 'Ayarlar',
    sectionDates: 'Tarih Bilgileri',
    sectionPreferences: 'Tercihler',
    sectionPremium: 'Şafak+ Pro',
    sectionAbout: 'Hakkında',
    startDate: 'Katılış Tarihi',
    endDate: 'Tezkere Tarihi',
    targetPerson: 'Geri Sayım Hitabı',
    safak81Mode: '81 İl Sayımı',
    themeMode: 'Tema',
    themeDark: 'Koyu Tema (Varsayılan)',
    themeLight: 'Açık Tema',
    themeSystem: 'Sistem Teması',
    saveChanges: 'Değişiklikleri Kaydet',
    premiumTitle: 'Tek Seferlik Pro',
    premiumDesc: 'Tüm temalar, özel widget’lar ve sınırsız hikaye kartları.',
    restorePurchases: 'Satın Alımları Geri Yükle',
    restoreSuccess: 'Satın alımınız başarıyla geri yüklendi.',
    restoreEmpty: 'Geri yüklenecek bir satın alım bulunamadı.',
    buyPro: 'Pro’ya Yükselt',
    disclaimerTitle: 'Yasal Bilgilendirme',
    disclaimerText:
      'Şafak+ uygulaması resmî bir askerlik şubesi veya Millî Savunma Bakanlığı uygulaması değildir. Hesaplanan tezkere ve kalan gün verileri tamamen kullanıcı girdisine ve tahmine dayanır.',
    version: 'Sürüm 1.0.0',
    privacyPolicy: 'Gizlilik Politikası',
  },

  // Erişilebilirlik (Accessibility)
  a11y: {
    plateBadge: (plaka: number, ilAdi: string) => `Şafak ${plaka}, ${ilAdi}`,
    gridCell: (plaka: number, ilAdi: string, status: string) =>
      `Şafak ${plaka}, ${ilAdi}, durum: ${status}`,
    progressLabel: (percent: number) => `Askerlik ilerlemesi yüzde ${percent}`,
  },
} as const;

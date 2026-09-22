// constants/strings.ts
// AGENT.md: Tüm kullanıcıya görünen metinler tek bir dosyada toplanır; component içinde hardcoded metin barındırılmaz.

export type TargetPerson = 'self' | 'relative';

export const strings = {
  appName: 'Şafak+',
  brandTag: 'ŞAFAK',

  // Onboarding
  onboarding: {
    title: 'Şafak+',
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
    progressEnd: (target: TargetPerson) => (target === 'self' ? 'Tezkerem' : 'Kavuşma Vakti'),
    shareButton: 'Şafağı Paylaş',
    safakYoluButton: 'Şafak Yolu',
    doneTitle: 'Hayırlı Tezkereler!',
    doneSubtitle: (target: TargetPerson) =>
      target === 'self'
        ? 'Vatani görevini başarıyla tamamladın. Yolun açık olsun!'
        : 'Vatani görev başarıyla tamamlandı. Hayırlı olsun!',
    doneBadge: 'TEZKERECİ',
    farStatusPrefix: 'Şafak',
    relativeRemaining: (target: TargetPerson) => (target === 'self' ? 'Tezkereme Kalan' : 'Kavuşmamıza Kalan'),
  },

  // Tarih Seçici Modalı
  datePicker: {
    titleStart: 'Katılış (Sülüs) Tarihini Seç',
    titleEnd: 'Tezkere Tarihini Seç',
    confirmBtn: '✓ Tarihi Seç ve Onayla',
    cancelBtn: 'Vazgeç',
    selectedDateLabel: 'Seçili Tarih:',
    changeButton: 'Tarihi Değiştir',
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

  // Günlük (Diary)
  diary: {
    tabTitle: 'Günlük',
    title: 'Şafak Günlüğü',
    subtitle: 'Askerlik anılarını gün gün ölümsüzleştir.',
    emptyTitle: 'İlk Şafağını Not Düş',
    emptySubtitle: 'Askerlik günlerin birer hatıra olarak kalsın. Bugün hissettiklerini, yaşadıklarını veya nöbet anını kaydet.',
    addTodayBtn: 'Bugünün Şafağına Not Ekle',
    addNewBtn: 'Yeni Anı Ekle',
    addNote: 'Yeni Anı Ekle',
    quickModalTitle: (gunNo: number, plakaIl?: string) =>
      plakaIl ? `Şafak ${gunNo} — ${plakaIl} Anısı` : `Şafak ${gunNo}. Gün Anısı`,
    notePlaceholder: 'Bugün neler yaşadın? Birkaç cümleyle anını not düş...',
    charCount: (current: number, max: number) => `${current}/${max}`,
    addPhotoBtn: 'Fotoğraf Ekle',
    changePhotoBtn: 'Fotoğrafı Değiştir',
    removePhotoBtn: 'Kaldır',
    photoProBadge: 'PRO',
    photoProHint: 'Fotoğraflı anılar Şafak+ Pro özelliğidir.',
    saveNoteBtn: 'Anıyı Kaydet',
    saving: 'Kaydediliyor...',
    deleteNoteBtn: 'Anıyı Sil',
    editNoteBtn: 'Düzenle',
    deleteConfirmTitle: 'Anıyı Sil',
    deleteConfirmDesc: 'Bu güne ait anı ve fotoğraf silinecektir. Emin misiniz?',
    deleteConfirmYes: 'Evet, Sil',
    cancelBtn: 'Vazgeç',
    futureDayWarning: 'Henüz yaşanmamış bir günün anısı olmaz. Şafağın gelmesini bekle!',
    hasNoteBadge: 'Anı Var ✍',
    noNoteYet: 'Bu güne henüz anı eklenmedi.',
    exportTitle: 'Günlüğü Dışa Aktar',
    exportButton: 'Günlüğü Dışa Aktar',
    exportSub: 'Tüm anılarınızı metin/JSON olarak yedekleyin',
    exportSuccess: 'Günlük başarıyla dışa aktarıldı.',
    exportEmpty: 'Dışa aktarılacak kayıtlı anı bulunamadı.',
    tezkereAlbumTitle: 'Tezkere Anı Albümü',
    tezkereAlbumDesc: 'Tüm askerlik boyunca biriktirdiğin anıların özeti',
    tezkereAlbumBtn: 'Anı Kolajını Gör',
    tezkereAlbumShare: 'Albüm Kartını Paylaş',
    totalMemories: (count: number) => `${count} anı kaydedildi`,
  },

  // Ayarlar (Settings)
  settings: {
    title: 'Ayarlar',
    sectionDates: 'Tarih Bilgileri',
    sectionPreferences: 'Tercihler',
    sectionPremium: 'Şafak+ Pro',
    sectionReset: 'Sıfırlama',
    sectionAbout: 'Hakkında',
    startDate: 'Katılış Tarihi',
    endDate: 'Tezkere Tarihi',
    targetPerson: 'Geri Sayım Hitabı',
    targetPersonHint: 'Hitap modu uygulama içindeki tüm metinleri ve paylaşım kartlarını buna göre özelleştirir.',
    targetPersonDescSelf: 'Askerlik yapıyorum ("Tezkereme kalan", "Şafağım")',
    targetPersonDescRelative: 'Asker bekliyorum ("Kavuşmamıza kalan", "Kavuşma vakti")',
    dateStats: (total: number, passed: number, percent: number) =>
      `Toplam ${total} gün • ${passed} gün geride kaldı (%${percent})`,
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
    resetApp: 'Uygulamayı Sıfırla',
    resetAppSub: 'Tüm tarih ve ayarları silip kurulum ekranına dön',
    resetConfirmTitle: 'Verileri Sıfırla',
    resetConfirmDesc: 'Tüm kayıtlı tarihleriniz ve tercihleriniz silinecek, başlangıç kurulum ekranına yönlendirileceksiniz. Devam etmek istiyor musunuz?',
    resetCancel: 'Vazgeç',
    resetConfirmBtn: 'Evet, Sıfırla',
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

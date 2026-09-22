// app/(tabs)/settings.tsx
// UI_SPEC.md: Ayarlar ekranı: tarihleri düzenleme, tema tercihi, satın alımları geri yükle, yasal feragat, veri sıfırlama.

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { strings, TargetPerson } from '../../constants/strings';
import { useAppStore } from '../../lib/storage';
import { formatTurkishDate, calculateSafak } from '../../lib/date';
import { restorePurchases, purchasePro } from '../../lib/iap';
import { DatePickerModal } from '../../components/DatePickerModal';
import { useDiaryStore } from '../../lib/diary';

export default function SettingsScreen() {
  const router = useRouter();

  const startDateStr = useAppStore((state) => state.startDate);
  const endDateStr = useAppStore((state) => state.endDate);
  const targetPerson = useAppStore((state) => state.targetPerson);
  const safak81Mode = useAppStore((state) => state.safak81Mode);
  const themeMode = useAppStore((state) => state.themeMode);
  const isPro = useAppStore((state) => state.isPro);

  const setDates = useAppStore((state) => state.setDates);
  const setTargetPerson = useAppStore((state) => state.setTargetPerson);
  const setSafak81Mode = useAppStore((state) => state.setSafak81Mode);
  const setThemeMode = useAppStore((state) => state.setThemeMode);
  const setIsPro = useAppStore((state) => state.setIsPro);
  const reset = useAppStore((state) => state.reset);

  const [pickerType, setPickerType] = useState<'start' | 'end' | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  const isDark = themeMode !== 'light';
  const currentColors = isDark ? colors.dark : colors.light;

  const calculation = calculateSafak(startDateStr, endDateStr, new Date());

  const handleConfirmDate = (selectedDate: Date) => {
    if (pickerType === 'start') {
      setDates(selectedDate.toISOString(), endDateStr);
    } else if (pickerType === 'end') {
      setDates(startDateStr, selectedDate.toISOString());
    }
  };

  const handleRestore = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    setIsRestoring(true);
    const result = await restorePurchases();
    setIsRestoring(false);

    if (result.success && result.isPro) {
      setIsPro(true);
      Alert.alert('Başarılı', strings.settings.restoreSuccess);
    } else {
      Alert.alert('Bilgi', result.message || strings.settings.restoreEmpty);
    }
  };

  const handleBuyPro = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    const result = await purchasePro();
    if (result.success && result.isPro) {
      setIsPro(true);
      Alert.alert('Tebrikler!', 'Şafak+ Pro aktif edildi!');
    } else if (result.message && result.message !== 'İşlem iptal edildi.') {
      Alert.alert('Hata', result.message);
    }
  };

  const handleResetApp = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {}

    Alert.alert(
      strings.settings.resetConfirmTitle,
      strings.settings.resetConfirmDesc,
      [
        { text: strings.settings.resetCancel, style: 'cancel' },
        {
          text: strings.settings.resetConfirmBtn,
          style: 'destructive',
          onPress: async () => {
            try {
              await useDiaryStore.getState().clearAll();
            } catch {}
            reset();
            router.replace('/onboarding');
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: currentColors.bg }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Başlık */}
      <View style={styles.header}>
        <Text style={[styles.screenTitle, { color: currentColors.ink }]}>
          {strings.settings.title}
        </Text>
      </View>

      {/* Tarih Bölümü */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: currentColors.mut }]}>
          {strings.settings.sectionDates}
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: currentColors.cardBg, borderColor: currentColors.cardBorder }]}>
        {/* Katılış Tarihi - Tüm Satır Tıklanabilir */}
        <TouchableOpacity
          style={styles.clickableDateRow}
          onPress={() => setPickerType('start')}
          activeOpacity={0.7}
        >
          <View style={styles.dateInfoCol}>
            <Text style={[styles.rowLabel, { color: currentColors.mut }]}>
              {strings.settings.startDate}
            </Text>
            <Text style={[styles.rowValue, { color: currentColors.ink }]}>
              📅 {formatTurkishDate(startDateStr)}
            </Text>
          </View>
          <View
            style={[
              styles.changeBadge,
              { backgroundColor: isDark ? 'rgba(255,214,176,0.12)' : '#E2E8F0' },
            ]}
          >
            <Text
              style={[
                styles.changeBadgeText,
                { color: isDark ? currentColors.dawn : currentColors.ink },
              ]}
            >
              {strings.datePicker.changeButton} ✎
            </Text>
          </View>
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: currentColors.line }]} />

        {/* Tezkere Tarihi - Tüm Satır Tıklanabilir */}
        <TouchableOpacity
          style={styles.clickableDateRow}
          onPress={() => setPickerType('end')}
          activeOpacity={0.7}
        >
          <View style={styles.dateInfoCol}>
            <Text style={[styles.rowLabel, { color: currentColors.mut }]}>
              {strings.settings.endDate}
            </Text>
            <Text style={[styles.rowValue, { color: currentColors.ink }]}>
              🎯 {formatTurkishDate(endDateStr)}
            </Text>
          </View>
          <View
            style={[
              styles.changeBadge,
              { backgroundColor: isDark ? 'rgba(255,214,176,0.12)' : '#E2E8F0' },
            ]}
          >
            <Text
              style={[
                styles.changeBadgeText,
                { color: isDark ? currentColors.dawn : currentColors.ink },
              ]}
            >
              {strings.datePicker.changeButton} ✎
            </Text>
          </View>
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: currentColors.line }]} />

        {/* Canlı İstatistik Önizleme */}
        <View style={styles.statsPreviewRow}>
          <Text style={[styles.statsPreviewText, { color: currentColors.mut }]}>
            {strings.settings.dateStats(
              calculation.totalDays,
              calculation.passedDays,
              calculation.progressPercent
            )}
          </Text>
          <View
            style={[
              styles.percentPill,
              {
                backgroundColor: isDark
                  ? 'rgba(255,214,176,0.15)'
                  : '#FEF3C7',
              },
            ]}
          >
            <Text
              style={[
                styles.percentPillText,
                { color: isDark ? currentColors.dawn : '#B45309' },
              ]}
            >
              %{calculation.progressPercent}
            </Text>
          </View>
        </View>
      </View>

      {/* Tercihler */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: currentColors.mut }]}>
          {strings.settings.sectionPreferences}
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: currentColors.cardBg, borderColor: currentColors.cardBorder }]}>
        {/* Hitap Tonu */}
        <View style={styles.row}>
          <Text style={[styles.prefLabel, { color: currentColors.ink }]}>
            {strings.settings.targetPerson}
          </Text>
          <View style={[styles.segmentContainer, { backgroundColor: currentColors.segmentBg }]}>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                targetPerson === 'self' && { backgroundColor: currentColors.segmentActiveBg },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setTargetPerson('self');
              }}
            >
              <Text
                style={[
                  styles.segmentButtonText,
                  { color: targetPerson === 'self' ? currentColors.segmentActiveText : currentColors.mut },
                ]}
              >
                Kendim
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.segmentButton,
                targetPerson === 'relative' && { backgroundColor: currentColors.segmentActiveBg },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setTargetPerson('relative');
              }}
            >
              <Text
                style={[
                  styles.segmentButtonText,
                  { color: targetPerson === 'relative' ? currentColors.segmentActiveText : currentColors.mut },
                ]}
              >
                Yakınım
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hitap Modu Açıklaması */}
        <View
          style={[
            styles.hintBox,
            {
              backgroundColor: isDark ? 'rgba(255,214,176,0.06)' : '#F8FAFC',
              borderColor: currentColors.line,
            },
          ]}
        >
          <Text style={[styles.hintText, { color: currentColors.mut }]}>
            💡 {targetPerson === 'self' ? strings.settings.targetPersonDescSelf : strings.settings.targetPersonDescRelative}
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: currentColors.line }]} />

        {/* 81 İl Sayımı */}
        <View style={styles.row}>
          <View style={styles.switchCol}>
            <Text style={[styles.prefLabel, { color: currentColors.ink }]}>
              {strings.settings.safak81Mode}
            </Text>
            <Text style={[styles.subHintText, { color: currentColors.mut }]}>
              Son 81 günde plaka illeriyle sayım
            </Text>
          </View>
          <Switch
            value={safak81Mode}
            onValueChange={(val) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSafak81Mode(val);
            }}
            trackColor={{ false: isDark ? 'rgba(243,241,234,0.15)' : '#CBD5E1', true: currentColors.dawn }}
            thumbColor={safak81Mode ? (isDark ? '#101216' : '#FFFFFF') : '#94A3B8'}
          />
        </View>

        <View style={[styles.divider, { backgroundColor: currentColors.line }]} />

        {/* Tema */}
        <View style={styles.row}>
          <Text style={[styles.prefLabel, { color: currentColors.ink }]}>
            {strings.settings.themeMode}
          </Text>
          <View style={[styles.segmentContainer, { backgroundColor: currentColors.segmentBg }]}>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                themeMode === 'dark' && { backgroundColor: currentColors.segmentActiveBg },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setThemeMode('dark');
              }}
            >
              <Text
                style={[
                  styles.segmentButtonText,
                  { color: themeMode === 'dark' ? currentColors.segmentActiveText : currentColors.mut },
                ]}
              >
                Koyu
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.segmentButton,
                themeMode === 'light' && { backgroundColor: currentColors.segmentActiveBg },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setThemeMode('light');
              }}
            >
              <Text
                style={[
                  styles.segmentButtonText,
                  { color: themeMode === 'light' ? currentColors.segmentActiveText : currentColors.mut },
                ]}
              >
                Açık
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Şafak+ Pro */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: currentColors.mut }]}>
          {strings.settings.sectionPremium}
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: currentColors.cardBg, borderColor: currentColors.cardBorder }]}>
        <View style={styles.proInfoBlock}>
          <Text style={[styles.proTitle, { color: currentColors.dawn }]}>
            {strings.settings.premiumTitle}
          </Text>
          <Text style={[styles.proDesc, { color: currentColors.mut }]}>
            {strings.settings.premiumDesc}
          </Text>
        </View>

        {!isPro ? (
          <TouchableOpacity
            style={[
              styles.buyProBtn,
              {
                backgroundColor: currentColors.primaryBtnBg,
                shadowColor: isDark ? '#FFD6B0' : '#000000',
              },
            ]}
            onPress={handleBuyPro}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.buyProBtnText,
                { color: currentColors.primaryBtnText },
              ]}
            >
              {strings.settings.buyPro}
            </Text>
          </TouchableOpacity>
        ) : (
          <View
            style={[
              styles.proActiveBadge,
              {
                backgroundColor: isDark
                  ? 'rgba(255,214,176,0.15)'
                  : '#FEF3C7',
              },
            ]}
          >
            <Text
              style={[
                styles.proActiveText,
                { color: isDark ? currentColors.dawn : '#92400E' },
              ]}
            >
              PRO AKTİF ✓
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.restoreBtn}
          onPress={handleRestore}
          disabled={isRestoring}
        >
          <Text style={[styles.restoreBtnText, { color: currentColors.mut }]}>
            {isRestoring ? 'Kontrol ediliyor...' : strings.settings.restorePurchases}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Günlük & Veri Bölümü */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: currentColors.mut }]}>
          {strings.diary.title.toUpperCase()} & VERİ
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: currentColors.cardBg, borderColor: currentColors.cardBorder }]}>
        <Text style={[styles.resetCardTitle, { color: currentColors.ink }]}>
          {strings.diary.exportTitle}
        </Text>
        <Text style={[styles.resetCardDesc, { color: currentColors.mut }]}>
          Tüm şafak günlüğü anılarınızı ve notlarınızı güvenli bir metin dosyası olarak cihazınıza indirin veya paylaşın.
        </Text>

        <TouchableOpacity
          style={[
            styles.exportButton,
            {
              backgroundColor: isDark ? 'rgba(243,241,234,0.06)' : '#F1F5F9',
              borderColor: currentColors.line,
            },
          ]}
          onPress={async () => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              const ok = await useDiaryStore.getState().exportDiary();
              if (!ok) {
                Alert.alert('Bilgi', 'Dışa aktarılacak günlük kaydı bulunamadı.');
              }
            } catch (err: any) {
              Alert.alert('Hata', err?.message || 'Dışa aktarma başarısız oldu.');
            }
          }}
          activeOpacity={0.8}
        >
          <Text style={[styles.exportButtonText, { color: currentColors.ink }]}>
            📥 {strings.diary.exportButton}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sıfırlama Bölümü */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: currentColors.dangerText }]}>
          {strings.settings.sectionReset}
        </Text>
      </View>

      <View
        style={[
          styles.card,
          {
            backgroundColor: currentColors.cardBg,
            borderColor: currentColors.dangerBorder,
          },
        ]}
      >
        <Text style={[styles.resetCardTitle, { color: currentColors.ink }]}>
          {strings.settings.resetApp}
        </Text>
        <Text style={[styles.resetCardDesc, { color: currentColors.mut }]}>
          {strings.settings.resetAppSub}
        </Text>

        <TouchableOpacity
          style={[
            styles.resetButton,
            {
              backgroundColor: currentColors.dangerBg,
              borderColor: currentColors.dangerBorder,
            },
          ]}
          onPress={handleResetApp}
          activeOpacity={0.8}
        >
          <Text style={[styles.resetButtonText, { color: currentColors.dangerText }]}>
            🗑️ {strings.settings.resetApp}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Yasal Feragat & Hakkında */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: currentColors.mut }]}>
          {strings.settings.sectionAbout}
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: currentColors.cardBg, borderColor: currentColors.cardBorder }]}>
        <Text style={[styles.disclaimerHead, { color: currentColors.ink }]}>
          {strings.settings.disclaimerTitle}
        </Text>
        <Text style={[styles.disclaimerBody, { color: currentColors.mut }]}>
          {strings.settings.disclaimerText}
        </Text>
        <View style={[styles.aboutMetaRow, { borderTopColor: currentColors.line }]}>
          <Text style={[styles.versionText, { color: currentColors.mut }]}>
            {strings.settings.version}
          </Text>
          <View style={styles.policyLinksRow}>
            <TouchableOpacity
              onPress={() => Linking.openURL('https://safakplus.app/privacy')}
            >
              <Text style={[styles.privacyLink, { color: currentColors.dawn }]}>
                {strings.settings.privacyPolicy}
              </Text>
            </TouchableOpacity>
            <Text style={{ color: currentColors.line }}>•</Text>
            <TouchableOpacity
              onPress={() => Linking.openURL('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/')}
            >
              <Text style={[styles.privacyLink, { color: currentColors.dawn }]}>
                {strings.settings.termsOfService}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Tarih Seçici Modal */}
      <DatePickerModal
        visible={pickerType !== null}
        title={pickerType === 'start' ? strings.datePicker.titleStart : strings.datePicker.titleEnd}
        value={pickerType === 'start' ? new Date(startDateStr) : new Date(endDateStr)}
        onConfirm={handleConfirmDate}
        onClose={() => setPickerType(null)}
        isDark={isDark}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 22,
    paddingTop: 56,
    paddingBottom: 48,
  },
  header: {
    marginBottom: 20,
  },
  screenTitle: {
    fontSize: typography.sizes.screenTitle,
    fontFamily: typography.fonts.condensed.bold,
    letterSpacing: 1,
  },
  sectionHeader: {
    marginTop: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: typography.fonts.body.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  clickableDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  dateInfoCol: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 12,
    fontFamily: typography.fonts.body.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rowValue: {
    fontSize: 17,
    fontFamily: typography.fonts.condensed.bold,
    marginTop: 4,
  },
  changeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginLeft: 10,
  },
  changeBadgeText: {
    fontSize: 13,
    fontFamily: typography.fonts.body.semiBold,
  },
  statsPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  statsPreviewText: {
    fontSize: 13,
    fontFamily: typography.fonts.body.medium,
    flex: 1,
  },
  percentPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  percentPillText: {
    fontSize: 13,
    fontFamily: typography.fonts.condensed.bold,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  prefLabel: {
    fontSize: 15,
    fontFamily: typography.fonts.body.medium,
  },
  switchCol: {
    flex: 1,
    paddingRight: 10,
  },
  subHintText: {
    fontSize: 12,
    fontFamily: typography.fonts.body.regular,
    marginTop: 2,
  },
  segmentContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
  },
  segmentButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  segmentButtonText: {
    fontSize: 13,
    fontFamily: typography.fonts.body.semiBold,
  },
  hintBox: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 10,
  },
  hintText: {
    fontSize: 12,
    fontFamily: typography.fonts.body.regular,
    lineHeight: 17,
  },
  proInfoBlock: {
    marginBottom: 12,
  },
  proTitle: {
    fontSize: 18,
    fontFamily: typography.fonts.condensed.bold,
    letterSpacing: 0.5,
  },
  proDesc: {
    fontSize: 13,
    fontFamily: typography.fonts.body.regular,
    marginTop: 4,
    lineHeight: 18,
  },
  buyProBtn: {
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  buyProBtnText: {
    fontSize: 16,
    fontFamily: typography.fonts.condensed.bold,
    letterSpacing: 0.8,
  },
  proActiveBadge: {
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    marginVertical: 6,
  },
  proActiveText: {
    fontFamily: typography.fonts.condensed.bold,
    fontSize: 14,
    letterSpacing: 1,
  },
  restoreBtn: {
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  restoreBtnText: {
    fontSize: 13,
    fontFamily: typography.fonts.body.medium,
    textDecorationLine: 'underline',
  },
  resetCardTitle: {
    fontSize: 16,
    fontFamily: typography.fonts.body.semiBold,
  },
  resetCardDesc: {
    fontSize: 13,
    fontFamily: typography.fonts.body.regular,
    marginTop: 4,
    marginBottom: 14,
    lineHeight: 18,
  },
  resetButton: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonText: {
    fontSize: 14,
    fontFamily: typography.fonts.body.semiBold,
  },
  exportButton: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportButtonText: {
    fontSize: 14,
    fontFamily: typography.fonts.body.semiBold,
  },
  disclaimerHead: {
    fontSize: 14,
    fontFamily: typography.fonts.body.semiBold,
    marginBottom: 4,
  },
  disclaimerBody: {
    fontSize: 12,
    fontFamily: typography.fonts.body.regular,
    lineHeight: 18,
  },
  aboutMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  versionText: {
    fontSize: 12,
    fontFamily: typography.fonts.body.regular,
  },
  privacyLink: {
    fontSize: 12,
    fontFamily: typography.fonts.body.medium,
  },
  policyLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

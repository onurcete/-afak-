// app/(tabs)/settings.tsx
// UI_SPEC.md: Ayarlar ekranı: tarihleri düzenleme, tema tercihi, satın alımları geri yükle, yasal feragat.
// Tasarım token'ları ana ekran ile birebir aynı tutulur.

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { strings, TargetPerson } from '../../constants/strings';
import { useAppStore } from '../../lib/storage';
import { formatTurkishDate } from '../../lib/date';
import { restorePurchases, purchasePro } from '../../lib/iap';

export default function SettingsScreen() {
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

  const [startDate, setStartDate] = useState<Date>(new Date(startDateStr));
  const [endDate, setEndDate] = useState<Date>(new Date(endDateStr));
  const [showPicker, setShowPicker] = useState<'start' | 'end' | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  const isDark = themeMode !== 'light';
  const currentColors = isDark ? colors.dark : colors.light;

  const handleStartDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setShowPicker(null);
    if (date) {
      setStartDate(date);
      setDates(date.toISOString(), endDate.toISOString());
    }
  };

  const handleEndDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setShowPicker(null);
    if (date) {
      setEndDate(date);
      setDates(startDate.toISOString(), date.toISOString());
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
        {/* Katılış Tarihi */}
        <View style={styles.row}>
          <View>
            <Text style={[styles.rowLabel, { color: currentColors.mut }]}>
              {strings.settings.startDate}
            </Text>
            <Text style={[styles.rowValue, { color: currentColors.ink }]}>
              {formatTurkishDate(startDate)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.changeBtn}
            onPress={() => setShowPicker(showPicker === 'start' ? null : 'start')}
          >
            <Text style={[styles.changeBtnText, { color: currentColors.dawn }]}>Değiştir</Text>
          </TouchableOpacity>
        </View>

        {showPicker === 'start' && (
          <View style={styles.pickerWrap}>
            <DateTimePicker
              value={startDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleStartDateChange}
              textColor={currentColors.ink}
              themeVariant={isDark ? 'dark' : 'light'}
            />
          </View>
        )}

        <View style={styles.divider} />

        {/* Tezkere Tarihi */}
        <View style={styles.row}>
          <View>
            <Text style={[styles.rowLabel, { color: currentColors.mut }]}>
              {strings.settings.endDate}
            </Text>
            <Text style={[styles.rowValue, { color: currentColors.ink }]}>
              {formatTurkishDate(endDate)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.changeBtn}
            onPress={() => setShowPicker(showPicker === 'end' ? null : 'end')}
          >
            <Text style={[styles.changeBtnText, { color: currentColors.dawn }]}>Değiştir</Text>
          </TouchableOpacity>
        </View>

        {showPicker === 'end' && (
          <View style={styles.pickerWrap}>
            <DateTimePicker
              value={endDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleEndDateChange}
              textColor={currentColors.ink}
              themeVariant={isDark ? 'dark' : 'light'}
            />
          </View>
        )}
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
          <View style={styles.miniSegment}>
            <TouchableOpacity
              style={[
                styles.miniSegmentBtn,
                targetPerson === 'self' && { backgroundColor: currentColors.dawn },
              ]}
              onPress={() => setTargetPerson('self')}
            >
              <Text
                style={[
                  styles.miniSegmentText,
                  { color: targetPerson === 'self' ? '#101216' : currentColors.mut },
                ]}
              >
                Kendim
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.miniSegmentBtn,
                targetPerson === 'relative' && { backgroundColor: currentColors.dawn },
              ]}
              onPress={() => setTargetPerson('relative')}
            >
              <Text
                style={[
                  styles.miniSegmentText,
                  { color: targetPerson === 'relative' ? '#101216' : currentColors.mut },
                ]}
              >
                Yakınım
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        {/* 81 İl Sayımı */}
        <View style={styles.row}>
          <Text style={[styles.prefLabel, { color: currentColors.ink }]}>
            {strings.settings.safak81Mode}
          </Text>
          <Switch
            value={safak81Mode}
            onValueChange={(val) => setSafak81Mode(val)}
            trackColor={{ false: 'rgba(243,241,234,0.15)', true: currentColors.dawn }}
            thumbColor={safak81Mode ? '#101216' : '#9DA8BD'}
          />
        </View>

        <View style={styles.divider} />

        {/* Tema */}
        <View style={styles.row}>
          <Text style={[styles.prefLabel, { color: currentColors.ink }]}>
            {strings.settings.themeMode}
          </Text>
          <View style={styles.miniSegment}>
            <TouchableOpacity
              style={[
                styles.miniSegmentBtn,
                themeMode === 'dark' && { backgroundColor: currentColors.dawn },
              ]}
              onPress={() => setThemeMode('dark')}
            >
              <Text
                style={[
                  styles.miniSegmentText,
                  { color: themeMode === 'dark' ? '#101216' : currentColors.mut },
                ]}
              >
                Koyu
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.miniSegmentBtn,
                themeMode === 'light' && { backgroundColor: currentColors.dawn },
              ]}
              onPress={() => setThemeMode('light')}
            >
              <Text
                style={[
                  styles.miniSegmentText,
                  { color: themeMode === 'light' ? '#101216' : currentColors.mut },
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
            style={[styles.buyProBtn, { backgroundColor: currentColors.dawn }]}
            onPress={handleBuyPro}
            activeOpacity={0.85}
          >
            <Text style={styles.buyProBtnText}>{strings.settings.buyPro}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.proActiveBadge}>
            <Text style={styles.proActiveText}>PRO AKTİF ✓</Text>
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
        <View style={styles.aboutMetaRow}>
          <Text style={[styles.versionText, { color: currentColors.mut }]}>
            {strings.settings.version}
          </Text>
          <TouchableOpacity
            onPress={() => Linking.openURL('https://safakplus.app/privacy')}
          >
            <Text style={[styles.privacyLink, { color: currentColors.dawn }]}>
              {strings.settings.privacyPolicy}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
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
    marginTop: 18,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: typography.fonts.body.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  rowLabel: {
    fontSize: 12,
    fontFamily: typography.fonts.body.medium,
    textTransform: 'uppercase',
  },
  rowValue: {
    fontSize: 17,
    fontFamily: typography.fonts.condensed.bold,
    marginTop: 2,
  },
  changeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(243,241,234,0.08)',
    borderRadius: 8,
  },
  changeBtnText: {
    fontSize: 13,
    fontFamily: typography.fonts.body.semiBold,
  },
  pickerWrap: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(243,241,234,0.08)',
    marginVertical: 12,
  },
  prefLabel: {
    fontSize: 15,
    fontFamily: typography.fonts.body.medium,
  },
  miniSegment: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 8,
    padding: 3,
  },
  miniSegmentBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  miniSegmentText: {
    fontSize: 12,
    fontFamily: typography.fonts.body.semiBold,
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
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
  },
  buyProBtnText: {
    fontSize: 16,
    fontFamily: typography.fonts.condensed.bold,
    color: '#101216',
    letterSpacing: 0.8,
  },
  proActiveBadge: {
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(255,214,176,0.15)',
    borderRadius: 10,
    marginVertical: 6,
  },
  proActiveText: {
    color: '#FFD6B0',
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
    borderTopColor: 'rgba(243,241,234,0.06)',
  },
  versionText: {
    fontSize: 12,
    fontFamily: typography.fonts.body.regular,
  },
  privacyLink: {
    fontSize: 12,
    fontFamily: typography.fonts.body.medium,
  },
});

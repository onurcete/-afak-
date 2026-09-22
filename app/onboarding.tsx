import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';
import { strings, TargetPerson } from '../constants/strings';
import { useAppStore } from '../lib/storage';
import { formatTurkishDate } from '../lib/date';
import { PlateBadge } from '../components/PlateBadge';
import { DatePickerModal } from '../components/DatePickerModal';

export default function OnboardingScreen() {
  const router = useRouter();
  const setDates = useAppStore((state) => state.setDates);
  const setTargetPerson = useAppStore((state) => state.setTargetPerson);
  const setSafak81Mode = useAppStore((state) => state.setSafak81Mode);
  const setCompletedOnboarding = useAppStore((state) => state.setCompletedOnboarding);

  // Başlangıç tarihi: 2 ay önce, Tezkere: 4 ay sonra (varsayılan makul tarihler)
  const initialStart = new Date();
  initialStart.setMonth(initialStart.getMonth() - 2);

  const initialEnd = new Date();
  initialEnd.setMonth(initialEnd.getMonth() + 4);

  const [startDate, setStartDate] = useState<Date>(initialStart);
  const [endDate, setEndDate] = useState<Date>(initialEnd);
  const [target, setTarget] = useState<TargetPerson>('self');
  const [safak81, setSafak81] = useState<boolean>(true);

  // DatePicker modal kontrolleri
  const [showPicker, setShowPicker] = useState<'start' | 'end' | null>(null);

  const isDateValid = endDate.getTime() > startDate.getTime();

  const handleStartCounting = () => {
    if (!isDateValid) return;

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    setDates(startDate.toISOString(), endDate.toISOString());
    setTargetPerson(target);
    setSafak81Mode(safak81);
    setCompletedOnboarding(true);

    router.replace('/(tabs)');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Üst Logo ve Başlık */}
      <View style={styles.header}>
        <PlateBadge n={81} size="card" cityName="Düzce" />
        <Text style={styles.title}>{strings.onboarding.title}</Text>
        <Text style={styles.subtitle}>{strings.onboarding.subtitle}</Text>
      </View>

      {/* Segment Kontrolü: Kendim için / Yakınım için */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>{strings.onboarding.targetLabel}</Text>
        <View style={styles.segmentContainer}>
          <TouchableOpacity
            style={[
              styles.segmentBtn,
              target === 'self' && styles.segmentBtnActive,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setTarget('self');
            }}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.segmentText,
                target === 'self' && styles.segmentTextActive,
              ]}
            >
              {strings.onboarding.targetSelf}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentBtn,
              target === 'relative' && styles.segmentBtnActive,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setTarget('relative');
            }}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.segmentText,
                target === 'relative' && styles.segmentTextActive,
              ]}
            >
              {strings.onboarding.targetRelative}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Hitap Açıklama Kutusu */}
        <View style={styles.targetHintBox}>
          <Text style={styles.targetHintText}>
            💡 {target === 'self' ? strings.settings.targetPersonDescSelf : strings.settings.targetPersonDescRelative}
          </Text>
        </View>
      </View>

      {/* Tarih Seçiciler */}
      <View style={styles.card}>
        {/* Katılış Tarihi - Tamamı Tıklanabilir */}
        <TouchableOpacity
          style={styles.dateRow}
          onPress={() => setShowPicker('start')}
          activeOpacity={0.7}
        >
          <View style={styles.dateInfo}>
            <Text style={styles.dateLabel}>{strings.onboarding.startDateLabel}</Text>
            <Text style={styles.dateValue}>📅 {formatTurkishDate(startDate)}</Text>
          </View>
          <View style={styles.dateChangeBadge}>
            <Text style={styles.dateChangeText}>{strings.datePicker.changeButton} ✎</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Tezkere Tarihi - Tamamı Tıklanabilir */}
        <TouchableOpacity
          style={styles.dateRow}
          onPress={() => setShowPicker('end')}
          activeOpacity={0.7}
        >
          <View style={styles.dateInfo}>
            <Text style={styles.dateLabel}>{strings.onboarding.endDateLabel}</Text>
            <Text style={styles.dateValue}>🎯 {formatTurkishDate(endDate)}</Text>
          </View>
          <View style={styles.dateChangeBadge}>
            <Text style={styles.dateChangeText}>{strings.datePicker.changeButton} ✎</Text>
          </View>
        </TouchableOpacity>

        {!isDateValid && (
          <Text style={styles.errorText}>{strings.onboarding.dateError}</Text>
        )}
      </View>

      {/* Şafak 81 Anahtarı */}
      <View style={styles.card}>
        <View style={styles.switchRow}>
          <View style={styles.switchTextCol}>
            <Text style={styles.switchLabel}>{strings.onboarding.safak81Toggle}</Text>
            <Text style={styles.switchHint}>{strings.onboarding.safak81Hint}</Text>
          </View>
          <Switch
            value={safak81}
            onValueChange={(val) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSafak81(val);
            }}
            trackColor={{ false: 'rgba(243,241,234,0.15)', true: colors.dark.dawn }}
            thumbColor={safak81 ? '#101216' : '#9DA8BD'}
          />
        </View>
      </View>

      {/* Yasal Not */}
      <Text style={styles.disclaimerText}>{strings.onboarding.disclaimer}</Text>

      {/* CTA Buton */}
      <TouchableOpacity
        style={[
          styles.submitBtn,
          !isDateValid && styles.submitBtnDisabled,
        ]}
        onPress={handleStartCounting}
        disabled={!isDateValid}
        activeOpacity={0.85}
      >
        <Text style={styles.submitBtnText}>{strings.onboarding.submitButton}</Text>
      </TouchableOpacity>

      {/* Tarih Seçici Modalı */}
      <DatePickerModal
        visible={showPicker !== null}
        title={showPicker === 'start' ? strings.datePicker.titleStart : strings.datePicker.titleEnd}
        value={showPicker === 'start' ? startDate : endDate}
        onConfirm={(d) => {
          if (showPicker === 'start') setStartDate(d);
          else if (showPicker === 'end') setEndDate(d);
        }}
        onClose={() => setShowPicker(null)}
        isDark={true}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.bg,
  },
  contentContainer: {
    paddingHorizontal: 22,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: typography.sizes.screenTitle,
    fontFamily: typography.fonts.condensed.bold,
    color: colors.dark.ink,
    marginTop: 16,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: typography.fonts.body.regular,
    color: colors.dark.mut,
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'rgba(243,241,234,0.05)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(243,241,234,0.10)',
    padding: 18,
    marginBottom: 16,
  },
  cardLabel: {
    fontSize: 13,
    fontFamily: typography.fonts.body.medium,
    color: colors.dark.mut,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    padding: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  segmentBtnActive: {
    backgroundColor: colors.dark.dawn,
  },
  segmentText: {
    fontSize: 14,
    fontFamily: typography.fonts.body.medium,
    color: colors.dark.mut,
  },
  segmentTextActive: {
    color: '#101216',
    fontFamily: typography.fonts.body.semiBold,
  },
  targetHintBox: {
    backgroundColor: 'rgba(255,214,176,0.06)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(243,241,234,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 10,
  },
  targetHintText: {
    fontSize: 12,
    fontFamily: typography.fonts.body.regular,
    color: colors.dark.mut,
    lineHeight: 16,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  dateInfo: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    fontFamily: typography.fonts.body.medium,
    color: colors.dark.mut,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateValue: {
    fontSize: 18,
    fontFamily: typography.fonts.condensed.bold,
    color: colors.dark.ink,
    marginTop: 2,
  },
  dateChangeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(243,241,234,0.10)',
    borderRadius: 10,
  },
  dateChangeText: {
    fontSize: 13,
    fontFamily: typography.fonts.body.medium,
    color: colors.dark.dawn,
  },
  pickerContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(243,241,234,0.08)',
    marginVertical: 12,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 8,
    fontFamily: typography.fonts.body.regular,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchTextCol: {
    flex: 1,
    paddingRight: 16,
  },
  switchLabel: {
    fontSize: 15,
    fontFamily: typography.fonts.body.semiBold,
    color: colors.dark.ink,
  },
  switchHint: {
    fontSize: 12,
    fontFamily: typography.fonts.body.regular,
    color: colors.dark.mut,
    marginTop: 2,
    lineHeight: 16,
  },
  disclaimerText: {
    fontSize: 11,
    fontFamily: typography.fonts.body.regular,
    color: colors.dark.mut,
    textAlign: 'center',
    paddingHorizontal: 12,
    marginVertical: 16,
    lineHeight: 16,
  },
  submitBtn: {
    height: 56,
    backgroundColor: colors.dark.dawn,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.dark.dawn,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  submitBtnDisabled: {
    opacity: 0.4,
  },
  submitBtnText: {
    fontSize: 18,
    fontFamily: typography.fonts.condensed.bold,
    color: '#101216',
    letterSpacing: 1,
  },
});

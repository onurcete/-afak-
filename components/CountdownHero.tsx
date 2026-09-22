// components/CountdownHero.tsx
// UI_SPEC.md: Üç duruma göre içerik değiştiren tek bileşen:
// - far (kalan gün > 81): büyük sayı (112px) + "gün kaldı"
// - plate (1 <= kalan gün <= 81): PlateBadge + il adı (38px) + saat:dakika:saniye geri sayımı
// - done (kalan gün = 0): "Tezkere günü" kutlama mesajı

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';
import { strings, TargetPerson } from '../constants/strings';
import { PlateBadge } from './PlateBadge';
import { CountdownState } from '../lib/date';

interface CountdownHeroProps {
  remainingDays: number;
  heroState: CountdownState;
  plateNumber?: number;
  ilAdi?: string;
  hours?: number;
  minutes?: number;
  seconds?: number;
  targetPerson?: TargetPerson;
  isDark?: boolean;
}

export const CountdownHero: React.FC<CountdownHeroProps> = ({
  remainingDays,
  heroState,
  plateNumber,
  ilAdi,
  hours = 0,
  minutes = 0,
  seconds = 0,
  targetPerson = 'self',
  isDark = true,
}) => {
  const currentColors = isDark ? colors.dark : colors.light;

  if (heroState === 'done') {
    return (
      <View style={styles.container}>
        <View style={[styles.celebrationBadge, { backgroundColor: currentColors.dawn }]}>
          <Text style={styles.celebrationBadgeText}>
            {strings.home.doneBadge}
          </Text>
        </View>
        <Text
          style={[
            styles.doneTitle,
            {
              color: currentColors.ink,
              fontFamily: typography.fonts.condensed.bold,
            },
          ]}
        >
          {strings.home.doneTitle}
        </Text>
        <Text
          style={[
            styles.doneSubtitle,
            {
              color: currentColors.mut,
              fontFamily: typography.fonts.body.regular,
            },
          ]}
        >
          {strings.home.doneSubtitle(targetPerson)}
        </Text>
      </View>
    );
  }

  if (heroState === 'plate' && plateNumber && ilAdi) {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return (
      <View style={styles.container}>
        <Text
          style={[
            styles.subLabel,
            {
              color: currentColors.mut,
              fontFamily: typography.fonts.body.medium,
            },
          ]}
        >
          {strings.home.relativeRemaining(targetPerson)}
        </Text>

        {/* Plaka Rozeti */}
        <View style={styles.plateWrapper}>
          <PlateBadge n={plateNumber} size="hero" cityName={ilAdi} />
        </View>

        {/* İl Adı */}
        <Text
          style={[
            styles.cityName,
            {
              color: currentColors.ink,
              fontFamily: typography.fonts.condensed.semiBold,
            },
          ]}
        >
          {ilAdi.toUpperCase()}
        </Text>

        {/* Kalan Gün Bilgisi */}
        <Text
          style={[
            styles.plateDaysText,
            {
              color: currentColors.dawn,
              fontFamily: typography.fonts.condensed.bold,
            },
          ]}
        >
          {remainingDays} {strings.home.daysRemaining}
        </Text>

        {/* Canlı Saat / Dakika / Saniye Sayacı */}
        <View style={styles.timerRow}>
          <Text
            style={[
              styles.timerDigits,
              {
                color: currentColors.mut,
                fontFamily: typography.fonts.condensed.semiBold,
              },
            ]}
          >
            {pad(hours)} {strings.home.hoursShort} : {pad(minutes)} {strings.home.minutesShort} : {pad(seconds)} {strings.home.secondsShort}
          </Text>
        </View>
      </View>
    );
  }

  // Far durumu (kalan gün > 81)
  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.subLabel,
          {
            color: currentColors.mut,
            fontFamily: typography.fonts.body.medium,
          },
        ]}
      >
        {strings.home.relativeRemaining(targetPerson)}
      </Text>

      {/* Büyük Gün Sayısı: 112px */}
      <Text
        style={[
          styles.heroDays,
          {
            color: currentColors.ink,
            fontFamily: typography.fonts.condensed.bold,
          },
        ]}
      >
        {remainingDays}
      </Text>

      {/* Gün Kaldı Etiketi */}
      <Text
        style={[
          styles.heroDaysLabel,
          {
            color: currentColors.dawn,
            fontFamily: typography.fonts.condensed.bold,
          },
        ]}
      >
        {strings.home.daysRemaining}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  subLabel: {
    fontSize: 14,
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  heroDays: {
    fontSize: typography.sizes.heroDays,
    lineHeight: 114,
    letterSpacing: -1,
    includeFontPadding: false,
    textAlign: 'center',
  },
  heroDaysLabel: {
    fontSize: 20,
    letterSpacing: 2,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  plateWrapper: {
    marginVertical: 10,
  },
  cityName: {
    fontSize: typography.sizes.cityName,
    lineHeight: 44,
    letterSpacing: 1.5,
    marginTop: 6,
    textAlign: 'center',
  },
  plateDaysText: {
    fontSize: 18,
    letterSpacing: 1.5,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  timerRow: {
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(243,241,234,0.06)',
  },
  timerDigits: {
    fontSize: 15,
    letterSpacing: 1,
    fontVariant: ['tabular-nums'],
  },
  celebrationBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 14,
  },
  celebrationBadgeText: {
    color: '#101216',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 1.5,
  },
  doneTitle: {
    fontSize: 42,
    lineHeight: 48,
    textAlign: 'center',
    marginBottom: 8,
  },
  doneSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 24,
    lineHeight: 24,
  },
});

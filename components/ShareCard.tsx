// components/ShareCard.tsx
// UI_SPEC.md: Instagram hikayesi oranında (9:16), react-native-view-shot ile PNG'ye çevrilecek kart.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';
import { PlateBadge } from './PlateBadge';
import { strings, TargetPerson } from '../constants/strings';
import { CountdownState, formatTurkishDate } from '../lib/date';
import { IlBilgisi } from '../constants/iller';

interface ShareCardProps {
  remainingDays: number;
  heroState: CountdownState;
  plateNumber?: number;
  currentIl?: IlBilgisi;
  startDate: string;
  endDate: string;
  progressPercent: number;
  targetPerson?: TargetPerson;
}

export const ShareCard: React.FC<ShareCardProps> = ({
  remainingDays,
  heroState,
  plateNumber,
  currentIl,
  startDate,
  endDate,
  progressPercent,
  targetPerson = 'self',
}) => {
  const currentColors = colors.dark; // Hikaye kartı her zaman ikonik koyu temada

  return (
    <View style={styles.cardContainer}>
      {/* Üst Marka Başlığı */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Text style={styles.flagEmoji}>🇹🇷</Text>
          <Text style={styles.brandTitle}>{strings.appName}</Text>
        </View>
        <Text style={styles.dateBadge}>{formatTurkishDate(new Date())}</Text>
      </View>

      {/* Orta Hero Alanı */}
      <View style={styles.centerContent}>
        {heroState === 'done' ? (
          <View style={styles.heroBlock}>
            <View style={styles.plateDoneBadge}>
              <Text style={styles.plateDoneText}>{strings.home.doneBadge}</Text>
            </View>
            <Text style={styles.doneTitle}>{strings.home.doneTitle}</Text>
            <Text style={styles.doneSub}>
              {strings.home.doneSubtitle(targetPerson)}
            </Text>
          </View>
        ) : heroState === 'plate' && plateNumber && currentIl ? (
          <View style={styles.heroBlock}>
            <Text style={styles.subText}>
              {strings.home.relativeRemaining(targetPerson)}
            </Text>

            <View style={styles.plateBadgeWrapper}>
              <PlateBadge n={plateNumber} size="hero" cityName={currentIl.isim} />
            </View>

            <Text style={styles.cityNameText}>{currentIl.isim.toUpperCase()}</Text>

            <Text style={styles.daysText}>
              {remainingDays} {strings.home.daysRemaining}
            </Text>
          </View>
        ) : (
          <View style={styles.heroBlock}>
            <Text style={styles.subText}>
              {strings.home.relativeRemaining(targetPerson)}
            </Text>
            <Text style={styles.bigDaysNumber}>{remainingDays}</Text>
            <Text style={styles.daysText}>{strings.home.daysRemaining}</Text>
          </View>
        )}

        {/* İlerleme Çubuğu */}
        <View style={styles.progressSection}>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.min(100, Math.max(0, progressPercent))}%` },
              ]}
            />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressDate}>{formatTurkishDate(startDate)}</Text>
            <Text style={styles.progressPercent}>%{progressPercent}</Text>
            <Text style={styles.progressDate}>{formatTurkishDate(endDate)}</Text>
          </View>
        </View>
      </View>

      {/* Alt Damga */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>{strings.share.cardFooter}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: 320,
    height: 568, // ~9:16 oranı
    backgroundColor: colors.dark.bg,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255,214,176,0.25)',
    padding: 24,
    justifyContent: 'space-between',
    alignSelf: 'center',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagEmoji: {
    fontSize: 20,
    marginRight: 6,
  },
  brandTitle: {
    fontSize: 22,
    fontFamily: typography.fonts.condensed.bold,
    color: colors.dark.ink,
    letterSpacing: 1,
  },
  dateBadge: {
    fontSize: 12,
    fontFamily: typography.fonts.body.medium,
    color: colors.dark.mut,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBlock: {
    alignItems: 'center',
    marginVertical: 14,
  },
  subText: {
    fontSize: 12,
    fontFamily: typography.fonts.body.medium,
    color: colors.dark.mut,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  plateBadgeWrapper: {
    marginVertical: 8,
  },
  cityNameText: {
    fontSize: 32,
    fontFamily: typography.fonts.condensed.bold,
    color: colors.dark.ink,
    letterSpacing: 1.5,
    marginTop: 4,
  },
  bigDaysNumber: {
    fontSize: 92,
    lineHeight: 96,
    fontFamily: typography.fonts.condensed.bold,
    color: colors.dark.ink,
  },
  daysText: {
    fontSize: 16,
    fontFamily: typography.fonts.condensed.bold,
    color: colors.dark.dawn,
    letterSpacing: 2,
    marginTop: 2,
  },
  plateDoneBadge: {
    backgroundColor: colors.dark.dawn,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  plateDoneText: {
    color: '#101216',
    fontWeight: '800',
    fontSize: 14,
  },
  doneTitle: {
    fontSize: 32,
    fontFamily: typography.fonts.condensed.bold,
    color: colors.dark.ink,
    textAlign: 'center',
  },
  doneSub: {
    fontSize: 14,
    fontFamily: typography.fonts.body.regular,
    color: colors.dark.mut,
    textAlign: 'center',
    marginTop: 6,
  },
  progressSection: {
    width: '100%',
    marginTop: 24,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: 'rgba(243,241,234,0.15)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.dark.dawn,
    borderRadius: 3,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  progressDate: {
    fontSize: 10,
    fontFamily: typography.fonts.body.medium,
    color: colors.dark.mut,
  },
  progressPercent: {
    fontSize: 12,
    fontFamily: typography.fonts.condensed.bold,
    color: colors.dark.dawn,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(243,241,234,0.08)',
  },
  footerText: {
    fontSize: 11,
    fontFamily: typography.fonts.body.regular,
    color: colors.dark.mut,
  },
});

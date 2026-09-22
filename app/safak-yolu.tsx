// app/safak-yolu.tsx
// UI_SPEC.md: Şafak Yolu ekranı: üstte özet ("X şafak geçti, Y kaldı"), SafakYoluGrid ve alt detay kartı.

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';
import { strings } from '../constants/strings';
import { useAppStore } from '../lib/storage';
import { calculateSafak, getCityDate, formatTurkishDate } from '../lib/date';
import { SafakYoluGrid } from '../components/SafakYoluGrid';
import { PlateBadge } from '../components/PlateBadge';
import { getIlByPlaka, IlBilgisi } from '../constants/iller';

export default function SafakYoluScreen() {
  const router = useRouter();
  const startDate = useAppStore((state) => state.startDate);
  const endDate = useAppStore((state) => state.endDate);
  const themeMode = useAppStore((state) => state.themeMode);

  const isDark = themeMode !== 'light';
  const currentColors = isDark ? colors.dark : colors.light;

  const calculation = calculateSafak(startDate, endDate, new Date());

  // Başlangıçta seçili plaka: bugün 81 içindeyse bugünün plakası, değilse 81 (Düzce) veya 34 (İstanbul)
  const defaultPlaka =
    calculation.remainingDays >= 1 && calculation.remainingDays <= 81
      ? calculation.remainingDays
      : 81;

  const [selectedIl, setSelectedIl] = useState<IlBilgisi>(
    getIlByPlaka(defaultPlaka) || { plaka: 81, kod: '81', isim: 'Düzce' }
  );

  // Göreli gün konumu hesaplama ("3 gün sonra" / "bugün" / "5 gün önce")
  const getRelativePosition = (plaka: number) => {
    const rem = calculation.remainingDays;
    if (rem <= 0) {
      const diff = Math.abs(rem - plaka);
      return strings.safakYolu.daysAgo(diff);
    }
    if (plaka === rem) {
      return strings.safakYolu.todayBadge;
    }
    if (plaka > rem) {
      // 81'den 1'e saydığımız için plaka numarası büyük olan günler geçmişte kaldı
      const diff = plaka - rem;
      return strings.safakYolu.daysAgo(diff);
    }
    // plaka < rem: gelecekteki gün
    const diff = rem - plaka;
    return strings.safakYolu.daysLater(diff);
  };

  // 81 il içindeki geçmiş ve kalan sayısı
  const passed81 = Math.max(0, Math.min(81, 81 - calculation.remainingDays));
  const remaining81 = Math.max(0, Math.min(81, calculation.remainingDays));

  const cityEstimatedDate = getCityDate(endDate, selectedIl.plaka);
  const relativeText = getRelativePosition(selectedIl.plaka);
  const isToday = relativeText === strings.safakYolu.todayBadge;

  return (
    <View style={[styles.screen, { backgroundColor: currentColors.bg }]}>
      {/* Üst Başlık Çubuğu */}
      <View style={styles.headerBar}>
        <Text style={[styles.headerTitle, { color: currentColors.ink }]}>
          {strings.safakYolu.title}
        </Text>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          style={styles.closeBtn}
          accessibilityLabel={strings.safakYolu.closeButton}
        >
          <Text style={[styles.closeBtnText, { color: currentColors.mut }]}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Özet Bandı: "X şafak geçti, Y kaldı" */}
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryText, { color: currentColors.ink }]}>
            {calculation.remainingDays > 81
              ? `Şafak 81'e ${calculation.remainingDays - 81} gün kaldı`
              : strings.safakYolu.summary(passed81, remaining81)}
          </Text>
          <Text style={[styles.hintText, { color: currentColors.mut }]}>
            {strings.safakYolu.selectHint}
          </Text>
        </View>

        {/* 9x9 Şafak Yolu Izgarası */}
        <View style={styles.gridWrapper}>
          <SafakYoluGrid
            remainingDays={calculation.remainingDays}
            selectedPlaka={selectedIl.plaka}
            onSelectPlaka={(il) => setSelectedIl(il)}
            isDark={isDark}
          />
        </View>

        {/* Seçili İl Detay Bilgi Kartı */}
        <View style={[styles.detailCard, { backgroundColor: currentColors.cardBg, borderColor: currentColors.cardBorder }]}>
          <View style={styles.detailCardTop}>
            <PlateBadge n={selectedIl.plaka} size="card" cityName={selectedIl.isim} />
            <View style={styles.detailTextCol}>
              <Text style={[styles.detailCityName, { color: currentColors.ink }]}>
                {selectedIl.isim.toUpperCase()}
              </Text>
              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: isToday
                        ? currentColors.dawn
                        : isDark
                        ? 'rgba(243,241,234,0.12)'
                        : 'rgba(0,0,0,0.06)',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      { color: isToday ? '#101216' : currentColors.ink },
                    ]}
                  >
                    {relativeText}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.detailDivider} />

          <View style={styles.detailCardBottom}>
            <Text style={[styles.dateSubLabel, { color: currentColors.mut }]}>
              {strings.safakYolu.cityDateLabel}
            </Text>
            <Text style={[styles.dateMainValue, { color: currentColors.ink }]}>
              {formatTurkishDate(cityEstimatedDate)}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 54,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(243,241,234,0.08)',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: typography.fonts.condensed.bold,
    letterSpacing: 1,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(243,241,234,0.06)',
  },
  closeBtnText: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    paddingBottom: 40,
  },
  summaryCard: {
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 20,
    fontFamily: typography.fonts.condensed.bold,
    letterSpacing: 0.5,
  },
  hintText: {
    fontSize: 12,
    fontFamily: typography.fonts.body.regular,
    marginTop: 4,
  },
  gridWrapper: {
    alignItems: 'center',
    marginVertical: 4,
  },
  detailCard: {
    marginTop: 20,
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
  },
  detailCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  detailTextCol: {
    flex: 1,
  },
  detailCityName: {
    fontSize: 24,
    fontFamily: typography.fonts.condensed.bold,
    letterSpacing: 1,
  },
  statusRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 12,
    fontFamily: typography.fonts.body.semiBold,
  },
  detailDivider: {
    height: 1,
    backgroundColor: 'rgba(243,241,234,0.08)',
    marginVertical: 14,
  },
  detailCardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateSubLabel: {
    fontSize: 13,
    fontFamily: typography.fonts.body.medium,
  },
  dateMainValue: {
    fontSize: 16,
    fontFamily: typography.fonts.condensed.bold,
    letterSpacing: 0.5,
  },
});

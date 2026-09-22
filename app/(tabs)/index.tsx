// app/(tabs)/index.tsx
// UI_SPEC.md: Ana ekran: marka rozeti, CountdownHero, ProgressArc, Paylaş ve Şafak Yolu butonları.
// AGENT.md: AppState dinleyerek arka plandayken canlı sayaç durdurulur; widget senkronizasyonu yapılır.

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  AppState,
  AppStateStatus,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { strings } from '../../constants/strings';
import { useAppStore } from '../../lib/storage';
import { calculateSafak } from '../../lib/date';
import { syncWidgetData } from '../../lib/widget';
import { CountdownHero } from '../../components/CountdownHero';
import { ProgressArc } from '../../components/ProgressArc';
import { ShareModal } from '../../components/ShareModal';
import { PlateBadge } from '../../components/PlateBadge';

export default function HomeScreen() {
  const router = useRouter();
  const startDate = useAppStore((state) => state.startDate);
  const endDate = useAppStore((state) => state.endDate);
  const targetPerson = useAppStore((state) => state.targetPerson);
  const themeMode = useAppStore((state) => state.themeMode);

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const appState = useRef(AppState.currentState);

  // Canlı saniye sayacı & AppState kontrolü
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    const startTimer = () => {
      if (!interval) {
        interval = setInterval(() => {
          setCurrentDate(new Date());
        }, 1000);
      }
    };

    const stopTimer = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    // İlk açılışta başlat
    startTimer();

    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // Uygulama ön plana geldi: saati güncelle ve timer'ı tekrar başlat
        setCurrentDate(new Date());
        startTimer();
      } else if (nextAppState.match(/inactive|background/)) {
        // Uygulama arka plana geçti: pil tasarrufu için durdur
        stopTimer();
      }
      appState.current = nextAppState;
    });

    return () => {
      stopTimer();
      subscription.remove();
    };
  }, []);

  const calculation = calculateSafak(startDate, endDate, currentDate);

  // Widget verisini arka planda senkronize et (gün/durum değişiminde)
  useEffect(() => {
    syncWidgetData(calculation);
  }, [calculation.remainingDays, calculation.heroState]);

  const isDark = themeMode !== 'light';
  const currentColors = isDark ? colors.dark : colors.light;

  const handleOpenShare = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    setShareModalVisible(true);
  };

  const handleOpenSafakYolu = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    router.push('/safak-yolu');
  };

  return (
    <View style={[styles.screen, { backgroundColor: currentColors.bg }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Üst Marka Başlığı ve Hızlı Paylaş Butonu */}
        <View style={styles.topBar}>
          <View style={styles.brandContainer}>
            <PlateBadge n={34} size="sm" />
            <Text style={[styles.brandText, { color: currentColors.ink }]}>
              {strings.appName}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.quickShareBtn, { borderColor: currentColors.line }]}
            onPress={handleOpenShare}
            accessibilityLabel={strings.home.shareButton}
            activeOpacity={0.7}
          >
            <Text style={styles.shareIconText}>↗</Text>
          </TouchableOpacity>
        </View>

        {/* Ortada CountdownHero */}
        <View style={styles.heroSection}>
          <CountdownHero
            remainingDays={calculation.remainingDays}
            heroState={calculation.heroState}
            plateNumber={calculation.plateNumber}
            ilAdi={calculation.currentIl?.isim}
            hours={calculation.hours}
            minutes={calculation.minutes}
            seconds={calculation.seconds}
            targetPerson={targetPerson}
            isDark={isDark}
          />
        </View>

        {/* Altında ProgressArc */}
        <View style={styles.arcSection}>
          <ProgressArc
            startDate={startDate}
            endDate={endDate}
            progressPercent={calculation.progressPercent}
            targetPerson={targetPerson}
            isDark={isDark}
          />
        </View>

        {/* En Altta İki Buton: Paylaş ve Şafak Yolu */}
        <View style={styles.actionButtonsCol}>
          <TouchableOpacity
            style={[styles.primaryShareBtn, { backgroundColor: currentColors.dawn }]}
            onPress={handleOpenShare}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryShareBtnText}>
              {strings.home.shareButton}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryOutlineBtn,
              {
                borderColor: currentColors.line,
                backgroundColor: isDark ? 'rgba(243,241,234,0.04)' : 'rgba(0,0,0,0.02)',
              },
            ]}
            onPress={handleOpenSafakYolu}
            activeOpacity={0.75}
          >
            <Text style={[styles.secondaryOutlineBtnText, { color: currentColors.ink }]}>
              {strings.home.safakYoluButton}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Paylaşım Modalı */}
      <ShareModal
        visible={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
        remainingDays={calculation.remainingDays}
        heroState={calculation.heroState}
        plateNumber={calculation.plateNumber}
        currentIl={calculation.currentIl}
        startDate={startDate}
        endDate={endDate}
        progressPercent={calculation.progressPercent}
        targetPerson={targetPerson}
        isDark={isDark}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 56,
    paddingBottom: 32,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandText: {
    fontSize: 22,
    fontFamily: typography.fonts.condensed.bold,
    letterSpacing: 1,
  },
  quickShareBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(243,241,234,0.06)',
  },
  shareIconText: {
    fontSize: 18,
    color: colors.dark.dawn,
    fontWeight: '700',
  },
  heroSection: {
    marginVertical: 10,
  },
  arcSection: {
    marginVertical: 6,
  },
  actionButtonsCol: {
    gap: 12,
    marginTop: 18,
  },
  primaryShareBtn: {
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFD6B0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryShareBtnText: {
    fontSize: 17,
    fontFamily: typography.fonts.condensed.bold,
    color: '#101216',
    letterSpacing: 0.8,
  },
  secondaryOutlineBtn: {
    height: 52,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryOutlineBtnText: {
    fontSize: 16,
    fontFamily: typography.fonts.condensed.semiBold,
    letterSpacing: 0.8,
  },
});

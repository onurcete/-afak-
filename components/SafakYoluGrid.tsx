// components/SafakYoluGrid.tsx
// UI_SPEC.md: 81 hücrelik ızgara (9x9).
// Geçmiş şafaklar soluk dolu, gelecekler boş çerçeveli, bugünün hücresi plaka rengiyle vurgulu.
// Her hücre accessibilityLabel içerir ("Şafak 47, Mardin, geçti").

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';
import { ILLER, IlBilgisi } from '../constants/iller';
import { strings } from '../constants/strings';

interface SafakYoluGridProps {
  remainingDays: number;
  selectedPlaka: number;
  onSelectPlaka: (il: IlBilgisi) => void;
  diaryPlakas?: Set<number>;
  isDark?: boolean;
}

export const SafakYoluGrid: React.FC<SafakYoluGridProps> = ({
  remainingDays,
  selectedPlaka,
  onSelectPlaka,
  diaryPlakas,
  isDark = true,
}) => {
  const currentColors = isDark ? colors.dark : colors.light;

  const handlePress = (il: IlBilgisi) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // sessizce geç
    }
    onSelectPlaka(il);
  };

  // Hücre durumunu belirle: 'past' | 'today' | 'future'
  const getCellStatus = (plaka: number): 'past' | 'today' | 'future' => {
    if (remainingDays <= 0) return 'past';
    if (remainingDays > 81) return 'future';
    if (plaka > remainingDays) return 'past'; // Şafak 81'den 1'e doğru saydığı için 81..35 geçti
    if (plaka === remainingDays) return 'today';
    return 'future';
  };

  const getStatusLabel = (status: 'past' | 'today' | 'future') => {
    switch (status) {
      case 'past':
        return strings.safakYolu.pastStatus;
      case 'today':
        return strings.safakYolu.todayBadge;
      case 'future':
        return strings.safakYolu.futureStatus;
    }
  };

  return (
    <View style={styles.gridContainer}>
      {ILLER.map((il) => {
        const status = getCellStatus(il.plaka);
        const isSelected = il.plaka === selectedPlaka;
        const statusLabel = getStatusLabel(status);
        const hasDiary = diaryPlakas?.has(il.plaka);

        let cellBg: string = 'transparent';
        let cellBorder: string = currentColors.line;
        let textColor: string = currentColors.mut;

        if (status === 'past') {
          cellBg = isDark ? 'rgba(243,241,234,0.14)' : 'rgba(16,19,26,0.12)';
          textColor = isDark ? 'rgba(243,241,234,0.45)' : 'rgba(16,19,26,0.45)';
        } else if (status === 'today') {
          cellBg = currentColors.dawn;
          cellBorder = currentColors.dawn;
          textColor = isDark ? '#101216' : '#FFFFFF';
        } else {
          // future
          cellBorder = isDark ? 'rgba(243,241,234,0.22)' : 'rgba(16,19,26,0.20)';
          textColor = currentColors.ink;
        }

        if (isSelected && status !== 'today') {
          cellBorder = currentColors.dawn;
        }

        return (
          <TouchableOpacity
            key={il.plaka}
            accessible
            accessibilityRole="button"
            accessibilityLabel={strings.a11y.gridCell(il.plaka, il.isim, statusLabel)}
            accessibilityState={{ selected: isSelected }}
            onPress={() => handlePress(il)}
            activeOpacity={0.7}
            style={[
              styles.cell,
              {
                backgroundColor: cellBg,
                borderColor: cellBorder,
                borderWidth: isSelected ? 2 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.cellText,
                {
                  color: textColor,
                  fontFamily: status === 'today' || isSelected
                    ? typography.fonts.condensed.bold
                    : typography.fonts.condensed.semiBold,
                },
              ]}
            >
              {il.kod}
            </Text>

            {/* Anı Noktası (Diary Dot Indicator) */}
            {hasDiary && (
              <View
                style={[
                  styles.diaryDot,
                  {
                    backgroundColor:
                      status === 'today'
                        ? (isDark ? '#101216' : '#FFFFFF')
                        : currentColors.dawn,
                  },
                ]}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingVertical: 8,
    maxWidth: 340,
    alignSelf: 'center',
  },
  cell: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2.5,
    position: 'relative',
  },
  cellText: {
    fontSize: 13,
    includeFontPadding: false,
    fontVariant: ['tabular-nums'],
  },
  diaryDot: {
    position: 'absolute',
    top: 2.5,
    right: 2.5,
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
});

// components/PlateBadge.tsx
// UI_SPEC.md: Plaka görünümü: solda mavi "TR" bandı, sağda büyük rakam, beyaz zemin, koyu kenarlık.
// Boyutlar: hero (64px), card (26px), sm (18px). İki haneli tabular monospace rakam davranışı.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';

export type PlateSize = 'hero' | 'card' | 'sm';

interface PlateBadgeProps {
  n: number;
  size?: PlateSize;
  cityName?: string;
  accessibilityLabel?: string;
}

export const PlateBadge: React.FC<PlateBadgeProps> = ({
  n,
  size = 'hero',
  cityName,
  accessibilityLabel,
}) => {
  const formattedNumber = n.toString().padStart(2, '0');
  const a11yText = accessibilityLabel || (cityName ? `Şafak ${formattedNumber}, ${cityName}` : `Plaka ${formattedNumber}`);

  const dimensions = {
    hero: {
      height: 96,
      minWidth: 154,
      borderWidth: 3,
      bandWidth: 36,
      trFontSize: 13,
      numberFontSize: typography.sizes.heroPlate,
      paddingHorizontal: 16,
      borderRadius: 10,
    },
    card: {
      height: 44,
      minWidth: 76,
      borderWidth: 2,
      bandWidth: 20,
      trFontSize: 8,
      numberFontSize: typography.sizes.cardPlate,
      paddingHorizontal: 8,
      borderRadius: 6,
    },
    sm: {
      height: 28,
      minWidth: 46,
      borderWidth: 1.5,
      bandWidth: 14,
      trFontSize: 6.5,
      numberFontSize: 15,
      paddingHorizontal: 4,
      borderRadius: 4,
    },
  }[size];

  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={a11yText}
      style={[
        styles.plateContainer,
        {
          height: dimensions.height,
          minWidth: dimensions.minWidth,
          borderWidth: dimensions.borderWidth,
          borderRadius: dimensions.borderRadius,
        },
      ]}
    >
      {/* Sol Mavi TR Bandı */}
      <View
        style={[
          styles.trBand,
          {
            width: dimensions.bandWidth,
            borderTopLeftRadius: dimensions.borderRadius - 2,
            borderBottomLeftRadius: dimensions.borderRadius - 2,
          },
        ]}
      >
        <Text
          style={[
            styles.trText,
            {
              fontSize: dimensions.trFontSize,
            },
          ]}
        >
          TR
        </Text>
      </View>

      {/* Sağ Plaka Numarası */}
      <View
        style={[
          styles.numberContainer,
          {
            paddingHorizontal: dimensions.paddingHorizontal,
          },
        ]}
      >
        <Text
          style={[
            styles.plateNumber,
            {
              fontSize: dimensions.numberFontSize,
              fontFamily: typography.fonts.condensed.bold,
            },
          ]}
        >
          {formattedNumber}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  plateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.plateBg,
    borderColor: colors.dark.plateInk,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  trBand: {
    height: '100%',
    backgroundColor: colors.dark.plateBand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trText: {
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  numberContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plateNumber: {
    color: colors.dark.plateInk,
    letterSpacing: 1.5,
    includeFontPadding: false,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
});

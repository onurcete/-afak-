// constants/typography.ts
// UI_SPEC.md tipografi tablosu ve font aileleri.

export const typography = {
  fonts: {
    condensed: {
      semiBold: 'BarlowCondensed_600SemiBold',
      bold: 'BarlowCondensed_700Bold',
    },
    body: {
      regular: 'Barlow_400Regular',
      medium: 'Barlow_500Medium',
      semiBold: 'Barlow_600SemiBold',
    },
  },
  sizes: {
    heroDays: 112,
    heroPlate: 64,
    screenTitle: 44,
    cityName: 38,
    cardPlate: 26,
    smPlate: 18,
    body: 15,
    label: 13,
    caption: 11,
  },
} as const;

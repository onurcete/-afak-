// constants/colors.ts
// UI_SPEC.md doğrultusunda tanımlanan tasarım renk token'ları.

export const colors = {
  dark: {
    bg: '#0A1020', // uygulama zemini (gece mavisi, tepe)
    bgBottom: '#0E1830', // zemin gradyanı alt tonu
    ink: '#F3F1EA', // birincil metin (plaka beyazı)
    mut: '#9DA8BD', // ikincil metin
    line: 'rgba(243,241,234,0.16)',
    dawn: '#FFD6B0', // vurgu — şafak şeftalisi
    plateBg: '#F6F6F1', // plaka zemini
    plateInk: '#101216', // plaka yazısı
    plateBand: '#1F3FA8', // plaka "TR" bandı
    cardBg: 'rgba(243,241,234,0.05)',
    cardBorder: 'rgba(243,241,234,0.10)',
    activePill: '#FFD6B0',
    activePillText: '#101216',
  },
  light: {
    bg: '#E8EAEF',
    bgBottom: '#D8DCE5',
    ink: '#10131A',
    mut: '#576072',
    line: 'rgba(16,19,26,0.14)',
    dawn: '#B45309',
    plateBg: '#F6F6F1',
    plateInk: '#101216',
    plateBand: '#1F3FA8',
    cardBg: '#FFFFFF',
    cardBorder: 'rgba(16,19,26,0.08)',
    activePill: '#10131A',
    activePillText: '#FFFFFF',
  },
} as const;

export type ThemeType = 'dark' | 'light';
export type ThemeColors = typeof colors.dark;

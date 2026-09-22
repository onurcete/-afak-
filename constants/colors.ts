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
    primaryBtnBg: '#FFD6B0',
    primaryBtnText: '#101216',
    segmentBg: 'rgba(243,241,234,0.08)',
    segmentActiveBg: '#FFD6B0',
    segmentActiveText: '#101216',
    dangerBg: 'rgba(239, 68, 68, 0.12)',
    dangerText: '#F87171',
    dangerBorder: 'rgba(239, 68, 68, 0.3)',
  },
  light: {
    bg: '#F4F6FA',
    bgBottom: '#EAEFF6',
    ink: '#0F172A',
    mut: '#64748B',
    line: 'rgba(15, 23, 42, 0.10)',
    dawn: '#D97706',
    plateBg: '#FFFFFF',
    plateInk: '#0F172A',
    plateBand: '#1F3FA8',
    cardBg: '#FFFFFF',
    cardBorder: 'rgba(15, 23, 42, 0.08)',
    activePill: '#0F172A',
    activePillText: '#FFFFFF',
    primaryBtnBg: '#0F172A',
    primaryBtnText: '#FFFFFF',
    segmentBg: '#E2E8F0',
    segmentActiveBg: '#0F172A',
    segmentActiveText: '#FFFFFF',
    dangerBg: '#FEE2E2',
    dangerText: '#DC2626',
    dangerBorder: '#FCA5A5',
  },
} as const;

export type ThemeType = 'dark' | 'light';
export type ThemeColors = typeof colors.dark;


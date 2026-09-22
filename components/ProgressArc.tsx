// components/ProgressArc.tsx
// UI_SPEC.md: Katılıştan tezkereye kavisli bir ilerleme çizgisi;
// üzerinde ilerlemeyle birlikte kayan bir "güneş" noktası. SVG (react-native-svg) ile uygulanır.
// Alt satırda üç etiket: katılış tarihi (sol), yüzde (orta), tezkere tarihi (sağ).

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';
import { formatTurkishDate } from '../lib/date';
import { strings, TargetPerson } from '../constants/strings';

interface ProgressArcProps {
  startDate: string | Date;
  endDate: string | Date;
  progressPercent: number; // 0 - 100
  targetPerson?: TargetPerson;
  isDark?: boolean;
}

export const ProgressArc: React.FC<ProgressArcProps> = ({
  startDate,
  endDate,
  progressPercent,
  targetPerson = 'self',
  isDark = true,
}) => {
  const currentColors = isDark ? colors.dark : colors.light;

  const width = 320;
  const height = 75;

  // Bezier noktaları: P0 = (24, 60), Control P1 = (160, 10), P2 = (296, 60)
  const p0 = { x: 24, y: 60 };
  const p1 = { x: 160, y: 10 };
  const p2 = { x: 296, y: 60 };

  const arcPath = `M ${p0.x} ${p0.y} Q ${p1.x} ${p1.y} ${p2.x} ${p2.y}`;

  // t: 0..1 normalize edilmiş ilerleme
  const clamped = Math.min(100, Math.max(0, progressPercent));
  const t = clamped / 100;

  // Quadratic Bezier formülü: B(t) = (1-t)^2 * P0 + 2*(1-t)*t * P1 + t^2 * P2
  const oneMinusT = 1 - t;
  const sunX = oneMinusT * oneMinusT * p0.x + 2 * oneMinusT * t * p1.x + t * t * p2.x;
  const sunY = oneMinusT * oneMinusT * p0.y + 2 * oneMinusT * t * p1.y + t * t * p2.y;

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={strings.a11y.progressLabel(clamped)}
      style={styles.container}
    >
      <View style={styles.svgWrapper}>
        <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <Defs>
            <RadialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={currentColors.dawn} stopOpacity="1" />
              <Stop offset="50%" stopColor={currentColors.dawn} stopOpacity="0.4" />
              <Stop offset="100%" stopColor={currentColors.dawn} stopOpacity="0" />
            </RadialGradient>
          </Defs>

          {/* Arka plan kavisli yay hattı */}
          <Path
            d={arcPath}
            stroke={currentColors.line}
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Güneşin dış parıltısı */}
          <Circle cx={sunX} cy={sunY} r="16" fill="url(#sunGlow)" />

          {/* Güneş merkez noktası */}
          <Circle
            cx={sunX}
            cy={sunY}
            r="6"
            fill={currentColors.dawn}
            stroke={isDark ? '#0A1020' : '#FFFFFF'}
            strokeWidth="2"
          />
        </Svg>
      </View>

      {/* Alt bilgi satırı: Sol katılış, Orta yüzde, Sağ tezkere */}
      <View style={styles.labelsRow}>
        <View style={styles.sideLabelLeft}>
          <Text style={[styles.labelText, { color: currentColors.mut }]}>
            {strings.home.progressStart}
          </Text>
          <Text style={[styles.dateText, { color: currentColors.ink }]}>
            {formatTurkishDate(startDate)}
          </Text>
        </View>

        <View style={[styles.percentBadge, { backgroundColor: isDark ? 'rgba(255,214,176,0.12)' : 'rgba(0,0,0,0.06)' }]}>
          <Text style={[styles.percentText, { color: currentColors.dawn }]}>
            %{clamped}
          </Text>
        </View>

        <View style={styles.sideLabelRight}>
          <Text style={[styles.labelText, { color: currentColors.mut }]}>
            {strings.home.progressEnd(targetPerson)}
          </Text>
          <Text style={[styles.dateText, { color: currentColors.ink }]}>
            {formatTurkishDate(endDate)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 12,
  },
  svgWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 320,
    marginTop: 4,
    paddingHorizontal: 8,
  },
  sideLabelLeft: {
    alignItems: 'flex-start',
  },
  sideLabelRight: {
    alignItems: 'flex-end',
  },
  labelText: {
    fontSize: 11,
    fontFamily: typography.fonts.body.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  dateText: {
    fontSize: 13,
    fontFamily: typography.fonts.body.semiBold,
    marginTop: 2,
  },
  percentBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  percentText: {
    fontSize: 14,
    fontFamily: typography.fonts.condensed.bold,
    letterSpacing: 0.5,
  },
});

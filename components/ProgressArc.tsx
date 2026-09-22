// components/ProgressArc.tsx
// UI_SPEC.md: Katılıştan tezkereye kavisli bir ilerleme çizgisi;
// üzerinde ilerlemeyle birlikte kayan, nefes alıp veren (hareketli/parıldayan) bir "güneş" küresi.

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, {
  Path,
  Circle,
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
  G,
} from 'react-native-svg';
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
  const height = 85;

  // Bezier kontrol noktaları: P0 = (24, 65), P1 = (160, 12), P2 = (296, 65)
  const p0 = { x: 24, y: 65 };
  const p1 = { x: 160, y: 12 };
  const p2 = { x: 296, y: 65 };

  const fullArcPath = `M ${p0.x} ${p0.y} Q ${p1.x} ${p1.y} ${p2.x} ${p2.y}`;

  const clamped = Math.min(100, Math.max(0, progressPercent));

  // Animasyon Değerleri
  const progressAnim = useRef(new Animated.Value(clamped)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.45)).current;

  const [displayProgress, setDisplayProgress] = useState<number>(clamped);
  const [pulseScale, setPulseScale] = useState<number>(1);
  const [glowOpacity, setGlowOpacity] = useState<number>(0.45);

  // İlerleme yüzdesi değiştiğinde akıcı kayma
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: clamped,
      duration: 1000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [clamped]);

  // Sürekli canlı nefes alma (pulsing / breathing) animasyonu
  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 1400,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.85,
            duration: 1400,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: false,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 1400,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.45,
            duration: 1400,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: false,
          }),
        ]),
      ])
    );

    pulseLoop.start();

    const idProg = progressAnim.addListener(({ value }) => setDisplayProgress(value));
    const idPulse = pulseAnim.addListener(({ value }) => setPulseScale(value));
    const idGlow = glowAnim.addListener(({ value }) => setGlowOpacity(value));

    return () => {
      pulseLoop.stop();
      progressAnim.removeListener(idProg);
      pulseAnim.removeListener(idPulse);
      glowAnim.removeListener(idGlow);
    };
  }, []);

  // t: 0..1 normalize edilmiş ilerleme
  const t = Math.max(0.001, Math.min(1, displayProgress / 100));
  const oneMinusT = 1 - t;

  // De Casteljau algoritmasıyla alt eğriyi tam hesaplama
  const q0x = oneMinusT * p0.x + t * p1.x;
  const q0y = oneMinusT * p0.y + t * p1.y;
  const sunX = oneMinusT * oneMinusT * p0.x + 2 * oneMinusT * t * p1.x + t * t * p2.x;
  const sunY = oneMinusT * oneMinusT * p0.y + 2 * oneMinusT * t * p1.y + t * t * p2.y;

  const activeArcPath = `M ${p0.x} ${p0.y} Q ${q0x} ${q0y} ${sunX} ${sunY}`;

  // Kilometre taşı noktaları (%25, %50, %75)
  const getPointOnCurve = (prog: number) => {
    const p = prog / 100;
    const omt = 1 - p;
    return {
      x: omt * omt * p0.x + 2 * omt * p * p1.x + p * p * p2.x,
      y: omt * omt * p0.y + 2 * omt * p * p1.y + p * p * p2.y,
    };
  };

  const m25 = getPointOnCurve(25);
  const m50 = getPointOnCurve(50);
  const m75 = getPointOnCurve(75);

  const activeColor = currentColors.dawn;
  const activeGradientStart = isDark ? '#F59E0B' : '#D97706';
  const activeGradientEnd = isDark ? '#FFD6B0' : '#F59E0B';

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={strings.a11y.progressLabel(Math.round(displayProgress))}
      style={styles.container}
    >
      <View style={styles.svgWrapper}>
        <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <Defs>
            {/* İlerleme hattı gradyanı */}
            <LinearGradient id="arcProgGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor={activeGradientStart} />
              <Stop offset="100%" stopColor={activeGradientEnd} />
            </LinearGradient>

            {/* Dış korona (aura) ışıltısı */}
            <RadialGradient id="sunCoronaGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={activeColor} stopOpacity="1" />
              <Stop offset="45%" stopColor={activeColor} stopOpacity="0.5" />
              <Stop offset="80%" stopColor={activeColor} stopOpacity="0.15" />
              <Stop offset="100%" stopColor={activeColor} stopOpacity="0" />
            </RadialGradient>

            {/* Güneşin çekirdek gradyanı */}
            <LinearGradient id="sunCoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#FFFFFF" />
              <Stop offset="50%" stopColor={activeColor} />
              <Stop offset="100%" stopColor={isDark ? '#D97706' : '#92400E'} />
            </LinearGradient>
          </Defs>

          {/* Arka plan temel kavis çizgisi */}
          <Path
            d={fullArcPath}
            stroke={currentColors.line}
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Kilometre taşı noktaları (%25, %50, %75) */}
          {[m25, m50, m75].map((pt, idx) => (
            <Circle
              key={idx}
              cx={pt.x}
              cy={pt.y}
              r="2.5"
              fill={currentColors.line}
            />
          ))}

          {/* Başlangıç ve Bitiş Dayanak Noktaları */}
          <Circle
            cx={p0.x}
            cy={p0.y}
            r="4"
            fill={activeColor}
            stroke={isDark ? '#0A1020' : '#FFFFFF'}
            strokeWidth="1.5"
          />
          <Circle
            cx={p2.x}
            cy={p2.y}
            r="4"
            fill={currentColors.line}
            stroke={isDark ? '#0A1020' : '#FFFFFF'}
            strokeWidth="1.5"
          />

          {/* Dolu / Aktif İlerleme Yayı (Işıltılı Çizgi) */}
          {displayProgress > 0 && (
            <G>
              {/* Dış neon parıltı katmanı */}
              <Path
                d={activeArcPath}
                stroke={activeColor}
                strokeWidth="7"
                strokeOpacity="0.25"
                strokeLinecap="round"
                fill="none"
              />
              {/* Ana renkli hat */}
              <Path
                d={activeArcPath}
                stroke="url(#arcProgGrad)"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
            </G>
          )}

          {/* HAREKETLİ GÜNEŞ KÜRESİ */}
          <G>
            {/* Genişleyen & Daralan Dış Işıma Aurası */}
            <Circle
              cx={sunX}
              cy={sunY}
              r={18 * pulseScale}
              fill="url(#sunCoronaGlow)"
              opacity={glowOpacity}
            />

            {/* İkincil nabız halkası */}
            <Circle
              cx={sunX}
              cy={sunY}
              r={11 * pulseScale}
              fill={activeColor}
              opacity="0.3"
            />

            {/* Ana Işıltılı Güneş Gövdesi */}
            <Circle
              cx={sunX}
              cy={sunY}
              r="7"
              fill="url(#sunCoreGrad)"
              stroke={isDark ? '#0A1020' : '#FFFFFF'}
              strokeWidth="2"
            />

            {/* Merkez parlak ışık yansıması (Göz alıcı nokta) */}
            <Circle
              cx={sunX - 1.8}
              cy={sunY - 1.8}
              r="1.8"
              fill="#FFFFFF"
              opacity="0.9"
            />
          </G>
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

        <View
          style={[
            styles.percentBadge,
            {
              backgroundColor: isDark ? 'rgba(255,214,176,0.12)' : '#FEF3C7',
              borderColor: isDark ? 'rgba(255,214,176,0.25)' : '#FDE68A',
            },
          ]}
        >
          <Text
            style={[
              styles.percentText,
              { color: isDark ? currentColors.dawn : '#B45309' },
            ]}
          >
            %{Math.round(displayProgress)}
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
    marginTop: 6,
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
    borderWidth: 1,
  },
  percentText: {
    fontSize: 14,
    fontFamily: typography.fonts.condensed.bold,
    letterSpacing: 0.5,
  },
});

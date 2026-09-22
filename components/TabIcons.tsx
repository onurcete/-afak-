// components/TabIcons.tsx
// Modern, zarif ve tüm platformlarla uyumlu SVG alt menü ikonları (Şafak & Ayarlar).

import React from 'react';
import Svg, { Path, Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';

interface TabIconProps {
  color: any;
  focused: boolean;
  size?: number;
}

/**
 * Şafak İkonu: Doğan güneş, şafak ufku ve kılavuz yıldızı birleşimi modern askeri-şafak rozeti.
 */
export const TabIconSafak: React.FC<TabIconProps> = ({ color, focused, size = 24 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Defs>
        <LinearGradient id="safakGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor={color} stopOpacity="0.8" />
          <Stop offset="100%" stopColor={color} stopOpacity="1" />
        </LinearGradient>
      </Defs>

      {/* Ufuk çizgisi / Zemin */}
      <Path
        d="M3 18C5.5 17.2 8.5 16.8 12 16.8C15.5 16.8 18.5 17.2 21 18"
        stroke={color}
        strokeWidth={focused ? '2.4' : '1.8'}
        strokeLinecap="round"
      />

      {/* Doğan Güneş Gövdesi */}
      <Path
        d="M7 16C7 13.2386 9.23858 11 12 11C14.7614 11 17 13.2386 17 16"
        stroke={color}
        strokeWidth={focused ? '2.2' : '1.8'}
        strokeLinecap="round"
        fill={focused ? color : 'none'}
        fillOpacity={focused ? 0.35 : 0}
      />

      {/* Işınlar */}
      {/* Tepe Işını */}
      <Path
        d="M12 4V7"
        stroke={color}
        strokeWidth={focused ? '2.4' : '2'}
        strokeLinecap="round"
      />
      {/* Sol Çapraz Işın */}
      <Path
        d="M6.34 6.34L8.46 8.46"
        stroke={color}
        strokeWidth={focused ? '2.2' : '1.8'}
        strokeLinecap="round"
      />
      {/* Sağ Çapraz Işın */}
      <Path
        d="M17.66 6.34L15.54 8.46"
        stroke={color}
        strokeWidth={focused ? '2.2' : '1.8'}
        strokeLinecap="round"
      />
      {/* Sol Yatay Işın */}
      <Path
        d="M3.5 13H5.5"
        stroke={color}
        strokeWidth={focused ? '2.2' : '1.8'}
        strokeLinecap="round"
      />
      {/* Sağ Yatay Işın */}
      <Path
        d="M18.5 13H20.5"
        stroke={color}
        strokeWidth={focused ? '2.2' : '1.8'}
        strokeLinecap="round"
      />

      {/* Odaklandığında merkezdeki minik şafak koru */}
      {focused && (
        <Circle cx="12" cy="14" r="2.2" fill={color} />
      )}
    </Svg>
  );
};

/**
 * Ayarlar İkonu: Hassas işlenmiş, modern mekanik dişli/çark (Settings Cog).
 */
export const TabIconSettings: React.FC<TabIconProps> = ({ color, focused, size = 24 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Modern 6 Dişli Geometrik Çark */}
      <Path
        d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
        stroke={color}
        strokeWidth={focused ? '2.4' : '1.8'}
        fill={focused ? color : 'none'}
        fillOpacity={focused ? 0.35 : 0}
      />
      <Path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z"
        stroke={color}
        strokeWidth={focused ? '2.2' : '1.8'}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

/**
 * Günlük İkonu: Zarif bir ajanda / anı defteri (Journal / Memory Book).
 */
export const TabIconDiary: React.FC<TabIconProps> = ({ color, focused, size = 24 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Defter / Ajanda Kapağı */}
      <Path
        d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"
        stroke={color}
        strokeWidth={focused ? '2.2' : '1.8'}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={focused ? color : 'none'}
        fillOpacity={focused ? 0.25 : 0}
      />
      {/* Defter omurgası çizgisi */}
      <Path
        d="M7 2v20"
        stroke={color}
        strokeWidth={focused ? '2.0' : '1.6'}
        strokeLinecap="round"
      />
      {/* Sayfa satırları */}
      <Path
        d="M11 7h5M11 11h5M11 15h3"
        stroke={color}
        strokeWidth={focused ? '2.0' : '1.8'}
        strokeLinecap="round"
      />
    </Svg>
  );
};

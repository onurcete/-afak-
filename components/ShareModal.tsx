// components/ShareModal.tsx
// UI_SPEC.md: ShareCard önizlemesi + "Paylaş" (native share sheet) / "Kapat" butonları.

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';
import { strings, TargetPerson } from '../constants/strings';
import { ShareCard } from './ShareCard';
import { CountdownState } from '../lib/date';
import { IlBilgisi } from '../constants/iller';

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  remainingDays: number;
  heroState: CountdownState;
  plateNumber?: number;
  currentIl?: IlBilgisi;
  startDate: string;
  endDate: string;
  progressPercent: number;
  targetPerson?: TargetPerson;
  isDark?: boolean;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  visible,
  onClose,
  remainingDays,
  heroState,
  plateNumber,
  currentIl,
  startDate,
  endDate,
  progressPercent,
  targetPerson = 'self',
  isDark = true,
}) => {
  const currentColors = isDark ? colors.dark : colors.light;
  const viewShotRef = useRef<View>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleShare = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    if (!viewShotRef.current) return;

    try {
      setIsCapturing(true);
      const uri = await captureRef(viewShotRef, {
        format: 'png',
        quality: 1.0,
      });

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          dialogTitle: strings.share.modalTitle,
          mimeType: 'image/png',
          UTI: 'public.png',
        });
      } else {
        Alert.alert('Bilgi', 'Paylaşım özelliği bu cihazda desteklenmiyor.');
      }
    } catch (error) {
      console.error('Share capture error:', error);
      Alert.alert('Hata', strings.share.sharingError);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: currentColors.bg }]}>
          {/* Başlık Çubuğu */}
          <View style={[styles.headerBar, { borderBottomColor: currentColors.line }]}>
            <Text style={[styles.headerTitle, { color: currentColors.ink }]}>
              {strings.share.modalTitle}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={[styles.closeIcon, { color: currentColors.mut }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Kart Önizlemesi */}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View ref={viewShotRef} collapsable={false}>
              <ShareCard
                remainingDays={remainingDays}
                heroState={heroState}
                plateNumber={plateNumber}
                currentIl={currentIl}
                startDate={startDate}
                endDate={endDate}
                progressPercent={progressPercent}
                targetPerson={targetPerson}
              />
            </View>
          </ScrollView>

          {/* Aksiyon Butonu */}
          <View style={styles.bottomBar}>
              <TouchableOpacity
                style={[
                  styles.shareActionBtn,
                  { backgroundColor: currentColors.primaryBtnBg },
                ]}
                onPress={handleShare}
                disabled={isCapturing}
                activeOpacity={0.8}
              >
                {isCapturing ? (
                  <ActivityIndicator color={currentColors.primaryBtnText} />
                ) : (
                  <Text
                    style={[
                      styles.shareActionBtnText,
                      { color: currentColors.primaryBtnText },
                    ]}
                  >
                    {strings.share.shareSheetButton}
                  </Text>
                )}
              </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 16,
    paddingBottom: 32,
    paddingHorizontal: 20,
    maxHeight: '92%',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(243,241,234,0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: typography.fonts.condensed.bold,
    letterSpacing: 0.5,
  },
  closeIcon: {
    fontSize: 20,
    paddingHorizontal: 8,
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  bottomBar: {
    paddingTop: 12,
  },
  shareActionBtn: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFD6B0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  shareActionBtnText: {
    fontSize: 17,
    fontFamily: typography.fonts.condensed.bold,
    color: '#101216',
    letterSpacing: 1,
  },
});

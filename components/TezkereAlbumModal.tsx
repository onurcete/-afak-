// components/TezkereAlbumModal.tsx
// Tezkere Günü Özeti: Tüm askerlik dönemi boyunca kaydedilen anılardan ve fotoğraflardan
// otomatik oluşturulan, hikaye olarak paylaşılabilir özel albüm ve kolaj kartı.

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';
import { strings } from '../constants/strings';
import { SafakKaydi } from '../lib/diary';
import { useAppStore } from '../lib/storage';
import { PlateBadge } from './PlateBadge';

interface TezkereAlbumModalProps {
  visible: boolean;
  entries: SafakKaydi[];
  onClose: () => void;
  isDark?: boolean;
}

export const TezkereAlbumModal: React.FC<TezkereAlbumModalProps> = ({
  visible,
  entries,
  onClose,
  isDark = true,
}) => {
  const currentColors = isDark ? colors.dark : colors.light;
  const isPro = useAppStore((state) => state.isPro);
  const setIsPro = useAppStore((state) => state.setIsPro);

  const viewShotRef = useRef<View>(null);
  const [isSharing, setIsSharing] = useState(false);

  if (!visible) return null;

  const photoEntries = entries.filter((e) => !!e.fotoUri);

  const handleShareStory = async () => {
    if (!isPro) {
      Alert.alert(
        'Şafak+ Pro Özelliği',
        'Tezkere Anı Albümünü paylaşmak Şafak+ Pro özelliğidir.',
        [
          { text: 'Daha Sonra', style: 'cancel' },
          {
            text: 'Pro Satın Al',
            onPress: () => {
              setIsPro(true);
              Alert.alert('Tebrikler!', 'Şafak+ Pro aktif edildi!');
            },
          },
        ]
      );
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    setIsSharing(true);
    try {
      if (viewShotRef.current) {
        const uri = await captureRef(viewShotRef.current, {
          format: 'png',
          quality: 1,
        });

        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(uri, {
            mimeType: 'image/png',
            dialogTitle: 'Tezkere Anı Albümü',
          });
        }
      }
    } catch (err) {
      console.warn('Paylaşım hatası:', err);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: isDark ? '#111827' : '#FFFFFF',
                  borderColor: currentColors.line,
                },
              ]}
            >
              {/* Başlık */}
              <View style={styles.headerRow}>
                <View>
                  <Text style={[styles.title, { color: currentColors.ink }]}>
                    🎖️ {strings.diary.tezkereAlbumTitle}
                  </Text>
                  <Text style={[styles.subtitle, { color: currentColors.mut }]}>
                    {strings.diary.totalMemories(entries.length)} • {photoEntries.length} fotoğraf
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  style={[styles.closeBtn, { backgroundColor: isDark ? 'rgba(243,241,234,0.08)' : '#F1F5F9' }]}
                >
                  <Text style={[styles.closeBtnText, { color: currentColors.mut }]}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Paylaşılabilir Kolaj Kartı */}
                <View
                  ref={viewShotRef}
                  collapsable={false}
                  style={[
                    styles.collageCard,
                    {
                      backgroundColor: isDark ? '#0A1020' : '#F8FAFC',
                      borderColor: currentColors.line,
                    },
                  ]}
                >
                  <View style={styles.collageHeader}>
                    <PlateBadge n={0} size="sm" />
                    <View style={styles.collageHeaderTitleCol}>
                      <Text style={[styles.collageBrand, { color: currentColors.ink }]}>
                        {strings.appName} • TEZKERE HATIRASI
                      </Text>
                      <Text style={[styles.collageSub, { color: currentColors.mut }]}>
                        Vatani Görevin Unutulmaz Anıları
                      </Text>
                    </View>
                  </View>

                  {/* Fotoğraf Kolajı Grid */}
                  {photoEntries.length > 0 ? (
                    <View style={styles.photoGrid}>
                      {photoEntries.slice(0, 4).map((item, idx) => (
                        <View key={item.id || idx} style={styles.gridPhotoWrapper}>
                          <Image source={{ uri: item.fotoUri }} style={styles.gridPhoto} />
                          <View style={styles.gridDayBadge}>
                            <Text style={styles.gridDayBadgeText}>Şafak {item.gunNo}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  ) : null}

                  {/* Öne Çıkan Notlar */}
                  <View style={styles.notesList}>
                    {entries.slice(0, 3).map((item, idx) => (
                      <View key={item.id || idx} style={styles.noteItem}>
                        <Text style={[styles.noteBullet, { color: currentColors.dawn }]}>✦</Text>
                        <View style={styles.noteItemContent}>
                          <Text style={[styles.noteDayTitle, { color: currentColors.dawn }]}>
                            Şafak {item.gunNo}:
                          </Text>
                          <Text
                            style={[styles.noteSnippet, { color: currentColors.ink }]}
                            numberOfLines={2}
                          >
                            {item.not || 'Fotoğraf anısı'}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>

                  <Text style={[styles.cardFooter, { color: currentColors.mut }]}>
                    {strings.share.cardFooter} 🇹🇷
                  </Text>
                </View>

                {/* Paylaş Butonu */}
                <TouchableOpacity
                  style={[styles.shareBtn, { backgroundColor: currentColors.primaryBtnBg }]}
                  onPress={handleShareStory}
                  disabled={isSharing}
                  activeOpacity={0.85}
                >
                  {isSharing ? (
                    <ActivityIndicator color={currentColors.primaryBtnText} />
                  ) : (
                    <Text style={[styles.shareBtnText, { color: currentColors.primaryBtnText }]}>
                      📸 {strings.diary.tezkereAlbumShare}
                    </Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 390,
    maxHeight: '90%',
    borderRadius: 26,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: {
    fontSize: 20,
    fontFamily: typography.fonts.condensed.bold,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: typography.fonts.body.medium,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 10,
  },
  collageCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  collageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  collageHeaderTitleCol: {
    flex: 1,
  },
  collageBrand: {
    fontSize: 13,
    fontFamily: typography.fonts.condensed.bold,
    letterSpacing: 1,
  },
  collageSub: {
    fontSize: 11,
    fontFamily: typography.fonts.body.regular,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  gridPhotoWrapper: {
    width: '48%',
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  gridPhoto: {
    width: '100%',
    height: '100%',
  },
  gridDayBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  gridDayBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  notesList: {
    gap: 8,
    marginBottom: 12,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  noteBullet: {
    fontSize: 14,
    marginTop: 1,
  },
  noteItemContent: {
    flex: 1,
  },
  noteDayTitle: {
    fontSize: 12,
    fontFamily: typography.fonts.condensed.bold,
  },
  noteSnippet: {
    fontSize: 12,
    fontFamily: typography.fonts.body.regular,
    lineHeight: 16,
  },
  cardFooter: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 6,
    fontFamily: typography.fonts.body.medium,
  },
  shareBtn: {
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  shareBtnText: {
    fontSize: 15,
    fontFamily: typography.fonts.condensed.bold,
    letterSpacing: 0.5,
  },
});

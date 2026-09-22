// components/DiaryDetailModal.tsx
// Kayıtlı anıyı tam boyutta görüntüleme, düzenleme ve silme modalı.

import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';
import { strings } from '../constants/strings';
import { formatTurkishDate } from '../lib/date';
import { SafakKaydi, useDiaryStore } from '../lib/diary';
import { getIlByPlaka } from '../constants/iller';

interface DiaryDetailModalProps {
  visible: boolean;
  entry?: SafakKaydi;
  onClose: () => void;
  onEdit: (entry: SafakKaydi) => void;
  isDark?: boolean;
}

export const DiaryDetailModal: React.FC<DiaryDetailModalProps> = ({
  visible,
  entry,
  onClose,
  onEdit,
  isDark = true,
}) => {
  const currentColors = isDark ? colors.dark : colors.light;
  const deleteEntry = useDiaryStore((state) => state.deleteEntry);

  if (!visible || !entry) return null;

  const ilBilgisi = entry.gunNo <= 81 && entry.gunNo >= 1 ? getIlByPlaka(entry.gunNo) : undefined;

  const handleDelete = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {}

    Alert.alert(
      strings.diary.deleteConfirmTitle,
      strings.diary.deleteConfirmDesc,
      [
        { text: strings.diary.cancelBtn, style: 'cancel' },
        {
          text: strings.diary.deleteConfirmYes,
          style: 'destructive',
          onPress: async () => {
            await deleteEntry(entry.id);
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch {}
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
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
              {/* Üst Başlık */}
              <View style={styles.headerRow}>
                <View style={styles.badgeCol}>
                  <View style={[styles.plakaBadge, { backgroundColor: currentColors.dawn }]}>
                    <Text style={styles.plakaBadgeText}>
                      ŞAFAK {entry.gunNo}
                    </Text>
                  </View>
                  {ilBilgisi && (
                    <Text style={[styles.cityName, { color: currentColors.ink }]}>
                      {ilBilgisi.isim.toUpperCase()}
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  onPress={onClose}
                  style={[styles.closeBtn, { backgroundColor: isDark ? 'rgba(243,241,234,0.08)' : '#F1F5F9' }]}
                >
                  <Text style={[styles.closeBtnText, { color: currentColors.mut }]}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.dateText, { color: currentColors.mut }]}>
                📅 {formatTurkishDate(entry.tarih)}
              </Text>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Varsa Fotoğraf */}
                {entry.fotoUri && (
                  <View style={styles.photoContainer}>
                    <Image source={{ uri: entry.fotoUri }} style={styles.photo} resizeMode="cover" />
                  </View>
                )}

                {/* Not Metni */}
                {entry.not ? (
                  <View
                    style={[
                      styles.noteContainer,
                      {
                        backgroundColor: isDark ? 'rgba(243,241,234,0.04)' : '#F8FAFC',
                        borderColor: currentColors.line,
                      },
                    ]}
                  >
                    <Text style={[styles.noteText, { color: currentColors.ink }]}>
                      {entry.not}
                    </Text>
                  </View>
                ) : null}

                {/* Aksiyon Butonları (Düzenle & Sil) */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
                        borderColor: currentColors.line,
                      },
                    ]}
                    onPress={() => {
                      onClose();
                      onEdit(entry);
                    }}
                  >
                    <Text style={[styles.actionBtnText, { color: currentColors.ink }]}>
                      ✏️ {strings.diary.editNoteBtn}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      {
                        backgroundColor: currentColors.dangerBg,
                        borderColor: currentColors.dangerBorder,
                      },
                    ]}
                    onPress={handleDelete}
                  >
                    <Text style={[styles.actionBtnText, { color: currentColors.dangerText }]}>
                      🗑️ {strings.diary.deleteNoteBtn}
                    </Text>
                  </TouchableOpacity>
                </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '85%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 22,
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
    marginBottom: 6,
  },
  badgeCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  plakaBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  plakaBadgeText: {
    color: '#101216',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.8,
  },
  cityName: {
    fontSize: 18,
    fontFamily: typography.fonts.condensed.bold,
    letterSpacing: 0.5,
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
  dateText: {
    fontSize: 13,
    fontFamily: typography.fonts.body.medium,
    marginBottom: 16,
  },
  scrollContent: {
    paddingBottom: 10,
  },
  photoContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  photo: {
    width: '100%',
    height: 220,
    borderRadius: 16,
  },
  noteContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 18,
  },
  noteText: {
    fontSize: 15,
    fontFamily: typography.fonts.body.regular,
    lineHeight: 24,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    fontSize: 14,
    fontFamily: typography.fonts.body.semiBold,
  },
});

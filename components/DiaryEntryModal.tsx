// components/DiaryEntryModal.tsx
// Hızlı anı kaydetme ve düzenleme bottom-sheet / modal bileşeni.

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';
import { strings } from '../constants/strings';
import { formatTurkishDate } from '../lib/date';
import { useAppStore } from '../lib/storage';
import { useDiaryStore } from '../lib/diary';

interface DiaryEntryModalProps {
  visible: boolean;
  gunNo: number;
  tarih: string;
  plakaIl?: string;
  onClose: () => void;
  onSaveSuccess?: () => void;
  isDark?: boolean;
}

const MAX_CHAR_LIMIT = 500;

export const DiaryEntryModal: React.FC<DiaryEntryModalProps> = ({
  visible,
  gunNo,
  tarih,
  plakaIl,
  onClose,
  onSaveSuccess,
  isDark = true,
}) => {
  const currentColors = isDark ? colors.dark : colors.light;
  const isPro = useAppStore((state) => state.isPro);
  const setIsPro = useAppStore((state) => state.setIsPro);

  const getEntryByGunNo = useDiaryStore((state) => state.getEntryByGunNo);
  const saveEntry = useDiaryStore((state) => state.saveEntry);

  const [noteText, setNoteText] = useState('');
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (visible && gunNo > 0) {
      const existing = getEntryByGunNo(gunNo);
      if (existing) {
        setNoteText(existing.not || '');
        setPhotoUri(existing.fotoUri);
      } else {
        setNoteText('');
        setPhotoUri(undefined);
      }
    }
  }, [visible, gunNo]);

  const handlePickPhoto = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    // Pro kontrolü
    if (!isPro) {
      Alert.alert(
        'Şafak+ Pro Özelliği',
        strings.diary.photoProHint,
        [
          { text: 'Daha Sonra', style: 'cancel' },
          {
            text: 'Pro Satın Al',
            onPress: () => {
              // Pro aktifleştirme akışı
              setIsPro(true);
              Alert.alert('Tebrikler!', 'Şafak+ Pro aktif edildi!');
            },
          },
        ]
      );
      return;
    }

    // Galeri / Kamera seçimi
    Alert.alert(
      'Fotoğraf Ekle',
      'Anı fotoğrafını nasıl eklemek istersiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: '📸 Kamera ile Çek',
          onPress: async () => {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) {
              Alert.alert('İzin Gerekli', 'Fotoğraf çekebilmek için kamera izni vermeniz gerekir.');
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.8,
            });
            if (!result.canceled && result.assets[0]?.uri) {
              setPhotoUri(result.assets[0].uri);
            }
          },
        },
        {
          text: '🖼️ Galeriden Seç',
          onPress: async () => {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
              Alert.alert('İzin Gerekli', 'Fotoğraf seçebilmek için galeri izni vermeniz gerekir.');
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.8,
            });
            if (!result.canceled && result.assets[0]?.uri) {
              setPhotoUri(result.assets[0].uri);
            }
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!noteText.trim() && !photoUri) {
      Alert.alert('Eksik Bilgi', 'Lütfen en azından kısa bir not yazın veya bir fotoğraf ekleyin.');
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    setIsSaving(true);
    await saveEntry({
      gunNo,
      tarih: tarih || new Date().toISOString().split('T')[0],
      not: noteText,
      fotoUri: photoUri,
    });
    setIsSaving(false);

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    if (onSaveSuccess) onSaveSuccess();
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={[
                styles.sheetContainer,
                {
                  backgroundColor: isDark ? '#111827' : '#FFFFFF',
                  borderColor: currentColors.line,
                },
              ]}
            >
              {/* Tutamaç / Drag Bar */}
              <View style={[styles.dragHandle, { backgroundColor: currentColors.line }]} />

              {/* Başlık Çubuğu */}
              <View style={styles.headerRow}>
                <View style={styles.titleCol}>
                  <Text style={[styles.title, { color: currentColors.ink }]}>
                    {strings.diary.quickModalTitle(gunNo, plakaIl)}
                  </Text>
                  <Text style={[styles.subtitle, { color: currentColors.mut }]}>
                    📅 {formatTurkishDate(tarih)}
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
                {/* Not Giriş Alanı */}
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: isDark ? 'rgba(243,241,234,0.04)' : '#F8FAFC',
                      borderColor: currentColors.line,
                    },
                  ]}
                >
                  <TextInput
                    style={[styles.textInput, { color: currentColors.ink }]}
                    placeholder={strings.diary.notePlaceholder}
                    placeholderTextColor={currentColors.mut}
                    multiline
                    maxLength={MAX_CHAR_LIMIT}
                    value={noteText}
                    onChangeText={setNoteText}
                    textAlignVertical="top"
                  />
                  <Text style={[styles.charCounter, { color: currentColors.mut }]}>
                    {strings.diary.charCount(noteText.length, MAX_CHAR_LIMIT)}
                  </Text>
                </View>

                {/* Fotoğraf Alanı */}
                {photoUri ? (
                  <View style={styles.photoPreviewWrapper}>
                    <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                    <View style={styles.photoActionRow}>
                      <TouchableOpacity
                        style={[styles.photoActionBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0' }]}
                        onPress={handlePickPhoto}
                      >
                        <Text style={[styles.photoActionText, { color: currentColors.ink }]}>
                          📷 {strings.diary.changePhotoBtn}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.photoActionBtn, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}
                        onPress={() => setPhotoUri(undefined)}
                      >
                        <Text style={[styles.photoActionText, { color: '#EF4444' }]}>
                          🗑️ {strings.diary.removePhotoBtn}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.addPhotoButton,
                      {
                        borderColor: currentColors.line,
                        backgroundColor: isDark ? 'rgba(243,241,234,0.03)' : '#F8FAFC',
                      },
                    ]}
                    onPress={handlePickPhoto}
                    activeOpacity={0.75}
                  >
                    <View style={styles.addPhotoContent}>
                      <Text style={styles.photoIcon}>📷</Text>
                      <Text style={[styles.addPhotoText, { color: currentColors.ink }]}>
                        {strings.diary.addPhotoBtn}
                      </Text>
                      {!isPro && (
                        <View style={[styles.proBadge, { backgroundColor: isDark ? currentColors.dawn : '#D97706' }]}>
                          <Text style={styles.proBadgeText}>{strings.diary.photoProBadge}</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                )}

                {/* Kaydet ve Vazgeç Butonları */}
                <View style={styles.actionButtonsCol}>
                  <TouchableOpacity
                    style={[styles.saveBtn, { backgroundColor: currentColors.primaryBtnBg }]}
                    onPress={handleSave}
                    disabled={isSaving}
                    activeOpacity={0.85}
                  >
                    {isSaving ? (
                      <ActivityIndicator color={currentColors.primaryBtnText} />
                    ) : (
                      <Text style={[styles.saveBtnText, { color: currentColors.primaryBtnText }]}>
                        ✓ {strings.diary.saveNoteBtn}
                      </Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                    <Text style={[styles.cancelBtnText, { color: currentColors.mut }]}>
                      {strings.diary.cancelBtn}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  dragHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  titleCol: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontFamily: typography.fonts.condensed.bold,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: typography.fonts.body.medium,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 20,
  },
  inputWrapper: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  textInput: {
    fontSize: 15,
    fontFamily: typography.fonts.body.regular,
    minHeight: 100,
    lineHeight: 22,
  },
  charCounter: {
    fontSize: 11,
    fontFamily: typography.fonts.body.medium,
    textAlign: 'right',
    marginTop: 6,
  },
  photoPreviewWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  photoPreview: {
    width: '100%',
    height: 180,
    borderRadius: 16,
  },
  photoActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  photoActionBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoActionText: {
    fontSize: 13,
    fontFamily: typography.fonts.body.semiBold,
  },
  addPhotoButton: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  addPhotoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  photoIcon: {
    fontSize: 18,
  },
  addPhotoText: {
    fontSize: 14,
    fontFamily: typography.fonts.body.semiBold,
  },
  proBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 4,
  },
  proBadgeText: {
    fontSize: 10,
    color: '#101216',
    fontWeight: '800',
  },
  actionButtonsCol: {
    gap: 10,
    marginTop: 4,
  },
  saveBtn: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  saveBtnText: {
    fontSize: 16,
    fontFamily: typography.fonts.condensed.bold,
    letterSpacing: 0.5,
  },
  cancelBtn: {
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontFamily: typography.fonts.body.medium,
  },
});

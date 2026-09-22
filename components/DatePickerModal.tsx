// components/DatePickerModal.tsx
// Kullanıcının tarihi net olarak görüp onaylayabileceği, tüm platformlarla uyumlu modal bileşeni.

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';
import { formatTurkishDate } from '../lib/date';
import { strings } from '../constants/strings';

interface DatePickerModalProps {
  visible: boolean;
  title: string;
  value: Date;
  onConfirm: (date: Date) => void;
  onClose: () => void;
  isDark?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  title,
  value,
  onConfirm,
  onClose,
  isDark = true,
  minimumDate,
  maximumDate,
}) => {
  const [tempDate, setTempDate] = useState<Date>(value || new Date());

  useEffect(() => {
    if (visible) {
      setTempDate(value || new Date());
    }
  }, [visible, value]);

  const currentColors = isDark ? colors.dark : colors.light;

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      if (event.type === 'set' && selectedDate) {
        setTempDate(selectedDate);
      }
      return;
    }

    // iOS ve Web
    if (selectedDate) {
      setTempDate(selectedDate);
    } else if ((event as any)?.nativeEvent?.timestamp) {
      setTempDate(new Date((event as any).nativeEvent.timestamp));
    } else if ((event as any)?.target?.value) {
      const parsed = new Date((event as any).target.value);
      if (!isNaN(parsed.getTime())) {
        setTempDate(parsed);
      }
    }
  };

  const handleConfirm = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    onConfirm(tempDate);
    onClose();
  };

  const handleCancel = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={handleCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View
              style={[
                styles.card,
                {
                  backgroundColor: isDark ? '#141C2E' : '#FFFFFF',
                  borderColor: currentColors.line,
                },
              ]}
            >
              {/* Başlık */}
              <View style={styles.header}>
                <Text style={[styles.title, { color: currentColors.ink }]}>
                  {title}
                </Text>
                <TouchableOpacity
                  onPress={handleCancel}
                  style={[styles.closeIconBtn, { backgroundColor: isDark ? 'rgba(243,241,234,0.08)' : '#F1F5F9' }]}
                >
                  <Text style={[styles.closeIconText, { color: currentColors.mut }]}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Seçili Tarih Önizleme Rozeti */}
              <View
                style={[
                  styles.previewBadge,
                  {
                    backgroundColor: isDark ? 'rgba(255,214,176,0.12)' : '#FEF3C7',
                    borderColor: isDark ? 'rgba(255,214,176,0.25)' : '#FDE68A',
                  },
                ]}
              >
                <Text style={[styles.previewLabel, { color: isDark ? currentColors.dawn : '#92400E' }]}>
                  {strings.datePicker.selectedDateLabel}
                </Text>
                <Text style={[styles.previewDate, { color: isDark ? currentColors.ink : '#78350F' }]}>
                  📅 {formatTurkishDate(tempDate)}
                </Text>
              </View>

              {/* DateTimePicker Alanı */}
              <View style={styles.pickerWrapper}>
                {Platform.OS === 'web' ? (
                  <View style={styles.webInputContainer}>
                    <input
                      type="date"
                      value={tempDate.toISOString().split('T')[0]}
                      onChange={(e) => {
                        const d = new Date(e.target.value);
                        if (!isNaN(d.getTime())) setTempDate(d);
                      }}
                      style={{
                        fontSize: 18,
                        padding: '12px 16px',
                        borderRadius: 12,
                        border: `1px solid ${currentColors.line}`,
                        backgroundColor: isDark ? '#0A1020' : '#F8FAFC',
                        color: currentColors.ink,
                        fontFamily: 'inherit',
                        width: '100%',
                        cursor: 'pointer',
                      }}
                    />
                  </View>
                ) : (
                  <DateTimePicker
                    value={tempDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleChange}
                    textColor={currentColors.ink}
                    themeVariant={isDark ? 'dark' : 'light'}
                    minimumDate={minimumDate}
                    maximumDate={maximumDate}
                    style={styles.picker}
                  />
                )}
              </View>

              {/* Aksiyon Butonları */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    {
                      backgroundColor: currentColors.primaryBtnBg,
                      shadowColor: isDark ? '#FFD6B0' : '#000000',
                    },
                  ]}
                  onPress={handleConfirm}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.confirmButtonText,
                      { color: currentColors.primaryBtnText },
                    ]}
                  >
                    {strings.datePicker.confirmBtn}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancel}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.cancelButtonText, { color: currentColors.mut }]}>
                    {strings.datePicker.cancelBtn}
                  </Text>
                </TouchableOpacity>
              </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    borderWidth: 1,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontFamily: typography.fonts.condensed.bold,
    letterSpacing: 0.5,
    flex: 1,
  },
  closeIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  closeIconText: {
    fontSize: 15,
    fontWeight: '700',
  },
  previewBadge: {
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  previewLabel: {
    fontSize: 12,
    fontFamily: typography.fonts.body.medium,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewDate: {
    fontSize: 20,
    fontFamily: typography.fonts.condensed.bold,
    letterSpacing: 0.5,
  },
  pickerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    minHeight: 120,
  },
  picker: {
    width: '100%',
    height: 140,
  },
  webInputContainer: {
    width: '100%',
    paddingVertical: 10,
  },
  actionButtons: {
    marginTop: 18,
    gap: 10,
  },
  confirmButton: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: typography.fonts.condensed.bold,
    letterSpacing: 0.5,
  },
  cancelButton: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: typography.fonts.body.medium,
  },
});

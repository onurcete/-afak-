// app/(tabs)/diary.tsx
// Şafak Günlüğü: Askerlik anılarının kronolojik akışı, detay görüntüleme ve tezkere albümü.

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { strings } from '../../constants/strings';
import { useAppStore } from '../../lib/storage';
import { formatTurkishDate, calculateSafak } from '../../lib/date';
import { SafakKaydi, useDiaryStore } from '../../lib/diary';
import { getIlByPlaka } from '../../constants/iller';
import { DiaryEntryModal } from '../../components/DiaryEntryModal';
import { DiaryDetailModal } from '../../components/DiaryDetailModal';
import { TezkereAlbumModal } from '../../components/TezkereAlbumModal';

export default function DiaryScreen() {
  const themeMode = useAppStore((state) => state.themeMode);
  const startDateStr = useAppStore((state) => state.startDate);
  const endDateStr = useAppStore((state) => state.endDate);

  const isDark = themeMode !== 'light';
  const currentColors = isDark ? colors.dark : colors.light;

  const entries = useDiaryStore((state) => state.entries);
  const isLoading = useDiaryStore((state) => state.isLoading);
  const loadEntries = useDiaryStore((state) => state.loadEntries);

  const [selectedEntry, setSelectedEntry] = useState<SafakKaydi | undefined>(undefined);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAlbumModalVisible, setIsAlbumModalVisible] = useState(false);

  // Düzenleme / yeni ekleme için gün ve tarih bilgisi
  const calculation = calculateSafak(startDateStr, endDateStr, new Date());
  const todayGunNo = Math.max(0, calculation.remainingDays);
  const todayDateStr = new Date().toISOString().split('T')[0];

  const [editGunNo, setEditGunNo] = useState<number>(todayGunNo);
  const [editDate, setEditDate] = useState<string>(todayDateStr);
  const [editPlakaIl, setEditPlakaIl] = useState<string | undefined>(calculation.currentIl?.isim);

  useEffect(() => {
    loadEntries();
  }, []);

  const handleOpenAddToday = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    setEditGunNo(todayGunNo);
    setEditDate(todayDateStr);
    setEditPlakaIl(calculation.currentIl?.isim);
    setIsEditModalVisible(true);
  };

  const handleOpenDetail = (entry: SafakKaydi) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    setSelectedEntry(entry);
    setIsDetailVisible(true);
  };

  const handleEditFromDetail = (entry: SafakKaydi) => {
    setEditGunNo(entry.gunNo);
    setEditDate(entry.tarih);
    const il = entry.gunNo <= 81 && entry.gunNo >= 1 ? getIlByPlaka(entry.gunNo)?.isim : undefined;
    setEditPlakaIl(il);
    setIsEditModalVisible(true);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View
        style={[
          styles.emptyIconCircle,
          { backgroundColor: isDark ? 'rgba(255,214,176,0.12)' : '#FEF3C7' },
        ]}
      >
        <Text style={styles.emptyIconText}>📖</Text>
      </View>
      <Text style={[styles.emptyTitle, { color: currentColors.ink }]}>
        {strings.diary.emptyTitle}
      </Text>
      <Text style={[styles.emptySubtitle, { color: currentColors.mut }]}>
        {strings.diary.emptySubtitle}
      </Text>

      <TouchableOpacity
        style={[styles.emptyAddBtn, { backgroundColor: currentColors.primaryBtnBg }]}
        onPress={handleOpenAddToday}
        activeOpacity={0.85}
      >
        <Text style={[styles.emptyAddBtnText, { color: currentColors.primaryBtnText }]}>
          ✍ {strings.diary.addTodayBtn}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }: { item: SafakKaydi }) => {
    const ilBilgisi = item.gunNo <= 81 && item.gunNo >= 1 ? getIlByPlaka(item.gunNo) : undefined;

    return (
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: currentColors.cardBg,
            borderColor: currentColors.cardBorder,
          },
        ]}
        onPress={() => handleOpenDetail(item)}
        activeOpacity={0.75}
      >
        {/* Üst Satır: Plaka / Şafak Rozeti ve Tarih */}
        <View style={styles.cardHeader}>
          <View style={styles.badgeRow}>
            <View style={[styles.dayBadge, { backgroundColor: currentColors.dawn }]}>
              <Text style={styles.dayBadgeText}>ŞAFAK {item.gunNo}</Text>
            </View>
            {ilBilgisi && (
              <Text style={[styles.cardCityName, { color: currentColors.ink }]}>
                {ilBilgisi.isim.toUpperCase()}
              </Text>
            )}
          </View>
          <Text style={[styles.cardDate, { color: currentColors.mut }]}>
            {formatTurkishDate(item.tarih)}
          </Text>
        </View>

        {/* Gövde: Not & Fotoğraf Önizlemesi */}
        <View style={styles.cardBody}>
          <View style={styles.cardTextCol}>
            {item.not ? (
              <Text
                style={[styles.cardNoteSnippet, { color: currentColors.ink }]}
                numberOfLines={3}
              >
                {item.not}
              </Text>
            ) : (
              <Text style={[styles.cardNoNoteText, { color: currentColors.mut }]}>
                {item.fotoUri ? 'Fotoğraf anısı eklendi' : strings.diary.noNoteYet}
              </Text>
            )}
          </View>

          {item.fotoUri && (
            <View style={styles.cardThumbnailWrapper}>
              <Image source={{ uri: item.fotoUri }} style={styles.cardThumbnail} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: currentColors.bg }]}>
      {/* Üst Başlık Çubuğu */}
      <View style={[styles.topBar, { borderBottomColor: currentColors.line }]}>
        <View style={styles.titleCol}>
          <Text style={[styles.screenTitle, { color: currentColors.ink }]}>
            {strings.diary.title}
          </Text>
          <Text style={[styles.screenSubtitle, { color: currentColors.mut }]}>
            {strings.diary.subtitle}
          </Text>
        </View>

        {entries.length > 0 && (
          <TouchableOpacity
            style={[styles.quickAddBtn, { backgroundColor: currentColors.primaryBtnBg }]}
            onPress={handleOpenAddToday}
            activeOpacity={0.8}
          >
            <Text style={[styles.quickAddBtnText, { color: currentColors.primaryBtnText }]}>
              + Not
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Yükleniyor Durumu */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={currentColors.dawn} />
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            entries.length > 0 ? (
              <TouchableOpacity
                style={[
                  styles.albumBannerCard,
                  {
                    backgroundColor: isDark ? 'rgba(255,214,176,0.1)' : '#FEF3C7',
                    borderColor: isDark ? 'rgba(255,214,176,0.25)' : '#FDE68A',
                  },
                ]}
                onPress={() => {
                  try {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  } catch {}
                  setIsAlbumModalVisible(true);
                }}
                activeOpacity={0.8}
              >
                <View style={styles.albumBannerContent}>
                  <Text style={styles.albumBannerIcon}>🎖️</Text>
                  <View style={styles.albumBannerTextCol}>
                    <Text style={[styles.albumBannerTitle, { color: isDark ? currentColors.dawn : '#92400E' }]}>
                      {strings.diary.tezkereAlbumTitle}
                    </Text>
                    <Text style={[styles.albumBannerSub, { color: isDark ? currentColors.ink : '#78350F' }]}>
                      {entries.length} anı birikti • Kolajı gör & paylaş →
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ) : null
          }
        />
      )}

      {/* Anı Ekleme / Düzenleme Modalı */}
      <DiaryEntryModal
        visible={isEditModalVisible}
        gunNo={editGunNo}
        tarih={editDate}
        plakaIl={editPlakaIl}
        onClose={() => setIsEditModalVisible(false)}
        onSaveSuccess={() => loadEntries()}
        isDark={isDark}
      />

      {/* Anı Detay Modalı */}
      <DiaryDetailModal
        visible={isDetailVisible}
        entry={selectedEntry}
        onClose={() => setIsDetailVisible(false)}
        onEdit={handleEditFromDetail}
        isDark={isDark}
      />

      {/* Tezkere Kolaj Albümü Modalı */}
      <TezkereAlbumModal
        visible={isAlbumModalVisible}
        entries={entries}
        onClose={() => setIsAlbumModalVisible(false)}
        isDark={isDark}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 56,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  titleCol: {
    flex: 1,
  },
  screenTitle: {
    fontSize: typography.sizes.screenTitle,
    fontFamily: typography.fonts.condensed.bold,
    letterSpacing: 1,
  },
  screenSubtitle: {
    fontSize: 12,
    fontFamily: typography.fonts.body.regular,
    marginTop: 2,
  },
  quickAddBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    marginLeft: 10,
  },
  quickAddBtnText: {
    fontSize: 14,
    fontFamily: typography.fonts.condensed.bold,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    flexGrow: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginTop: 60,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  emptyIconText: {
    fontSize: 38,
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: typography.fonts.condensed.bold,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: typography.fonts.body.regular,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyAddBtn: {
    height: 50,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  emptyAddBtnText: {
    fontSize: 15,
    fontFamily: typography.fonts.condensed.bold,
    letterSpacing: 0.5,
  },
  albumBannerCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  albumBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  albumBannerIcon: {
    fontSize: 26,
  },
  albumBannerTextCol: {
    flex: 1,
  },
  albumBannerTitle: {
    fontSize: 15,
    fontFamily: typography.fonts.condensed.bold,
    letterSpacing: 0.5,
  },
  albumBannerSub: {
    fontSize: 12,
    fontFamily: typography.fonts.body.medium,
    marginTop: 2,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dayBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  dayBadgeText: {
    color: '#101216',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.6,
  },
  cardCityName: {
    fontSize: 15,
    fontFamily: typography.fonts.condensed.bold,
  },
  cardDate: {
    fontSize: 12,
    fontFamily: typography.fonts.body.regular,
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardTextCol: {
    flex: 1,
  },
  cardNoteSnippet: {
    fontSize: 14,
    fontFamily: typography.fonts.body.regular,
    lineHeight: 20,
  },
  cardNoNoteText: {
    fontSize: 13,
    fontFamily: typography.fonts.body.medium,
    fontStyle: 'italic',
  },
  cardThumbnailWrapper: {
    width: 60,
    height: 60,
    borderRadius: 10,
    overflow: 'hidden',
  },
  cardThumbnail: {
    width: '100%',
    height: '100%',
  },
});

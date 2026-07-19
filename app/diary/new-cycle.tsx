import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { typography } from '../../src/theme/typography';
import { colors } from '../../src/theme/colors';
import { PageHeader } from '../../src/components/PageHeader';
import { ChevronDown, Save, Sprout } from 'lucide-react-native';
import { Button } from '../../src/components/Button';
import { useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { goBackOrReplace } from '../../src/utils/navigation';
import { api } from '../../src/api/client';
import { usePlots } from '../../src/hooks/usePlot';
import { useDiaries } from '../../src/hooks/useDiary';
import { getErrorMessage } from '../../src/utils/errors';

const CROP_TYPES = ['Lúa nước', 'Cây ăn trái', 'Cà phê', 'Rau màu', 'Khác'];

const SEASON_MAPPING: Record<string, string[]> = {
  'Lúa nước': ['Đông Xuân', 'Hè Thu', 'Thu Đông', 'Vụ Mùa'],
  'Cây ăn trái': ['Mùa mưa', 'Mùa khô', 'Quanh năm'],
  'Cà phê': ['Trồng mới (đầu mùa mưa)', 'Mùa thu hoạch', 'Mùa khô (tưới nước)'],
  'Rau màu': ['Vụ Xuân', 'Vụ Hè', 'Vụ Thu', 'Vụ Đông'],
  'Khác': ['Quanh năm', 'Theo mùa vụ địa phương']
};

export default function NewCycleScreen() {
  const router = useRouter();
  const { data: plots = [], isLoading: plotsLoading } = usePlots();
  const { refetch: refetchDiaries } = useDiaries();
  
  const [selectedPlotId, setSelectedPlotId] = useState<string>('');
  const [showPlotDropdown, setShowPlotDropdown] = useState(false);
  
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [showCropDropdown, setShowCropDropdown] = useState(false);
  
  const [selectedSeason, setSelectedSeason] = useState<string>('');
  const [showSeasonDropdown, setShowSeasonDropdown] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available seasons based on selected crop
  const availableSeasons = useMemo(() => {
    if (!selectedCrop) return [];
    return SEASON_MAPPING[selectedCrop] || SEASON_MAPPING['Khác'];
  }, [selectedCrop]);

  const handleSave = async () => {
    if (!selectedPlotId) {
      Alert.alert('Lỗi', 'Vui lòng chọn mảnh vườn.');
      return;
    }
    if (!selectedCrop) {
      Alert.alert('Lỗi', 'Vui lòng chọn loại cây.');
      return;
    }
    if (!selectedSeason) {
      Alert.alert('Lỗi', 'Vui lòng chọn mùa vụ.');
      return;
    }

    setIsSubmitting(true);
    try {
      const startDate = new Date().toISOString();
      await api.post('/diaries', {
        plot_id: selectedPlotId,
        crop_type: selectedCrop,
        season: selectedSeason,
        start_date: startDate,
      });

      Alert.alert('Thành công', 'Đã khởi tạo vụ mùa mới.', [
        { text: 'OK', onPress: () => {
          refetchDiaries();
          goBackOrReplace(router, '/(tabs)/diary');
        }}
      ]);
    } catch (err) {
      Alert.alert('Lỗi', getErrorMessage(err, 'Không thể tạo vụ mùa.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPlot = plots.find(p => p._id === selectedPlotId);

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <PageHeader title="Bắt đầu vụ mùa mới" fallbackHref="/(tabs)/diary" />
      
      <KeyboardAvoidingView 
        style={styles.content} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.formCard}>
            
            {/* Select Plot */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>1. Chọn mảnh vườn</Text>
              {plotsLoading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : plots.length === 0 ? (
                <Text style={styles.emptyText}>Bạn chưa có mảnh vườn nào. Hãy tạo mảnh vườn trước.</Text>
              ) : (
                <>
                  <TouchableOpacity 
                    style={styles.selectInput} 
                    onPress={() => {
                      setShowPlotDropdown(!showPlotDropdown);
                      setShowCropDropdown(false);
                      setShowSeasonDropdown(false);
                    }}
                  >
                    <Text style={styles.selectText}>
                      {selectedPlot ? selectedPlot.name : 'Chọn mảnh vườn đang canh tác'}
                    </Text>
                    <ChevronDown size={20} color={colors.textMain + '80'} />
                  </TouchableOpacity>

                  {showPlotDropdown && (
                    <View style={styles.dropdown}>
                      {plots.map((plot) => (
                        <TouchableOpacity 
                          key={plot._id}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setSelectedPlotId(plot._id);
                            setShowPlotDropdown(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{plot.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </>
              )}
            </View>

            {/* Select Crop */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>2. Loại cây trồng</Text>
              <TouchableOpacity 
                style={[styles.selectInput, !selectedPlotId && styles.disabledInput]} 
                disabled={!selectedPlotId}
                onPress={() => {
                  setShowCropDropdown(!showCropDropdown);
                  setShowPlotDropdown(false);
                  setShowSeasonDropdown(false);
                }}
              >
                <Text style={styles.selectText}>
                  {selectedCrop ? selectedCrop : 'Chọn loại cây'}
                </Text>
                <ChevronDown size={20} color={colors.textMain + '80'} />
              </TouchableOpacity>

              {showCropDropdown && (
                <View style={styles.dropdown}>
                  {CROP_TYPES.map((crop) => (
                    <TouchableOpacity 
                      key={crop}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedCrop(crop);
                        setSelectedSeason(''); // Reset season when crop changes
                        setShowCropDropdown(false);
                        // Auto open season dropdown after crop is selected
                        setTimeout(() => setShowSeasonDropdown(true), 300);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{crop}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Select Season */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>3. Chọn mùa vụ</Text>
              <TouchableOpacity 
                style={[styles.selectInput, !selectedCrop && styles.disabledInput]} 
                disabled={!selectedCrop}
                onPress={() => {
                  setShowSeasonDropdown(!showSeasonDropdown);
                  setShowCropDropdown(false);
                  setShowPlotDropdown(false);
                }}
              >
                <Text style={styles.selectText}>
                  {selectedSeason ? selectedSeason : (selectedCrop ? 'Chọn mùa vụ' : 'Vui lòng chọn loại cây trước')}
                </Text>
                <ChevronDown size={20} color={colors.textMain + '80'} />
              </TouchableOpacity>

              {showSeasonDropdown && availableSeasons.length > 0 && (
                <View style={styles.dropdown}>
                  {availableSeasons.map((season) => (
                    <TouchableOpacity 
                      key={season}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedSeason(season);
                        setShowSeasonDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{season}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

          </View>

          <View style={styles.infoBanner}>
            <Sprout size={32} color={colors.primary} style={{ marginRight: 16 }} />
            <Text style={styles.infoText}>
              Bắt đầu ghi chép vụ mùa giúp Farmy theo dõi sức khoẻ cây trồng và đưa ra lời khuyên chính xác.
            </Text>
          </View>

        </ScrollView>

        <View style={styles.footer}>
          <Button 
            title={isSubmitting ? "Đang xử lý..." : "Khởi tạo vụ mùa"} 
            onPress={handleSave} 
            disabled={isSubmitting}
            icon={isSubmitting ? <ActivityIndicator size="small" color="#fff" /> : <Save size={20} color="#fff" style={{ marginRight: 8 }} />}
            style={{ marginBottom: 12 }}
          />
          <TouchableOpacity style={styles.cancelBtn} onPress={() => goBackOrReplace(router, '/(tabs)/diary')} disabled={isSubmitting}>
            <Text style={styles.cancelText}>Hủy bỏ</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgMain,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.borderMain + '50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    ...typography.bodySmall,
    fontWeight: '800',
    color: colors.textMain,
    marginBottom: 8,
    marginLeft: 8,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    marginLeft: 8,
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderMain + '80',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  disabledInput: {
    backgroundColor: colors.bgSurface1,
    opacity: 0.7,
  },
  selectText: {
    ...typography.body,
    color: colors.textMain,
  },
  dropdown: {
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderMain + '50',
    borderRadius: 16,
    marginTop: 8,
    overflow: 'hidden',
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderMain + '20',
  },
  dropdownItemText: {
    ...typography.body,
    color: colors.textMain,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSurface1,
    borderWidth: 1,
    borderColor: colors.primary + '20',
    padding: 16,
    borderRadius: 16,
  },
  infoText: {
    flex: 1,
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textMain + 'CC',
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    backgroundColor: colors.bgSurface,
    borderTopWidth: 1,
    borderTopColor: colors.borderMain + '30',
    paddingBottom: Platform.OS === 'ios' ? 32 : 20,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textMain + '80',
  }
});

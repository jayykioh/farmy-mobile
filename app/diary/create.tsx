import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image, ActivityIndicator, Alert, DeviceEventEmitter } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { typography } from '../../src/theme/typography';
import { colors } from '../../src/theme/colors';
import { PageHeader } from '../../src/components/PageHeader';
import { ChevronDown, Camera, Droplets, FlaskConical, BugOff, Save, X } from 'lucide-react-native';
import { Button } from '../../src/components/Button';
import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { goBackOrReplace } from '../../src/utils/navigation';
import { useDiaries } from '../../src/hooks/useDiary';
import { api } from '../../src/api/client';
import { createDiaryRequestHash } from '../../src/utils/diaryHash';
import * as ImagePicker from 'expo-image-picker';
import { getErrorMessage } from '../../src/utils/errors';

const generateIdempotencyKey = () => {
  return `${Math.random().toString(36).substring(2, 15)}-${Date.now()}`;
};

export default function CreateDiaryScreen() {
  const router = useRouter();
  const { diaryId } = useLocalSearchParams();
  const { data: diaries = [], isLoading } = useDiaries();
  
  const initialDiaryId = Array.isArray(diaryId) ? diaryId[0] : diaryId;
  const [selectedDiaryId, setSelectedDiaryId] = useState<string | null>(initialDiaryId || null);

  const [showDropdown, setShowDropdown] = useState(false);
  const [stage, setStage] = useState('');
  const [content, setContent] = useState('');
  const [activeActivity, setActiveActivity] = useState<string>('water'); // 'water', 'fertilizer', 'pest'
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleSelectImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập', 'Ứng dụng cần quyền truy cập thư viện ảnh để tải lên hình ảnh.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImage = result.assets[0];
      setIsUploading(true);
      try {
        const formData = new FormData();
        const filename = selectedImage.fileName || selectedImage.uri.split('/').pop()?.split('?')[0] || 'photo.jpg';
        const type = selectedImage.mimeType || 'image/jpeg';

        formData.append('file', {
          uri: selectedImage.uri,
          name: filename,
          type,
        } as unknown as Blob);

        const response = await api.post('/snaps/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data?.success && response.data?.data?.publicUrl) {
          setImageUrl(response.data.data.publicUrl);
        } else {
          throw new Error('Không nhận được đường dẫn ảnh từ máy chủ.');
        }
      } catch (err) {
        Alert.alert('Lỗi tải ảnh', getErrorMessage(err, 'Không thể tải ảnh lên.'));
      } finally {
        setIsUploading(false);
      }
    }
  };

  const activities = [
    { id: 'water', label: 'Tưới nước', icon: Droplets },
    { id: 'fertilizer', label: 'Bón phân', icon: FlaskConical },
    { id: 'pest', label: 'Phun thuốc', icon: BugOff },
  ];

  const activeDiaries = diaries
    .filter(diary => diary.status === 'active' || diary._id === initialDiaryId)
    .sort((a, b) => new Date(b.start_date || 0).getTime() - new Date(a.start_date || 0).getTime());
  
  const currentSelectedId = selectedDiaryId || (activeDiaries.length > 0 ? activeDiaries[0]._id : null);
  const selectedDiary = activeDiaries.find(diary => diary._id === currentSelectedId) || null;
  const isSaveDisabled = isSubmitting || isUploading || isLoading || !selectedDiary;

  const handleSave = async () => {
    if (isUploading) {
      Alert.alert('Đang tải ảnh', 'Vui lòng đợi ảnh tải lên xong trước khi lưu nhật ký.');
      return;
    }

    if (!selectedDiary) {
      Alert.alert('Lỗi', 'Vui lòng chọn một vụ mùa trước.');
      return;
    }
    if (!content.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền nội dung nhật ký.');
      return;
    }

    setIsSubmitting(true);
    try {
      const diaryDate = new Date().toISOString();
      const idempotencyKey = generateIdempotencyKey();
      
      const payload = {
        diaryId: selectedDiary._id,
        activityType: activeActivity,
        content: content.trim(),
        diaryDate,
        cropType: selectedDiary.crop_type,
        imageDigests: imageUrl ? [imageUrl] : [],
      };

      const requestHash = createDiaryRequestHash(payload);

      // Theo NestJS API:
      // Body là CreateDiaryLogDto: { activity_type, content, image_url }
      await api.post(`/diaries/${selectedDiary._id}/logs`, {
        activity_type: activeActivity,
        content: `${stage ? `[${stage}] ` : ''}${content.trim()}`,
        image_url: imageUrl || undefined,
      }, {
        headers: {
          'Idempotency-Key': idempotencyKey,
          'X-Request-Hash': requestHash,
        }
      });

      // Phát sự kiện đồng bộ
      DeviceEventEmitter.emit('diary_updated');
      DeviceEventEmitter.emit('pet_updated');

      Alert.alert('Thành công', 'Đã lưu nhật ký mới.', [
        { text: 'OK', onPress: () => goBackOrReplace(router, '/(tabs)/diary') }
      ]);
    } catch (err) {
      Alert.alert('Lỗi', getErrorMessage(err, 'Không thể tạo nhật ký.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <PageHeader title="Nhật ký mới" fallbackHref="/(tabs)/diary" />
      
      <KeyboardAvoidingView 
        style={styles.content} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.formCard}>
            
            {/* Select Crop */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Chọn vụ mùa</Text>
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : activeDiaries.length === 0 ? (
                <Text style={styles.emptyText}>Chưa có vụ mùa nào đang canh tác.</Text>
              ) : (
                <>
                  <TouchableOpacity 
                    style={styles.selectInput} 
                    onPress={() => setShowDropdown(!showDropdown)}
                  >
                    <Text style={styles.selectText}>
                      {selectedDiary ? `${selectedDiary.crop_type}${selectedDiary.season ? ` (${selectedDiary.season})` : ''}` : 'Chọn vụ mùa'}
                    </Text>
                    <ChevronDown size={20} color={colors.textMain + '80'} />
                  </TouchableOpacity>

                  {showDropdown && (
                    <View style={styles.dropdown}>
                      {activeDiaries.map((diary) => (
                        <TouchableOpacity 
                          key={diary._id}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setSelectedDiaryId(diary._id);
                            setShowDropdown(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{diary.crop_type}{diary.season ? ` (${diary.season})` : ''}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </>
              )}
            </View>

            {/* Growth Stage */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Giai đoạn sinh trưởng</Text>
              <TextInput 
                style={styles.textInput} 
                placeholder="Ví dụ: Đang làm đòng / Trổ bông" 
                placeholderTextColor={colors.borderMain}
                value={stage}
                onChangeText={setStage}
              />
            </View>

            {/* Notes */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nhật ký vườn ruộng</Text>
              <TextInput 
                style={[styles.textInput, styles.textArea]} 
                placeholder="Hôm nay ruộng vườn nhà bạn có gì thay đổi?" 
                placeholderTextColor={colors.borderMain}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={content}
                onChangeText={setContent}
              />
            </View>

            {/* Activities */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Hoạt động trong ngày</Text>
              <View style={styles.activitiesRow}>
                {activities.map(act => {
                  const Icon = act.icon;
                  const isActive = activeActivity === act.id;
                  return (
                    <TouchableOpacity 
                      key={act.id} 
                      style={[styles.activityChip, isActive ? styles.activityChipActive : null]}
                      onPress={() => setActiveActivity(act.id)}
                    >
                      <Icon size={16} color={isActive ? '#fff' : colors.textMain + 'B0'} />
                      <Text style={[styles.activityText, isActive ? styles.activityTextActive : null]}>
                        {act.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Image */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Hình ảnh thực tế</Text>
              <View style={styles.imageRow}>
                <TouchableOpacity 
                  style={styles.addImageBtn} 
                  onPress={handleSelectImage}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <>
                      <Camera size={24} color={colors.textMain + '50'} />
                      <Text style={styles.addImageText}>Thêm ảnh</Text>
                    </>
                  )}
                </TouchableOpacity>

                {imageUrl && (
                  <View style={styles.imagePreviewWrapper}>
                    <Image source={{ uri: imageUrl }} style={styles.imagePreview} />
                    <TouchableOpacity style={styles.removeImageBtn} onPress={() => setImageUrl(null)}>
                      <X size={12} color="#fff" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>

          </View>

          <View style={styles.infoBanner}>
            <Text style={{ fontSize: 40, marginRight: 16 }}>🌱</Text>
            <Text style={styles.infoText}>
              Ghi lại thay đổi của cây trồng mỗi ngày giúp Farmy đưa ra khuyến nghị tốt hơn.
            </Text>
          </View>

        </ScrollView>

        <View style={styles.footer}>
          <Button 
            title={isUploading ? "Đang tải ảnh..." : isSubmitting ? "Đang lưu..." : "Lưu nhật ký"} 
            onPress={handleSave} 
            disabled={isSaveDisabled}
            icon={isSubmitting ? <ActivityIndicator size="small" color="#fff" /> : <Save size={20} color="#fff" style={{ marginRight: 8 }} />}
            style={{ marginBottom: 12 }}
          />
          <TouchableOpacity style={styles.cancelBtn} onPress={() => goBackOrReplace(router, '/(tabs)/diary')} disabled={isSubmitting || isUploading}>
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
    marginBottom: 20,
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
  textInput: {
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderMain + '80',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 14,
    ...typography.body,
    color: colors.textMain,
  },
  textArea: {
    height: 120,
    paddingTop: 16,
    borderRadius: 20,
  },
  activitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderMain + '50',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  activityChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  activityText: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.textMain + 'B0',
  },
  activityTextActive: {
    color: '#fff',
  },
  imageRow: {
    flexDirection: 'row',
    gap: 16,
  },
  addImageBtn: {
    width: 80,
    height: 80,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderMain,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bgSurface,
    gap: 4,
  },
  addImageText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMain + '80',
  },
  imagePreviewWrapper: {
    width: 80,
    height: 80,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderMain + '50',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
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

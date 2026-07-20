import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { typography } from '../../src/theme/typography';
import { colors } from '../../src/theme/colors';
import { PageHeader } from '../../src/components/PageHeader';
import { Camera, Send, Sprout, ThumbsUp, ThumbsDown, X } from 'lucide-react-native';
import { useChat } from '../../src/hooks/useChat';
import { useState, useRef, useEffect, Fragment } from 'react';
import { useResponsiveLayout } from '../../src/hooks/useResponsiveLayout';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../../src/api/client';
import { getErrorMessage } from '../../src/utils/errors';

export default function ChatScreen() {
  const { messages, isTyping, error, sendMessage } = useChat();
  const [input, setInput] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();
  const params = useLocalSearchParams<{ initialMessage?: string; initialImage?: string }>();
  const { gutter, contentMaxWidth } = useResponsiveLayout();

  useEffect(() => {
    if (params.initialImage) {
      setAttachedImage(params.initialImage);
    }
    if (params.initialMessage) {
      setInput(params.initialMessage);
    }
  }, [params.initialImage, params.initialMessage]);

  const uploadAndAttachImage = async (uri: string, filename: string, mimeType: string) => {
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri,
        name: filename,
        type: mimeType,
      } as unknown as Blob);

      const response = await api.post('/snaps/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data?.success && response.data?.data?.publicUrl) {
        setAttachedImage(response.data.data.publicUrl);
      } else {
        throw new Error('Không nhận được đường dẫn ảnh từ máy chủ.');
      }
    } catch (err) {
      Alert.alert('Lỗi đính kèm ảnh', getErrorMessage(err, 'Không thể tải ảnh lên.'));
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleCameraBtnPress = () => {
    Alert.alert(
      'Đính kèm ảnh hoặc Chẩn đoán',
      'Bạn muốn làm gì?',
      [
        {
          text: 'Chụp ảnh đính kèm chat',
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Quyền truy cập', 'Ứng dụng cần quyền sử dụng máy ảnh.');
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              quality: 0.8,
            });
            if (!result.canceled && result.assets && result.assets.length > 0) {
              const selected = result.assets[0];
              const filename = selected.fileName || selected.uri.split('/').pop()?.split('?')[0] || 'photo.jpg';
              const type = selected.mimeType || 'image/jpeg';
              await uploadAndAttachImage(selected.uri, filename, type);
            }
          },
        },
        {
          text: 'Chọn ảnh từ thư viện',
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Quyền truy cập', 'Ứng dụng cần quyền truy cập thư viện ảnh.');
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              quality: 0.8,
            });
            if (!result.canceled && result.assets && result.assets.length > 0) {
              const selected = result.assets[0];
              const filename = selected.fileName || selected.uri.split('/').pop()?.split('?')[0] || 'photo.jpg';
              const type = selected.mimeType || 'image/jpeg';
              await uploadAndAttachImage(selected.uri, filename, type);
            }
          },
        },
        {
          text: 'Quét AI chẩn đoán bệnh (Scan)',
          onPress: () => router.push('/scan'),
        },
        {
          text: 'Hủy bỏ',
          style: 'cancel',
        },
      ]
    );
  };

  const handleSend = () => {
    const text = input.trim();
    if ((!text && !attachedImage) || isTyping || isUploadingImage) return;

    let messageToSend = text;
    if (attachedImage) {
      messageToSend = text ? `${text}\n\n[IMAGE:${attachedImage}]` : `[IMAGE:${attachedImage}]`;
    }

    sendMessage(messageToSend);
    setInput('');
    setAttachedImage(null);
  };

  const handleFeedback = (type: 'up' | 'down') => {
    Alert.alert('Cảm ơn phản hồi', type === 'up' ? 'Farmy đã ghi nhận câu trả lời hữu ích.' : 'Farmy đã ghi nhận để cải thiện câu trả lời.');
  };

  const parseMessageContent = (contentString: string, isUser: boolean) => {
    if (!contentString) return <Text style={[styles.messageContent, isUser ? styles.textContentUser : styles.textContentAssistant]}>...</Text>;
    const parts = contentString.split(/(\[IMAGE:https?:\/\/[^\]]+\])/g);

    return (
      <View>
        {parts.map((part, idx) => {
          if (part.startsWith('[IMAGE:')) {
            const url = part.slice(7, -1);
            return (
              <Image
                key={idx}
                source={{ uri: url }}
                style={styles.attachedBubbleImage}
                resizeMode="cover"
              />
            );
          }
          if (!part.trim() && idx > 0) return null;
          return (
            <Text key={idx} style={[styles.messageContent, isUser ? styles.textContentUser : styles.textContentAssistant]}>
              {part}
            </Text>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <PageHeader
        title="FarmDiaries AI"
        showBack={false}
        rightElement={(
          <TouchableOpacity
            style={styles.headerAction}
            onPress={() => router.push('/scan')}
            accessibilityRole="button"
            accessibilityLabel="Mở máy quét cây trồng"
            activeOpacity={0.7}
          >
            <Camera color={colors.textMain} size={22} />
          </TouchableOpacity>
        )}
      />
      
      <KeyboardAvoidingView 
        style={styles.content} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={[styles.scrollContent, { paddingHorizontal: gutter, maxWidth: contentMaxWidth }]}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {/* Date Label */}
          <View style={styles.dateLabelContainer}>
            <View style={styles.dateLabel}>
              <Text style={styles.dateText}>Hôm nay</Text>
            </View>
          </View>

          {/* Initial Greeting */}
          {messages.length === 0 && (
            <View style={[styles.messageWrapper, styles.messageAssistant]}>
              <View style={styles.avatarContainer}>
                <Sprout size={18} color={colors.primary} />
              </View>
              <View style={[styles.messageBubble, styles.bubbleAssistant]}>
                <Text style={[styles.messageContent, styles.textContentAssistant]}>
                  Chào bạn! Mình là Bé Thóc, bạn cần mình giúp gì về nông trại hôm nay?
                </Text>
              </View>
            </View>
          )}

          {/* Messages */}
          {messages.map(msg => (
            <View key={msg.id} style={[styles.messageWrapper, msg.role === 'user' ? styles.messageUser : styles.messageAssistant]}>
              {msg.role === 'assistant' && (
                <View style={styles.avatarContainer}>
                  <Sprout size={18} color={colors.primary} />
                </View>
              )}
              
              <View style={[styles.messageBubble, msg.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant]}>
                {parseMessageContent(msg.content, msg.role === 'user')}
                
                {msg.role === 'assistant' && !!msg.content && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleFeedback('up')} accessibilityRole="button" accessibilityLabel="Phản hồi hữu ích">
                      <ThumbsUp size={14} color={colors.textMain} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleFeedback('down')} accessibilityRole="button" accessibilityLabel="Phản hồi chưa hữu ích">
                      <ThumbsDown size={14} color={colors.textMain} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          ))}
          
          {isTyping && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
            <View style={{ padding: 10, alignSelf: 'flex-start' }}>
               <ActivityIndicator size="small" color={colors.primary} />
            </View>
          )}

          {!!error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          {attachedImage && (
            <View style={[styles.attachmentPreviewContainer, { marginHorizontal: gutter, maxWidth: contentMaxWidth }]}>
              <Image source={{ uri: attachedImage }} style={styles.attachmentPreviewImage} />
              <TouchableOpacity style={styles.attachmentRemoveBtn} onPress={() => setAttachedImage(null)}>
                <X size={14} color="#FFF" />
              </TouchableOpacity>
            </View>
          )}
          <View style={[styles.inputContainer, { paddingHorizontal: gutter, maxWidth: contentMaxWidth }]}>
            <TouchableOpacity style={styles.cameraBtn} onPress={handleCameraBtnPress} accessibilityRole="button" accessibilityLabel="Đính kèm ảnh hoặc quét AI" activeOpacity={0.7}>
              {isUploadingImage ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Camera size={22} color={attachedImage ? colors.primary : colors.textMuted} />
              )}
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Nhắn tin Bé Thóc..."
              placeholderTextColor={colors.textMuted}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={handleSend}
              editable={!isTyping && !isUploadingImage}
              selectionColor={colors.primary}
              accessibilityLabel="Tin nhắn cho Bé Thóc"
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[styles.sendBtn, ((!input.trim() && !attachedImage) || isTyping || isUploadingImage) && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={(!input.trim() && !attachedImage) || isTyping || isUploadingImage}
              accessibilityRole="button"
              accessibilityLabel="Gửi tin nhắn"
              accessibilityState={{ disabled: (!input.trim() && !attachedImage) || isTyping || isUploadingImage }}
            >
              <Send size={20} color={colors.bgSurface} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgSurface1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    width: '100%',
    alignSelf: 'center',
    paddingVertical: 16,
    paddingBottom: 24,
  },
  dateLabelContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  dateLabel: {
    backgroundColor: colors.bgSurface,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderMain + '50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dateText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textMain + '80',
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '85%',
  },
  messageUser: {
    alignSelf: 'flex-end',
  },
  messageAssistant: {
    alignSelf: 'flex-start',
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderMain + '50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 4,
  },
  headerAction: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderMain + '66',
  },
  messageBubble: {
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  bubbleUser: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    backgroundColor: colors.bgSurface,
    borderColor: colors.borderMain + '50',
    borderBottomLeftRadius: 4,
  },
  messageContent: {
    ...typography.body,
    lineHeight: 24,
  },
  textContentUser: {
    color: colors.bgSurface,
  },
  textContentAssistant: {
    color: colors.textMain,
  },
  inputBar: {
    backgroundColor: colors.bgSurface,
    borderTopWidth: 1,
    borderTopColor: colors.borderMain + '50',
  },
  inputContainer: {
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  cameraBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: colors.bgMain,
    borderWidth: 1,
    borderColor: colors.borderMain + '50',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    ...typography.body,
    minHeight: 48,
    maxHeight: 100,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  sendBtnDisabled: {
    opacity: 0.42,
  },
  errorBanner: {
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: colors.error + '14',
    borderWidth: 1,
    borderColor: colors.error + '40',
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '700',
    textAlign: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: colors.bgSurface1,
    borderWidth: 1,
    borderColor: colors.borderMain + '30',
  },
  attachedBubbleImage: {
    width: 200,
    height: 200,
    borderRadius: 16,
    marginVertical: 6,
    backgroundColor: '#E5E7EB',
  },
  attachmentPreviewContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    marginTop: 10,
    marginLeft: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderMain + '50',
    backgroundColor: colors.bgSurface1,
  },
  attachmentPreviewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  attachmentRemoveBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.error || '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

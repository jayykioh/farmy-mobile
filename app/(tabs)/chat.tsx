import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { typography } from '../../src/theme/typography';
import { colors } from '../../src/theme/colors';
import { PageHeader } from '../../src/components/PageHeader';
import { Camera, Send, Sprout } from 'lucide-react-native';
import { useChat } from '../../src/hooks/useChat';
import { useState, useRef } from 'react';
import { useResponsiveLayout } from '../../src/hooks/useResponsiveLayout';
import { useRouter } from 'expo-router';

export default function ChatScreen() {
  const { messages, isTyping, sendMessage } = useChat();
  const [input, setInput] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();
  const { gutter, contentMaxWidth } = useResponsiveLayout();

  const handleSend = () => {
    if (!input.trim() || isTyping) return;
    sendMessage(input.trim());
    setInput('');
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
                <Text style={[styles.messageContent, msg.role === 'user' ? styles.textContentUser : styles.textContentAssistant]}>
                  {msg.content || '...'}
                </Text>
                
              </View>
            </View>
          ))}
          
          {isTyping && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
            <View style={{ padding: 10, alignSelf: 'flex-start' }}>
               <ActivityIndicator size="small" color={colors.primary} />
            </View>
          )}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <View style={[styles.inputContainer, { paddingHorizontal: gutter, maxWidth: contentMaxWidth }]}>
            <TouchableOpacity style={styles.cameraBtn} onPress={() => router.push('/scan')} accessibilityRole="button" accessibilityLabel="Đính kèm ảnh cây trồng" activeOpacity={0.7}>
              <Camera size={22} color={colors.textMuted} />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Nhắn tin Bé Thóc..."
              placeholderTextColor={colors.textMuted}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={handleSend}
              editable={!isTyping}
              selectionColor={colors.primary}
              accessibilityLabel="Tin nhắn cho Bé Thóc"
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!input.trim() || isTyping) && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!input.trim() || isTyping}
              accessibilityRole="button"
              accessibilityLabel="Gửi tin nhắn"
              accessibilityState={{ disabled: !input.trim() || isTyping }}
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
  }
});

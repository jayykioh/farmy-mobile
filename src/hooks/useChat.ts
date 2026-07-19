import { useState, useCallback } from 'react';
import EventSource from 'react-native-sse';
import { api } from '../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    // Thêm tin nhắn của user vào UI ngay lập tức
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    const token = await AsyncStorage.getItem('access_token');

    const clientMessageId = `client-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    // Mở SSE kết nối
    let url = `${api.defaults.baseURL}/chat/stream/events?message=${encodeURIComponent(content)}&client_message_id=${clientMessageId}`;
    if (sessionId) {
      url += `&session_id=${sessionId}`;
    }

    const es = new EventSource(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    let currentBotContent = '';
    const botMsgId = (Date.now() + 1).toString();

    // Khởi tạo tin nhắn trống của bot
    setMessages(prev => [...prev, { id: botMsgId, role: 'assistant', content: '' }]);

    es.addEventListener('meta' as any, (event: any) => {
      const data = JSON.parse(event.data || '{}');
      if (data.session_id) {
        setSessionId(data.session_id);
      }
    });

    es.addEventListener('token' as any, (event: any) => {
      const data = JSON.parse(event.data || '{}');
      if (data.delta) {
        currentBotContent += data.delta;
        setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, content: currentBotContent } : m));
      }
    });

    es.addEventListener('done' as any, () => {
      if (!currentBotContent) {
        setMessages(prev => prev.map(m => m.id === botMsgId ? {
          ...m,
          content: 'Mình chưa nhận được phản hồi từ AI. Bạn thử gửi lại câu hỏi nhé.',
        } : m));
      }
      setIsTyping(false);
      es.close();
    });

    es.addEventListener('error' as any, (event: any) => {
      console.error('SSE Error:', event);
      setMessages(prev => prev.map(m => m.id === botMsgId ? {
        ...m,
        content: currentBotContent || 'Kết nối AI đang gặp sự cố. Bạn vui lòng thử lại sau ít phút.',
      } : m));
      setIsTyping(false);
      es.close();
    });

  }, [sessionId]);

  return {
    messages,
    isTyping,
    sendMessage
  };
}

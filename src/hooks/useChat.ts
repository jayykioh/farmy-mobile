import { useState, useCallback, useEffect, useRef } from 'react';
import EventSource from 'react-native-sse';
import { api } from '../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getErrorMessage } from '../utils/errors';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource<'meta' | 'token' | 'done'> | null>(null);

  useEffect(() => {
    return () => {
      eventSourceRef.current?.close();
    };
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    const token = await AsyncStorage.getItem('access_token');
    if (!token) {
      setError('Bạn cần đăng nhập để sử dụng trợ lý AI.');
      return;
    }

    setError(null);
    // Thêm tin nhắn của user vào UI ngay lập tức
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    eventSourceRef.current?.close();

    const clientMessageId = `client-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    // Mở SSE kết nối
    let url = `${api.defaults.baseURL}/chat/stream/events?message=${encodeURIComponent(content)}&client_message_id=${clientMessageId}`;
    if (sessionId) {
      url += `&session_id=${sessionId}`;
    }

    const es = new EventSource<'meta' | 'token' | 'done'>(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    eventSourceRef.current = es;

    let currentBotContent = '';
    const botMsgId = (Date.now() + 1).toString();

    // Khởi tạo tin nhắn trống của bot
    setMessages(prev => [...prev, { id: botMsgId, role: 'assistant', content: '' }]);

    es.addEventListener('meta', (event) => {
      try {
        const data = JSON.parse(event.data || '{}');
        if (data.session_id) {
          setSessionId(data.session_id);
        }
      } catch (err) {
        setError(getErrorMessage(err, 'Không thể đọc phản hồi phiên chat.'));
      }
    });

    es.addEventListener('token', (event) => {
      try {
        const data = JSON.parse(event.data || '{}');
        if (data.delta) {
          currentBotContent += data.delta;
          setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, content: currentBotContent } : m));
        }
      } catch (err) {
        setError(getErrorMessage(err, 'Không thể đọc phản hồi từ trợ lý AI.'));
        setIsTyping(false);
        es.close();
        eventSourceRef.current = null;
      }
    });

    es.addEventListener('done', () => {
      setIsTyping(false);
      es.close();
      eventSourceRef.current = null;
    });

    es.addEventListener('error', () => {
      setError('Kết nối trợ lý AI bị gián đoạn. Vui lòng thử lại.');
      setIsTyping(false);
      es.close();
      eventSourceRef.current = null;
    });

  }, [sessionId]);

  return {
    messages,
    isTyping,
    error,
    sendMessage
  };
}

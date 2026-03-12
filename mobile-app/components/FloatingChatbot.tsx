// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, TextInput, Animated, Dimensions,
  ScrollView, Alert, Easing, Platform, KeyboardAvoidingView, Keyboard
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useChatbotPersistence } from '../hooks/useChatbotPersistence';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  primary:      '#4169E1',
  secondary:    '#4169E1',
  bg:           '#FFFFFF',
  surface:      '#F8FAFC',
  glass:        'rgba(255, 255, 255, 0.92)',
  text:         '#1E293B',
  textSub:      '#64748B',
  white:        '#FFFFFF',
  border:       '#E2E8F0',
  online:       '#10B981',
  error:        '#EF4444',
  glow:         'rgba(65, 105, 225, 0.25)',
  fabGrad:      ['#4169E1', '#4169E1'],
  headerGrad:   ['#FFFFFF', '#F8FAFC'],
  userBubble:   ['#4169E1', '#4169E1'],
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

const chatbotService = {
  sendMessage: async (token, message) => {
    const response = await fetch(`${API_BASE_URL}/chatbot/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ message }),
    });
    if (!response.ok) throw new Error('Failed to get response from chatbot');
    return response.json();
  },
  getQuickActions: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/quick-actions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to get quick actions');
      return response.json();
    } catch {
      return { quickActions: [
        { id: 'submit', label: 'Submit Feedback' },
        { id: 'status', label: 'Check Status' },
        { id: 'faq',    label: 'FAQ' },
      ]};
    }
  },
};

// ─── Pulsing Glow Ring ────────────────────────────────────────────────────────
const PulseRing = () => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.timing(scale, { toValue: 1.7, duration: 1500, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
        Animated.timing(opacity, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.pulseRing, { transform: [{ scale }], opacity }]}
    />
  );
};

// ─── Text Formatter (No Asterisks) ───────────────────────────────────────────
const FormattedText = ({ text, style, isUser = false }) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <Text style={style}>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <Text key={i} style={[style, { fontWeight: '800' }]}>
              {part.slice(2, -2)}
            </Text>
          );
        }
        return part;
      })}
    </Text>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FloatingChatbot({ user, token }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef(null);

  const [isOpen, setIsOpen]           = useState(false);
  const [messages, setMessages]       = useState([]);
  const [inputText, setInputText]     = useState('');
  const [isLoading, setIsLoading]     = useState(false);
  const [showMenu, setShowMenu]       = useState(false);
  const [quickActions, setQuickActions] = useState([]);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const panelAnim  = useRef(new Animated.Value(0)).current; 
  const slideAnim  = useRef(new Animated.Value(30)).current;

  const { persistedMessages, saveMessages, clearMessages, isLoading: isLoadingPersistence } =
    useChatbotPersistence();

  useEffect(() => {
    if (persistedMessages.length > 0) setMessages(persistedMessages);
  }, []);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0)
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(panelAnim, { toValue: 1, duration: 400, useNativeDriver: true, easing: Easing.out(Easing.back(1)) }),
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 40, friction: 7 }),
      ]).start();
      if (token) loadQuickActions();
    } else {
      Animated.parallel([
        Animated.timing(panelAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 30, duration: 300, useNativeDriver: true }),
      ]).start();
      Keyboard.dismiss();
    }
  }, [isOpen]);

  useEffect(() => {
    if (messages.length > 0 && !isLoadingPersistence) saveMessages(messages);
  }, [messages, isLoadingPersistence]);

  useEffect(() => {
    if (isOpen && messages.length === 0 && !isLoadingPersistence) {
      setMessages([{
        id: '1',
        text: `Hey${user?.name ? ' ' + user.name : ''}! 👋\n\nI'm your assistant. How can I help you today?`,
        type: 'bot',
        timestamp: new Date(),
      }]);
    }
  }, [isOpen, messages.length, isLoadingPersistence]);

  const loadQuickActions = async () => {
    try {
      const data = await chatbotService.getQuickActions(token);
      setQuickActions(data.quickActions || []);
    } catch {}
  };

  const handleSend = useCallback(async (text) => {
    const messageText = typeof text === 'string' ? text.trim() : inputText.trim();
    if (!messageText || isLoading) return;

    const userMsg = { id: Date.now().toString(), text: messageText, type: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      if (!token) {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          text: 'Please log in to use the chatbot.',
          type: 'bot', timestamp: new Date(),
        }]);
        return;
      }
      const response = await chatbotService.sendMessage(token, messageText);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: response.message,
        type: 'bot',
        timestamp: new Date(),
        quickActions: response.quickActions,
        feedbackSummary: response.feedbackSummary,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble connecting. Please try again later.",
        type: 'bot', timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [inputText, isLoading, token]);

  const renderMessage = ({ item }) => {
    const isUser = item.type === 'user';
    const timeStr = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <View style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowBot]}>
        {!isUser && (
          <LinearGradient colors={C.fabGrad} style={styles.botAvatar}>
            <IconSymbol name="smart-toy" size={14} color={C.white} />
          </LinearGradient>
        )}
        <View style={styles.msgColumn}>
          {isUser ? (
            <LinearGradient colors={C.userBubble} style={[styles.bubble, styles.bubbleUser]}>
              <FormattedText text={item.text} style={styles.bubbleTextUser} isUser />
            </LinearGradient>
          ) : (
            <View style={[styles.bubble, styles.bubbleBot]}>
              <FormattedText text={item.text} style={styles.bubbleTextBot} />
              
              {item.quickActions && (
                <View style={styles.inlineChips}>
                  {item.quickActions.map(a => (
                    <TouchableOpacity key={a.id} style={styles.inlineChip} onPress={() => handleSend(a.label)}>
                      <Text style={styles.inlineChipText}>{a.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {item.feedbackSummary && (
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryTitle}>Latest Feedback</Text>
                  {item.feedbackSummary.recent?.[0] && (
                    <View style={styles.summaryRow}>
                      <View style={styles.onlineDot} />
                      <Text style={styles.summaryText} numberOfLines={1}>{item.feedbackSummary.recent[0].title}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}
          <Text style={[styles.time, isUser ? styles.timeUser : styles.timeBot]}>{timeStr}</Text>
        </View>
      </View>
    );
  };

  return (
    <>
      <Animated.View style={[styles.fabWrap, { bottom: insets.bottom + 100, right: 16 }]}>
        {!isOpen && <PulseRing />}
        <TouchableOpacity onPress={() => setIsOpen(!isOpen)} activeOpacity={0.9}>
          <LinearGradient colors={C.fabGrad} style={styles.fab}>
            <IconSymbol name={isOpen ? 'close' : 'smart-toy'} size={24} color={C.white} />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {isOpen && (
        <Animated.View style={[
          styles.panel,
          {
            opacity: panelAnim,
            transform: [{ translateY: slideAnim }],
            bottom: insets.bottom + (keyboardHeight ? keyboardHeight + 10 : 170),
            right: 16, left: 16,
            height: keyboardHeight ? SCREEN_HEIGHT * 0.4 : SCREEN_HEIGHT * 0.65,
          }
        ]}>
          <LinearGradient colors={C.headerGrad} style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerAvatar}>
                <IconSymbol name="smart-toy" size={20} color={C.primary} />
              </View>
              <View>
                <Text style={styles.headerTitle}>Assistant</Text>
                <View style={styles.statusRow}>
                  <View style={styles.onlineDot} />
                  <Text style={styles.headerSub}>Online</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity onPress={() => setIsOpen(false)} style={styles.closeBtn}>
              <IconSymbol name="close" size={20} color={C.textSub} />
            </TouchableOpacity>
          </LinearGradient>

          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={renderMessage}
            contentContainerStyle={{ padding: 16 }}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            ListFooterComponent={isLoading && (
              <View style={styles.loading}>
                <ActivityIndicator size="small" color={C.primary} />
                <Text style={styles.loadingText}>Thinking...</Text>
              </View>
            )}
          />

          <View style={styles.inputArea}>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder="How can I help you?"
                placeholderTextColor={C.textSub}
                value={inputText}
                onChangeText={setInputText}
                multiline
              />
            </View>
            <TouchableOpacity
              onPress={() => handleSend()}
              disabled={!inputText.trim() || isLoading}
            >
              <LinearGradient 
                colors={inputText.trim() ? C.fabGrad : ['#E2E8F0', '#E2E8F0']} 
                style={styles.sendBtn}
              >
                <IconSymbol name="send" size={16} color={C.white} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  fabWrap: { position: 'absolute', zIndex: 999 },
  fab: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: C.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6 },
  pulseRing: { position: 'absolute', width: 56, height: 56, borderRadius: 28, backgroundColor: C.glow },
  panel: { 
    position: 'absolute', 
    zIndex: 1000, 
    borderRadius: 28, 
    backgroundColor: C.glass, 
    elevation: 20, 
    shadowColor: '#4F46E5', 
    shadowOffset: { width: 0, height: 12 }, 
    shadowOpacity: 0.15, 
    shadowRadius: 24, 
    height: SCREEN_HEIGHT * 0.65, 
    borderWidth: 1.5, 
    borderColor: 'rgba(255,255,255,0.7)',
    overflow: 'hidden' 
  },
  header: { paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: C.border },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.white, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: C.border },
  headerTitle: { fontSize: 16, fontWeight: '700', color: C.text },
  headerSub: { fontSize: 12, color: C.textSub },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.online },
  closeBtn: { padding: 4 },
  msgRow: { flexDirection: 'row', marginBottom: 16, maxWidth: '85%' },
  msgRowUser: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
  msgRowBot: { alignSelf: 'flex-start' },
  botAvatar: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 8, alignSelf: 'flex-end', marginBottom: 4 },
  msgColumn: { flex: 1 },
  bubble: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12 },
  bubbleUser: { borderBottomRightRadius: 4 },
  bubbleBot: { backgroundColor: C.white, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#F1F5F9', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  bubbleTextUser: { color: C.white, fontSize: 14, lineHeight: 20 },
  bubbleTextBot: { color: C.text, fontSize: 14, lineHeight: 20 },
  time: { fontSize: 10, marginTop: 4, color: C.textSub },
  timeUser: { textAlign: 'right', marginRight: 4 },
  timeBot: { marginLeft: 4 },
  inlineChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  inlineChip: { backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: C.border },
  inlineChipText: { color: C.primary, fontSize: 12, fontWeight: '600' },
  summaryCard: { marginTop: 10, backgroundColor: '#F8FAFC', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: C.border },
  summaryTitle: { fontSize: 12, fontWeight: '700', color: C.text, marginBottom: 6 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  summaryText: { fontSize: 12, color: C.textSub, flex: 1 },
  loading: { padding: 16, flexDirection: 'row', alignItems: 'center', gap: 8 },
  loadingText: { fontSize: 12, color: C.textSub, fontStyle: 'italic' },
  inputArea: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, backgroundColor: C.white, gap: 10, borderTopWidth: 1, borderTopColor: C.border },
  inputWrap: { flex: 1, backgroundColor: '#F1F5F9', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, maxHeight: 80, justifyContent: 'center' },
  input: { fontSize: 14, color: C.text, padding: 0 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
});

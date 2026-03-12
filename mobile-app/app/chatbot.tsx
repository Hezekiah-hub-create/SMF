// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList,
  KeyboardAvoidingView, Platform, SafeAreaView, StatusBar,
  Animated, Easing, ScrollView, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

// ─── API URL ──────────────────────────────────────────────────────────────────
let API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';
if (__DEV__ && API_BASE_URL.includes('localhost')) {
  if (Constants.expoConfig?.hostUri) {
    API_BASE_URL = `http://${Constants.expoConfig.hostUri.split(':')[0]}:5000/api`;
  } else if (Platform.OS === 'android') {
    API_BASE_URL = 'http://10.0.2.2:5000/api';
  }
}

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  bgTop:        '#EEF2FF',
  bgBot:        '#F8FAFF',
  headerStart:  '#4338CA',
  headerEnd:    '#6D28D9',
  userStart:    '#4F46E5',
  userEnd:      '#7C3AED',
  botBubble:    '#FFFFFF',
  botBorder:    '#E2E8F0',
  botAccent:    '#6366F1',
  text:         '#1E293B',
  textSub:      '#64748B',
  textMuted:    '#94A3B8',
  white:        '#FFFFFF',
  online:       '#34D399',
  chipBg:       '#EEF2FF',
  chipBorder:   '#C7D2FE',
  chipText:     '#4F46E5',
  inputBg:      '#F1F5F9',
  inputBorder:  '#E2E8F0',
  sendStart:    '#4F46E5',
  sendEnd:      '#7C3AED',
  error:        '#EF4444',
};

// ─── Service ──────────────────────────────────────────────────────────────────
const chatbotService = {
  sendMessage: async (token, message) => {
    const res = await fetch(`${API_BASE_URL}/chatbot/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) throw new Error('Failed');
    return res.json();
  },
};

const QUICK_REPLIES = [
  'How do I submit feedback?',
  'What is my feedback status?',
  'How do I check my responses?',
  'Contact support',
];

// ─── Typing Indicator ─────────────────────────────────────────────────────────
const TypingIndicator = () => {
  const dots = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];
  useEffect(() => {
    dots.forEach((dot, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 180),
          Animated.timing(dot, { toValue: -7, duration: 350, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
          Animated.timing(dot, { toValue: 0,  duration: 350, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
          Animated.delay(500),
        ])
      ).start();
    });
  }, []);
  return (
    <View style={styles.typingRow}>
      {dots.map((d, i) => <Animated.View key={i} style={[styles.typingDot, { transform: [{ translateY: d }] }]} />)}
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ChatbotScreen() {
  const router = useRouter();
  const { user, token } = useAuth();
  const flatListRef = useRef(null);

  const [messages,  setMessages]  = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [reactions, setReactions] = useState({});

  // Greeting
  useEffect(() => {
    setMessages([{
      id: '1',
      text: `Hey${user?.name ? ' ' + user.name : ''}! 👋\n\nI'm here to help with feedback and inquiries. How can I assist you today?`,
      type: 'bot',
      timestamp: new Date(),
    }]);
  }, [user]);

  // Auto-scroll on new messages
  useEffect(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, isLoading]);

  const getFallbackResponse = (input) => {
    const l = input.toLowerCase();
    if (l.includes('submit') || l.includes('feedback'))
      return "To submit feedback, go to the Feedback tab and tap +. Provide a title, description, and category.";
    if (l.includes('status') || l.includes('check'))
      return "Check your feedback status on the Dashboard — it shows all submissions with Pending, In Progress, or Resolved status.";
    if (l.includes('response') || l.includes('reply'))
      return "You'll receive a notification when staff responds. View all replies in the Feedback Detail screen.";
    if (l.includes('contact') || l.includes('support'))
      return "For additional support, contact the Student Representative Council (SRC) or submit a general feedback.";
    if (l.includes('hello') || l.includes('hi') || l.includes('hey'))
      return "Hello! 👋 How can I help you today?";
    if (l.includes('help'))
      return "I can help with:\n• Submitting feedback\n• Checking feedback status\n• Understanding responses\n\nWhat would you like to know?";
    return "Thanks for your message! For specific feedback assistance, use the Feedback tab. Anything else I can help with?";
  };

  const handleSend = useCallback(async (text) => {
    const msg = typeof text === 'string' ? text.trim() : inputText.trim();
    if (!msg || isLoading) return;

    const userMsg = { id: Date.now().toString(), text: msg, type: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      if (token) {
        const res = await chatbotService.sendMessage(token, msg);
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          text: res.reply || res.message || "I'm here to help!",
          type: 'bot', timestamp: new Date(),
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          text: getFallbackResponse(msg),
          type: 'bot', timestamp: new Date(),
        }]);
      }
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: getFallbackResponse(msg),
        type: 'bot', timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [inputText, isLoading, token]);

  const toggleReaction = (msgId, emoji) => {
    setReactions(prev => ({ ...prev, [msgId]: prev[msgId] === emoji ? null : emoji }));
  };

  const charCount = inputText.length;
  const nearLimit = charCount > 420;

  // ─── Render Message ─────────────────────────────────────────────────────────
  const renderMessage = ({ item }) => {
    const isUser = item.type === 'user';
    const timeStr = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <View style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowBot]}>
        {!isUser && (
          <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.botAvatar}>
            <IconSymbol name="smart-toy" size={15} color="#fff" />
          </LinearGradient>
        )}
        <View style={styles.msgCol}>
          {isUser ? (
            <LinearGradient colors={[C.userStart, C.userEnd]} style={[styles.bubble, styles.bubbleUser]}>
              <Text style={styles.bubbleTextUser}>{item.text}</Text>
              <Text style={styles.timeUser}>{timeStr}</Text>
            </LinearGradient>
          ) : (
            <View style={[styles.bubble, styles.bubbleBot]}>
              <Text style={styles.bubbleTextBot}>{item.text}</Text>
              <View style={styles.botMeta}>
                <Text style={styles.timeBot}>{timeStr}</Text>
                <View style={styles.reactionRow}>
                  {['👍', '👎'].map(emoji => (
                    <TouchableOpacity
                      key={emoji}
                      style={[styles.reactionBtn, reactions[item.id] === emoji && styles.reactionBtnActive]}
                      onPress={() => toggleReaction(item.id, emoji)}
                    >
                      <Text style={{ fontSize: 12 }}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.headerStart} />

      {/* ── Header ── */}
      <LinearGradient colors={[C.headerStart, C.headerEnd]} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={20} color={C.white} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <LinearGradient colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.08)']} style={styles.headerAvatar}>
            <IconSymbol name="smart-toy" size={20} color={C.white} />
          </LinearGradient>
          <View>
            <Text style={styles.headerTitle}>SMF Assistant</Text>
            <View style={styles.statusRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.headerSub}>Online • Ready to help</Text>
            </View>
          </View>
        </View>

        <View style={{ width: 36 }} />
      </LinearGradient>

      {/* ── Messages ── */}
      <LinearGradient colors={[C.bgTop, C.bgBot]} style={{ flex: 1 }}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.msgList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={() => isLoading ? (
            <View style={[styles.msgRow, styles.msgRowBot]}>
              <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.botAvatar}>
                <IconSymbol name="smart-toy" size={15} color="#fff" />
              </LinearGradient>
              <View style={[styles.bubble, styles.bubbleBot, { paddingVertical: 16 }]}>
                <TypingIndicator />
              </View>
            </View>
          ) : null}
        />
      </LinearGradient>

      {/* ── Quick Replies ── */}
      <View style={styles.chipsBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {QUICK_REPLIES.map((r, i) => (
            <TouchableOpacity key={i} style={styles.chip} onPress={() => handleSend(r)}>
              <Text style={styles.chipText}>{r}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── Input ── */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.inputBar}>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="Type a message…"
              placeholderTextColor={C.textMuted}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            {nearLimit && <Text style={styles.charCount}>{charCount}/500</Text>}
          </View>
          <TouchableOpacity
            onPress={() => handleSend()}
            disabled={!inputText.trim() || isLoading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={(!inputText.trim() || isLoading) ? ['#94A3B8', '#94A3B8'] : [C.sendStart, C.sendEnd]}
              style={styles.sendBtn}
            >
              <IconSymbol name="send" size={18} color={C.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: C.bgTop },

  // Header
  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, justifyContent: 'space-between' },
  backBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerAvatar: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  headerTitle:  { fontSize: 16, fontWeight: '700', color: '#fff' },
  headerSub:    { fontSize: 11, color: 'rgba(255,255,255,0.65)' },
  statusRow:    { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  onlineDot:    { width: 7, height: 7, borderRadius: 4, backgroundColor: '#34D399' },

  // Messages
  msgList:      { paddingHorizontal: 14, paddingVertical: 14, paddingBottom: 6 },
  msgRow:       { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12 },
  msgRowUser:   { justifyContent: 'flex-end', paddingLeft: 50 },
  msgRowBot:    { justifyContent: 'flex-start', paddingRight: 50 },
  msgCol:       { flex: 1 },
  botAvatar:    { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 8, marginBottom: 2, flexShrink: 0 },

  // Bubbles
  bubble:         { borderRadius: 20, paddingHorizontal: 15, paddingVertical: 12 },
  bubbleUser:     { borderBottomRightRadius: 4, alignSelf: 'flex-end' },
  bubbleBot:      { backgroundColor: '#fff', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#E2E8F0', borderLeftWidth: 3, borderLeftColor: '#6366F1' },
  bubbleTextUser: { color: '#fff', fontSize: 15, lineHeight: 22 },
  bubbleTextBot:  { color: '#1E293B', fontSize: 15, lineHeight: 22 },
  timeUser:       { color: 'rgba(255,255,255,0.6)', fontSize: 10, marginTop: 6, textAlign: 'right' },
  timeBot:        { color: '#94A3B8', fontSize: 10, marginTop: 6 },

  // Bot meta
  botMeta:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  reactionRow:    { flexDirection: 'row', gap: 4 },
  reactionBtn:    { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10, backgroundColor: '#F1F5F9' },
  reactionBtnActive: { backgroundColor: '#E0E7FF' },

  // Quick reply chips
  chipsBar:     { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  chip:         { backgroundColor: '#EEF2FF', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, marginRight: 8, borderWidth: 1, borderColor: '#C7D2FE' },
  chipText:     { color: '#4F46E5', fontSize: 13, fontWeight: '500' },

  // Input bar
  inputBar:     { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E2E8F0', gap: 8 },
  inputWrap:    { flex: 1, backgroundColor: '#F1F5F9', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, maxHeight: 100 },
  input:        { fontSize: 15, color: '#1E293B', maxHeight: 80 },
  charCount:    { fontSize: 10, color: '#EF4444', textAlign: 'right', marginTop: 2 },
  sendBtn:      { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 4 },

  // Typing
  typingRow:    { flexDirection: 'row', alignItems: 'center', height: 18, gap: 5 },
  typingDot:    { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#94A3B8' },
});

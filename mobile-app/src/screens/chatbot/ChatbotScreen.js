import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuth } from '../../context/AuthContext'
import chatbotService from '../../services/chatbotService'

const { width } = Dimensions.get('window')

// Message types
const MESSAGE_TYPE = {
  USER: 'user',
  BOT: 'bot',
  ACTION: 'action',
  FEEDBACK_ITEM: 'feedback_item',
}

// Design Tokens
const COLORS = {
  primary: '#4169E1',
  primaryDark: '#2D4DB8',
  secondary: '#4169E1',
  bg: '#F8FAFC',
  text: '#1E293B',
  textSub: '#64748B',
  white: '#FFFFFF',
  botBubble: '#FFFFFF',
  userBubble: ['#4169E1', '#4169E1'],
  border: '#E2E8F0',
  shadow: 'rgba(0,0,0,0.06)',
}

// Custom Text Parser for Bolding
const FormattedText = ({ text, style }) => {
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

const ChatbotScreen = ({ navigation }) => {
  const { user, token } = useAuth()
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(false)
  const flatListRef = useRef()

  useEffect(() => {
    initializeChatbot()
  }, [token])

  const initializeChatbot = async () => {
    setLoading(true)
    try {
      const response = await chatbotService.sendMessage(token, '')
      setMessages([
        {
          id: '1',
          type: MESSAGE_TYPE.BOT,
          message: response.message || "Hello! 👋 I'm your feedback assistant. How can I help you today?",
          quickActions: response.quickActions,
        },
      ])
    } catch (error) {
      setMessages([
        {
          id: '1',
          type: MESSAGE_TYPE.BOT,
          message: "Hello! 👋 I'm your feedback assistant. I can help with feedback, status checks, and questions.",
          quickActions: [
            { id: 'submit', label: 'Submit Feedback' },
            { id: 'status', label: 'Check Status' },
            { id: 'faq', label: 'FAQ' },
          ],
        },
      ])
    }
    setLoading(false)
  }

  const sendMessage = async (text = inputText) => {
    if (!text.trim() || loading) return

    const userMessage = {
      id: Date.now().toString(),
      type: MESSAGE_TYPE.USER,
      message: text.trim(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setLoading(true)

    try {
      const response = await chatbotService.sendMessage(token, text.trim())
      const botMessage = {
        id: (Date.now() + 1).toString(),
        type: MESSAGE_TYPE.BOT,
        message: response.message,
        quickActions: response.quickActions,
        feedbackSummary: response.feedbackSummary,
      }
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: MESSAGE_TYPE.BOT,
        message: "I'm sorry, I encountered an error. Please try again.",
      }])
    }
    setLoading(false)
  }

  const handleQuickAction = (actionId) => {
    const actionMap = {
      submit: 'I want to submit feedback',
      status: 'Check my feedback status',
      faq: 'Show me FAQ',
      stats: 'Show my statistics'
    }
    sendMessage(actionMap[actionId] || actionId)
  }

  const renderMessage = ({ item }) => {
    const isUser = item.type === MESSAGE_TYPE.USER

    return (
      <View style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowBot]}>
        {!isUser && (
          <View style={styles.botAvatar}>
            <LinearGradient colors={['#4169E1', '#4169E1']} style={styles.botAvatarGrad}>
              <IconSymbol name="smart-toy" size={16} color="#FFFFFF" />
            </LinearGradient>
          </View>
        )}
        <View style={styles.msgContent}>
          {isUser ? (
            <LinearGradient colors={COLORS.userBubble} style={[styles.bubble, styles.bubbleUser]}>
              <FormattedText text={item.message} style={styles.textUser} />
            </LinearGradient>
          ) : (
            <View style={[styles.bubble, styles.bubbleBot]}>
              <FormattedText text={item.message} style={styles.textBot} />
              
              {item.quickActions && (
                <View style={styles.quickActions}>
                  {item.quickActions.map(action => (
                    <TouchableOpacity
                      key={action.id}
                      style={styles.actionChip}
                      onPress={() => handleQuickAction(action.id)}
                    >
                      <Text style={styles.actionLabel}>{action.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {item.feedbackSummary && (
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryTitle}>📊 Your Feedback</Text>
                  {item.feedbackSummary.recent?.map((f, i) => (
                    <View key={i} style={styles.summaryItem}>
                      <View style={[styles.tag, { backgroundColor: f.status === 'resolved' ? '#DCFCE7' : '#EFF6FF' }]}>
                        <Text style={[styles.tagText, { color: f.status === 'resolved' ? '#166534' : '#1E40AF' }]}>
                          {f.status.replace('_', ' ')}
                        </Text>
                      </View>
                      <Text style={styles.summaryItemText} numberOfLines={1}>{f.title}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#FFFFFF', '#F8FAFC']} style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.iconText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Assistant</Text>
          <View style={styles.onlineStatus}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Online</Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={loading && (
          <View style={styles.typing}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.typingText}>Thinking...</Text>
          </View>
        )}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.inputArea}>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              placeholder="How can I help you?"
              placeholderTextColor="#94A3B8"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
          </View>
          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={() => sendMessage()}
            disabled={!inputText.trim() || loading}
          >
            <LinearGradient
              colors={!inputText.trim() ? ['#E2E8F0', '#E2E8F0'] : COLORS.userBubble}
              style={styles.sendBtnGrad}
            >
              <Text style={styles.sendIcon}>➤</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    justifyContent: 'space-between',
  },
  headerTitleContainer: { alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  onlineStatus: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginRight: 4 },
  onlineText: { fontSize: 12, color: COLORS.textSub },
  iconBtn: { width: 40, height: 40, justifyContent: 'center' },
  iconText: { fontSize: 24, color: COLORS.primary, fontWeight: '600' },
  list: { padding: 16, paddingBottom: 32 },
  msgRow: { flexDirection: 'row', marginBottom: 20, maxWidth: '85%' },
  msgRowUser: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
  msgRowBot: { alignSelf: 'flex-start' },
  botAvatar: { marginRight: 8, alignSelf: 'flex-end' },
  botAvatarGrad: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  botAvatarText: { fontSize: 16 },
  msgContent: { flex: 1 },
  bubble: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12 },
  bubbleUser: { borderBottomRightRadius: 4 },
  bubbleBot: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  textUser: { color: COLORS.white, fontSize: 15, lineHeight: 22 },
  textBot: { color: COLORS.text, fontSize: 15, lineHeight: 22 },
  quickActions: { marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionLabel: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  summaryCard: {
    marginTop: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  summaryItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8 },
  summaryItemText: { flex: 1, fontSize: 12, color: COLORS.textSub },
  tag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  tagText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  typing: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 40 },
  typingText: { fontSize: 13, color: COLORS.textSub, fontStyle: 'italic' },
  inputArea: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'flex-end',
    gap: 12,
  },
  inputWrap: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 48,
    maxHeight: 120,
    justifyContent: 'center',
  },
  input: { fontSize: 15, color: COLORS.text, padding: 0 },
  sendBtn: { width: 48, height: 48, borderRadius: 24, overflow: 'hidden' },
  sendBtnDisabled: { opacity: 0.8 },
  sendBtnGrad: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sendIcon: { fontSize: 20, color: COLORS.white, marginLeft: 2 },
})

export default ChatbotScreen


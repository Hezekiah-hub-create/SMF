// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import feedbackService from '../../services/feedbackService';
import counselingService from '../../services/counselingService';
import { IconSymbol } from '@/components/ui/icon-symbol';

const { width } = Dimensions.get('window');

const C = {
  primary:      '#4169E1',
  primaryLight: '#EEF2FF',
  bg:           '#F0F4FF',
  card:         '#FFFFFF',
  text:         '#1E293B',
  textSub:      '#64748B',
  textMuted:    '#94A3B8',
  success:      '#10B981',
  successLight: '#ECFDF5',
  warning:      '#F59E0B',
  warningLight: '#FFFBEB',
  error:        '#EF4444',
  errorLight:   '#FEF2F2',
  info:         '#3B82F6',
  infoLight:    '#EFF6FF',
  border:       '#E2E8F0',
  white:        '#FFFFFF',
};

// Map server notification types to UI config
const NOTIF_TYPES = {
  routing:      { icon: 'arrow.right.circle.fill', color: '#3B82F6', bg: '#EFF6FF', label: 'New Assignment' },
  response:     { icon: 'bubble.left.fill',       color: '#10B981', bg: '#ECFDF5', label: 'New Response' },
  resolution:   { icon: 'checkmark.circle.fill',  color: '#10B981', bg: '#ECFDF5', label: 'Resolved' },
  escalation:   { icon: 'exclamationmark.triangle.fill', color: '#EF4444', bg: '#FEF2F2', label: 'Escalated' },
  appointment:  { icon: 'calendar.badge.clock',    color: '#8B5CF6', bg: '#F3E8FF', label: 'Appointment' },
};

// Fallback for unknown types
const getNotifConfig = (type) => NOTIF_TYPES[type] || { icon: 'bell.fill', color: '#64748B', bg: '#F1F5F9', label: 'Notification' };

function timeAgo(ts) {
  const date = new Date(ts);
  const diff = Date.now() - date.getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d < 7)  return `${d}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── Notification Card ────────────────────────────────────────────
const NotifCard = ({ item, onPress }) => {
  const cfg = getNotifConfig(item.type);
  return (
    <TouchableOpacity 
      style={[styles.card, !item.isRead && styles.cardUnread]} 
      onPress={onPress} 
      activeOpacity={0.8}
    >
      <View style={[styles.cardIcon, { backgroundColor: cfg.bg }]}>
        <IconSymbol name={cfg.icon} size={22} color={cfg.color} />
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardTop}>
          <Text style={[styles.cardTitle, !item.isRead && styles.cardTitleUnread]} numberOfLines={1}>
            {item.title}
          </Text>
          {!item.isRead && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.cardMsg} numberOfLines={2}>{item.message}</Text>
        <View style={styles.cardFooter}>
          <View style={[styles.typePill, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.typePillText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
          <Text style={styles.cardTime}>{timeAgo(item.createdAt)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ─── Empty State ──────────────────────────────────────────────────
const EmptyState = () => (
  <View style={styles.emptyBox}>
    <View style={styles.emptyIconCircle}>
      <IconSymbol name="bell.fill" size={40} color={C.primary} />
    </View>
    <Text style={styles.emptyTitle}>All Caught Up!</Text>
    <Text style={styles.emptySub}>
      No notifications yet. You'll be notified when there are updates on your feedback submissions.
    </Text>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────
export default function NotificationsScreen() {
  const { token, user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Handle notification press - navigate to appropriate screen
  const handleNotificationPress = (item) => {
    // Mark as read
    markRead(item.id, item.type);
    
    // Navigate based on notification type
    if (item.type === 'appointment' || item.type === 'appointment_accepted' || 
        item.type === 'appointment_rejected' || item.type === 'appointment_completed' ||
        item.type === 'appointment_rescheduled' || item.type === 'appointment_cancelled') {
      // Navigate to counseling/appointments
      router.push('/(tabs)/counseling');
    } else if (item.feedbackId) {
      // Navigate to feedback detail
      router.push(`/feedback-detail?id=${item.feedbackId}`);
    } else {
      // Navigate to feedback list
      router.push('/(tabs)/feedback');
    }
  };

  const fetchNotifications = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      setError(null);
      
      // Fetch notifications - both feedback and counseling use the same notification service
      // so we only need to fetch from one source to avoid duplicates
      const feedbackData = await feedbackService.getNotifications(token);
      
      let allNotifications = [];
      
      // Add feedback notifications
      if (feedbackData && feedbackData.notifications) {
        allNotifications = [...feedbackData.notifications];
      }
      
      // For students, filter to show only relevant notifications
      const userRole = user?.role?.toLowerCase();
      let filteredNotifications = allNotifications;
      
      if (userRole === 'student') {
        // Students see: response, resolution, appointment
        filteredNotifications = allNotifications.filter(n => 
          n.type === 'response' || 
          n.type === 'resolution' ||
          n.type === 'appointment'
        );
      }
      
      // Sort by date (newest first)
      const sorted = filteredNotifications.sort((a, b) => 
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
      
      setNotifications(sorted);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to load notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchNotifications(); 
  }, [token]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications().finally(() => setRefreshing(false));
  };

  const markRead = async (id, source) => {
    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    
    // Call API to mark as read - try both services
    try {
      if (source === 'counseling') {
        await counselingService.markNotificationRead(token, id);
      } else {
        await feedbackService.markNotificationRead(token, id);
      }
    } catch (err) {
      // Try the other service if first fails
      try {
        if (source === 'counseling') {
          await feedbackService.markNotificationRead(token, id);
        } else {
          await counselingService.markNotificationRead(token, id);
        }
      } catch (err2) {
        console.error('Failed to mark notification as read:', err2);
      }
    }
  };

  const markAllRead = async () => {
    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    
    // Mark all as read - call API for each unread
    const unread = notifications.filter(n => !n.isRead);
    for (const notif of unread) {
      try {
        if (notif.source === 'counseling') {
          await counselingService.markNotificationRead(token, notif.id);
        } else {
          await feedbackService.markNotificationRead(token, notif.id);
        }
      } catch (err) {
        // Try other service
        try {
          if (notif.source === 'counseling') {
            await feedbackService.markNotificationRead(token, notif.id);
          } else {
            await counselingService.markNotificationRead(token, notif.id);
          }
        } catch (err2) {
          console.error('Failed to mark notification as read:', err2);
        }
      }
    }
  };

  const unread = notifications.filter(n => !n.isRead).length;
  const read   = notifications.filter(n => n.isRead).length;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerCircle1} />
        <View style={styles.headerCircle2} />
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Notifications</Text>
            <Text style={styles.headerSub}>Stay updated on your feedback</Text>
          </View>
          {unread > 0 && (
            <TouchableOpacity style={styles.markAllBtn} onPress={markAllRead}>
              <IconSymbol name="checkmark.circle.fill" size={14} color={C.white} />
              <Text style={styles.markAllText}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{notifications.length}</Text>
            <Text style={styles.statLbl}>Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: '#FCD34D' }]}>{unread}</Text>
            <Text style={styles.statLbl}>Unread</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: '#6EE7B7' }]}>{read}</Text>
            <Text style={styles.statLbl}>Read</Text>
          </View>
        </View>
      </View>

      {/* ── Error State ── */}
      {error && (
        <View style={styles.errorBanner}>
          <IconSymbol name="exclamationmark.triangle.fill" size={16} color={C.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* ── List ── */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      ) : notifications.length > 0 ? (
        <FlatList
          data={notifications}
          keyExtractor={item => `notif-${item.source || 'unknown'}-${item.id ? item.id.toString() : item.type + '-' + item.createdAt}`}
renderItem={({ item }) => <NotifCard item={item} onPress={() => handleNotificationPress(item)} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[C.primary]} tintColor={C.primary} />}
          ListHeaderComponent={
            unread > 0 ? (
              <View style={styles.unreadBanner}>
                <IconSymbol name="bell.fill" size={14} color={C.primary} />
                <Text style={styles.unreadBannerText}>{unread} unread notification{unread > 1 ? 's' : ''}</Text>
              </View>
            ) : null
          }
        />
      ) : (
        <View style={styles.emptyScroll}>
          <EmptyState />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.primary },
  // headerContainer: { backgroundColor: C.primary },
  header: { backgroundColor: C.primary, paddingHorizontal: 20, paddingTop: 70, paddingBottom: 24, overflow: 'hidden', borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerCircle1: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.07)', top: -50, right: -30 },
  headerCircle2: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.05)', bottom: -20, left: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: C.white },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  markAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  markAllText: { fontSize: 12, color: C.white, fontWeight: '700' },
  statsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 8 },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '800', color: C.white },
  statLbl: { fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 4 },

  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.errorLight, paddingHorizontal: 16, paddingVertical: 10 },
  errorText: { fontSize: 13, color: C.error },

  listContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100, backgroundColor: C.bg },
  unreadBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.primaryLight, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 12, borderWidth: 1, borderColor: C.primary + '30' },
  unreadBannerText: { fontSize: 13, color: C.primary, fontWeight: '700' },

  card: { flexDirection: 'row', backgroundColor: C.card, borderRadius: 16, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  cardUnread: { backgroundColor: '#F5F8FF', borderLeftWidth: 4, borderLeftColor: C.primary },
  cardIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardContent: { flex: 1 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: C.text, flex: 1 },
  cardTitleUnread: { fontWeight: '800' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.primary, marginLeft: 8 },
  cardMsg: { fontSize: 13, color: C.textSub, lineHeight: 19, marginBottom: 8 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  typePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  typePillText: { fontSize: 10, fontWeight: '700' },
  cardTime: { fontSize: 11, color: C.textMuted },

  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg, gap: 12 },
  loadingText: { fontSize: 14, color: C.textMuted },

  emptyScroll: { flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  emptyBox: { alignItems: 'center' },
  emptyIconCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: C.white, justifyContent: 'center', alignItems: 'center', marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: C.text, marginBottom: 8 },
  emptySub: { fontSize: 14, color: C.textSub, textAlign: 'center', lineHeight: 22 },
});

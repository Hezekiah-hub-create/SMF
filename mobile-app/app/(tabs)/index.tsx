// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, StatusBar, TextInput,
  KeyboardAvoidingView, Platform, Animated, Dimensions, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import feedbackService from '../../services/feedbackService';
import { IconSymbol } from '@/components/ui/icon-symbol';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const C = {
  primary: '#4169E1', primaryLight: '#EEF2FF', secondary: '#7C3AED',
  bg: '#F0F4FF', card: '#FFFFFF', text: '#1E293B', textSub: '#64748B',
  textMuted: '#94A3B8', success: '#10B981', successLight: '#ECFDF5',
  warning: '#F59E0B', warningLight: '#FFFBEB', error: '#EF4444',
  errorLight: '#FEF2F2', info: '#3B82F6', infoLight: '#EFF6FF',
  pink: '#EC4899', pinkLight: '#FDF2F8', border: '#E2E8F0', white: '#FFFFFF',
};

const STATUS = {
  new: { color: '#64748B', bg: '#F1F5F9', label: 'New', icon: 'circle' },
  routed: { color: '#3B82F6', bg: '#EFF6FF', label: 'Routed', icon: 'arrow.right.circle.fill' },
  in_progress: { color: '#F59E0B', bg: '#FFFBEB', label: 'In Progress', icon: 'clock.fill' },
  resolved: { color: '#10B981', bg: '#ECFDF5', label: 'Resolved', icon: 'checkmark.circle.fill' },
  escalated: { color: '#EF4444', bg: '#FEF2F2', label: 'Escalated', icon: 'exclamationmark.triangle.fill' },
  closed: { color: '#6B7280', bg: '#F9FAFB', label: 'Closed', icon: 'lock.fill' },
};

const CAT = {
  course_related: { color: '#4169E1', bg: '#EEF2FF', icon: 'book.fill', label: 'Course Related' },
  faculty_wide: { color: '#7C3AED', bg: '#F5F3FF', icon: 'building.columns', label: 'Faculty Wide' },
  welfare: { color: '#10B981', bg: '#ECFDF5', icon: 'heart.fill', label: 'Welfare' },
  admission: { color: '#F59E0B', bg: '#FFFBEB', icon: 'clipboard.fill', label: 'Admission' },
  quality: { color: '#EF4444', bg: '#FEF2F2', icon: 'star.fill', label: 'Quality' },
  mental_health: { color: '#EC4899', bg: '#FDF2F8', icon: 'psychology', label: 'Mental Health' },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS[status?.toLowerCase()] || STATUS.new;
  return (
    <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
      <IconSymbol name={cfg.icon} size={10} color={cfg.color} />
      <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
};

const CategoryTag = ({ category }) => {
  const cfg = CAT[category] || { color: C.primary, icon: 'doc.text.fill', label: category || 'General', bg: C.primaryLight };
  return (
    <View style={[styles.catTag, { backgroundColor: cfg.bg }]}>
      <IconSymbol name={cfg.icon} size={10} color={cfg.color} />
      <Text style={[styles.catLabel, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
};

const FeedbackCard = ({ item, onPress }) => {
  const sc = STATUS[item.status] || STATUS.new;
  const date = item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';
  return (
    <TouchableOpacity style={[styles.card, { borderLeftColor: sc.color }]} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardTop}>
        <CategoryTag category={item.category} />
        <StatusBadge status={item.status} />
      </View>
      <Text style={styles.cardTitle} numberOfLines={2}>{item.title || 'Feedback'}</Text>
      {item.description ? <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text> : null}
      <View style={styles.cardFooter}>
        <View style={styles.footerLeft}>
          <IconSymbol name="calendar" size={11} color={C.textMuted} />
          <Text style={styles.footerDate}>{date}</Text>
        </View>
        <View style={styles.footerRight}>
          {item.isAnonymous && <View style={styles.anonBadge}><IconSymbol name="person.fill" size={10} color={C.textSub} /><Text style={styles.anonText}>Anonymous</Text></View>}
          {item.responses?.length > 0 && <View style={styles.replyBadge}><IconSymbol name="bubble.left.fill" size={10} color={C.primary} /><Text style={styles.replyText}>{item.responses.length} reply</Text></View>}
          <IconSymbol name="chevron.right" size={16} color={C.textMuted} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const EmptyState = () => (
  <View style={styles.emptyBox}>
    <View style={styles.emptyIconCircle}><IconSymbol name="tray.fill" size={36} color={C.textMuted} /></View>
    <Text style={styles.emptyTitle}>No Feedback Yet</Text>
    <Text style={styles.emptySub}>You haven't submitted any feedback yet.{'\n'}Tap 'Submit' to share your thoughts.</Text>
  </View>
);

export default function HomeScreen() {
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFeedback = async () => {
    if (!token) return;
    try {
      const isStudent = user?.role === 'student';
      const data = isStudent ? await feedbackService.getMyFeedback(token) : await feedbackService.getFeedback(token);
      setFeedbackList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load feedback:', error);
      setFeedbackList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFeedback(); }, [token, user]);

  const onRefresh = async () => { setRefreshing(true); await fetchFeedback(); setRefreshing(false); };
  const handleFeedbackPress = (item) => router.push(`/feedback-detail?id=${item._id || item.id}`);
  const handleLogout = () => Alert.alert('Logout', 'Are you sure you want to logout?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Logout', style: 'destructive', onPress: async () => { await logout(); router.replace('/login'); } }]);

  const getGreeting = () => { const hour = new Date().getHours(); if (hour < 12) return 'Good morning'; if (hour < 18) return 'Good afternoon'; return 'Good evening'; };

  const total = feedbackList.length;
  const pending = feedbackList.filter(f => ['new', 'routed'].includes(f.status)).length;
  const inProg = feedbackList.filter(f => ['in_progress', 'escalated'].includes(f.status)).length;
  const resolved = feedbackList.filter(f => ['resolved', 'closed'].includes(f.status)).length;
  const userDepartment = user?.department || 'Student Affairs';

  if (loading) return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.loadingBox}><ActivityIndicator size="large" color={C.primary} /><Text style={styles.loadingText}>Loading your dashboard...</Text></View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <View style={styles.headerCircle1} /><View style={styles.headerCircle2} />
          <View style={styles.headerTop}>
            <View><Text style={styles.headerGreeting}>{getGreeting()}</Text><Text style={styles.headerTitle}>{user?.name || 'User'}</Text></View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerButton} onPress={handleLogout}><IconSymbol name="logout" size={22} color={C.white} /></TouchableOpacity>
              <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/(tabs)/profile')}><Text style={styles.profileInitial}>{(user?.name || 'U').charAt(0).toUpperCase()}</Text></TouchableOpacity>
            </View>
          </View>
          <View style={styles.userInfoRow}>
            <View style={styles.userInfoCard}>
              <View style={[styles.userInfoIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}><IconSymbol name="building.2" size={16} color={C.white} /></View>
              <View style={styles.userInfoContent}><Text style={styles.userInfoValue}>{userDepartment}</Text></View>
            </View>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[C.primary]} tintColor={C.primary} />}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(tabs)/submit')}>
              <View style={[styles.actionIcon, { backgroundColor: '#EEF2FF' }]}><IconSymbol name="edit-note" size={24} color={C.primary} /></View>
              <Text style={styles.actionLabel}>Submit</Text><Text style={styles.actionSub}>New feedback</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(tabs)/feedback')}>
              <View style={[styles.actionIcon, { backgroundColor: '#ECFDF5' }]}><IconSymbol name="doc.text.fill" size={24} color={C.success} /></View>
              <Text style={styles.actionLabel}>My Feedback</Text><Text style={styles.actionSub}>View all</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(tabs)/notifications')}>
              <View style={[styles.actionIcon, { backgroundColor: '#FFFBEB' }]}><IconSymbol name="bell.fill" size={24} color={C.warning} /></View>
              <Text style={styles.actionLabel}>Alerts</Text><Text style={styles.actionSub}>Notifications</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(tabs)/profile')}>
              <View style={[styles.actionIcon, { backgroundColor: '#FDF2F8' }]}><IconSymbol name="person" size={24} color="#EC4899" /></View>
              <Text style={styles.actionLabel}>Profile</Text><Text style={styles.actionSub}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle1}>Feedback Statistics</Text>
        <View style={[styles.section, styles.statsSection]}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}><Text style={[styles.statNum, { color: C.primary }]}>{total}</Text><Text style={styles.statLbl}>Total</Text></View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}><Text style={[styles.statNum, { color: '#F59E0B' }]}>{pending}</Text><Text style={styles.statLbl}>Pending</Text></View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}><Text style={[styles.statNum, { color: '#3B82F6' }]}>{inProg}</Text><Text style={styles.statLbl}>In Progress</Text></View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}><Text style={[styles.statNum, { color: '#10B981' }]}>{resolved}</Text><Text style={styles.statLbl}>Resolved</Text></View>
          </View>
        </View>

        <View style={[styles.section, styles.lastSection]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Feedback</Text>
            {feedbackList.length > 0 && <TouchableOpacity onPress={() => router.push('/(tabs)/feedback')}><Text style={styles.seeAll}>See All</Text></TouchableOpacity>}
          </View>
          {feedbackList.length > 0 ? (
            <View style={styles.feedbackList}>
              {feedbackList.slice(0, 5).map((item, index) => (<FeedbackCard key={item._id || item.id || index} item={item} onPress={() => handleFeedbackPress(item)} />))}
            </View>
          ) : (<EmptyState />)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  headerContainer: { backgroundColor: C.primary, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg, gap: 12 },
  loadingText: { fontSize: 14, color: C.textMuted },
  header: { backgroundColor: C.primary, paddingHorizontal: 20, paddingTop: 60, paddingBottom: 24, overflow: 'hidden', borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerCircle1: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.07)', top: -50, right: -30 },
  headerCircle2: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.05)', bottom: -20, left: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  headerGreeting: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: C.white },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  profileButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  profileInitial: { fontSize: 20, fontWeight: '800', color: C.white },
  userInfoRow: { flexDirection: 'row', gap: 12, marginBottom: 8, width: '100%' },
  userInfoCard: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  userInfoIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  userInfoContent: { flex: 1 },
  userInfoLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginBottom: 1 },
  userInfoValue: { fontSize: 13, color: C.white, fontWeight: '700' },
  section: { paddingHorizontal: 16, paddingTop: 20 },
  lastSection: { paddingBottom: 100 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: C.text, marginBottom: 16 },
  sectionTitle1: { fontSize: 18, fontWeight: '700', color: C.text, marginBottom: 16, marginLeft: 19, marginTop: 24 },
  seeAll: { fontSize: 14, fontWeight: '600', color: C.primary },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionCard: { width: '48%', backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  actionIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  actionLabel: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 2 },
  actionSub: { fontSize: 12, color: C.textMuted },
  statsSection: { backgroundColor: C.card, marginHorizontal: 16, borderRadius: 16, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: C.border },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center', flex: 1 },
  statNum: { fontSize: 22, fontWeight: '800', color: C.text },
  statLbl: { fontSize: 10, color: C.textMuted, fontWeight: '600', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: C.border, marginVertical: 4 },
  feedbackList: { gap: 12 },
  card: { backgroundColor: C.card, borderRadius: 16, padding: 16, borderLeftWidth: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  catTag: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, gap: 5 },
  catLabel: { fontSize: 12, fontWeight: '700' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 6, lineHeight: 22 },
  cardDesc: { fontSize: 13, color: C.textSub, lineHeight: 19, marginBottom: 10 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  footerLeft: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerDate: { fontSize: 11, color: C.textMuted, marginLeft: 3 },
  footerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  anonBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  anonText: { fontSize: 10, color: C.textSub, fontWeight: '600' },
  replyBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.primaryLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  replyText: { fontSize: 10, color: C.primary, fontWeight: '700' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  statusText: { fontSize: 11, fontWeight: '700' },
  emptyBox: { backgroundColor: C.card, borderRadius: 20, padding: 32, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  emptyIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: C.text, marginBottom: 8 },
  emptySub: { fontSize: 14, color: C.textSub, textAlign: 'center', lineHeight: 22 },
});


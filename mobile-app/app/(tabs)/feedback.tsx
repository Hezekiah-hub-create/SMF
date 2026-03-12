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
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import feedbackService from '../../services/feedbackService';
import { IconSymbol } from '@/components/ui/icon-symbol';

const { width } = Dimensions.get('window');

const C = {
  primary:      '#4169E1',
  primaryLight: '#EEF2FF',
  secondary:    '#7C3AED',
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
  pink:         '#EC4899',
  pinkLight:    '#FDF2F8',
  border:       '#E2E8F0',
  white:        '#FFFFFF',
};

// ─── Status Config ────────────────────────────────────────────────
const STATUS = {
  new:         { color: '#64748B', bg: '#F1F5F9', label: 'New',         icon: 'circle' },
  routed:      { color: '#3B82F6', bg: '#EFF6FF', label: 'Routed',      icon: 'arrow.right.circle.fill' },
  in_progress: { color: '#F59E0B', bg: '#FFFBEB', label: 'In Progress', icon: 'clock.fill' },
  resolved:    { color: '#10B981', bg: '#ECFDF5', label: 'Resolved',    icon: 'checkmark.circle.fill' },
  escalated:   { color: '#EF4444', bg: '#FEF2F2', label: 'Escalated',   icon: 'exclamationmark.triangle.fill' },
  closed:      { color: '#6B7280', bg: '#F9FAFB', label: 'Closed',      icon: 'lock.fill' },
};

// ─── Category Config (icon instead of emoji) ──────────────────────
const CAT = {
  course_related: { color: '#4169E1', bg: '#EEF2FF', icon: 'book.fill',        label: 'Course Related' },
  faculty_wide:   { color: '#7C3AED', bg: '#F5F3FF', icon: 'building.columns', label: 'Faculty Wide' },
  welfare:        { color: '#10B981', bg: '#ECFDF5', icon: 'heart.fill',        label: 'Welfare' },
  admission:      { color: '#F59E0B', bg: '#FFFBEB', icon: 'clipboard.fill',    label: 'Admission' },
  quality:        { color: '#EF4444', bg: '#FEF2F2', icon: 'star.fill',         label: 'Quality' },
  mental_health:  { color: '#EC4899', bg: '#FDF2F8', icon: 'psychology',        label: 'Mental Health' },
};

const FILTERS = [
  { key: 'all',         label: 'All',         statusKeys: null },
  { key: 'pending',     label: 'Pending',     statusKeys: ['new', 'routed'] },
  { key: 'in_progress', label: 'In Progress', statusKeys: ['in_progress', 'escalated'] },
  { key: 'resolved',    label: 'Resolved',    statusKeys: ['resolved', 'closed'] },
];

// ─── Status Badge ─────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = STATUS[status?.toLowerCase()] || STATUS.new;
  return (
    <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
      <IconSymbol name={cfg.icon} size={10} color={cfg.color} />
      <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
};

// ─── Feedback Card ────────────────────────────────────────────────
const FeedbackCard = ({ item, onPress }) => {
  const sc = STATUS[item.status] || STATUS.new;
  const cc = CAT[item.category] || { color: C.primary, icon: 'doc.text.fill', label: item.category || 'General', bg: C.primaryLight };
  const date = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'N/A';

  return (
    <TouchableOpacity style={[styles.card, { borderLeftColor: sc.color }]} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardTop}>
        <View style={[styles.catTag, { backgroundColor: cc.bg }]}>
          <IconSymbol name={cc.icon} size={13} color={cc.color} />
          <Text style={[styles.catLabel, { color: cc.color }]}>{cc.label}</Text>
        </View>
        <StatusBadge status={item.status} />
      </View>

      <Text style={styles.cardTitle} numberOfLines={2}>{item.title || 'Feedback'}</Text>

      {item.description ? (
        <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
      ) : null}

      <View style={styles.cardFooter}>
        <View style={styles.footerLeft}>
          <IconSymbol name="calendar" size={11} color={C.textMuted} />
          <Text style={styles.footerDate}>{date}</Text>
        </View>
        <View style={styles.footerRight}>
          {item.isAnonymous && (
            <View style={styles.anonBadge}>
              <IconSymbol name="person.fill" size={10} color={C.textSub} />
              <Text style={styles.anonText}>Anonymous</Text>
            </View>
          )}
          {item.responses?.length > 0 && (
            <View style={styles.replyBadge}>
              <IconSymbol name="bubble.left.fill" size={10} color={C.primary} />
              <Text style={styles.replyText}>{item.responses.length} reply</Text>
            </View>
          )}
          <IconSymbol name="chevron.right" size={16} color={C.textMuted} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ─── Empty State ──────────────────────────────────────────────────
const EmptyState = ({ filter }) => (
  <View style={styles.emptyBox}>
    <View style={styles.emptyIconCircle}>
      <IconSymbol
        name={filter === 'all' ? 'tray.fill' : 'magnifyingglass'}
        size={36}
        color={C.textMuted}
      />
    </View>
    <Text style={styles.emptyTitle}>
      {filter === 'all' ? 'No Feedback Yet' : `No ${filter.replace('_', ' ')} feedback`}
    </Text>
    <Text style={styles.emptySub}>
      {filter === 'all'
        ? "You haven't submitted any feedback yet.\nTap 'Submit' to share your thoughts."
        : 'No feedback matches this filter right now.'}
    </Text>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────
export default function FeedbackScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [feedbackList, setFeedbackList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchFeedback = async () => {
    if (!token) return;
    try {
      const data = await feedbackService.getFeedback(token);
      const list = Array.isArray(data) ? data : (data?.feedback ?? data?.data ?? []);
      setFeedbackList(list);
    } catch {
      setFeedbackList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFeedback(); }, [token]);
  const onRefresh = async () => { setRefreshing(true); await fetchFeedback(); setRefreshing(false); };

  const getCount = (filterKey) => {
    const f = FILTERS.find(f => f.key === filterKey);
    if (!f || !f.statusKeys) return feedbackList.length;
    return feedbackList.filter(item => f.statusKeys.includes(item.status)).length;
  };

  const filtered = (() => {
    const f = FILTERS.find(f => f.key === filter);
    if (!f || !f.statusKeys) return feedbackList;
    return feedbackList.filter(item => f.statusKeys.includes(item.status));
  })();

  const total    = feedbackList.length;
  const pending  = feedbackList.filter(f => ['new', 'routed'].includes(f.status)).length;
  const inProg   = feedbackList.filter(f => ['in_progress', 'escalated'].includes(f.status)).length;
  const resolved = feedbackList.filter(f => ['resolved', 'closed'].includes(f.status)).length;

  const handleFeedbackPress = (item) => {
    router.push(`/feedback-detail?id=${item._id || item.id}`);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerCircle1} />
        <View style={styles.headerCircle2} />
        <Text style={styles.headerTitle}>My Feedback</Text>
        <Text style={styles.headerSub}>Track all your submissions</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{total}</Text>
            <Text style={styles.statLbl}>Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: '#FCD34D' }]}>{pending}</Text>
            <Text style={styles.statLbl}>Pending</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: '#93C5FD' }]}>{inProg}</Text>
            <Text style={styles.statLbl}>In Progress</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: '#6EE7B7' }]}>{resolved}</Text>
            <Text style={styles.statLbl}>Resolved</Text>
          </View>
        </View>
      </View>

      {/* ── Filter Chips ── */}
      <View style={styles.filterWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTERS.map(f => {
            const count = getCount(f.key);
            const active = filter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setFilter(f.key)}
                activeOpacity={0.75}
              >
                <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{f.label}</Text>
                <View style={[styles.chipCount, active && styles.chipCountActive]}>
                  <Text style={[styles.chipCountText, active && styles.chipCountTextActive]}>{count}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── List ── */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={styles.loadingText}>Loading feedback...</Text>
        </View>
      ) : filtered.length > 0 ? (
        <FlatList
          data={filtered}
          keyExtractor={(item, i) => item._id || item.id?.toString() || String(i)}
          renderItem={({ item }) => <FeedbackCard item={item} onPress={() => handleFeedbackPress(item)} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[C.primary]} tintColor={C.primary} />}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.emptyScroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[C.primary]} tintColor={C.primary} />}
        >
          <EmptyState filter={filter} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.primary },
  headerContainer: { backgroundColor: C.primary, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  header: { backgroundColor: C.primary, paddingHorizontal: 20, paddingTop: 60, paddingBottom: 24, overflow: 'hidden', },
  headerCircle1: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.07)', top: -50, right: -30 },
  headerCircle2: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.05)', bottom: -20, left: 20 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: C.white, marginBottom: 2 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 20 },
  statsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 8 },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '800', color: C.white },
  statLbl: { fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 4 },

  filterWrap: { backgroundColor: C.white, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  filterRow: { paddingHorizontal: 16, gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: C.bg, borderWidth: 1.5, borderColor: C.border },
  chipActive: { backgroundColor: C.primary, borderColor: C.primary },
  chipLabel: { fontSize: 13, fontWeight: '600', color: C.textSub },
  chipLabelActive: { color: C.white },
  chipCount: { minWidth: 20, height: 20, borderRadius: 10, backgroundColor: C.border, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 5 },
  chipCountActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  chipCountText: { fontSize: 11, fontWeight: '700', color: C.textSub },
  chipCountTextActive: { color: C.white },

  listContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100, backgroundColor: C.bg },
  card: {
    backgroundColor: C.white, borderRadius: 16, padding: 16, marginBottom: 12, borderLeftWidth: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
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

  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg, gap: 12 },
  loadingText: { fontSize: 14, color: C.textMuted },

  emptyScroll: { flexGrow: 1, backgroundColor: C.bg, justifyContent: 'center', paddingHorizontal: 24 },
  emptyBox: { alignItems: 'center', paddingVertical: 48 },
  emptyIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: C.white, justifyContent: 'center', alignItems: 'center', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: C.text, marginBottom: 8 },
  emptySub: { fontSize: 14, color: C.textSub, textAlign: 'center', lineHeight: 22 },
});

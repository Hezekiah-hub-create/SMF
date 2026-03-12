// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import feedbackService from '../services/feedbackService';
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
  border:       '#E2E8F0',
  white:        '#FFFFFF',
};

// Staff roles that can respond to feedback
const STAFF_ROLES = ['admin', 'lecturer', 'hod', 'dean_faculty', 'dean_students', 'src', 'quality_assurance', 'admissions', 'academic_affairs', 'counseling', 'staff', 'finance'];

// ─── Status Config ────────────────────────────────────────────────
const STATUS = {
  new:         { color: '#64748B', bg: '#F1F5F9', label: 'New',         icon: 'circle', desc: 'Your feedback has been received' },
  routed:      { color: '#3B82F6', bg: '#EFF6FF', label: 'Routed',      icon: 'arrow.right.circle.fill', desc: 'Sent to the relevant department' },
  in_progress: { color: '#F59E0B', bg: '#FFFBEB', label: 'In Progress', icon: 'clock.fill', desc: 'Department is working on it' },
  resolved:    { color: '#10B981', bg: '#ECFDF5', label: 'Resolved',    icon: 'checkmark.circle.fill', desc: 'Your feedback has been addressed' },
  escalated:   { color: '#EF4444', bg: '#FEF2F2', label: 'Escalated',   icon: 'exclamationmark.triangle.fill', desc: 'Escalated to higher authority' },
  closed:      { color: '#6B7280', bg: '#F9FAFB', label: 'Closed',      icon: 'lock.fill', desc: 'This feedback is closed' },
};

// ─── Category Config ──────────────────────────────────────────────
const CAT = {
  course_related: { color: '#4169E1', bg: '#EEF2FF', icon: 'book.fill',        label: 'Course Related' },
  faculty_wide:   { color: '#7C3AED', bg: '#F5F3FF', icon: 'building.columns', label: 'Faculty Wide' },
  welfare:        { color: '#10B981', bg: '#ECFDF5', icon: 'heart.fill',        label: 'Welfare' },
  admission:      { color: '#F59E0B', bg: '#FFFBEB', icon: 'clipboard.fill',    label: 'Admission' },
  quality:        { color: '#EF4444', bg: '#FEF2F2', icon: 'star.fill',         label: 'Quality' },
  mental_health:  { color: '#EC4899', bg: '#FDF2F8', icon: 'psychology',        label: 'Mental Health' },
};

// ─── Status Progress ───────────────────────────────────────────────
const StatusProgress = ({ status }) => {
  const statusOrder = ['new', 'routed', 'in_progress', 'resolved'];
  const currentIndex = statusOrder.indexOf(status?.toLowerCase());
  
  return (
    <View style={styles.progressContainer}>
      {statusOrder.map((s, i) => {
        const isActive = i <= currentIndex;
        const isCurrent = i === currentIndex;
        const cfg = STATUS[s];
        return (
          <React.Fragment key={s}>
            <View style={styles.progressStep}>
              <View style={[
                styles.progressDot,
                isActive && styles.progressDotActive,
                isCurrent && styles.progressDotCurrent,
              ]}>
                <IconSymbol 
                  name={isActive ? 'checkmark' : cfg.icon} 
                  size={isActive ? 10 : 8} 
                  color={isActive ? C.white : C.textMuted} 
                />
              </View>
              <Text style={[styles.progressLabel, isActive && styles.progressLabelActive]}>
                {cfg.label}
              </Text>
            </View>
            {i < statusOrder.length - 1 && (
              <View style={[styles.progressLine, isActive && styles.progressLineActive]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

// ─── Response Card ────────────────────────────────────────────────
const ResponseCard = ({ response }) => {
  const isStaff = response.isStaff || response.role === 'staff' || response.role === 'admin' || response.responderId;
  const date = response.createdAt 
    ? new Date(response.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'N/A';
    
  return (
    <View style={[styles.responseCard, isStaff && styles.responseCardStaff]}>
      <View style={styles.responseHeader}>
        <View style={[styles.responseAvatar, isStaff ? styles.responseAvatarStaff : styles.responseAvatarUser]}>
          <IconSymbol 
            name={isStaff ? 'person.fill' : 'person.fill'} 
            size={14} 
            color={isStaff ? C.white : C.primary} 
          />
        </View>
        <View style={styles.responseMeta}>
          <Text style={[styles.responseName, isStaff && styles.responseNameStaff]}>
            {isStaff ? (response.responderName || 'Staff Member') : 'You'}
          </Text>
          <Text style={styles.responseDate}>{date}</Text>
        </View>
        {isStaff && (
          <View style={styles.staffBadge}>
            <IconSymbol name="checkmark.shield.fill" size={10} color={C.success} />
            <Text style={styles.staffBadgeText}>Staff</Text>
          </View>
        )}
      </View>
      <Text style={styles.responseText}>{response.message || response.text}</Text>
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────
export default function FeedbackDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { token, user } = useAuth();
  
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showResponseForm, setShowResponseForm] = useState(false);

  // Check if user is staff
  const isStaff = user && STAFF_ROLES.includes(user.role);

  const fetchFeedbackDetail = async () => {
    if (!token || !id) return;
    try {
      const data = await feedbackService.getFeedbackById(token, id);
      setFeedback(data);
    } catch (err) {
      console.error('Error fetching feedback detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbackDetail();
  }, [token, id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFeedbackDetail();
    setRefreshing(false);
  };

  const handleSubmitResponse = async () => {
    if (!responseText.trim()) {
      Alert.alert('Error', 'Please enter a response');
      return;
    }

    setSubmitting(true);
    try {
      await feedbackService.submitResponse(token, id, { message: responseText.trim() });
      setResponseText('');
      setShowResponseForm(false);
      await fetchFeedbackDetail();
      Alert.alert('Success', 'Your response has been submitted');
    } catch (err) {
      Alert.alert('Error', 'Failed to submit response. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async () => {
    Alert.alert(
      'Resolve Feedback',
      'Are you sure you want to mark this feedback as resolved?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Resolve',
          onPress: async () => {
            try {
              await feedbackService.resolveFeedback(token, id);
              await fetchFeedbackDetail();
              Alert.alert('Success', 'Feedback has been resolved');
            } catch (err) {
              Alert.alert('Error', 'Failed to resolve feedback');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor={C.primary} />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={24} color={C.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Feedback Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={styles.loadingText}>Loading feedback details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!feedback) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor={C.primary} />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={24} color={C.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Feedback Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorBox}>
          <IconSymbol name="exclamationmark.triangle.fill" size={48} color={C.error} />
          <Text style={styles.errorTitle}>Feedback Not Found</Text>
          <Text style={styles.errorText}>Unable to load feedback details</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={onRefresh}>
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusConfig = STATUS[feedback.status?.toLowerCase()] || STATUS.new;
  const categoryConfig = CAT[feedback.category] || { color: C.primary, icon: 'doc.text.fill', label: feedback.category || 'General', bg: C.primaryLight };
  const responses = feedback.responses || [];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={C.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Feedback Details</Text>
        {isStaff ? (
          <TouchableOpacity 
            style={styles.staffActionBtn}
            onPress={() => setShowResponseForm(!showResponseForm)}
          >
            <IconSymbol name="pencil" size={20} color={C.white} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[C.primary]} tintColor={C.primary} />
          }
        >
          {/* Staff Response Form */}
          {isStaff && showResponseForm && (
            <View style={styles.responseFormCard}>
              <Text style={styles.responseFormTitle}>Add Response</Text>
              <TextInput
                style={styles.responseInput}
                placeholder="Type your response..."
                placeholderTextColor={C.textMuted}
                value={responseText}
                onChangeText={setResponseText}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <View style={styles.responseFormButtons}>
                <TouchableOpacity 
                  style={styles.cancelBtn}
                  onPress={() => {
                    setShowResponseForm(false);
                    setResponseText('');
                  }}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
                  onPress={handleSubmitResponse}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color={C.white} />
                  ) : (
                    <Text style={styles.submitBtnText}>Submit Response</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Status Card */}
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <View style={[styles.statusIconWrap, { backgroundColor: statusConfig.bg }]}>
                <IconSymbol name={statusConfig.icon} size={24} color={statusConfig.color} />
              </View>
              <View style={styles.statusInfo}>
                <Text style={styles.statusLabel}>{statusConfig.label}</Text>
                <Text style={styles.statusDesc}>{statusConfig.desc}</Text>
              </View>
            </View>
            <StatusProgress status={feedback.status} />
          </View>

          {/* Feedback Details Card */}
          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <View style={[styles.catTag, { backgroundColor: categoryConfig.bg }]}>
                <IconSymbol name={categoryConfig.icon} size={14} color={categoryConfig.color} />
                <Text style={[styles.catLabel, { color: categoryConfig.color }]}>{categoryConfig.label}</Text>
              </View>
              {feedback.isAnonymous && (
                <View style={styles.anonBadge}>
                  <IconSymbol name="eye.slash.fill" size={12} color={C.textSub} />
                  <Text style={styles.anonText}>Anonymous</Text>
                </View>
              )}
            </View>

            <Text style={styles.feedbackTitle}>{feedback.title}</Text>
            {feedback.description && (
              <Text style={styles.feedbackDesc}>{feedback.description}</Text>
            )}

          <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <IconSymbol name="calendar" size={14} color={C.textMuted} />
                <Text style={styles.metaText}>
                  {feedback.createdAt 
                    ? new Date(feedback.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                    : 'N/A'}
                </Text>
              </View>
              {feedback.trackingId && (
                <View style={styles.metaItem}>
                  <IconSymbol name="number" size={14} color={C.textMuted} />
                  <Text style={styles.metaText}>#{feedback.trackingId}</Text>
                </View>
              )}
            </View>

            {/* Department & Faculty */}
            {(feedback.department || feedback.faculty) && (
              <View style={styles.deptFacultyRow}>
                {feedback.department && (
                  <View style={styles.deptFacultyItem}>
                    <IconSymbol name="building.2.fill" size={14} color={C.primary} />
                    <Text style={styles.deptFacultyText}>
                      {typeof feedback.department === 'object' ? feedback.department?.name : feedback.department}
                    </Text>
                  </View>
                )}
                {feedback.faculty && (
                  <View style={styles.deptFacultyItem}>
                    <IconSymbol name="building.columns.fill" size={14} color={C.secondary} />
                    <Text style={styles.deptFacultyText}>
                      {typeof feedback.faculty === 'object' ? feedback.faculty?.name : feedback.faculty}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Progress Timeline */}
          <View style={styles.timelineCard}>
            <Text style={styles.timelineTitle}>Progress Timeline</Text>
            
            {/* Submitted */}
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, styles.timelineDotDone]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineItemTitle}>Feedback Submitted</Text>
                <Text style={styles.timelineItemDesc}>Your feedback was received and registered</Text>
                <Text style={styles.timelineItemDate}>
                  {feedback.createdAt 
                    ? new Date(feedback.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : 'N/A'}
                </Text>
              </View>
            </View>

            {/* Routed */}
            {(feedback.status === 'routed' || feedback.status === 'in_progress' || feedback.status === 'resolved' || feedback.status === 'escalated') && (
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, styles.timelineDotDone]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineItemTitle}>Routed to Department</Text>
                  <Text style={styles.timelineItemDesc}>Sent to the relevant department for review</Text>
                </View>
              </View>
            )}

            {/* In Progress */}
            {(feedback.status === 'in_progress' || feedback.status === 'resolved' || feedback.status === 'escalated') && (
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, styles.timelineDotDone]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineItemTitle}>In Progress</Text>
                  <Text style={styles.timelineItemDesc}>The department is working on your feedback</Text>
                </View>
              </View>
            )}

            {/* Resolved */}
            {(feedback.status === 'resolved' || feedback.status === 'closed') && (
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, styles.timelineDotDone]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineItemTitle}>Resolved</Text>
                  <Text style={styles.timelineItemDesc}>Your feedback has been addressed</Text>
                </View>
              </View>
            )}

            {/* Current Status */}
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, styles.timelineDotCurrent]} />
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineItemTitle, { color: statusConfig.color }]}>Current Status: {statusConfig.label}</Text>
                <Text style={styles.timelineItemDesc}>{statusConfig.desc}</Text>
              </View>
            </View>
          </View>

          {/* Staff Actions */}
          {isStaff && (feedback.status !== 'resolved' && feedback.status !== 'closed') && (
            <View style={styles.staffActionsCard}>
              <Text style={styles.staffActionsTitle}>Staff Actions</Text>
              <TouchableOpacity style={styles.resolveBtn} onPress={handleResolve}>
                <IconSymbol name="checkmark.circle.fill" size={20} color={C.white} />
                <Text style={styles.resolveBtnText}>Mark as Resolved</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Responses */}
          {responses.length > 0 && (
            <View style={styles.responsesCard}>
              <Text style={styles.responsesTitle}>
                Responses ({responses.length})
              </Text>
              {responses.map((response, index) => (
                <ResponseCard 
                  key={response._id || index} 
                  response={response}
                />
              ))}
            </View>
          )}

          {/* No Responses Yet */}
          {responses.length === 0 && (
            <View style={styles.noResponseCard}>
              <IconSymbol name="clock.fill" size={32} color={C.textMuted} />
              <Text style={styles.noResponseTitle}>
                {isStaff ? 'No Responses Yet' : 'No Responses Yet'}
              </Text>
              <Text style={styles.noResponseDesc}>
                {isStaff 
                  ? 'Add a response to address this feedback.'
                  : 'Staff members will respond to your feedback. You\'ll receive a notification when there\'s an update.'}
              </Text>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.primary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: C.primary,
    paddingTop: 60
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.white,
  },
  staffActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  scroll: { flex: 1, backgroundColor: C.bg },
  scrollContent: { padding: 16 },

  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg, gap: 12 },
  loadingText: { fontSize: 14, color: C.textMuted },

  errorBox: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg, padding: 24 },
  errorTitle: { fontSize: 18, fontWeight: '700', color: C.text, marginTop: 16, marginBottom: 8 },
  errorText: { fontSize: 14, color: C.textSub, marginBottom: 20 },
  retryBtn: { backgroundColor: C.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  retryBtnText: { color: C.white, fontWeight: '600' },

  // Response Form
  responseFormCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: C.primary,
  },
  responseFormTitle: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 12 },
  responseInput: {
    backgroundColor: C.bg,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: C.text,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: C.border,
  },
  responseFormButtons: { flexDirection: 'row', gap: 12, marginTop: 12 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: C.bg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  cancelBtnText: { color: C.textSub, fontWeight: '600' },
  submitBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: C.primary,
    alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: C.white, fontWeight: '600' },

  // Status Card
  statusCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  statusInfo: { flex: 1 },
  statusLabel: { fontSize: 20, fontWeight: '800', color: C.text, marginBottom: 2 },
  statusDesc: { fontSize: 13, color: C.textSub },

  // Progress
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  progressStep: { alignItems: 'center' },
  progressDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: C.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressDotActive: { backgroundColor: C.success },
  progressDotCurrent: { backgroundColor: C.warning },
  progressLabel: { fontSize: 10, color: C.textMuted, fontWeight: '600' },
  progressLabelActive: { color: C.text },
  progressLine: { flex: 1, height: 2, backgroundColor: C.border, marginBottom: 20 },
  progressLineActive: { backgroundColor: C.success },

  // Detail Card
  detailCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  catTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  catLabel: { fontSize: 12, fontWeight: '700' },
  anonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  anonText: { fontSize: 11, color: C.textSub, fontWeight: '500' },
  feedbackTitle: { fontSize: 18, fontWeight: '700', color: C.text, marginBottom: 10, lineHeight: 26 },
  feedbackDesc: { fontSize: 14, color: C.textSub, lineHeight: 22, marginBottom: 16 },
  metaRow: { flexDirection: 'row', gap: 20, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.border },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 12, color: C.textMuted },

  // Timeline
  timelineCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  timelineTitle: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 16 },
  timelineItem: { flexDirection: 'row', marginBottom: 16 },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: C.border,
    marginTop: 4,
    marginRight: 12,
  },
  timelineDotDone: { backgroundColor: C.success },
  timelineDotCurrent: { backgroundColor: C.warning },
  timelineContent: { flex: 1 },
  timelineItemTitle: { fontSize: 14, fontWeight: '600', color: C.text, marginBottom: 2 },
  timelineItemDesc: { fontSize: 12, color: C.textSub, lineHeight: 18 },
  timelineItemDate: { fontSize: 11, color: C.textMuted, marginTop: 4 },

  // Staff Actions
  staffActionsCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  staffActionsTitle: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 16 },
  resolveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.success,
    paddingVertical: 14,
    borderRadius: 12,
  },
  resolveBtnText: { color: C.white, fontWeight: '700', fontSize: 15 },

  // Responses
  responsesCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  responsesTitle: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 16 },
  responseCard: {
    backgroundColor: C.bg,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  responseCardStaff: {
    backgroundColor: C.primaryLight,
  },
  responseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  responseAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  responseAvatarUser: { backgroundColor: C.primaryLight },
  responseAvatarStaff: { backgroundColor: C.primary },
  responseMeta: { flex: 1 },
  responseName: { fontSize: 13, fontWeight: '700', color: C.text },
  responseNameStaff: { color: C.primary },
  responseDate: { fontSize: 11, color: C.textMuted, marginTop: 2 },
  staffBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: C.successLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  staffBadgeText: { fontSize: 10, color: C.success, fontWeight: '600' },
  responseText: { fontSize: 14, color: C.text, lineHeight: 20 },

  // No Response
  noResponseCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  noResponseTitle: { fontSize: 16, fontWeight: '700', color: C.text, marginTop: 12, marginBottom: 8 },
  noResponseDesc: { fontSize: 13, color: C.textSub, textAlign: 'center', lineHeight: 20 },
  
  // Department & Faculty
  deptFacultyRow: { flexDirection: 'row', gap: 12, marginTop: 12, flexWrap: 'wrap' },
  deptFacultyItem: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.bg, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  deptFacultyText: { fontSize: 12, color: C.text, fontWeight: '500' },
});

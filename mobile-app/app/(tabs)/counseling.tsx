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
  Modal,
  TextInput,
  Alert,
  Linking,
  Platform,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import counselingService from '../../services/counselingService';
import { IconSymbol } from '@/components/ui/icon-symbol';

const { width, height } = Dimensions.get('window');

// ─── Design Tokens ────────────────────────────────────────────────
const C = {
  primary:      '#4169E1',
  primaryDark:  '#2D4DB8',
  primaryLight: '#EEF2FF',
  secondary:    '#7C3AED',
  secondaryLight:'#F5F3FF',
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

// ─── Tab Config ───────────────────────────────────────────────────
const TABS = [
  { key: 'sessions',   label: 'Sessions',   icon: 'calendar' },
  { key: 'counselors', label: 'Counselors', icon: 'psychology' },
  { key: 'resources',  label: 'Resources',  icon: 'book.fill' },
];

// ─── Counselor Card ───────────────────────────────────────────────
const CounselorCard = ({ counselor, onBook }) => (
  <View style={styles.counselorCard}>
    <View style={styles.counselorTop}>
      <View style={styles.counselorAvatar}>
        <IconSymbol name="psychology" size={28} color={C.primary} />
      </View>
      <View style={styles.counselorInfo}>
        <Text style={styles.counselorName}>{counselor.name}</Text>
        <Text style={styles.counselorTitle}>{counselor.title}</Text>
        <View style={styles.ratingRow}>
          <IconSymbol name="star.fill" size={13} color="#F59E0B" />
          <Text style={styles.ratingText}>{counselor.rating || '4.8'}</Text>
        </View>
      </View>
    </View>
    <View style={[styles.specPill, { backgroundColor: C.primaryLight }]}>
      <Text style={[styles.specText, { color: C.primary }]}>{counselor.specialization}</Text>
    </View>
    {counselor.bio ? (
      <Text style={styles.counselorBio} numberOfLines={2}>{counselor.bio}</Text>
    ) : null}
    <View style={styles.counselorFooter}>
      <View style={styles.availBadge}>
        <View style={styles.availDot} />
        <Text style={styles.availText}>{counselor.availability || 'Mon–Fri, 9am–5pm'}</Text>
      </View>
      <TouchableOpacity style={styles.bookBtn} onPress={() => onBook(counselor)} activeOpacity={0.85}>
        <Text style={styles.bookBtnText}>Book Session</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// ─── Appointment Card ─────────────────────────────────────────────
const AppointmentCard = ({ appt, onCancel }) => {
  const upcoming = appt.status === 'upcoming';
  const date = new Date(appt.date);
  const formatted = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  return (
    <View style={[styles.apptCard, { borderLeftColor: upcoming ? C.success : C.textMuted }]}>
      <View style={styles.apptTop}>
        <View style={[styles.apptStatusBadge, { backgroundColor: upcoming ? C.successLight : '#F1F5F9' }]}>
          <IconSymbol name={upcoming ? 'circle.fill' : 'checkmark.circle.fill'} size={11} color={upcoming ? C.success : C.textMuted} />
          <Text style={[styles.apptStatusText, { color: upcoming ? C.success : C.textMuted }]}>
            {upcoming ? 'Upcoming' : 'Completed'}
          </Text>
        </View>
        <Text style={styles.apptType}>{appt.type}</Text>
      </View>
      <View style={styles.apptDetails}>
        <View style={styles.apptRow}>
          <IconSymbol name="psychology" size={15} color={C.textSub} />
          <Text style={styles.apptRowText}>{appt.counselorName}</Text>
        </View>
        <View style={styles.apptRow}>
          <IconSymbol name="calendar" size={15} color={C.textSub} />
          <Text style={styles.apptRowText}>{formatted} at {appt.time}</Text>
        </View>
      </View>
      {appt.notes ? (
        <View style={styles.apptNotesRow}>
          <IconSymbol name="square.and.pencil" size={12} color={C.textMuted} />
          <Text style={styles.apptNotes}>{appt.notes}</Text>
        </View>
      ) : null}
      {upcoming && (
        <TouchableOpacity style={styles.cancelApptBtn} onPress={() => onCancel(appt.id)}>
          <Text style={styles.cancelApptText}>Cancel Appointment</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ─── Resource Card ────────────────────────────────────────────────
const ResourceCard = ({ resource }) => {
  const ICONS = { article: 'doc.fill', video: 'video', guide: 'book.fill', audio: 'headphones', default: 'doc.text.fill' };
  const iconName = ICONS[resource.type] || ICONS.default;
  return (
    <TouchableOpacity style={styles.resourceCard} activeOpacity={0.75}>
      <View style={styles.resourceIcon}>
        <IconSymbol name={iconName} size={22} color={C.primary} />
      </View>
      <View style={styles.resourceInfo}>
        <Text style={styles.resourceTitle}>{resource.title}</Text>
        <Text style={styles.resourceMeta}>{resource.category} · {resource.type}</Text>
      </View>
      <IconSymbol name="chevron.right" size={16} color={C.textMuted} />
    </TouchableOpacity>
  );
};

// ─── Crisis Contact ───────────────────────────────────────────────
const CrisisContact = ({ contact, onCall }) => (
  <TouchableOpacity style={styles.crisisCard} onPress={() => onCall(contact.phone)} activeOpacity={0.8}>
    <View style={styles.crisisIcon}>
      <IconSymbol name="phone.fill" size={20} color={C.error} />
    </View>
    <View style={styles.crisisInfo}>
      <Text style={styles.crisisName}>{contact.name}</Text>
      <Text style={styles.crisisPhone}>{contact.phone}</Text>
      <Text style={styles.crisisDesc}>{contact.description}</Text>
    </View>
    <View style={styles.liveBadge}>
      <View style={styles.liveDot} />
      <Text style={styles.liveText}>24/7</Text>
    </View>
  </TouchableOpacity>
);

// ─── Booking Modal ────────────────────────────────────────────────
const BookingModal = ({ visible, counselor, onClose, onConfirm }) => {
  const [selDate, setSelDate] = useState(null);
  const [selTime, setSelTime] = useState(null);
  const [sessionType, setSessionType] = useState('Individual Session');
  const [notes, setNotes] = useState('');

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i + 1); return d;
  });
  const times = ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'];
  const types = ['Individual Session', 'Stress Management', 'Career Guidance', 'Follow-up'];

  useEffect(() => { if (!visible) { setSelDate(null); setSelTime(null); setNotes(''); } }, [visible]);

  const confirm = () => {
    if (!selDate || !selTime) { Alert.alert('Missing Info', 'Please select a date and time.'); return; }
    onConfirm({ counselorId: counselor?.id, counselorName: counselor?.name, date: selDate.toISOString(), time: selTime, type: sessionType, notes });
  };

  if (!counselor) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Book Appointment</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalClose}>
              <IconSymbol name="xmark" size={20} color={C.textSub} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            {/* Counselor Summary */}
            <View style={styles.modalCounselorRow}>
              <View style={styles.modalCounselorAvatar}>
                <IconSymbol name="psychology" size={24} color={C.primary} />
              </View>
              <View>
                <Text style={styles.modalCounselorName}>{counselor.name}</Text>
                <Text style={styles.modalCounselorSpec}>{counselor.specialization}</Text>
              </View>
            </View>

            {/* Session Type */}
            <Text style={styles.modalSectionLabel}>Session Type</Text>
            <View style={styles.typeGrid}>
              {types.map(t => (
                <TouchableOpacity key={t} style={[styles.typeChip, sessionType === t && styles.typeChipActive]} onPress={() => setSessionType(t)}>
                  <Text style={[styles.typeChipText, sessionType === t && styles.typeChipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Date */}
            <Text style={styles.modalSectionLabel}>Select Date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
              {dates.map((d, i) => {
                const sel = selDate && selDate.toDateString() === d.toDateString();
                return (
                  <TouchableOpacity key={i} style={[styles.dateCard, sel && styles.dateCardActive]} onPress={() => setSelDate(d)}>
                    <Text style={[styles.dateDay, sel && styles.dateTextActive]}>{d.toLocaleDateString('en-US', { weekday: 'short' })}</Text>
                    <Text style={[styles.dateNum, sel && styles.dateTextActive]}>{d.getDate()}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Time */}
            <Text style={styles.modalSectionLabel}>Select Time</Text>
            <View style={styles.timeGrid}>
              {times.map((t, i) => (
                <TouchableOpacity key={i} style={[styles.timeCard, selTime === t && styles.timeCardActive]} onPress={() => setSelTime(t)}>
                  <Text style={[styles.timeText, selTime === t && styles.timeTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Notes */}
            <Text style={styles.modalSectionLabel}>Notes (Optional)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="What would you like to discuss?"
              placeholderTextColor={C.textMuted}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </ScrollView>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={onClose}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalConfirmBtn} onPress={confirm}>
              <Text style={styles.modalConfirmText}>Confirm Booking</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────
export default function CounselingScreen() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('sessions');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [crisisVisible, setCrisisVisible] = useState(false);
  const [bookingVisible, setBookingVisible] = useState(false);
  const [selectedCounselor, setSelectedCounselor] = useState(null);

  const [counselors, setCounselors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [resources, setResources] = useState([]);
  const [crisisContacts, setCrisisContacts] = useState([]);
  const [stats, setStats] = useState({ upcomingSessions: 0, completedSessions: 0, totalHours: 0 });

  const fetchData = async () => {
    if (!token) return;
    try {
      const [c, a, r, cr, s] = await Promise.all([
        counselingService.getCounselors(token),
        counselingService.getAppointments(token),
        counselingService.getResources(token),
        counselingService.getCrisisContacts(token),
        counselingService.getStats(token),
      ]);
      setCounselors(c.counselors || []);
      setAppointments(a.appointments || []);
      setResources(r.resources || []);
      setCrisisContacts(cr.contacts || []);
      setStats(s);
    } catch { /* silent */ }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchData(); }, [token]);

  const handleBook = (counselor) => { setSelectedCounselor(counselor); setBookingVisible(true); };

  const handleConfirmBooking = async (data) => {
    try {
      await counselingService.bookAppointment(token, data);
      setBookingVisible(false);
      Alert.alert('Booked! 🎉', 'Your appointment has been confirmed.');
      fetchData();
    } catch { Alert.alert('Error', 'Failed to book. Please try again.'); }
  };

  const handleCancel = (id) => {
    Alert.alert('Cancel Appointment', 'Are you sure?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes, Cancel', style: 'destructive', onPress: async () => {
        try { await counselingService.cancelAppointment(token, id); fetchData(); Alert.alert('Cancelled', 'Appointment cancelled.'); }
        catch { Alert.alert('Error', 'Failed to cancel.'); }
      }},
    ]);
  };

  const handleCall = (phone) => {
    const url = `tel:${phone.replace(/-/g, '')}`;
    Linking.canOpenURL(url).then(ok => ok ? Linking.openURL(url) : Alert.alert('Error', 'Phone calls not supported.'));
  };

  const upcoming  = appointments.filter(a => a.status === 'upcoming');
  const completed = appointments.filter(a => a.status === 'completed');

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerCircle1} />
        <View style={styles.headerCircle2} />

        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Counseling</Text>
            <Text style={styles.headerSub}>Your mental wellness matters</Text>
          </View>
          <TouchableOpacity style={styles.crisisBtn} onPress={() => setCrisisVisible(true)}>
            <IconSymbol name="sos" size={22} color={C.error} />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: '#FCD34D' }]}>{stats.upcomingSessions}</Text>
            <Text style={styles.statLbl}>Upcoming</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: '#6EE7B7' }]}>{stats.completedSessions}</Text>
            <Text style={styles.statLbl}>Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: '#C4B5FD' }]}>{stats.totalHours}</Text>
            <Text style={styles.statLbl}>Hours</Text>
          </View>
        </View>
      </View>

      {/* ── Tabs ── */}
      <View style={styles.tabBar}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, activeTab === t.key && styles.tabActive]}
            onPress={() => setActiveTab(t.key)}
            activeOpacity={0.8}
          >
            <IconSymbol name={t.icon} size={14} color={activeTab === t.key ? C.white : C.textSub} />
            <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Content ── */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Sessions Tab */}
          {activeTab === 'sessions' && (
            <>
              {upcoming.length > 0 ? (
                <>
                  <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
                  {upcoming.map(a => <AppointmentCard key={a.id} appt={a} onCancel={handleCancel} />)}
                </>
              ) : (
                <View style={styles.emptyBox}>
                  <View style={styles.emptyIconCircle}>
                    <IconSymbol name="calendar" size={36} color={C.textMuted} />
                  </View>
                  <Text style={styles.emptyTitle}>No Upcoming Sessions</Text>
                  <Text style={styles.emptySub}>Book a session with a counselor to get started</Text>
                  <TouchableOpacity style={styles.emptyBtn} onPress={() => setActiveTab('counselors')}>
                    <Text style={styles.emptyBtnText}>Find a Counselor</Text>
                    <IconSymbol name="chevron.right" size={14} color={C.white} />
                  </TouchableOpacity>
                </View>
              )}
              {completed.length > 0 && (
                <>
                  <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Past Sessions</Text>
                  {completed.map(a => <AppointmentCard key={a.id} appt={a} onCancel={() => {}} />)}
                </>
              )}
            </>
          )}

          {/* Counselors Tab */}
          {activeTab === 'counselors' && (
            <>
              <Text style={styles.sectionTitle}>Available Counselors</Text>
              {counselors.length > 0 ? (
                counselors.map(c => <CounselorCard key={c.id} counselor={c} onBook={handleBook} />)
              ) : (
                <View style={styles.emptyBox}>
                  <View style={styles.emptyIconCircle}>
                    <IconSymbol name="psychology" size={36} color={C.textMuted} />
                  </View>
                  <Text style={styles.emptyTitle}>No Counselors Available</Text>
                  <Text style={styles.emptySub}>Check back later for available counselors</Text>
                </View>
              )}
            </>
          )}

          {/* Resources Tab */}
          {activeTab === 'resources' && (
            <>
              <Text style={styles.sectionTitle}>Mental Health Resources</Text>
              {resources.length > 0 ? (
                resources.map(r => <ResourceCard key={r.id} resource={r} />)
              ) : (
                <View style={styles.emptyBox}>
                  <View style={styles.emptyIconCircle}>
                    <IconSymbol name="book.fill" size={36} color={C.textMuted} />
                  </View>
                  <Text style={styles.emptyTitle}>No Resources Yet</Text>
                  <Text style={styles.emptySub}>Resources will be added soon</Text>
                </View>
              )}

              {/* Crisis Banner */}
              <TouchableOpacity style={styles.crisisBanner} onPress={() => setCrisisVisible(true)} activeOpacity={0.85}>
                <View style={styles.crisisBannerIcon}>
                  <IconSymbol name="sos" size={22} color={C.error} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.crisisBannerTitle}>Need Immediate Help?</Text>
                  <Text style={styles.crisisBannerSub}>Access 24/7 crisis support hotlines</Text>
                </View>
                <IconSymbol name="chevron.right" size={18} color={C.error} />
              </TouchableOpacity>
            </>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* ── Crisis Modal ── */}
      <Modal visible={crisisVisible} animationType="slide" transparent onRequestClose={() => setCrisisVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { maxHeight: height * 0.72 }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <IconSymbol name="sos" size={22} color={C.error} />
                <Text style={styles.modalTitle}>Crisis Support</Text>
              </View>
              <TouchableOpacity onPress={() => setCrisisVisible(false)} style={styles.modalClose}>
                <IconSymbol name="xmark" size={20} color={C.textSub} />
              </TouchableOpacity>
            </View>
            <View style={styles.crisisWarning}>
              <Text style={styles.crisisWarningText}>
                ⚠️ If you're in immediate danger, call emergency services (999) or go to your nearest emergency room.
              </Text>
            </View>
            <ScrollView style={{ paddingHorizontal: 16 }} showsVerticalScrollIndicator={false}>
              <Text style={styles.sectionTitle}>Hotlines</Text>
              {crisisContacts.map(c => <CrisisContact key={c.id} contact={c} onCall={handleCall} />)}
            </ScrollView>
            <View style={{ padding: 16 }}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setCrisisVisible(false)}>
                <Text style={styles.modalCancelText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Booking Modal ── */}
      <BookingModal
        visible={bookingVisible}
        counselor={selectedCounselor}
        onClose={() => { setBookingVisible(false); setSelectedCounselor(null); }}
        onConfirm={handleConfirmBooking}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.primary },
  headerContainer: { backgroundColor: C.primary, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  scroll: { flex: 1, backgroundColor: C.bg },
  scrollContent: { padding: 16 },

// Header
  header: {
    backgroundColor: C.primary,
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 24,
    overflow: 'hidden',
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  headerCircle1: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.07)', top: -60, right: -40,
  },
  headerCircle2: {
    position: 'absolute', width: 130, height: 130, borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.05)', bottom: -30, left: 10,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: C.white },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  crisisBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(239,68,68,0.25)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.4)',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16, paddingVertical: 14, paddingHorizontal: 8,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '800', color: C.white },
  statLbl: { fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 4 },

  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: C.white,
    paddingHorizontal: 12, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: C.border,
    gap: 6,
  },
  tab: {
    flex: 1, paddingVertical: 9, borderRadius: 10,
    alignItems: 'center', backgroundColor: C.bg,
    flexDirection: 'row', justifyContent: 'center', gap: 5,
  },
  tabActive: { backgroundColor: C.primary },
  tabText: { fontSize: 12, fontWeight: '600', color: C.textSub },
  tabTextActive: { color: C.white },

  // Section
  sectionTitle: { fontSize: 17, fontWeight: '700', color: C.text, marginBottom: 14 },

  // Counselor Card
  counselorCard: {
    backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  counselorTop: { flexDirection: 'row', marginBottom: 12 },
  counselorAvatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: C.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  counselorInfo: { flex: 1 },
  counselorName: { fontSize: 16, fontWeight: '700', color: C.text },
  counselorTitle: { fontSize: 12, color: C.textSub, marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  ratingText: { fontSize: 12, fontWeight: '600', color: C.text },
  specPill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, marginBottom: 8 },
  specText: { fontSize: 12, fontWeight: '700' },
  counselorBio: { fontSize: 13, color: C.textSub, lineHeight: 18, marginBottom: 12 },
  counselorFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  availBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  availDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: C.success },
  availText: { fontSize: 11, color: C.success, fontWeight: '600' },
  bookBtn: {
    backgroundColor: C.primary, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 10,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 4,
  },
  bookBtnText: { color: C.white, fontSize: 13, fontWeight: '700' },

  // Appointment Card
  apptCard: {
    backgroundColor: C.card, borderRadius: 14, padding: 14, marginBottom: 12, borderLeftWidth: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  apptTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  apptStatusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  apptStatusText: { fontSize: 11, fontWeight: '700' },
  apptType: { fontSize: 12, color: C.textSub, fontWeight: '500' },
  apptDetails: { gap: 6, marginBottom: 6 },
  apptRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  apptRowText: { fontSize: 14, color: C.text },
  apptNotesRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 4 },
  apptNotes: { flex: 1, fontSize: 12, color: C.textMuted, fontStyle: 'italic' },
  cancelApptBtn: { marginTop: 10, paddingVertical: 8, alignItems: 'center', borderTopWidth: 1, borderTopColor: C.border },
  cancelApptText: { color: C.error, fontSize: 13, fontWeight: '700' },

  // Resource Card
  resourceCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.card, borderRadius: 12, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  resourceIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: C.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  resourceInfo: { flex: 1 },
  resourceTitle: { fontSize: 14, fontWeight: '600', color: C.text },
  resourceMeta: { fontSize: 11, color: C.textMuted, marginTop: 2 },

  // Crisis Card
  crisisCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.card, borderRadius: 14, padding: 14, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  crisisIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: C.errorLight, justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  crisisInfo: { flex: 1 },
  crisisName: { fontSize: 15, fontWeight: '700', color: C.text },
  crisisPhone: { fontSize: 14, color: C.primary, fontWeight: '600', marginTop: 2 },
  crisisDesc: { fontSize: 11, color: C.textMuted, marginTop: 3 },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: C.successLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.success },
  liveText: { fontSize: 10, color: C.success, fontWeight: '700' },

  // Crisis Banner
  crisisBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.errorLight, borderRadius: 14, padding: 14, marginTop: 16,
    borderWidth: 1, borderColor: C.error + '30', gap: 12,
  },
  crisisBannerIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: C.error + '20', justifyContent: 'center', alignItems: 'center',
  },
  crisisBannerTitle: { fontSize: 15, fontWeight: '700', color: C.error },
  crisisBannerSub: { fontSize: 12, color: C.textSub, marginTop: 2 },

  // Crisis Warning
  crisisWarning: {
    backgroundColor: C.warningLight, borderRadius: 10, padding: 12,
    marginHorizontal: 16, marginBottom: 16, borderWidth: 1, borderColor: C.warning + '40',
  },
  crisisWarningText: { fontSize: 13, color: C.warning, lineHeight: 19 },

  // Empty
  emptyBox: {
    backgroundColor: C.card, borderRadius: 20, padding: 32, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  emptyIconCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: C.text, marginBottom: 6 },
  emptySub: { fontSize: 13, color: C.textSub, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  emptyBtnText: { color: C.white, fontSize: 14, fontWeight: '700' },

  // Loading
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg, gap: 12 },
  loadingText: { fontSize: 14, color: C.textMuted },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: {
    backgroundColor: C.bg,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    maxHeight: height * 0.9,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    backgroundColor: C.white,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: C.text },
  modalClose: { padding: 4 },
  modalScroll: { paddingHorizontal: 20, paddingTop: 16 },
  modalCounselorRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.white, borderRadius: 12, padding: 12, marginBottom: 20,
  },
  modalCounselorAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: C.primaryLight, justifyContent: 'center', alignItems: 'center',
  },
  // (icon replaces emoji in modal avatar — rendered inline)
  modalCounselorName: { fontSize: 15, fontWeight: '700', color: C.text },
  modalCounselorSpec: { fontSize: 12, color: C.textSub, marginTop: 2 },
  modalSectionLabel: { fontSize: 14, fontWeight: '700', color: C.text, marginBottom: 10, marginTop: 4 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  typeChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: C.white, borderWidth: 1.5, borderColor: C.border,
  },
  typeChipActive: { backgroundColor: C.primary, borderColor: C.primary },
  typeChipText: { fontSize: 12, color: C.textSub, fontWeight: '600' },
  typeChipTextActive: { color: C.white },
  dateCard: {
    width: 60, height: 70, borderRadius: 12,
    backgroundColor: C.white, justifyContent: 'center', alignItems: 'center',
    marginRight: 8, borderWidth: 1.5, borderColor: C.border,
  },
  dateCardActive: { backgroundColor: C.primary, borderColor: C.primary },
  dateDay: { fontSize: 11, color: C.textSub, fontWeight: '600' },
  dateNum: { fontSize: 18, fontWeight: '800', color: C.text, marginTop: 2 },
  dateTextActive: { color: C.white },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  timeCard: {
    width: (width - 72) / 3, paddingVertical: 12, borderRadius: 10,
    backgroundColor: C.white, alignItems: 'center', borderWidth: 1.5, borderColor: C.border,
  },
  timeCardActive: { backgroundColor: C.primary, borderColor: C.primary },
  timeText: { fontSize: 12, color: C.text, fontWeight: '600' },
  timeTextActive: { color: C.white },
  notesInput: {
    backgroundColor: C.white, borderRadius: 12, padding: 14,
    fontSize: 14, color: C.text, borderWidth: 1.5, borderColor: C.border,
    minHeight: 80, textAlignVertical: 'top', marginBottom: 16,
  },
  modalFooter: {
    flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 14,
    borderTopWidth: 1, borderTopColor: C.border, gap: 12,
  },
  modalCancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center',
    backgroundColor: C.white, borderWidth: 1.5, borderColor: C.border,
  },
  modalCancelText: { fontSize: 14, fontWeight: '700', color: C.textSub },
  modalConfirmBtn: {
    flex: 2, paddingVertical: 14, borderRadius: 12, alignItems: 'center',
    backgroundColor: C.primary,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  modalConfirmText: { fontSize: 14, fontWeight: '700', color: C.white },
});

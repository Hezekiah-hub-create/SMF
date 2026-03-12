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
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { IconSymbol } from '../../components/ui/icon-symbol';

const { width } = Dimensions.get('window');

const C = {
  primary:      '#4169E1',
  primaryDark:  '#2D4DB8',
  primaryLight: '#EEF2FF',
  bg:           '#F8FAFC',
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
  border:       '#E2E8F0',
  white:        '#FFFFFF',
  shadow:       'rgba(65, 105, 225, 0.12)',
};

// ─── Role Display Map ─────────────────────
const ROLE_LABELS = {
  student:           { label: 'Student',            icon: 'graduationcap.fill', color: C.primary },
  lecturer:          { label: 'Lecturer',            icon: 'person.fill',        color: '#7C3AED' },
  hod:               { label: 'Department Head',     icon: 'building.2.fill',    color: '#10B981' },
  dean_faculty:      { label: 'Faculty Dean',        icon: 'building.columns',   color: '#F59E0B' },
  quality_assurance: { label: 'Quality Assurance',   icon: 'star.fill',          color: '#EC4899' },
  admin:             { label: 'Administrator',       icon: 'gear.fill',          color: '#64748B' },
};

// ─── Menu Sections ────────────────────────────────────────────────
const MENU = [
  {
    title: 'Account',
    items: [
      { icon: 'person.fill',              label: 'Personal Information', sub: 'View and edit your profile',    route: '/personal-info',         color: '#4169E1', bg: '#EEF2FF' },
      { icon: 'lock.fill',                label: 'Change Password',      sub: 'Update your password',          route: '/change-password',       color: '#7C3AED', bg: '#F5F3FF' },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { icon: 'bell.fill',                label: 'Notifications',        sub: 'Manage notification settings',  route: '/notification-settings', color: '#F59E0B', bg: '#FFFBEB' },
      { icon: 'shield.fill',              label: 'Privacy & Security',   sub: 'Privacy and security settings', route: '/privacy',               color: '#10B981', bg: '#ECFDF5' },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: 'questionmark.circle.fill', label: 'Help & Support',       sub: 'Get help or report issues',     route: '/help-support',          color: '#3B82F6', bg: '#EFF6FF' },
      { icon: 'info.circle.fill',         label: 'About',                sub: 'App version and information',   route: '/about',                 color: '#64748B', bg: '#F1F5F9' },
    ],
  },
];

// ─── Stat Item ────────────────────────────────────────────────────
const StatItem = ({ value, label, color, loading }) => (
  <View style={styles.statItem}>
    {loading ? (
      <ActivityIndicator size="small" color={color} />
    ) : (
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    )}
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// ─── Menu Item ────────────────────────────────────────────────────
const MenuItem = ({ item, onPress, isLast }) => (
  <TouchableOpacity
    style={[styles.menuItem, !isLast && styles.menuItemBorder]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.menuIconWrap, { backgroundColor: item.bg }]}>
      <IconSymbol name={item.icon} size={18} color={item.color} />
    </View>
    <View style={styles.menuText}>
      <Text style={styles.menuLabel}>{item.label}</Text>
      <Text style={styles.menuSub}>{item.sub}</Text>
    </View>
    <IconSymbol name="chevron.right" size={16} color={C.textMuted} />
  </TouchableOpacity>
);

// ─── Main Screen ──────────────────────────────────────────────────
export default function ProfileScreen() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (user?.feedbackCount !== undefined || user === null) {
      setStatsLoading(false);
    } else {
      const t = setTimeout(() => setStatsLoading(false), 1500);
      return () => clearTimeout(t);
    }
  }, [user]);

  const name = user?.name || user?.fullName || 'User';
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const roleInfo = ROLE_LABELS[user?.role] || ROLE_LABELS.student;

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => { await logout(); router.replace('/login'); } },
    ]);
  };

  const feedbackCount = user?.feedbackCount ?? 0;
  const resolvedCount = user?.resolvedCount ?? 0;
  const pendingCount  = feedbackCount - resolvedCount;
  const resolveRate   = feedbackCount > 0 ? Math.round((resolvedCount / feedbackCount) * 100) : 0;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Hero ── */}
        <View style={styles.hero}>
          <View style={styles.heroCircle1} />
          <View style={styles.heroCircle2} />

          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
            <View style={styles.avatarOnline} />
          </View>

          <Text style={styles.heroName}>{name}</Text>
          <Text style={styles.heroEmail}>{user?.email || ''}</Text>

          <View style={styles.heroBadges}>
            {/* Role badge */}
            <View style={[styles.heroBadge, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
              <IconSymbol name={roleInfo.icon} size={13} color={C.white} />
              <Text style={styles.heroBadgeText}>{roleInfo.label}</Text>
            </View>
            {/* Department badge */}
            {user?.department && (
              <View style={[styles.heroBadge, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                <IconSymbol name="building.2.fill" size={13} color={C.white} />
                <Text style={styles.heroBadgeText}>{user.department}</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Stats Card ── */}
        <View style={styles.statsCard}>
          <StatItem value={feedbackCount}      label="Submitted" color={C.primary}  loading={statsLoading} />
          <View style={styles.statDivider} />
          <StatItem value={resolvedCount}      label="Resolved"  color={C.success}  loading={statsLoading} />
          <View style={styles.statDivider} />
          <StatItem value={pendingCount}       label="Pending"   color={C.warning}  loading={statsLoading} />
          <View style={styles.statDivider} />
          <StatItem value={`${resolveRate}%`}  label="Rate"      color={C.primary}  loading={statsLoading} />
        </View>

        {/* ── Progress Bar ── */}
        {!statsLoading && feedbackCount > 0 && (
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Resolution Progress</Text>
              <Text style={styles.progressPct}>{resolveRate}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${resolveRate}%` }]} />
            </View>
            <Text style={styles.progressSub}>{resolvedCount} of {feedbackCount} feedback items resolved</Text>
          </View>
        )}

        {/* ── Menu Sections ── */}
        {MENU.map((section, si) => (
          <View key={si} style={styles.menuSection}>
            <Text style={styles.menuSectionTitle}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, ii) => (
                <MenuItem key={ii} item={item} isLast={ii === section.items.length - 1} onPress={() => router.push(item.route)} />
              ))}
            </View>
          </View>
        ))}

        {/* ── Logout ── */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <View style={styles.logoutIconWrap}>
            <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color={C.error} />
          </View>
          <Text style={styles.logoutText}>Logout</Text>
          <IconSymbol name="chevron.right" size={16} color={C.error} />
        </TouchableOpacity>

        <Text style={styles.version}>Student Feedback Management v1.0.0</Text>
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.primary },
  scroll: { flex: 1, backgroundColor: C.bg },
  scrollContent: { paddingBottom: 20 },

  hero: { backgroundColor: C.primary, paddingHorizontal: 20, paddingTop: 60, paddingBottom: 36, alignItems: 'center', overflow: 'hidden', borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  heroCircle1: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(255,255,255,0.06)', top: -70, right: -50 },
  heroCircle2: { position: 'absolute', width: 150, height: 150, borderRadius: 75,  backgroundColor: 'rgba(255,255,255,0.05)', bottom: -40, left: -20 },
  avatarWrap: { position: 'relative', marginBottom: 14 },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.6)' },
  avatarInitials: { fontSize: 30, fontWeight: '800', color: C.white },
  avatarOnline: { position: 'absolute', bottom: 4, right: 4, width: 16, height: 16, borderRadius: 8, backgroundColor: C.success, borderWidth: 2, borderColor: C.white },
  heroName: { fontSize: 22, fontWeight: '800', color: C.white, marginBottom: 4 },
  heroEmail: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 14 },
  heroBadges: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  heroBadgeText: { fontSize: 12, color: C.white, fontWeight: '600' },

  statsCard: {
    flexDirection: 'row', backgroundColor: C.white,
    marginHorizontal: 16, marginTop: -24, borderRadius: 24,
    paddingVertical: 24, paddingHorizontal: 12,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)'
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  statLabel: { fontSize: 11, color: C.textSub, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  statDivider: { width: 1, backgroundColor: '#F1F5F9', marginVertical: 8 },

  progressCard: { backgroundColor: C.white, marginHorizontal: 16, marginTop: 16, borderRadius: 20, padding: 20, shadowColor: C.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 4 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  progressTitle: { fontSize: 15, fontWeight: '700', color: C.text },
  progressPct: { fontSize: 18, fontWeight: '800', color: C.primary },
  progressTrack: { height: 10, backgroundColor: '#F1F5F9', borderRadius: 5, overflow: 'hidden', marginBottom: 10 },
  progressFill: { height: '100%', backgroundColor: C.primary, borderRadius: 5 },
  progressSub: { fontSize: 13, color: C.textSub },

  menuSection: { marginTop: 24, paddingHorizontal: 16 },
  menuSectionTitle: { fontSize: 13, fontWeight: '800', color: C.textSub, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 12, marginLeft: 4 },
  menuCard: { backgroundColor: C.white, borderRadius: 24, overflow: 'hidden', shadowColor: C.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 16, elevation: 4 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  menuIconWrap: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: '700', color: C.text },
  menuSub: { fontSize: 13, color: C.textSub, marginTop: 2 },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, marginHorizontal: 16, marginTop: 24, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#FEE2E2', gap: 14, shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 },
  logoutIconWrap: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center' },
  logoutText: { flex: 1, fontSize: 16, fontWeight: '700', color: C.error },

  version: { fontSize: 12, color: C.textMuted, textAlign: 'center', marginTop: 24, fontWeight: '500' },
});

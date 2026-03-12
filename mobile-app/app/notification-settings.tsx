// @ts-nocheck
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '../components/ui/icon-symbol';

const COLORS = {
  primary: '#4169E1',
  background: '#F8FAFC',
  card: '#FFFFFF',
  text: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  shadow: 'rgba(65, 105, 225, 0.08)',
};

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    feedbackUpdates: true,
    announcements: false,
    mentions: true,
    marketing: false,
  });

  const toggleSwitch = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const sections = [
    {
      title: 'Global Settings',
      items: [
        { key: 'pushNotifications', label: 'Push Notifications', sub: 'Receive alerts via mobile push', icon: 'bell.fill' },
        { key: 'emailNotifications', label: 'Email Notifications', sub: 'Stay updated via your inbox', icon: 'envelope.fill' },
      ],
    },
    {
      title: 'Activity Updates',
      items: [
        { key: 'feedbackUpdates', label: 'Feedback Activity', sub: 'When staff responds to your feedback', icon: 'bubble.left.fill' },
        { key: 'announcements', label: 'General News', sub: 'University news and weekly updates', icon: 'megaphone.fill' },
      ],
    },
  ];

  const handleSave = () => {
    // In a real app, this would call an API to save settings
    Alert.alert(
      'Success',
      'Your notification preferences have been saved.',
      [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={styles.heroIconContainer}>
            <IconSymbol name="bell.badge.fill" size={32} color={COLORS.primary} />
          </View>
          <Text style={styles.heroTitle}>Manage Alerts</Text>
          <Text style={styles.heroSubtitle}>Choose how you want to be notified about important activity.</Text>
        </View>

        {sections.map((section, sIdx) => (
          <View key={sIdx} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, iIdx) => (
                <View key={item.key} style={[styles.settingRow, iIdx !== section.items.length - 1 && styles.rowBorder]}>
                  <View style={styles.settingIconWrap}>
                    <IconSymbol name={item.icon} size={18} color={COLORS.primary} />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingLabel}>{item.label}</Text>
                    <Text style={styles.settingSub}>{item.sub}</Text>
                  </View>
                  <Switch
                    trackColor={{ false: '#E2E8F0', true: COLORS.primary + '40' }}
                    thumbColor={settings[item.key] ? COLORS.primary : '#FFFFFF'}
                    ios_backgroundColor="#E2E8F0"
                    onValueChange={() => toggleSwitch(item.key)}
                    value={settings[item.key]}
                  />
                </View>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.saveTip}>
          <IconSymbol name="info.circle.fill" size={16} color={COLORS.textMuted} />
          <Text style={styles.saveTipText}>Settings are saved automatically</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 16 },
  backButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  
  heroSection: { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 40 },
  heroIconContainer: { width: 80, height: 80, borderRadius: 28, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 5 },
  heroTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginTop: 16 },
  heroSubtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 20 },

  section: { marginTop: 24, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 12, marginLeft: 4 },
  sectionCard: { backgroundColor: '#FFF', borderRadius: 24, overflow: 'hidden', shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 16, elevation: 4 },
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: 18, gap: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  settingIconWrap: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.primary + '08', justifyContent: 'center', alignItems: 'center' },
  settingText: { flex: 1 },
  settingLabel: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  settingSub: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },

  saveTip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 32 },
  saveTipText: { fontSize: 13, color: COLORS.textMuted, fontWeight: '500' },
});

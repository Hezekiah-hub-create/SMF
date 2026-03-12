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
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '../components/ui/icon-symbol';

const COLORS = {
  primary: '#4169e1',
  background: '#F5F6F8',
  card: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  success: '#10B981',
  error: '#EF4444',
  border: '#E5E7EB',
};

export default function PrivacyScreen() {
  const router = useRouter();
  
  const [settings, setSettings] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showDepartment: true,
    allowMessaging: true,
    activityStatus: true,
    dataAnalytics: true,
  });

  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    Alert.alert(
      'Success',
      'Your privacy settings have been saved.',
      [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deletion', 'This feature requires confirmation via email. Please contact support.');
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Your data export request has been submitted. You will receive an email with your data within 24-48 hours.',
      [{ text: 'OK' }]
    );
  };

  const privacyOptions = [
    { value: 'public', label: 'Public', description: 'Everyone can see your profile' },
    { value: 'contacts', label: 'Contacts Only', description: 'Only your contacts can see your profile' },
    { value: 'private', label: 'Private', description: 'Only you can see your profile' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron-left" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy</Text>
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Visibility Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Visibility</Text>
          <View style={styles.card}>
            {privacyOptions.map((option, index) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.radioItem,
                  index < privacyOptions.length - 1 && styles.radioItemBorder,
                ]}
                onPress={() => setSettings((prev) => ({ ...prev, profileVisibility: option.value }))}
              >
                <View style={styles.radioContent}>
                  <View style={[
                    styles.radioCircle,
                    settings.profileVisibility === option.value && styles.radioCircleSelected,
                  ]}>
                    {settings.profileVisibility === option.value && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                  <View style={styles.radioLabel}>
                    <Text style={styles.radioLabelText}>{option.label}</Text>
                    <Text style={styles.radioDescription}>{option.description}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Information Sharing Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information Sharing</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Show Email Address</Text>
                <Text style={styles.settingSubtitle}>
                  Allow others to see your email
                </Text>
              </View>
              <Switch
                value={settings.showEmail}
                onValueChange={() => toggleSetting('showEmail')}
                trackColor={{ false: COLORS.border, true: COLORS.primary + '60' }}
                thumbColor={settings.showEmail ? COLORS.primary : '#f4f3f4'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Show Department</Text>
                <Text style={styles.settingSubtitle}>
                  Display your department on your profile
                </Text>
              </View>
              <Switch
                value={settings.showDepartment}
                onValueChange={() => toggleSetting('showDepartment')}
                trackColor={{ false: COLORS.border, true: COLORS.primary + '60' }}
                thumbColor={settings.showDepartment ? COLORS.primary : '#f4f3f4'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Allow Messaging</Text>
                <Text style={styles.settingSubtitle}>
                  Let others send you messages
                </Text>
              </View>
              <Switch
                value={settings.allowMessaging}
                onValueChange={() => toggleSetting('allowMessaging')}
                trackColor={{ false: COLORS.border, true: COLORS.primary + '60' }}
                thumbColor={settings.allowMessaging ? COLORS.primary : '#f4f3f4'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Show Activity Status</Text>
                <Text style={styles.settingSubtitle}>
                  Let others see when you're active
                </Text>
              </View>
              <Switch
                value={settings.activityStatus}
                onValueChange={() => toggleSetting('activityStatus')}
                trackColor={{ false: COLORS.border, true: COLORS.primary + '60' }}
                thumbColor={settings.activityStatus ? COLORS.primary : '#f4f3f4'}
              />
            </View>
          </View>
        </View>

        {/* Data & Analytics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Analytics</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Analytics</Text>
                <Text style={styles.settingSubtitle}>
                  Help improve the app with anonymous usage data
                </Text>
              </View>
              <Switch
                value={settings.dataAnalytics}
                onValueChange={() => toggleSetting('dataAnalytics')}
                trackColor={{ false: COLORS.border, true: COLORS.primary + '60' }}
                thumbColor={settings.dataAnalytics ? COLORS.primary : '#f4f3f4'}
              />
            </View>
          </View>
        </View>

        {/* Data Management Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <View style={styles.card}>
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={handleExportData}
            >
              <View style={styles.actionIcon}>
                <IconSymbol name="download" size={18} color={COLORS.primary} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Export My Data</Text>
                <Text style={styles.actionSubtitle}>Download a copy of your data</Text>
              </View>
              <IconSymbol name="chevron-right" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => Linking.openURL('https://example.com/privacy-policy')}
            >
              <View style={styles.actionIcon}>
                <IconSymbol name="doc.text" size={18} color={COLORS.primary} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Privacy Policy</Text>
                <Text style={styles.actionSubtitle}>Read our privacy policy</Text>
              </View>
              <IconSymbol name="chevron-right" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => Linking.openURL('https://example.com/terms')}
            >
              <View style={styles.actionIcon}>
                <IconSymbol name="clipboard" size={18} color={COLORS.primary} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Terms of Service</Text>
                <Text style={styles.actionSubtitle}>Read our terms of service</Text>
              </View>
              <IconSymbol name="chevron-right" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: COLORS.error }]}>Danger Zone</Text>
          <View style={[styles.card, styles.dangerCard]}>
            <TouchableOpacity 
              style={styles.dangerButton}
              onPress={handleDeleteAccount}
            >
              <Text style={styles.dangerButtonText}>Delete Account</Text>
              <Text style={styles.dangerButtonSubtitle}>
                Permanently delete your account and all data
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
  },
  backButton: {
    padding: 4,
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  saveButton: {
    padding: 4,
  },
  saveButtonText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginHorizontal: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
  },
  radioItem: {
    padding: 16,
  },
  radioItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  radioContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioCircleSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  radioLabel: {
    flex: 1,
  },
  radioLabelText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  radioDescription: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionIconText: {
    fontSize: 18,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  actionArrow: {
    fontSize: 24,
    color: COLORS.textMuted,
    fontWeight: '300',
  },
  dangerCard: {
    borderWidth: 1,
    borderColor: COLORS.error + '30',
  },
  dangerButton: {
    padding: 16,
    alignItems: 'center',
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.error,
    marginBottom: 4,
  },
  dangerButtonSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
});

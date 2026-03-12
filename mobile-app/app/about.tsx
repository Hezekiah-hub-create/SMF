// @ts-nocheck
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Linking,
  Image,
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

const APP_INFO = {
  name: 'Feedback Management System',
  version: '1.0.0',
  buildNumber: '1001',
  releaseDate: '-----',
};

const FEATURES = [
  {
    icon: 'edit',
    title: 'Easy Feedback Submission',
    description: 'Submit feedback with categories, descriptions, and attachments',
  },
  {
    icon: 'bell',
    title: 'Real-time Notifications',
    description: 'Get instant updates on your feedback status',
  },
  {
    icon: 'chart.bar',
    title: 'Track Progress',
    description: 'Monitor the status of all your submitted feedback',
  },
  {
    icon: 'lock',
    title: 'Secure & Private',
    description: 'Your data is protected with industry-standard security',
  },
];

const LEGAL_LINKS = [
  {
    title: 'Privacy Policy',
    onPress: () => Linking.openURL('https://example.com/privacy-policy'),
  },
  {
    title: 'Terms of Service',
    onPress: () => Linking.openURL('https://example.com/terms'),
  },
  {
    title: 'Cookie Policy',
    onPress: () => Linking.openURL('https://example.com/cookies'),
  },
  {
    title: 'Open Source Licenses',
    onPress: () => {},
  },
];

export default function AboutScreen() {
  const router = useRouter();

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
          <Text style={styles.headerTitle}>About</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* App Logo and Info */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <IconSymbol name="school" size={48} color="#FFFFFF" />
          </View>
          <Text style={styles.appName}>{APP_INFO.name}</Text>
          <Text style={styles.versionText}>Version {APP_INFO.version}</Text>
          <Text style={styles.buildText}>Build {APP_INFO.buildNumber}</Text>
        </View>

        {/* Release Info */}
        <View style={styles.releaseCard}>
          <View style={styles.releaseRow}>
            <Text style={styles.releaseLabel}>Release Date</Text>
            <Text style={styles.releaseValue}>{APP_INFO.releaseDate}</Text>
          </View>
          <View style={styles.releaseDivider} />
          <View style={styles.releaseRow}>
            <Text style={styles.releaseLabel}>Platform</Text>
            <Text style={styles.releaseValue}>iOS & Android</Text>
          </View>
          <View style={styles.releaseDivider} />
          <View style={styles.releaseRow}>
            <Text style={styles.releaseLabel}>Developer</Text>
            <Text style={styles.releaseValue}>University IT Department</Text>
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.card}>
            {FEATURES.map((feature, index) => (
              <View
                key={index}
                style={[
                  styles.featureItem,
                  index < FEATURES.length - 1 && styles.featureItemBorder,
                ]}
              >
                <View style={styles.featureIcon}>
                  <IconSymbol name={feature.icon} size={20} color={COLORS.primary} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* What's New Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's New</Text>
          <View style={styles.card}>
            <View style={styles.whatsNewItem}>
              <Text style={styles.whatsNewVersion}>Version 1.0.0</Text>
              <Text style={styles.whatsNewDate}>-----</Text>
            </View>
            <View style={styles.whatsNewDivider} />
            <Text style={styles.whatsNewList}>
              • Initial release{'\n'}
              • Feedback submission{'\n'}
              • Status tracking{'\n'}
              • Push notifications{'\n'}
              • Profile management
            </Text>
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.card}>
            <TouchableOpacity 
              style={styles.supportItem}
              onPress={() => router.push('/help-support')}
            >
              <View style={styles.supportIconContainer}>
                <IconSymbol name="help" size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.supportText}>Help & FAQ</Text>
              <IconSymbol name="chevron-right" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
            <View style={styles.supportDivider} />
            <TouchableOpacity 
              style={styles.supportItem}
              onPress={() => {}}
            >
              <View style={styles.supportIconContainer}>
                <IconSymbol name="chat" size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.supportText}>Contact Us</Text>
              <IconSymbol name="chevron-right" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
            <View style={styles.supportDivider} />
            <TouchableOpacity 
              style={styles.supportItem}
              onPress={() => {}}
            >
              <View style={styles.supportIconContainer}>
                <IconSymbol name="star" size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.supportText}>Rate This App</Text>
              <IconSymbol name="chevron-right" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Legal Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <View style={styles.card}>
            {LEGAL_LINKS.map((link, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.legalItem,
                  index < LEGAL_LINKS.length - 1 && styles.legalItemBorder,
                ]}
                onPress={link.onPress}
              >
                <Text style={styles.legalText}>{link.title}</Text>
                <IconSymbol name="chevron-right" size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Copyright */}
        <View style={styles.copyright}>
          <Text style={styles.copyrightText}>
            © 2024 University. All rights reserved.
          </Text>
          <Text style={styles.copyrightText}>
            Feedback Management System
          </Text>
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
  logoSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoIcon: {
    fontSize: 48,
  },
  appName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  versionText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  buildText: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  releaseCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  releaseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  releaseLabel: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  releaseValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  releaseDivider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  section: {
    marginTop: 24,
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
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  featureItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureIconText: {
    fontSize: 20,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  whatsNewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  whatsNewVersion: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  whatsNewDate: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  whatsNewDivider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  whatsNewList: {
    padding: 16,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  supportIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  supportIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  supportText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  supportArrow: {
    fontSize: 20,
    color: COLORS.textMuted,
  },
  supportDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
  },
  legalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  legalItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  legalText: {
    fontSize: 15,
    color: COLORS.text,
  },
  legalArrow: {
    fontSize: 20,
    color: COLORS.textMuted,
  },
  copyright: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  copyrightText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
});

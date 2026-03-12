// @ts-nocheck
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
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

const FAQ_DATA = [
  {
    id: '1',
    question: 'How do I submit feedback?',
    answer: 'To submit feedback, tap on the Submit tab in the bottom navigation. Fill in the required fields including the category, title, and description of your feedback. You can also attach images if needed.',
  },
  {
    id: '2',
    question: 'How can I track my feedback status?',
    answer: 'You can track your feedback status by visiting the Feedback tab. Each feedback item shows its current status: Submitted, In Review, or Resolved.',
  },
  {
    id: '3',
    question: 'How long does it take to get a response?',
    answer: 'Response times vary depending on the nature of the feedback. Most feedback receives a response within 5-7 business days. Urgent matters are typically addressed within 48 hours.',
  },
  {
    id: '4',
    question: 'Can I edit or delete my feedback after submission?',
    answer: 'Once submitted, feedback cannot be edited. However, you can delete your own feedback from the Feedback tab before it receives a response.',
  },
  {
    id: '5',
    question: 'How do I change my password?',
    answer: 'Go to Profile > Change Password. Enter your current password and then create a new one. Make sure to follow the password requirements shown.',
  },
  {
    id: '6',
    question: 'Is my feedback anonymous?',
    answer: 'Yes, your feedback is treated with confidentiality. Only the relevant authorities can see your identity when addressing your feedback.',
  },
];

export default function HelpSupportScreen() {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
  });

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredFAQs = FAQ_DATA.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmitTicket = () => {
    if (!contactForm.subject || !contactForm.message) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    Alert.alert(
      'Ticket Submitted',
      'Your support ticket has been submitted. We will get back to you within 24-48 hours.',
      [
        {
          text: 'OK',
          onPress: () => {
            setContactForm({ subject: '', message: '' });
            setShowContactForm(false);
          },
        },
      ]
    );
  };

  const supportOptions = [
    {
      icon: 'mail',
      title: 'Email Support',
      subtitle: 'support@university.edu',
      onPress: () => {},
    },
    {
      icon: 'phone',
      title: 'Phone',
      subtitle: '+233 00 000 0000',
      onPress: () => {},
    },
    {
      icon: 'chat',
      title: 'Live Chat',
      subtitle: 'Available 9 AM - 5 PM',
      onPress: () => {},
    },
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
          <Text style={styles.headerTitle}>Help & Support</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <IconSymbol name="search" size={20} color={COLORS.textMuted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for help..."
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <IconSymbol name="close" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Quick Support Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.card}>
            {supportOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.supportOption,
                  index < supportOptions.length - 1 && styles.supportOptionBorder,
                ]}
                onPress={option.onPress}
              >
                <View style={styles.supportIcon}>
                  <IconSymbol name={option.icon} size={20} color={COLORS.primary} />
                </View>
                <View style={styles.supportContent}>
                  <Text style={styles.supportTitle}>{option.title}</Text>
                  <Text style={styles.supportSubtitle}>{option.subtitle}</Text>
                </View>
                <IconSymbol name="chevron-right" size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Submit Ticket Button */}
        {!showContactForm && (
          <TouchableOpacity 
            style={styles.ticketButton}
            onPress={() => setShowContactForm(true)}
          >
            <Text style={styles.ticketButtonText}>Submit a Support Ticket</Text>
          </TouchableOpacity>
        )}

        {/* Contact Form */}
        {showContactForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Submit a Ticket</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Subject</Text>
              <TextInput
                style={styles.input}
                value={contactForm.subject}
                onChangeText={(text) => setContactForm((prev) => ({ ...prev, subject: text }))}
                placeholder="Enter subject"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Message</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={contactForm.message}
                onChangeText={(text) => setContactForm((prev) => ({ ...prev, message: text }))}
                placeholder="Describe your issue..."
                placeholderTextColor={COLORS.textMuted}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setShowContactForm(false);
                  setContactForm({ subject: '', message: '' });
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleSubmitTicket}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.faqCard}>
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((faq, index) => (
                <TouchableOpacity
                  key={faq.id}
                  style={[
                    styles.faqItem,
                    index < filteredFAQs.length - 1 && styles.faqItemBorder,
                  ]}
                  onPress={() => toggleExpand(faq.id)}
                >
                  <View style={styles.faqQuestion}>
                    <Text style={styles.faqQuestionText}>{faq.question}</Text>
                    <IconSymbol 
                      name={expandedId === faq.id ? 'minus.circle' : 'plus.circle'} 
                      size={20} 
                      color={COLORS.primary} 
                    />
                  </View>
                  {expandedId === faq.id && (
                    <Text style={styles.faqAnswer}>{faq.answer}</Text>
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.noResults}>
                <Text style={styles.noResultsText}>
                  No FAQs found matching your search.
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>
            Feedback Management System v1.0.0
          </Text>
          <Text style={styles.appInfoText}>
            © 2026 Ho Technical University. All rights reserved.
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
    paddingTop: 16,
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  clearIcon: {
    fontSize: 16,
    color: COLORS.textMuted,
    padding: 4,
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
  supportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  supportOptionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  supportIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  supportIconText: {
    fontSize: 20,
  },
  supportContent: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  supportSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  supportArrow: {
    fontSize: 24,
    color: COLORS.textMuted,
    fontWeight: '300',
  },
  ticketButton: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  ticketButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  formCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  submitButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    marginLeft: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  faqCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  faqItem: {
    padding: 16,
  },
  faqItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: 12,
  },
  faqIcon: {
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: '600',
  },
  faqAnswer: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 12,
    lineHeight: 20,
  },
  noResults: {
    padding: 24,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  appInfoText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
});

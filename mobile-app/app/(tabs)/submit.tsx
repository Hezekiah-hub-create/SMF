// @ts-nocheck
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Dimensions,
  Modal,
  Pressable,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import feedbackService from '../../services/feedbackService';
import { IconSymbol } from '@/components/ui/icon-symbol';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

const C = {
  primary:      '#4169E1',
  primaryDark:  '#2D4DB8',
  primaryLight: '#EEF2FF',
  bg:           '#F0F4FF',
  card:         '#FFFFFF',
  text:         '#1E293B',
  textSub:      '#64748B',
  textMuted:    '#94A3B8',
  success:      '#10B981',
  successLight: '#ECFDF5',
  error:        '#EF4444',
  errorLight:   '#FEF2F2',
  border:       '#E2E8F0',
  white:        '#FFFFFF',
};

// ─── DFD P2 Categories (icon instead of emoji) ───────────────────
const CATEGORIES = [
  { value: 'course_related', label: 'Course Related', desc: 'Lecturer, course content, exams',    icon: 'book.fill',        color: '#4169E1', bg: '#EEF2FF' },
  { value: 'faculty_wide',   label: 'Faculty Wide',   desc: 'Faculty-level issues',               icon: 'building.columns', color: '#7C3AED', bg: '#F5F3FF' },
  { value: 'welfare',        label: 'Welfare',         desc: 'Student welfare & accommodation',   icon: 'heart.fill',       color: '#10B981', bg: '#ECFDF5' },
  { value: 'admission',      label: 'Admission',       desc: 'Admissions & registration',         icon: 'clipboard.fill',   color: '#F59E0B', bg: '#FFFBEB' },
  { value: 'quality',        label: 'Quality',         desc: 'Academic quality & standards',      icon: 'star.fill',        color: '#EF4444', bg: '#FEF2F2' },
  { value: 'mental_health',  label: 'Mental Health',   desc: 'Counseling & mental wellbeing',     icon: 'psychology',       color: '#EC4899', bg: '#FDF2F8' },
];

// ─── Step Indicator ───────────────────────────────────────────────
const StepIndicator = ({ current, total }) => (
  <View style={styles.stepRow}>
    {Array.from({ length: total }).map((_, i) => (
      <React.Fragment key={i}>
        <View style={[styles.stepDot, i < current && styles.stepDotDone, i === current - 1 && styles.stepDotActive]}>
          {i < current - 1 ? (
            <IconSymbol name="checkmark" size={10} color={C.white} />
          ) : (
            <Text style={[styles.stepNum, i === current - 1 && styles.stepNumActive]}>{i + 1}</Text>
          )}
        </View>
        {i < total - 1 && <View style={[styles.stepLine, i < current - 1 && styles.stepLineDone]} />}
      </React.Fragment>
    ))}
  </View>
);

// ─── Category Card ────────────────────────────────────────────────
const CategoryCard = ({ cat, selected, onPress }) => (
  <TouchableOpacity
    style={[styles.catCard, { backgroundColor: selected ? cat.color : cat.bg }, selected && styles.catCardSelected]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={[styles.catIconWrap, { backgroundColor: selected ? 'rgba(255,255,255,0.2)' : cat.color + '20' }]}>
      <IconSymbol name={cat.icon} size={24} color={selected ? C.white : cat.color} />
    </View>
    <Text style={[styles.catLabel, { color: selected ? C.white : cat.color }]}>{cat.label}</Text>
    <Text style={[styles.catDesc, { color: selected ? 'rgba(255,255,255,0.8)' : C.textSub }]} numberOfLines={2}>
      {cat.desc}
    </Text>
    {selected && (
      <View style={styles.catCheck}>
        <IconSymbol name="checkmark.circle.fill" size={18} color={C.white} />
      </View>
    )}
  </TouchableOpacity>
);

// ─── Success Screen ───────────────────────────────────────────────
const SuccessScreen = ({ onReset }) => (
  <View style={styles.successBox}>
    <View style={styles.successCircle}>
      <IconSymbol name="checkmark.circle.fill" size={64} color={C.success} />
    </View>
    <Text style={styles.successTitle}>Feedback Submitted!</Text>
    <Text style={styles.successSub}>
      Your feedback has been received and will be reviewed by the relevant department.
      You can track its status in the Feedback tab.
    </Text>
    <View style={styles.successInfo}>
      <IconSymbol name="bell.fill" size={14} color={C.primary} />
      <Text style={styles.successInfoText}>You'll be notified when there's an update</Text>
    </View>
    <TouchableOpacity style={styles.successBtn} onPress={onReset}>
      <IconSymbol name="square.and.pencil" size={16} color={C.white} />
      <Text style={styles.successBtnText}>Submit Another Feedback</Text>
    </TouchableOpacity>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────
export default function SubmitFeedbackScreen() {
  const { token } = useAuth();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showAnonModal, setShowAnonModal] = useState(false);
  const [showAnonInfoModal, setShowAnonInfoModal] = useState(false);
  const [showIdentifiedSubmitModal, setShowIdentifiedSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [titleFocused, setTitleFocused] = useState(false);
  const [descFocused, setDescFocused] = useState(false);
  const [location, setLocation] = useState(null);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [detectedPriority, setDetectedPriority] = useState('medium');

  const URGENT_KEYWORDS = ['urgent', 'emergency', 'critical', 'immediate', 'danger', 'harassment', 'abuse', 'suicide', 'crisis'];
  const HIGH_KEYWORDS = ['serious', 'important', 'failed', 'failing', 'discrimination', 'unfair', 'cheating', 'fraud', 'missing', 'lost'];

  const selectedCat = CATEGORIES.find(c => c.value === category);

  // Analyze text for priority
  React.useEffect(() => {
    const text = (title + ' ' + description).toLowerCase();
    if (URGENT_KEYWORDS.some(kw => text.includes(kw))) {
      setDetectedPriority('urgent');
    } else if (HIGH_KEYWORDS.some(kw => text.includes(kw))) {
      setDetectedPriority('high');
    } else {
      setDetectedPriority('medium');
    }
  }, [title, description]);

  const handleGetLocation = async () => {
    setFetchingLocation(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    } catch (error) {
      Alert.alert('Error', 'Could not fetch your location. Please try again.');
    } finally {
      setFetchingLocation(false);
    }
  };

  const handleNext = () => {
    if (!category) { Alert.alert('Select Category', 'Please select a category to continue.'); return; }
    setStep(2);
  };

  // Handle anonymous toggle - show modal when turning ON or OFF
  const handleAnonToggle = () => {
    if (isAnonymous) {
      // Turning OFF - show confirmation modal to warn about being identified
      setShowAnonModal(true);
    } else {
      // Turning ON - show information modal about anonymous submission
      setShowAnonInfoModal(true);
    }
  };

  const handleAnonConfirm = () => {
    setIsAnonymous(false);
    setShowAnonModal(false);
  };

  const handleAnonCancel = () => {
    setShowAnonModal(false);
  };

  // Handle anonymous info modal confirmation - turn on anonymous
  const handleAnonInfoConfirm = () => {
    setIsAnonymous(true);
    setShowAnonInfoModal(false);
  };

  const handleAnonInfoClose = () => {
    setShowAnonInfoModal(false);
  };

  const handleSubmit = async () => {
    if (!title.trim()) { Alert.alert('Missing Title', 'Please enter a title for your feedback.'); return; }
    if (!description.trim()) { Alert.alert('Missing Description', 'Please describe your feedback in detail.'); return; }
    
    // Show information modal when submitting anonymously
    if (isAnonymous) {
      Alert.alert(
        'Submit Anonymously?',
        'Your feedback will be submitted anonymously. You will not be able to track responses or receive direct notifications about updates.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Continue', 
            onPress: () => submitFeedback()
          }
        ]
      );
      return;
    }
    
    // Show popup when submitting as identified (not anonymous)
    setShowIdentifiedSubmitModal(true);
  };

  const handleIdentifiedSubmitConfirm = () => {
    setShowIdentifiedSubmitModal(false);
    submitFeedback();
  };

  const handleIdentifiedSubmitCancel = () => {
    setShowIdentifiedSubmitModal(false);
  };

  const submitFeedback = async () => {
    setSubmitting(true);
    try {
      await feedbackService.submitFeedback(token, { 
        title: title.trim(), 
        description: description.trim(), 
        category, 
        isAnonymous,
        location,
      });
      setStep(3);
    } catch {
      Alert.alert('Submission Failed', 'Could not submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => { setTitle(''); setDescription(''); setCategory(''); setIsAnonymous(false); setStep(1); };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerCircle} />
        <View style={styles.headerTop}>
          {step === 2 && (
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
              <IconSymbol name="chevron.left" size={20} color={C.white} />
            </TouchableOpacity>
          )}
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle}>
              {step === 1 ? 'Submit Feedback' : step === 2 ? 'Add Details' : 'Done!'}
            </Text>
            <Text style={styles.headerSub}>
              {step === 1 ? 'Choose a category below' : step === 2 ? `Category: ${selectedCat?.label}` : 'Feedback submitted'}
            </Text>
          </View>
        </View>
        {step < 3 && <StepIndicator current={step} total={2} />}
      </View>

      {/* ── Content ── */}
      {step === 3 ? (
        <ScrollView contentContainerStyle={styles.successScroll}>
          <SuccessScreen onReset={handleReset} />
        </ScrollView>
      ) : (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

            {/* Step 1: Category */}
            {step === 1 && (
              <View>
                <Text style={styles.sectionLabel}>What is your feedback about?</Text>
                <View style={styles.catGrid}>
                  {CATEGORIES.map(cat => (
                    <CategoryCard key={cat.value} cat={cat} selected={category === cat.value} onPress={() => setCategory(cat.value)} />
                  ))}
                </View>
                <TouchableOpacity style={[styles.nextBtn, !category && styles.nextBtnDisabled]} onPress={handleNext} disabled={!category} activeOpacity={0.85}>
                  <Text style={styles.nextBtnText}>Continue</Text>
                  <IconSymbol name="chevron.right" size={18} color={C.white} />
                </TouchableOpacity>
              </View>
            )}

            {/* Step 2: Details */}
            {step === 2 && (
              <View>
                {selectedCat && (
                  <View style={styles.catInfoRow}>
                    <View style={[styles.selectedCatPill, { backgroundColor: selectedCat.bg, borderColor: selectedCat.color, marginBottom: 0 }]}>
                      <IconSymbol name={selectedCat.icon} size={18} color={selectedCat.color} />
                      <Text style={[styles.selectedCatLabel, { color: selectedCat.color }]}>{selectedCat.label}</Text>
                    </View>
                    
                    <View style={[styles.priorityPill, { backgroundColor: detectedPriority === 'urgent' ? C.errorLight : detectedPriority === 'high' ? '#FEF3C7' : C.primaryLight }]}>
                      <Text style={[styles.priorityText, { color: detectedPriority === 'urgent' ? C.error : detectedPriority === 'high' ? '#D97706' : C.primary }]}>
                        {detectedPriority.toUpperCase()} PRIORITY
                      </Text>
                    </View>
                  </View>
                )}

                {/* Title */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Title <Text style={styles.required}>*</Text></Text>
                  <TextInput
                    style={[styles.input, titleFocused && styles.inputFocused]}
                    placeholder="Brief summary of your feedback"
                    placeholderTextColor={C.textMuted}
                    value={title}
                    onChangeText={setTitle}
                    maxLength={100}
                    onFocus={() => setTitleFocused(true)}
                    onBlur={() => setTitleFocused(false)}
                  />
                  <Text style={styles.charCount}>{title.length}/100</Text>
                </View>

                {/* Description */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Description <Text style={styles.required}>*</Text></Text>
                  <TextInput
                    style={[styles.input, styles.textArea, descFocused && styles.inputFocused]}
                    placeholder="Describe your feedback in detail..."
                    placeholderTextColor={C.textMuted}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                    maxLength={1000}
                    onFocus={() => setDescFocused(true)}
                    onBlur={() => setDescFocused(false)}
                  />
                  <Text style={styles.charCount}>{description.length}/1000</Text>
                </View>

                {/* Anonymous Toggle */}
                <TouchableOpacity style={[styles.anonRow, isAnonymous && styles.anonRowActive]} onPress={handleAnonToggle} activeOpacity={0.8}>
                  <View style={styles.anonLeft}>
                    <View style={[styles.anonIconWrap, { backgroundColor: isAnonymous ? C.primaryLight : C.bg }]}>
                      <IconSymbol name="person.fill" size={20} color={isAnonymous ? C.primary : C.textMuted} />
                    </View>
                    <View>
                      <Text style={styles.anonTitle}>Submit Anonymously</Text>
                      <Text style={styles.anonSub}>Your identity will not be shared</Text>
                    </View>
                  </View>
                  <View style={[styles.toggle, isAnonymous && styles.toggleOn]}>
                    <View style={[styles.toggleThumb, isAnonymous && styles.toggleThumbOn]} />
                  </View>
                </TouchableOpacity>

                {/* Location Tagging */}
                <TouchableOpacity 
                  style={[styles.locationRow, location && styles.locationRowActive]} 
                  onPress={handleGetLocation} 
                  disabled={fetchingLocation}
                  activeOpacity={0.8}
                >
                  <View style={styles.anonLeft}>
                    <View style={[styles.anonIconWrap, { backgroundColor: location ? C.successLight : C.bg }]}>
                      <IconSymbol name="location.fill" size={20} color={location ? C.success : C.textMuted} />
                    </View>
                    <View>
                      <Text style={styles.anonTitle}>{location ? 'Location Tagged' : 'Tag My Location'}</Text>
                      <Text style={styles.anonSub}>
                        {fetchingLocation ? 'Fetching...' : location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : 'Help us locate the issue'}
                      </Text>
                    </View>
                  </View>
                  {location && (
                    <TouchableOpacity onPress={() => setLocation(null)} style={styles.clearLocation}>
                      <IconSymbol name="xmark.circle.fill" size={20} color={C.error} />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>

                {/* Routing Info */}
                {selectedCat && (
                  <View style={[styles.routingInfo, { backgroundColor: selectedCat.bg, borderColor: selectedCat.color + '40' }]}>
                    <IconSymbol name="routing" size={16} color={selectedCat.color} />
                    <Text style={[styles.routingText, { color: selectedCat.color }]}>
                      This feedback will be automatically routed to the{' '}
                      <Text style={{ fontWeight: '800' }}>{selectedCat.label}</Text> department
                    </Text>
                  </View>
                )}

                {/* Submit Button */}
                <TouchableOpacity style={[styles.submitBtn, submitting && styles.submitBtnDisabled]} onPress={handleSubmit} disabled={submitting} activeOpacity={0.85}>
                  {submitting ? (
                    <Text style={styles.submitBtnText}>Submitting...</Text>
                  ) : (
                    <View style={styles.submitBtnInner}>
                      <IconSymbol name="paperplane.fill" size={18} color={C.white} />
                      <Text style={styles.submitBtnText}>Submit Feedback</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            )}

            <View style={{ height: 100 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      )}
      
      {/* Anonymous Confirmation Modal - shown when turning OFF anonymous */}
      <Modal visible={showAnonModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={handleAnonCancel}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalIconWrap}>
              <IconSymbol name="eye.fill" size={32} color={C.primary} />
            </View>
            <Text style={styles.modalTitle}>Go Identified?</Text>
            <Text style={styles.modalText}>
              Your feedback will no longer be anonymous. Your identity will be visible to the recipients.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={handleAnonCancel}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleAnonConfirm}>
                <Text style={styles.modalConfirmText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Anonymous Information Modal - shown when turning ON anonymous */}
      <Modal visible={showAnonInfoModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={handleAnonInfoClose}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={[styles.modalIconWrap, { backgroundColor: C.successLight }]}>
              <IconSymbol name="hand.raised.fill" size={32} color={C.success} />
            </View>
            <Text style={styles.modalTitle}>Submit Anonymously</Text>
            <Text style={styles.modalText}>
              Your feedback will be submitted anonymously. You will not be able to track responses or receive direct notifications about updates.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={handleAnonInfoClose}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalConfirmBtn, { backgroundColor: C.success }]} onPress={handleAnonInfoConfirm}>
                <Text style={styles.modalConfirmText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Identified Submit Modal - shown when submitting as identified (not anonymous) */}
      <Modal visible={showIdentifiedSubmitModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={handleIdentifiedSubmitCancel}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={[styles.modalIconWrap, { backgroundColor: '#FEF3C7' }]}>
              <IconSymbol name="person.fill" size={32} color="#F59E0B" />
            </View>
            <Text style={styles.modalTitle}>Submit as Identified?</Text>
            <Text style={styles.modalText}>
              Your feedback will be submitted with your identity visible. You will be able to track responses and receive direct notifications about updates.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={handleIdentifiedSubmitCancel}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleIdentifiedSubmitConfirm}>
                <Text style={styles.modalConfirmText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.primary },
  headerContainer: { backgroundColor: C.primary, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  scroll: { flex: 1, backgroundColor: C.bg },
  scrollContent: { padding: 16 },

  header: { backgroundColor: C.primary, paddingHorizontal: 20, paddingTop: 70, paddingBottom: 24, overflow: 'hidden', borderBottomLeftRadius: 24, borderBottomRightRadius: 24},
  headerCircle: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.07)', top: -60, right: -40 },
  headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  headerTextWrap: { flex: 1 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: C.white },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },

  stepRow: { flexDirection: 'row', alignItems: 'center' },
  stepDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },
  stepDotActive: { backgroundColor: C.white, borderColor: C.white },
  stepDotDone: { backgroundColor: 'rgba(255,255,255,0.9)', borderColor: C.white },
  stepNum: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.8)' },
  stepNumActive: { color: C.primary },
  stepLine: { flex: 1, height: 2, backgroundColor: 'rgba(255,255,255,0.25)', marginHorizontal: 6 },
  stepLineDone: { backgroundColor: C.white },

  sectionLabel: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 16, marginTop: 4 },

  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  catCard: {
    width: (width - 44) / 2, borderRadius: 16, padding: 16, position: 'relative',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  catCardSelected: { shadowOpacity: 0.2, shadowRadius: 10, elevation: 6, transform: [{ scale: 1.02 }] },
  catIconWrap: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  catLabel: { fontSize: 13, fontWeight: '800', marginBottom: 4 },
  catDesc: { fontSize: 11, lineHeight: 16 },
  catCheck: { position: 'absolute', top: 10, right: 10 },

  nextBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: C.primary, borderRadius: 14, paddingVertical: 16,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  nextBtnDisabled: { backgroundColor: C.textMuted, shadowOpacity: 0 },
  nextBtnText: { color: C.white, fontSize: 16, fontWeight: '700' },

  selectedCatPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, marginBottom: 20, gap: 8 },
  selectedCatLabel: { flex: 1, fontSize: 14, fontWeight: '700' },
  changeCatBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.06)' },
  changeCatText: { fontSize: 12, fontWeight: '700' },

  catInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  priorityPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  priorityText: { fontSize: 10, fontWeight: '900' },

  fieldGroup: { marginBottom: 20 },
  fieldLabel: { fontSize: 14, fontWeight: '700', color: C.text, marginBottom: 8 },
  required: { color: C.error },
  input: { backgroundColor: C.white, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: C.text, borderWidth: 1.5, borderColor: C.border },
  inputFocused: { borderColor: C.primary, backgroundColor: '#FAFBFF' },
  textArea: { minHeight: 130, paddingTop: 14, textAlignVertical: 'top' },
  charCount: { fontSize: 11, color: C.textMuted, textAlign: 'right', marginTop: 4 },

  anonRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.white, borderRadius: 14, padding: 14, borderWidth: 1.5, borderColor: C.border, marginBottom: 16 },
  anonRowActive: { borderColor: C.primary, backgroundColor: '#FAFBFF' },
  anonLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  anonIconWrap: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  anonTitle: { fontSize: 14, fontWeight: '700', color: C.text },
  anonSub: { fontSize: 12, color: C.textMuted, marginTop: 2 },
  toggle: { width: 48, height: 28, borderRadius: 14, backgroundColor: C.border, justifyContent: 'center', paddingHorizontal: 3 },
  toggleOn: { backgroundColor: C.primary },
  toggleThumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: C.white, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2 },
  toggleThumbOn: { transform: [{ translateX: 20 }] },

  locationRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.white, borderRadius: 14, padding: 14, borderWidth: 1.5, borderColor: C.border, marginBottom: 16 },
  locationRowActive: { borderColor: C.success, backgroundColor: '#F0FDF4' },
  clearLocation: { padding: 4 },

  routingInfo: { flexDirection: 'row', alignItems: 'flex-start', borderRadius: 12, padding: 14, borderWidth: 1, marginBottom: 20, gap: 10 },
  routingText: { flex: 1, fontSize: 13, lineHeight: 19 },

  submitBtn: { backgroundColor: C.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', shadowColor: C.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  submitBtnDisabled: { opacity: 0.6, shadowOpacity: 0 },
  submitBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  submitBtnText: { color: C.white, fontSize: 16, fontWeight: '700' },

  successScroll: { flexGrow: 1, backgroundColor: C.bg, justifyContent: 'center', padding: 24 },
  successBox: { alignItems: 'center' },
  successCircle: { width: 110, height: 110, borderRadius: 55, backgroundColor: C.successLight, justifyContent: 'center', alignItems: 'center', marginBottom: 24, borderWidth: 3, borderColor: C.success + '40' },
  successTitle: { fontSize: 24, fontWeight: '800', color: C.text, marginBottom: 12 },
  successSub: { fontSize: 14, color: C.textSub, textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  successInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.primaryLight, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 28 },
  successInfoText: { fontSize: 13, color: C.primary, fontWeight: '600' },
  successBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.primary, borderRadius: 14, paddingHorizontal: 32, paddingVertical: 16, shadowColor: C.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  successBtnText: { color: C.white, fontSize: 15, fontWeight: '700' },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { backgroundColor: C.white, borderRadius: 20, padding: 24, width: '100%', maxWidth: 340, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 },
  modalIconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: C.primaryLight, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: C.text, marginBottom: 12, textAlign: 'center' },
  modalText: { fontSize: 14, color: C.textSub, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  modalButtons: { flexDirection: 'row', gap: 12, width: '100%' },
  modalCancelBtn: { flex: 1, backgroundColor: C.bg, borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1.5, borderColor: C.border },
  modalCancelText: { fontSize: 15, fontWeight: '600', color: C.textSub },
  modalConfirmBtn: { flex: 1, backgroundColor: C.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center', shadowColor: C.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  modalConfirmText: { fontSize: 15, fontWeight: '600', color: C.white },
});


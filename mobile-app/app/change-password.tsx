// @ts-nocheck
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import { IconSymbol } from '../components/ui/icon-symbol';
import authService from '../services/authService';

const COLORS = {
  primary: '#4169E1',
  background: '#F8FAFC',
  card: '#FFFFFF',
  text: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  success: '#10B981',
  error: '#EF4444',
  border: '#E2E8F0',
  shadow: 'rgba(65, 105, 225, 0.08)',
};

export default function ChangePasswordScreen() {
  const { token } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const validateForm = () => {
    const newErrors = {};
    if (!formData.currentPassword) newErrors.currentPassword = 'Required';
    if (!formData.newPassword) newErrors.newPassword = 'Required';
    else if (formData.newPassword.length < 8) newErrors.newPassword = 'Too short';
    if (formData.newPassword !== formData.confirmPassword) newErrors.confirmPassword = 'Mismatch';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validateForm() || loading) return;
    setLoading(true);

    try {
      await authService.changePassword(token, formData.currentPassword, formData.newPassword);
      Alert.alert('Success', 'Password updated successfully', [{ text: 'Done', onPress: () => router.back() }]);
    } catch (error) {
      Alert.alert('Failed', error.response?.data?.message || 'Check your current password');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const toggleVisibility = (field) => setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Change Password</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Lock Icon */}
        <View style={styles.iconSection}>
          <View style={styles.iconContainer}>
            <IconSymbol name="lock.fill" size={36} color={COLORS.primary} />
          </View>
          <Text style={styles.iconTitle}>Security Update</Text>
          <Text style={styles.iconSubtitle}>Keep your account secure with a strong password.</Text>
        </View>

        {/* Form */}
        <View style={styles.formCard}>
          {[
            { label: 'Current Password', field: 'currentPassword', visibleKey: 'current' },
            { label: 'New Password', field: 'newPassword', visibleKey: 'new' },
            { label: 'Confirm Password', field: 'confirmPassword', visibleKey: 'confirm' },
          ].map((item, idx) => (
            <View key={idx} style={styles.inputGroup}>
              <Text style={styles.label}>{item.label}</Text>
              <View style={[styles.inputContainer, errors[item.field] && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  value={formData[item.field]}
                  onChangeText={(val) => updateField(item.field, val)}
                  secureTextEntry={!showPasswords[item.visibleKey]}
                  placeholder={`••••••••`}
                  placeholderTextColor={COLORS.textMuted}
                />
                <TouchableOpacity style={styles.eyeButton} onPress={() => toggleVisibility(item.visibleKey)}>
                  <IconSymbol name={showPasswords[item.visibleKey] ? "eye.slash.fill" : "eye.fill"} size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
              {errors[item.field] && <Text style={styles.errorText}>{errors[item.field]}</Text>}
            </View>
          ))}
        </View>

        {/* Requirements */}
        <View style={styles.reqCard}>
          <Text style={styles.reqTitle}>Must Contain:</Text>
          {[
            { test: formData.newPassword.length >= 8, label: '8+ Characters' },
            { test: /[A-Z]/.test(formData.newPassword), label: 'Uppercase Letter' },
            { test: /\d/.test(formData.newPassword), label: 'At least one Number' },
          ].map((req, i) => (
            <View key={i} style={styles.reqItem}>
              <IconSymbol name={req.test ? "checkmark.circle.fill" : "circle"} size={16} color={req.test ? COLORS.success : COLORS.textMuted} />
              <Text style={[styles.reqText, req.test && { color: COLORS.success, fontWeight: '700' }]}>{req.label}</Text>
            </View>
          ))}
        </View>

        {/* Submit */}
        <TouchableOpacity style={[styles.saveButton, loading && { opacity: 0.7 }]} onPress={handleChangePassword} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Update Password</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 16 },
  backButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  
  iconSection: { alignItems: 'center', paddingVertical: 24 },
  iconContainer: { width: 88, height: 88, borderRadius: 28, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 },
  iconTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginTop: 16 },
  iconSubtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', paddingHorizontal: 40, marginTop: 8, lineHeight: 20 },

  formCard: { backgroundColor: '#FFF', marginHorizontal: 20, borderRadius: 28, padding: 24, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 1, shadowRadius: 24, elevation: 4 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 8, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 16, borderWidth: 1, borderColor: '#F1F5F9' },
  inputError: { borderColor: COLORS.error + '40' },
  input: { flex: 1, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: COLORS.text },
  eyeButton: { padding: 12 },
  errorText: { color: COLORS.error, fontSize: 12, marginTop: 4, marginLeft: 4, fontWeight: '600' },
  
  reqCard: { backgroundColor: '#FFF', marginHorizontal: 20, marginTop: 20, borderRadius: 24, padding: 20, borderLeftWidth: 4, borderLeftColor: COLORS.primary },
  reqTitle: { fontSize: 14, fontWeight: '800', color: COLORS.text, marginBottom: 12 },
  reqItem: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  reqText: { fontSize: 13, color: COLORS.textMuted },
  
  saveButton: { backgroundColor: COLORS.primary, marginHorizontal: 20, marginTop: 28, borderRadius: 20, padding: 18, alignItems: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  saveButtonText: { fontSize: 17, fontWeight: '800', color: '#FFF' },
});

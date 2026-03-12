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

export default function PersonalInfoScreen() {
  const { user, token, updateUser } = useAuth();
  const router = useRouter();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.name || user?.fullName || '',
    email: user?.email || '',
    studentId: user?.studentId || '',
    department: user?.department || '',
    phone: user?.phone || '',
  });

  const handleSave = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const response = await authService.updateProfile(token, formData);
      await updateUser(response.user);
      
      Alert.alert(
        'Profile Updated',
        'Your changes have been saved successfully.',
        [{ text: 'Great', onPress: () => setIsEditing(false) }]
      );
    } catch (error) {
      Alert.alert('Update Failed', error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.name || user?.fullName || '',
      email: user?.email || '',
      studentId: user?.studentId || '',
      department: user?.department || '',
      phone: user?.phone || '',
    });
    setIsEditing(false);
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const initials = formData.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'US';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Personal Info</Text>
          <TouchableOpacity style={styles.editButton} onPress={() => isEditing ? handleCancel() : setIsEditing(true)}>
            <Text style={[styles.editButtonText, isEditing && { color: COLORS.error }]}>
              {isEditing ? 'Cancel' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Profile Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
            <TouchableOpacity style={styles.cameraButton}>
              <IconSymbol name="camera.fill" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.roleText, { color: COLORS.primary }]}>{user?.role?.toUpperCase() || 'USER'}</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formCard}>
          {[
            { label: 'Full Name', field: 'fullName', icon: 'person.fill' },
            { label: 'Email Address', field: 'email', icon: 'envelope.fill', keyboard: 'email-address' },
            { label: 'Student ID', field: 'studentId', icon: 'idcard.fill' },
            { label: 'Department', field: 'department', icon: 'building.2.fill' },
            { label: 'Phone Number', field: 'phone', icon: 'phone.fill', keyboard: 'phone-pad' },
          ].map((item, idx) => (
            <View key={idx} style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <IconSymbol name={item.icon} size={14} color={COLORS.textSecondary} />
                <Text style={styles.label}>{item.label}</Text>
              </View>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={formData[item.field]}
                onChangeText={(val) => updateField(item.field, val)}
                editable={isEditing}
                placeholder={`Your ${item.label.toLowerCase()}`}
                placeholderTextColor={COLORS.textMuted}
                keyboardType={item.keyboard || 'default'}
              />
            </View>
          ))}
        </View>

        {/* Save Button */}
        {isEditing && (
          <TouchableOpacity style={[styles.saveButton, loading && { opacity: 0.7 }]} onPress={handleSave} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
          </TouchableOpacity>
        )}

        {/* Account Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Meta Data</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Member Since</Text>
            <Text style={styles.infoValue}>{new Date(user?.createdAt || Date.now()).toLocaleDateString()}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Active</Text>
            <Text style={styles.infoValue}>Today</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 16 },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  editButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, backgroundColor: '#FFF', shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  editButtonText: { fontSize: 15, color: COLORS.primary, fontWeight: '700' },
  
  avatarSection: { alignItems: 'center', paddingVertical: 24 },
  avatarContainer: { position: 'relative' },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: '#FFF', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 10 },
  avatarInitials: { fontSize: 36, fontWeight: '800', color: '#FFF' },
  cameraButton: { position: 'absolute', bottom: 0, right: 0, width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFF' },
  roleText: { fontSize: 13, fontWeight: '800', marginTop: 16, letterSpacing: 1.5, opacity: 0.7 },

  formCard: { backgroundColor: '#FFF', marginHorizontal: 20, borderRadius: 28, padding: 24, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 1, shadowRadius: 24, elevation: 4 },
  inputGroup: { marginBottom: 20 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8, marginLeft: 4 },
  label: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#F8FAFC', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: COLORS.text, borderWidth: 1, borderColor: '#F1F5F9' },
  inputDisabled: { opacity: 0.7, color: COLORS.textSecondary, backgroundColor: '#FBFCFE' },
  
  saveButton: { backgroundColor: COLORS.primary, marginHorizontal: 20, marginTop: 24, borderRadius: 20, padding: 18, alignItems: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  saveButtonText: { fontSize: 17, fontWeight: '800', color: '#FFF' },
  
  infoCard: { backgroundColor: '#FFF', marginHorizontal: 20, marginTop: 20, borderRadius: 24, padding: 20, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 2 },
  infoTitle: { fontSize: 15, fontWeight: '800', color: COLORS.text, marginBottom: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  infoLabel: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '500' },
  infoValue: { fontSize: 14, fontWeight: '700', color: COLORS.text },
});

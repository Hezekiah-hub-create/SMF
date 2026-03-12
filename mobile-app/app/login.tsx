import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Pressable,
  Image,
  useWindowDimensions,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '../context/AuthContext'
import { Colors, BrandColors, FontSizes, Spacing, BorderRadius, Shadows } from '../constants/theme'
import { IconSymbol } from '../components/ui/icon-symbol'

// Design tokens from dashboard
const C = {
  primary:       '#4169E1',
  primaryDark:   '#2D4DB8',
  primaryLight:  '#EEF2FF',
  secondary:     '#7C3AED',
  secondaryLight:'#F5F3FF',
  bg:            '#F0F4FF',
  card:          '#FFFFFF',
  text:          '#1E293B',
  textSub:       '#64748B',
  textMuted:     '#94A3B8',
  success:       '#10B981',
  successLight:  '#ECFDF5',
  warning:       '#F59E0B',
  warningLight:  '#FFFBEB',
  error:         '#EF4444',
  errorLight:    '#FEF2F2',
  info:          '#3B82F6',
  infoLight:     '#EFF6FF',
  pink:          '#EC4899',
  pinkLight:     '#FDF2F8',
  border:        '#E2E8F0',
  white:         '#FFFFFF',
}

// Responsive hook
const useResponsive = () => {
  const { width, height } = useWindowDimensions()
  const isSmall = width < 360
  const isLarge = width >= 414
  const isTablet = Math.min(width, height) >= 600
  
  return {
    width,
    height,
    isSmall,
    isLarge,
    isTablet,
    isPortrait: height > width,
    isLandscape: width > height,
    scale: width / 375,
  }
}

export default function LoginScreen() {
  const router = useRouter()
  const { login, isLoading: authLoading } = useAuth()
  const responsive = useResponsive()
  const { isSmall, isLarge, isTablet } = responsive
  
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    setError('')
    
    if (!identifier.trim()) {
      setError('Please enter your email or student ID')
      return
    }
    
    if (!password.trim()) {
      setError('Please enter your password')
      return
    }

    setLoading(true)
    
    try {
      const result = await login(identifier, password, rememberMe)
      
      if (!result.success) {
        setError(result.error || 'Invalid credentials. Please try again.')
      } else {
        router.replace('/(tabs)')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = () => {
    // TODO: Navigate to forgot password screen
  }

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section - Modern design like dashboard */}
          <View style={[styles.hero, { paddingHorizontal: isSmall ? 16 : 20 }]}>
            {/* Circular decorations */}
            <View style={styles.heroCircle1} />
            <View style={styles.heroCircle2} />
            <View style={styles.heroCircle3} />

            {/* Logo and branding */}
            <View style={styles.heroContent}>
              <View style={[styles.logoContainer, { 
                width: isSmall ? 70 : isLarge ? 90 : 80, 
                height: isSmall ? 70 : isLarge ? 90 : 80,
                borderRadius: (isSmall ? 70 : isLarge ? 90 : 80) / 2 
              }]}>
                <Image
                  source={require('../assets/images/logo.jpg')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
              
              <Text style={[styles.appName, { fontSize: isSmall ? 22 : isLarge ? 28 : 24 }]}>
                Student Feedback
              </Text>
              <Text style={[styles.appSubtitle, { fontSize: isSmall ? 14 : 16 }]}>
                Management System
              </Text>

              {/* Role badges */}
              <View style={styles.heroBadges}>
                <View style={styles.badge}>
                  <IconSymbol name="school" size={12} color={C.white} />
                  <Text style={styles.badgeText}>Student</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Form Section */}
          <View style={[styles.formSection, { paddingHorizontal: isSmall ? 16 : 20 }]}>
            <View style={styles.formCard}>
              {/* Welcome header */}
              <View style={styles.formHeader}>
                <Text style={styles.welcomeText}>Welcome Back</Text>
                <Text style={styles.welcomeSubtext}>Sign in to continue</Text>
              </View>

              {/* Error Message */}
              {error ? (
                <View style={styles.errorContainer}>
                  <IconSymbol name="exclamationmark.triangle.fill" size={18} color={C.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Email/ID Input with icon */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Email or Student ID</Text>
                <View style={styles.inputContainer}>
                  <View style={styles.inputIcon}>
                    <IconSymbol name="envelope.fill" size={18} color={C.primary} />
                  </View>
                  <TextInput
                    style={[styles.input, { paddingLeft: isSmall ? 40 : 44 }]}
                    placeholder="Enter your email or student ID"
                    placeholderTextColor={C.textMuted}
                    value={identifier}
                    onChangeText={setIdentifier}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading && !authLoading}
                    returnKeyType="next"
                  />
                </View>
              </View>

              {/* Password Input with icon */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.inputContainer}>
                  <View style={styles.inputIcon}>
                    <IconSymbol name="lock.fill" size={18} color={C.primary} />
                  </View>
                  <TextInput
                    style={[styles.input, styles.passwordInput, { paddingLeft: isSmall ? 40 : 44, paddingRight: isSmall ? 40 : 50 }]}
                    placeholder="Enter your password"
                    placeholderTextColor={C.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    editable={!loading && !authLoading}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.7}
                  >
                    <IconSymbol
                      name={showPassword ? 'eye.slash.fill' : 'eye.fill'}
                      size={20}
                      color={C.textMuted}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Remember Me & Forgot Password */}
              <View style={styles.optionsRow}>
                <Pressable
                  style={styles.rememberMeContainer}
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                    {rememberMe && <IconSymbol name="checkmark" size={12} color={C.white} />}
                  </View>
                  <Text style={styles.rememberMeText}>Remember me</Text>
                </Pressable>
                
                <TouchableOpacity onPress={handleForgotPassword}>
                  <Text style={styles.forgotPassword}>Forgot password?</Text>
                </TouchableOpacity>
              </View>

              {/* Sign In Button */}
              <TouchableOpacity
                style={[
                  styles.loginButton,
                  (loading || authLoading) && styles.loginButtonDisabled
                ]}
                onPress={handleLogin}
                disabled={loading || authLoading}
                activeOpacity={0.85}
              >
                {loading || authLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <View style={styles.loginButtonContent}>
                    <Text style={styles.loginButtonText}>Sign In</Text>
                    <IconSymbol name="arrow.right" size={18} color={C.white} />
                  </View>
                )}
              </TouchableOpacity>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  Don't have an account?{' '}
                  <Text style={styles.signupLink}>Contact Support</Text>
                </Text>
              </View>
            </View>

            {/* Copyright */}
            <Text style={styles.copyrightText}>
              Powered by University IT Services
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.primary, },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1 },

  // Hero Section - Modern design
  hero: {
    backgroundColor: C.primary,
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 20,
    overflow: 'hidden',
    position: 'relative',
    borderBottomRightRadius: 24,
    borderBottomLeftRadius: 24,
  },
  heroCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -60,
    right: -40,
  },
  heroCircle2: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.06)',
    bottom: -30,
    left: -20,
  },
  heroCircle3: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.04)',
    top: 40,
    left: 20,
  },
  heroContent: {
    alignItems: 'center',
    zIndex: 2,
  },
  logoContainer: {
    backgroundColor: C.white,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
    ...Shadows.large,
  },
  logoImage: {
    width: '95%',
    height: '95%',
  },
  appName: {
    fontWeight: '800',
    color: C.white,
    marginBottom: 4,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  appSubtitle: {
    fontWeight: '500',
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 20,
    textAlign: 'center',
  },
  heroBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  badgeSecondary: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  badgeTertiary: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  badgeText: {
    fontSize: 12,
    color: C.white,
    fontWeight: '600',
  },

  // Form Section
  formSection: {
    flex: 1,
    backgroundColor: C.bg,
    paddingTop: 28,
    paddingBottom: 32,
  },
  formCard: {
    backgroundColor: C.card,
    borderRadius: 24,
    padding: 24,
    ...Shadows.large,
  },
  formHeader: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: '800',
    color: C.text,
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 15,
    color: C.textSub,
  },

  // Error Message
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.errorLight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 10,
  },
  errorText: {
    flex: 1,
    color: C.error,
    fontSize: 14,
    fontWeight: '500',
  },

  // Input Fields
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: C.text,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 1,
  },
  input: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: C.border,
    borderRadius: 14,
    fontSize: 15,
    color: C.text,
    backgroundColor: C.bg,
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },

  // Options Row
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: C.border,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.bg,
  },
  checkboxChecked: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  rememberMeText: {
    color: C.textSub,
    fontSize: 14,
    fontWeight: '500',
  },
  forgotPassword: {
    color: C.primary,
    fontSize: 14,
    fontWeight: '600',
  },

  // Login Button
  loginButton: {
    backgroundColor: C.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
    ...Shadows.medium,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loginButtonText: {
    color: C.white,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingTop: 4,
  },
  footerText: {
    color: C.textSub,
    fontSize: 14,
  },
  signupLink: {
    color: C.primary,
    fontWeight: '700',
  },
  copyrightText: {
    textAlign: 'center',
    color: C.textMuted,
    fontSize: 12,
    marginTop: 24,
  },
})

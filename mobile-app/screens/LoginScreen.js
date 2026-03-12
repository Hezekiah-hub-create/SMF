// import React, { useState } from 'react'
// import {
//   View,
//   TextInput,
//   TouchableOpacity,
//   Text,
//   StyleSheet,
//   ActivityIndicator,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   Image,
// } from 'react-native'
// import { useAuth } from '../context/AuthContext'

// const LoginScreen = ({ navigation }) => {
//   const [identifier, setIdentifier] = useState('')
//   const [password, setPassword] = useState('')
//   const [rememberMe, setRememberMe] = useState(false)
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')
//   const { login } = useAuth()

//   const handleLogin = async () => {
//     setError('')
//     if (!identifier.trim() || !password.trim()) {
//       setError('Please enter your email/ID and password')
//       return
//     }

//     setLoading(true)
//     const result = await login(identifier, password, rememberMe)
//     setLoading(false)

//     if (!result.success) {
//       setError(result.error || 'Invalid credentials')
//     }
//   }

//   return (
//     <KeyboardAvoidingView
//       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       style={styles.container}
//     >
//       <ScrollView 
//         contentContainerStyle={styles.scrollContainer}
//         keyboardShouldPersistTaps="handled"
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Top Section - Logo & Branding */}
//         <View style={styles.topSection}>
//           <View style={styles.logoWrapper}>
//             <View style={styles.logoContainer}>
//               <Text style={styles.logoIcon}>🎓</Text>
//             </View>
//             <View style={styles.logoGlow} />
//           </View>
          
//           <Text style={styles.appName}>SFMS</Text>
//           <Text style={styles.appTagline}>Student Feedback Management System</Text>
//         </View>

//         {/* Bottom Section - Login Form */}
//         <View style={styles.formSection}>
//           <View style={styles.formCard}>
//             <Text style={styles.welcomeText}>Welcome Back</Text>
//             <Text style={styles.welcomeSubtext}>Sign in to continue</Text>

//             {error ? (
//               <View style={styles.errorContainer}>
//                 <Text style={styles.errorIcon}>⚠️</Text>
//                 <Text style={styles.errorText}>{error}</Text>
//               </View>
//             ) : null}

//             <View style={styles.inputContainer}>
//               <View style={styles.inputWrapper}>
//                 <Text style={styles.inputLabel}>Email or Student ID</Text>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Enter your email or student ID"
//                   placeholderTextColor="#9CA3AF"
//                   value={identifier}
//                   onChangeText={setIdentifier}
//                   keyboardType="email-address"
//                   autoCapitalize="none"
//                   editable={!loading}
//                 />
//               </View>

//               <View style={styles.inputWrapper}>
//                 <Text style={styles.inputLabel}>Password</Text>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Enter your password"
//                   placeholderTextColor="#9CA3AF"
//                   value={password}
//                   onChangeText={setPassword}
//                   secureTextEntry
//                   editable={!loading}
//                 />
//               </View>
//             </View>

//             <View style={styles.optionsRow}>
//               <TouchableOpacity 
//                 style={styles.rememberMeContainer}
//                 onPress={() => setRememberMe(!rememberMe)}
//               >
//                 <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
//                   {rememberMe && <Text style={styles.checkmark}>✓</Text>}
//                 </View>
//                 <Text style={styles.rememberMeText}>Remember me</Text>
//               </TouchableOpacity>
              
//               <TouchableOpacity>
//                 <Text style={styles.forgotPassword}>Forgot password?</Text>
//               </TouchableOpacity>
//             </View>

//             <TouchableOpacity
//               style={[styles.loginButton, loading && styles.loginButtonDisabled]}
//               onPress={handleLogin}
//               disabled={loading}
//               activeOpacity={0.8}
//             >
//               {loading ? (
//                 <ActivityIndicator color="#fff" size="small" />
//               ) : (
//                 <Text style={styles.loginButtonText}>Sign In</Text>
//               )}
//             </TouchableOpacity>

//             <View style={styles.footer}>
//               <Text style={styles.footerText}>
//                 Don't have an account?{' '}
//                 <Text style={styles.signupLink}>Contact Support</Text>
//               </Text>
//             </View>
//           </View>

//           {/* Footer Text */}
//           <Text style={styles.copyrightText}>
//             Powered by University IT Services
//           </Text>
//         </View>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   )
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#4F46E5',
//   },
//   scrollContainer: {
//     flexGrow: 1,
//   },
//   // Top Section - Logo
//   topSection: {
//     alignItems: 'center',
//     paddingTop: 60,
//     paddingBottom: 40,
//     paddingHorizontal: 20,
//   },
//   logoWrapper: {
//     position: 'relative',
//     marginBottom: 16,
//   },
//   logoContainer: {
//     width: 100,
//     height: 100,
//     borderRadius: 24,
//     backgroundColor: '#fff',
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.2,
//     shadowRadius: 16,
//     elevation: 8,
//     zIndex: 2,
//   },
//   logoIcon: {
//     fontSize: 48,
//   },
//   logoGlow: {
//     position: 'absolute',
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     backgroundColor: '#4338CA',
//     top: -10,
//     left: -10,
//     opacity: 0.5,
//     zIndex: 1,
//   },
//   appName: {
//     fontSize: 32,
//     fontWeight: 'bold',
//     color: '#fff',
//     marginBottom: 4,
//     letterSpacing: 2,
//   },
//   appTagline: {
//     fontSize: 14,
//     color: '#C7D2FE',
//     textAlign: 'center',
//   },
//   // Bottom Section - Form
//   formSection: {
//     flex: 1,
//     backgroundColor: '#F9FAFB',
//     borderTopLeftRadius: 32,
//     borderTopRightRadius: 32,
//     paddingTop: 32,
//     paddingHorizontal: 24,
//     paddingBottom: 40,
//   },
//   formCard: {
//     backgroundColor: '#fff',
//     borderRadius: 24,
//     padding: 28,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 12,
//     elevation: 4,
//   },
//   welcomeText: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#111827',
//     marginBottom: 4,
//   },
//   welcomeSubtext: {
//     fontSize: 14,
//     color: '#6B7280',
//     marginBottom: 24,
//   },
//   errorContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FEF2F2',
//     borderRadius: 12,
//     padding: 14,
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: '#FECACA',
//   },
//   errorIcon: {
//     fontSize: 16,
//     marginRight: 10,
//   },
//   errorText: {
//     flex: 1,
//     color: '#DC2626',
//     fontSize: 13,
//     fontWeight: '500',
//   },
//   inputContainer: {
//     marginBottom: 20,
//   },
//   inputWrapper: {
//     marginBottom: 18,
//   },
//   inputLabel: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: '#374151',
//     marginBottom: 8,
//     textTransform: 'uppercase',
//     letterSpacing: 0.5,
//   },
//   input: {
//     width: '100%',
//     paddingHorizontal: 16,
//     paddingVertical: 14,
//     borderWidth: 2,
//     borderColor: '#E5E7EB',
//     borderRadius: 12,
//     fontSize: 15,
//     color: '#111827',
//     backgroundColor: '#F9FAFB',
//   },
//   optionsRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 28,
//   },
//   rememberMeContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   checkbox: {
//     width: 22,
//     height: 22,
//     borderRadius: 6,
//     borderWidth: 2,
//     borderColor: '#D1D5DB',
//     marginRight: 10,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//   },
//   checkboxChecked: {
//     backgroundColor: '#4F46E5',
//     borderColor: '#4F46E5',
//   },
//   checkmark: {
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: 'bold',
//   },
//   rememberMeText: {
//     color: '#4B5563',
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   forgotPassword: {
//     color: '#4F46E5',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   loginButton: {
//     backgroundColor: '#4F46E5',
//     borderRadius: 14,
//     paddingVertical: 16,
//     alignItems: 'center',
//     marginBottom: 20,
//     shadowColor: '#4F46E5',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   loginButtonDisabled: {
//     opacity: 0.6,
//   },
//   loginButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '700',
//     letterSpacing: 0.5,
//   },
//   footer: {
//     alignItems: 'center',
//     paddingTop: 8,
//   },
//   footerText: {
//     color: '#6B7280',
//     fontSize: 14,
//   },
//   signupLink: {
//     color: '#4F46E5',
//     fontWeight: '700',
//   },
//   copyrightText: {
//     textAlign: 'center',
//     color: '#9CA3AF',
//     fontSize: 12,
//     marginTop: 24,
//   },
// })

// export default LoginScreen

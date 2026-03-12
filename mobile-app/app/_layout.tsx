import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import 'react-native-reanimated'
import { AuthProvider, useAuth } from '../context/AuthContext'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { View, ActivityIndicator } from 'react-native'

function AuthLayout() {
  // @ts-ignore - AuthContext is JS, types not fully available
  const { token, isLoading } = useAuth()
  const colorScheme = useColorScheme()

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#4169e1' }}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <StatusBar style="light" />
      </View>
    )
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ 
            gestureEnabled: false,
          }} 
        />
        <Stack.Screen 
          name="login" 
          options={{ 
            gestureEnabled: false,
          }} 
        />
        {/* <Stack.Screen name="register" /> */}
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="feedback-detail" options={{ gestureEnabled: true }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
    </ThemeProvider>
  )
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthLayout />
    </AuthProvider>
  )
}

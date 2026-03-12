import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useAuth } from '../context/AuthContext'
import LoginScreen from '../screens/LoginScreen'
import DashboardScreen from '../screens/DashboardScreen'
import FeedbackDetail from '../src/screens/feedback/FeedbackDetail'
import NotificationsScreen from '../src/screens/notifications/NotificationsScreen'
import ChatbotScreen from '../src/screens/chatbot/ChatbotScreen'
import ActivityIndicator from 'react-native'

const Stack = createNativeStackNavigator()

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
  </Stack.Navigator>
)

const AppStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Dashboard" component={DashboardScreen} />
    <Stack.Screen name="FeedbackDetail" component={FeedbackDetail} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
    <Stack.Screen name="Chatbot" component={ChatbotScreen} />
  </Stack.Navigator>
)

const RootNavigator = () => {
  const { token, isLoading } = useAuth()

  if (isLoading) {
    return (
      <ActivityIndicator
        size="large"
        color="#2563eb"
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      />
    )
  }

  return (
    <NavigationContainer>
      {token ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  )
}

export default RootNavigator

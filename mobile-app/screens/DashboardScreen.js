import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../context/AuthContext'
import feedbackService from '../services/feedbackService'

const DashboardScreen = ({ navigation }) => {
  const { user, token, logout } = useAuth()
  const [feedbackList, setFeedbackList] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadFeedback = async () => {
    if (!token) return
    
    try {
      // For students, get their own feedback; for staff, get all assigned feedback
      const isStudent = user?.role === 'student'
      const data = isStudent 
        ? await feedbackService.getMyFeedback(token)
        : await feedbackService.getFeedback(token)
      
      setFeedbackList(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load feedback:', error)
      // Don't show error for network issues - just show empty state
      // This is expected if server is not running or device is offline
      setFeedbackList([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadFeedback()
  }, [token])

  const onRefresh = () => {
    setRefreshing(true)
    loadFeedback()
  }

  const renderFeedbackItem = ({ item }) => (
    <TouchableOpacity
      style={styles.feedbackCard}
      onPress={() => navigation.navigate('FeedbackDetail', { feedbackId: item._id || item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.feedbackTitle} numberOfLines={2}>
          {item.title || 'Feedback'}
        </Text>
        <View style={[styles.badge, styles[`badge-${item.status?.toLowerCase()}`]]}>
          <Text style={styles.badgeText}>{item.status || 'Pending'}</Text>
        </View>
      </View>
      <Text style={styles.feedbackDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.cardFooter}>
        <Text style={styles.timestamp}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        {item.responses && item.responses.length > 0 && (
          <Text style={styles.responseCount}>{item.responses.length} responses</Text>
        )}
      </View>
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name}</Text>
          <Text style={styles.role}>{user?.role}</Text>
          {user?.department && (
            <View style={styles.departmentContainer}>
              <Text style={styles.departmentText}>
                {user.department}
                {user.faculty && ` • ${user.faculty}`}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.notifButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Text style={styles.notifText}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={async () => {
              await logout()
            }}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Floating Action Button for Chatbot */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Chatbot')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>💬</Text>
      </TouchableOpacity>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{feedbackList.length}</Text>
          <Text style={styles.statLabel}>Total Feedback</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {feedbackList.filter((f) => f.status === 'Pending').length}
          </Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Recent Feedback</Text>

      {feedbackList.length > 0 ? (
        <FlatList
          data={feedbackList}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderFeedbackItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No feedback items yet</Text>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  role: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  departmentContainer: {
    marginTop: 4,
  },
  departmentText: {
    fontSize: 11,
    color: '#2563eb',
    fontWeight: '500',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notifButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  notifText: {
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  feedbackCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  feedbackTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  'badge-pending': {
    backgroundColor: '#fef08a',
  },
  'badge-resolved': {
    backgroundColor: '#dcfce7',
  },
  'badge-escalated': {
    backgroundColor: '#fee2e2',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1e293b',
  },
  feedbackDescription: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 8,
  },
  timestamp: {
    fontSize: 11,
    color: '#94a3b8',
  },
  responseCount: {
    fontSize: 11,
    color: '#2563eb',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  // Floating Action Button styles
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  fabText: {
    fontSize: 28,
  },
})

export default DashboardScreen

import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../../context/AuthContext'
import feedbackService from '../../services/feedbackService'

const FeedbackDetail = ({ route, navigation }) => {
  const { feedbackId } = route.params
  const { token } = useAuth()
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadFeedbackDetail = async () => {
    if (!token || !feedbackId) return

    try {
      const data = await feedbackService.getFeedbackById(token, feedbackId)
      setFeedback(data)
    } catch (error) {
      console.error('Failed to load feedback detail:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadFeedbackDetail()
  }, [feedbackId, token])

  const onRefresh = () => {
    setRefreshing(true)
    loadFeedbackDetail()
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'new':
        return '#3b82f6'
      case 'routed':
        return '#8b5cf6'
      case 'in_progress':
        return '#f59e0b'
      case 'resolved':
        return '#22c55e'
      case 'escalated':
        return '#ef4444'
      case 'closed':
        return '#6b7280'
      default:
        return '#6b7280'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'new':
        return 'New'
      case 'routed':
        return 'Routed'
      case 'in_progress':
        return 'In Progress'
      case 'resolved':
        return 'Resolved'
      case 'escalated':
        return 'Escalated'
      case 'closed':
        return 'Closed'
      default:
        return status
    }
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    )
  }

  if (!feedback) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Feedback not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const responses = feedback.responses || []

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBack}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Feedback Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Feedback Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.feedbackTitle}>{feedback.title}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(feedback.status) },
              ]}
            >
              <Text style={styles.statusText}>
                {getStatusLabel(feedback.status)}
              </Text>
            </View>
          </View>

          <Text style={styles.categoryLabel}>
            Category: {feedback.category?.replace('_', ' ').toUpperCase()}
          </Text>

          <Text style={styles.description}>{feedback.description}</Text>

          <View style={styles.metaInfo}>
            <Text style={styles.metaText}>
              Submitted: {formatDate(feedback.createdAt)}
            </Text>
            {feedback.priority && (
              <Text style={styles.metaText}>
                Priority: {feedback.priority.toUpperCase()}
              </Text>
            )}
          </View>

          {feedback.resolutionNote && (
            <View style={styles.resolutionCard}>
              <Text style={styles.resolutionTitle}>Resolution Note:</Text>
              <Text style={styles.resolutionText}>{feedback.resolutionNote}</Text>
              {feedback.resolvedBy && (
                <Text style={styles.resolvedBy}>
                  Resolved by: {feedback.resolvedBy.name}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Responses Section */}
        <Text style={styles.sectionTitle}>
          Responses ({responses.length})
        </Text>

        {responses.length > 0 ? (
          responses.map((response, index) => (
            <View
              key={response._id || index}
              style={[
                styles.responseCard,
                response.isInternal && styles.internalResponse,
              ]}
            >
              <View style={styles.responseHeader}>
                <Text style={styles.responderName}>
                  {response.respondedBy?.name || 'Staff Member'}
                </Text>
                <Text style={styles.responseDate}>
                  {formatDate(response.createdAt)}
                </Text>
              </View>
              {response.isInternal && (
                <View style={styles.internalBadge}>
                  <Text style={styles.internalBadgeText}>Internal Note</Text>
                </View>
              )}
              <Text style={styles.responseMessage}>{response.message}</Text>
              {response.isResolution && (
                <View style={styles.resolutionBadge}>
                  <Text style={styles.resolutionBadgeText}>
                    ✓ Final Resolution
                  </Text>
                </View>
              )}
            </View>
          ))
        ) : (
          <View style={styles.noResponses}>
            <Text style={styles.noResponsesText}>
              No responses yet. Staff will respond to your feedback soon.
            </Text>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
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
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerBack: {
    padding: 4,
  },
  backText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  headerSpacer: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
    marginBottom: 12,
  },
  feedbackTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 12,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
    marginBottom: 16,
  },
  metaInfo: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  metaText: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
  },
  resolutionCard: {
    backgroundColor: '#dcfce7',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  resolutionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 8,
  },
  resolutionText: {
    fontSize: 14,
    color: '#166534',
    lineHeight: 20,
  },
  resolvedBy: {
    fontSize: 12,
    color: '#15803d',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  responseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  internalResponse: {
    borderLeftColor: '#f59e0b',
    backgroundColor: '#fffbeb',
  },
  responseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  responderName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  responseDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  internalBadge: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  internalBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  responseMessage: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
  },
  resolutionBadge: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  resolutionBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  noResponses: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  noResponsesText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 20,
  },
})

export default FeedbackDetail

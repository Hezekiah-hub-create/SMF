import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import feedbackService from '../../services/feedbackService';

const FeedbackDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Form states
  const [responseMessage, setResponseMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [showRespondForm, setShowRespondForm] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [escalationNote, setEscalationNote] = useState('');
  const [showEscalateForm, setShowEscalateForm] = useState(false);

  useEffect(() => {
    fetchFeedback();
  }, [id]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const data = await feedbackService.getFeedbackById(id);
      setFeedback(data);
    } catch (err) {
      setError(err.message || 'Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (e) => {
    e.preventDefault();
    if (!responseMessage.trim()) return;
    
    try {
      setActionLoading(true);
      await feedbackService.respondToFeedback(id, {
        message: responseMessage,
        isInternal
      });
      setResponseMessage('');
      setIsInternal(false);
      setShowRespondForm(false);
      fetchFeedback(); // Refresh data
    } catch (err) {
      alert(err.message || 'Failed to send response');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await feedbackService.resolveFeedback(id, {
        resolutionNote: resolutionNote || 'Resolved by handler'
      });
      setResolutionNote('');
      setShowResolveForm(false);
      fetchFeedback(); // Refresh data
    } catch (err) {
      alert(err.message || 'Failed to resolve feedback');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEscalate = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await feedbackService.escalateFeedback(id, {
        note: escalationNote || 'Escalated for further action'
      });
      setEscalationNote('');
      setShowEscalateForm(false);
      fetchFeedback(); // Refresh data
    } catch (err) {
      alert(err.message || 'Failed to escalate feedback');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      new: '#4169e1',
      routed: '#4169e1',
      in_progress: '#f59e0b',
      resolved: '#10b981',
      closed: '#6b7280',
      escalated: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#ef4444',
      urgent: '#dc2626'
    };
    return colors[priority] || '#6b7280';
  };

  const getCategoryLabel = (category) => {
    const labels = {
      course_related: 'Course Related',
      faculty_wide: 'Faculty Wide',
      welfare: 'Welfare',
      admission: 'Admission',
      quality: 'Quality',
      mental_health: 'Mental Health'
    };
    return labels[category] || category;
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{ color: '#6b7280' }}>Loading feedback details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ color: '#ef4444', marginBottom: '16px' }}>Error: {error}</div>
        <button 
          onClick={() => navigate(-1)}
          style={{ padding: '8px 16px', background: '#4169e1', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ color: '#6b7280' }}>Feedback not found</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <button 
            onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', color: '#4169e1', cursor: 'pointer', marginBottom: '8px', padding: 0 }}
          >
            ← Back
          </button>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: '#1f2937' }}>{feedback.title}</h1>
          <div style={{ color: '#6b7280', marginTop: '4px' }}>ID: {feedback._id || id}</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{ 
            background: getStatusColor(feedback.status) + '20', 
            color: getStatusColor(feedback.status), 
            padding: '6px 12px', 
            borderRadius: '6px', 
            fontSize: '13px',
            fontWeight: '600'
          }}>
            {feedback.status?.replace('_', ' ').toUpperCase()}
          </span>
          <span style={{ 
            background: getPriorityColor(feedback.priority) + '20', 
            color: getPriorityColor(feedback.priority), 
            padding: '6px 12px', 
            borderRadius: '6px', 
            fontSize: '13px',
            fontWeight: '600'
          }}>
            {feedback.priority?.toUpperCase()}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Main Content */}
        <div>
          {/* Description */}
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e6e9ee', marginBottom: '24px' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>Description</h2>
            <p style={{ margin: 0, color: '#374151', lineHeight: '1.6' }}>{feedback.description}</p>
          </div>

          {/* Responses */}
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e6e9ee', marginBottom: '24px' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
              Responses ({feedback.responses?.length || 0})
            </h2>
            {feedback.responses && feedback.responses.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {feedback.responses.map((response, idx) => (
                  <div key={idx} style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px', borderLeft: response.isInternal ? '3px solid #f59e0b' : '3px solid #4169e1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '600', color: '#1f2937' }}>{response.respondedBy?.name || 'Staff'}</span>
                      {response.isInternal && (
                        <span style={{ background: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>Internal</span>
                      )}
                    </div>
                    <p style={{ margin: 0, color: '#374151', fontSize: '14px' }}>{response.message}</p>
                    <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>
                      {new Date(response.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: '#6b7280', fontSize: '14px' }}>No responses yet</div>
            )}
          </div>

          {/* Status History */}
          {feedback.statusHistory && feedback.statusHistory.length > 0 && (
            <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e6e9ee', marginBottom: '24px' }}>
              <h2 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>Status History</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {feedback.statusHistory.map((history, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: idx < feedback.statusHistory.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getStatusColor(history.status) }} />
                    <span style={{ flex: 1, fontSize: '14px', color: '#1f2937' }}>
                      Status changed to <strong>{history.status?.replace('_', ' ')}</strong>
                    </span>
                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                      {new Date(history.changedAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div>
          {/* Details Card */}
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e6e9ee', marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Category</div>
                <div style={{ fontSize: '14px', color: '#1f2937' }}>{getCategoryLabel(feedback.category)}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Submitted</div>
                <div style={{ fontSize: '14px', color: '#1f2937' }}>{new Date(feedback.createdAt).toLocaleDateString()}</div>
              </div>
              {feedback.submittedBy && (
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Submitted By</div>
                  <div style={{ fontSize: '14px', color: '#1f2937' }}>{feedback.isAnonymous ? 'Anonymous' : feedback.submittedBy.name}</div>
                </div>
              )}
              {feedback.department && (
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Department</div>
                  <div style={{ fontSize: '14px', color: '#1f2937' }}>
                    {typeof feedback.department === 'object' ? feedback.department?.name : feedback.department}
                  </div>
                </div>
              )}
              {feedback.faculty && (
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Faculty</div>
                  <div style={{ fontSize: '14px', color: '#1f2937' }}>
                    {typeof feedback.faculty === 'object' ? feedback.faculty?.name : feedback.faculty}
                  </div>
                </div>
              )}
              {feedback.escalationLevel > 0 && (
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>Escalation Level</div>
                  <div style={{ fontSize: '14px', color: '#ef4444', fontWeight: '600' }}>Level {feedback.escalationLevel}</div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e6e9ee' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* P3: Respond */}
              {!showRespondForm && feedback.status !== 'resolved' && feedback.status !== 'closed' && (
                <button 
                  onClick={() => setShowRespondForm(true)}
                  style={{ padding: '10px 16px', background: '#4169e1', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
                >
                  Respond (P3)
                </button>
              )}

              {/* Respond Form */}
              {showRespondForm && (
                <form onSubmit={handleRespond} style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
                  <textarea
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                    placeholder="Enter your response..."
                    rows={4}
                    style={{ width: '100%', padding: '12px', border: '1px solid #e6e9ee', borderRadius: '6px', fontSize: '14px', resize: 'vertical', marginBottom: '12px' }}
                    required
                  />
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '13px', color: '#374151' }}>
                    <input
                      type="checkbox"
                      checked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                    />
                    Internal response (not visible to student)
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      type="submit"
                      disabled={actionLoading}
                      style={{ flex: 1, padding: '8px', background: '#4169e1', color: '#fff', border: 'none', borderRadius: '6px', cursor: actionLoading ? 'not-allowed' : 'pointer', opacity: actionLoading ? 0.7 : 1 }}
                    >
                      {actionLoading ? 'Sending...' : 'Send Response'}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setShowRespondForm(false)}
                      style={{ padding: '8px 16px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* P4: Resolve */}
              {!showResolveForm && feedback.status !== 'resolved' && feedback.status !== 'closed' && (
                <button 
                  onClick={() => setShowResolveForm(true)}
                  style={{ padding: '10px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
                >
                  Resolve (P4)
                </button>
              )}

              {/* Resolve Form */}
              {showResolveForm && (
                <form onSubmit={handleResolve} style={{ padding: '16px', background: '#f0fdf4', borderRadius: '8px' }}>
                  <textarea
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    placeholder="Resolution note (optional)..."
                    rows={3}
                    style={{ width: '100%', padding: '12px', border: '1px solid #e6e9ee', borderRadius: '6px', fontSize: '14px', resize: 'vertical', marginBottom: '12px' }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      type="submit"
                      disabled={actionLoading}
                      style={{ flex: 1, padding: '8px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: actionLoading ? 'not-allowed' : 'pointer', opacity: actionLoading ? 0.7 : 1 }}
                    >
                      {actionLoading ? 'Resolving...' : 'Confirm Resolve'}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setShowResolveForm(false)}
                      style={{ padding: '8px 16px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* P5: Escalate */}
              {!showEscalateForm && feedback.status !== 'closed' && (
                <button 
                  onClick={() => setShowEscalateForm(true)}
                  style={{ padding: '10px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
                >
                  Escalate (P5)
                </button>
              )}

              {/* Escalate Form */}
              {showEscalateForm && (
                <form onSubmit={handleEscalate} style={{ padding: '16px', background: '#fef2f2', borderRadius: '8px' }}>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                    Current escalation level: {feedback.escalationLevel || 0}
                  </div>
                  <textarea
                    value={escalationNote}
                    onChange={(e) => setEscalationNote(e.target.value)}
                    placeholder="Reason for escalation..."
                    rows={3}
                    style={{ width: '100%', padding: '12px', border: '1px solid #e6e9ee', borderRadius: '6px', fontSize: '14px', resize: 'vertical', marginBottom: '12px' }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      type="submit"
                      disabled={actionLoading}
                      style={{ flex: 1, padding: '8px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: actionLoading ? 'not-allowed' : 'pointer', opacity: actionLoading ? 0.7 : 1 }}
                    >
                      {actionLoading ? 'Escalating...' : 'Confirm Escalate'}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setShowEscalateForm(false)}
                      style={{ padding: '8px 16px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackDetail;

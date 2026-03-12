import React from 'react'
import './Settings.css'

const Help = () => {
  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1 className="settings-title">Help & Support</h1>
        <p className="settings-subtitle">Get help with using the feedback system</p>
      </div>

      <div className="settings-content">
        <div className="settings-card">
          <h2 className="card-title">Frequently Asked Questions</h2>
          
          <div className="faq-item">
            <h3 className="faq-question">How do I submit feedback?</h3>
            <p className="faq-answer">Navigate to the Feedback section from the sidebar and click on "Submit New Feedback" to create a new feedback entry.</p>
          </div>

          <div className="faq-item">
            <h3 className="faq-question">How do I track my submitted feedback?</h3>
            <p className="faq-answer">You can view all your submitted feedback in the Feedback section. Each feedback has a unique ID that you can use to track its status.</p>
          </div>

          <div className="faq-item">
            <h3 className="faq-question">What should I do if my feedback is escalated?</h3>
            <p className="faq-answer">If your feedback has been escalated, you will receive a notification. Please check the feedback details for more information on the escalation.</p>
          </div>

          <div className="faq-item">
            <h3 className="faq-question">How do I change my password?</h3>
            <p className="faq-answer">Click on your profile in the top right corner and select "Change Password" to update your password.</p>
          </div>
        </div>

        <div className="settings-card">
          <h2 className="card-title">Contact Support</h2>
          <p className="card-description">If you need further assistance, please contact the system administrator.</p>
          
          <div className="contact-info">
            <div className="contact-item">
              <span className="contact-label">Email:</span>
              <span className="contact-value">support@university.edu</span>
            </div>
            <div className="contact-item">
              <span className="contact-label">Phone:</span>
              <span className="contact-value">+1 (555) 123-4567</span>
            </div>
            <div className="contact-item">
              <span className="contact-label">Office Hours:</span>
              <span className="contact-value">Monday - Friday, 9:00 AM - 5:00 PM</span>
            </div>
          </div>
        </div>

        <div className="settings-card">
          <h2 className="card-title">System Information</h2>
          <div className="system-info">
            <div className="info-item">
              <span className="info-label">Version:</span>
              <span className="info-value">1.0.0</span>
            </div>
            <div className="info-item">
              <span className="info-label">Academic Year:</span>
              <span className="info-value">2025/2026 - Semester 1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Help

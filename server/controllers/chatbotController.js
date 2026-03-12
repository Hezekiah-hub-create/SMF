/**
 * Chatbot Controller
 * 
 * Provides conversational interface for:
 * - FAQ answering
 * - Feedback submission guidance
 * - Feedback status checking
 * - General help
 */

const Feedback = require('../models/Feedback');
const User = require('../models/User');
const nlpManager = require('../services/nlpManager');

// FAQ Data - Common questions and answers
const FAQ_DATA = {
  general: [
    {
      keywords: ['what is', 'about', 'purpose', 'explain'],
      question: 'What is this feedback system?',
      answer: 'This is a university feedback management system that allows students to submit feedback about courses, facilities, services, and more. Your feedback is automatically routed to the appropriate department for review and response.'
    },
    {
      keywords: ['how to submit', 'submit feedback', 'create feedback'],
      question: 'How do I submit feedback?',
      answer: 'To submit feedback:\n1. Click on the "Submit Feedback" button\n2. Select a category (Course Related, Facilities, Services, etc.)\n3. Provide a clear title and description\n4. Choose if you want to submit anonymously\n5. Submit your feedback\n\nThe system will automatically route it to the appropriate department.'
    },
    {
      keywords: ['anonymous', 'anonymous feedback', 'privacy'],
      question: 'Can I submit anonymous feedback?',
      answer: 'Yes! You can submit feedback anonymously by toggling the "Submit Anonymously" option when creating your feedback. Anonymous feedback cannot be traced back to you, but you also won\'t receive notifications about its status.'
    },
    {
      keywords: ['track', 'status', 'check', 'my feedback'],
      question: 'How can I track my feedback status?',
      answer: 'You can track your feedback status in the Dashboard or Feedback section of the app. You\'ll see statuses like:\n- New: Feedback submitted\n- Routed: Sent to department\n- In Progress: Being investigated\n- Resolved: Completed\n- Escalated: Sent to higher authority'
    },
    {
      keywords: ['categories', 'types', 'what can i report'],
      question: 'What categories of feedback can I submit?',
      answer: 'You can submit feedback in these categories:\n- Course Related: About lectures, assignments, exams\n- Facilities: Buildings, classrooms, labs\n- Dining Services: Food, cafeteria\n- Transportation: Buses, parking\n- IT Services: Computers, internet\n- Administrative: Admissions, registration\n- Housing: Dormitories, hostels\n- Student Services: General student support'
    }
  ],
  status: [
    {
      keywords: ['pending', 'waiting', 'long time'],
      question: 'Why is my feedback taking so long?',
      answer: 'Feedback processing time varies based on complexity and department workload. Simple issues may be resolved in a few days, while complex matters might take longer. You can check your feedback status in the app. If escalated, it may take additional time.'
    },
    {
      keywords: ['resolved', 'done', 'completed'],
      question: 'What does "Resolved" mean?',
      answer: 'When feedback is marked as "Resolved", it means the department has addressed the issue and provided a resolution. You should receive a notification with details. If you\'re unsatisfied, you can request escalation.'
    },
    {
      keywords: ['escalated', 'escalate', 'higher'],
      question: 'What happens when feedback is escalated?',
      answer: 'Escalation happens when the initial department cannot resolve the issue. It\'s then forwarded to a higher authority (like the Dean or Quality Assurance). This ensures your concern receives proper attention.'
    }
  ],
  help: [
    {
      keywords: ['help', 'help me', 'support'],
      question: 'How can I get help?',
      answer: 'I\'m here to help! You can:\n• Ask me questions about the system\n• Use quick actions to submit or check feedback\n• Contact support through the Help & Support section in settings'
    },
    {
      keywords: ['contact', 'reach', 'talk to someone'],
      question: 'How do I contact support?',
      answer: 'For additional support, you can:\n• Visit the Help & Support section in the app\n• Submit feedback about the system itself\n• Contact your department directly'
    },
    {
      keywords: ['login', 'login issues', 'can\'t login', 'password'],
      question: 'I can\'t login to the app',
      answer: 'If you\'re having login issues:\n1. Check your internet connection\n2. Verify your student/staff ID and password\n3. Use the "Forgot Password" option if available\n4. Contact IT support if problems persist'
    }
  ]
};

// Flatten FAQ for searching
const ALL_FAQS = [...FAQ_DATA.general, ...FAQ_DATA.status, ...FAQ_DATA.help];

/**
 * Find best matching FAQ based on user input
 */
const findMatchingFAQ = (userMessage) => {
  const lowerMessage = userMessage.toLowerCase();
  
  // Score each FAQ based on keyword matches
  let bestMatch = null;
  let highestScore = 0;
  
  for (const faq of ALL_FAQS) {
    let score = 0;
    for (const keyword of faq.keywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        score += 1;
      }
    }
    
    // Bonus for exact phrase match
    if (lowerMessage.includes(faq.question.toLowerCase())) {
      score += 2;
    }
    
    if (score > highestScore) {
      highestScore = score;
      bestMatch = faq;
    }
  }
  
  // Only return match if score is significant
  return highestScore >= 1 ? bestMatch : null;
};

/**
 * Get quick action options
 */
const getQuickActions = (userRole = 'student') => {
  const actions = [
    { id: 'submit', label: 'Submit Feedback', description: 'Create new feedback' },
    { id: 'status', label: 'Check Status', description: 'View your feedback status' },
    { id: 'faq', label: 'FAQ', description: 'Common questions & answers' },
  ];
  
  if (userRole !== 'student') {
    actions.push({ id: 'stats', label: 'My Stats', description: 'View feedback statistics' });
  }
  
  return actions;
};

/**
 * Get user's recent feedback summary
 */
const getUserFeedbackSummary = async (userId) => {
  try {
    const feedback = await Feedback.find({ submittedBy: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title status category createdAt');
    
    if (!feedback || feedback.length === 0) {
      return null;
    }
    
    const summary = {
      total: await Feedback.countDocuments({ submittedBy: userId }),
      recent: feedback.map(f => ({
        title: f.title,
        status: f.status,
        category: f.category,
        date: f.createdAt
      }))
    };
    
    // Get status counts
    const statusCounts = await Feedback.aggregate([
      { $match: { submittedBy: userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    summary.statusCounts = {};
    statusCounts.forEach(s => {
      summary.statusCounts[s._id] = s.count;
    });
    
    return summary;
  } catch (error) {
    console.error('Error getting feedback summary:', error);
    return null;
  }
};

/**
 * @desc    Process chatbot message
 * @route   POST /api/chatbot/message
 * @access  Private
 */
const processMessage = async (req, res) => {
  try {
    const { message, context } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;
    
    let response = {
      message: '',
      quickActions: getQuickActions(userRole),
      type: 'text' // text, feedback_list, faq, help
    };
    
    // If no message, return greeting
    if (!message || message.trim() === '') {
      response.message = getGreeting(userRole);
      response.type = 'greeting';
      return res.json(response);
    }
    
    // Process message with NLP
    const nlpResult = await nlpManager.process(message);
    const { intent, score } = nlpResult;
    
    console.log(`Chatbot Intent: ${intent} (${score})`);

    // Handle intents with high confidence
    if (score > 0.6) {
      // Handle Actions
      if (intent === 'action.submit') {
        response.message = 'I can help you submit feedback! Please provide the following:\n\n1. **Category** - What type of feedback? (e.g., Course Related, Facilities, Services, etc.)\n2. **Title** - A brief summary\n3. **Description** - Detailed explanation\n\nWhat category would you like to submit feedback about?';
        response.type = 'submit_feedback';
        return res.json(response);
      }
      
      if (intent === 'action.status') {
        const summary = await getUserFeedbackSummary(userId);
        if (!summary || summary.recent.length === 0) {
          response.message = "You haven't submitted any feedback yet. Would you like to submit your first feedback?";
          response.type = 'no_feedback';
        } else {
          response.message = formatFeedbackSummary(summary);
          response.type = 'feedback_list';
          response.feedbackSummary = summary;
        }
        return res.json(response);
      }
      
      if (intent === 'action.faq') {
        response.message = 'Here are some common questions I can help with:\n\n' +
          '• **How do I submit feedback?**\n' +
          '• **Can I submit anonymous feedback?**\n' +
          '• **How can I track my feedback status?**\n' +
          '• **What categories can I report?**\n' +
          '• **Why is my feedback taking so long?**\n\n' +
          'Ask me anything!';
        response.type = 'faq';
        return res.json(response);
      }

      // Handle FAQ Intents
      const faqMap = {
        'faq.system_purpose': FAQ_DATA.general[0].answer,
        'faq.how_to_submit': FAQ_DATA.general[1].answer,
        'faq.anonymous': FAQ_DATA.general[2].answer,
        'faq.track_status': FAQ_DATA.general[3].answer,
        'faq.categories': FAQ_DATA.general[4].answer,
        'faq.delay': FAQ_DATA.status[0].answer,
        'faq.resolved_meaning': FAQ_DATA.status[1].answer,
        'faq.escalation_process': FAQ_DATA.status[2].answer,
        'support.contact': FAQ_DATA.help[0].answer,
        'support.login_issue': FAQ_DATA.help[1].answer
      };

      if (faqMap[intent]) {
        response.message = faqMap[intent];
        response.type = 'faq';
        return res.json(response);
      }
    }
    
    // Fallback to old FAQ search if NLP confidence is low
    const matchingFAQ = findMatchingFAQ(message);
    if (matchingFAQ) {
      response.message = matchingFAQ.answer;
      response.type = 'faq';
      return res.json(response);
    }
    
    // Default response - couldn't understand
    response.message = "I'm not sure I understood that. Here are things I can help with:\n\n" +
      "- **Submit Feedback**: Create new feedback\n" +
      "- **Check Status**: View your feedback status\n" +
      "- **FAQ**: Common questions\n\n" +
      "What would you like to do?";
    response.type = 'help';
    
    return res.json(response);
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ message: 'Error processing message' });
  }
};

/**
 * @desc    Get quick actions
 * @route   GET /api/chatbot/quick-actions
 * @access  Private
 */
const getQuickActionsHandler = async (req, res) => {
  try {
    const userRole = req.user.role;
    const actions = getQuickActions(userRole);
    res.json({ quickActions: actions });
  } catch (error) {
    console.error('Get quick actions error:', error);
    res.status(500).json({ message: 'Error getting quick actions' });
  }
};

/**
 * @desc    Get feedback status for user
 * @route   GET /api/chatbot/feedback-status
 * @access  Private
 */
const getFeedbackStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const summary = await getUserFeedbackSummary(userId);
    
    if (!summary || summary.recent.length === 0) {
      return res.json({
        message: "You haven't submitted any feedback yet.",
        hasFeedback: false
      });
    }
    
    res.json({
      message: formatFeedbackSummary(summary),
      hasFeedback: true,
      summary
    });
  } catch (error) {
    console.error('Get feedback status error:', error);
    res.status(500).json({ message: 'Error getting feedback status' });
  }
};

/**
 * @desc    Start feedback submission flow
 * @route   POST /api/chatbot/start-submit
 * @access  Private
 */
const startFeedbackSubmit = async (req, res) => {
  try {
    res.json({
      message: 'To submit feedback, please provide:\n\n1. **Category** - What type of feedback? (Course Related, Facilities, Services, Administrative, IT Services, Dining Services, Transportation, Housing, Other)\n\n2. **Title** - A brief summary\n\n3. **Description** - Detailed explanation\n\nWhat category would you like to submit feedback about?',
      categories: Feedback.CATEGORIES,
      type: 'submit_started'
    });
  } catch (error) {
    console.error('Start feedback submit error:', error);
    res.status(500).json({ message: 'Error starting feedback submission' });
  }
};

/**
 * Get personalized greeting
 */
const getGreeting = (role) => {
  const greetings = {
    student: "Hello! I'm your feedback assistant. I can help you:\n\n- **Submit new feedback**\n- **Check your feedback status**\n- **Answer questions about the system**\n\nWhat would you like to do?",
    default: "Hello! I'm here to help with feedback. I can assist with **submitting feedback**, **checking status**, and **answering questions**.\n\nWhat would you like to do?"
  };
  
  return greetings[role] || greetings.default;
};

/**
 * Format feedback summary for display
 */
const formatFeedbackSummary = (summary) => {
  let message = `**Your Feedback Summary**\n\n`;
  message += `**Total Feedback**: ${summary.total}\n\n`;
  
  if (summary.statusCounts) {
    message += `**Status**:\n`;
    if (summary.statusCounts.new) message += `  - **New**: ${summary.statusCounts.new}\n`;
    if (summary.statusCounts.routed) message += `  - **Routed**: ${summary.statusCounts.routed}\n`;
    if (summary.statusCounts.in_progress) message += `  - **In Progress**: ${summary.statusCounts.in_progress}\n`;
    if (summary.statusCounts.resolved) message += `  - **Resolved**: ${summary.statusCounts.resolved}\n`;
    if (summary.statusCounts.escalated) message += `  - **Escalated**: ${summary.statusCounts.escalated}\n`;
  }
  
  message += `\n**Recent Feedback**:\n`;
  summary.recent.forEach((f, i) => {
    message += `${i + 1}. **[${f.status.toUpperCase()}]** ${f.title}\n`;
    message += `   Category: ${f.category} | ${new Date(f.date).toLocaleDateString()}\n`;
  });
  
  return message;
};

/**
 * Get emoji for status
 */
const getStatusEmoji = (status) => {
  const emojis = {
    new: '📝',
    routed: '🔄',
    in_progress: '⚙️',
    resolved: '✅',
    escalated: '⬆️',
    closed: '❌'
  };
  return emojis[status] || '❓';
};

module.exports = {
  processMessage,
  getQuickActionsHandler,
  getFeedbackStatus,
  startFeedbackSubmit
};


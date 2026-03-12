const { Nlp } = require('@nlpjs/nlp');

/**
 * NLP Manager Service
 * Handles intent classification and entity extraction
 */
class NLPManagerService {
  constructor() {
    this.nlp = new Nlp({ languages: ['en'], forceNER: true, autoSave: false });
    this.nlp.addLanguage('en');
    this.isTrained = false;
  }

  /**
   * Initialize and train the NLP model
   */
  async initialize() {
    if (this.isTrained) return;

    console.log('Training NLP model...');
    
    // Add Intents based on FAQ Data
    // General Questions
    this.addTrainingData('faq.system_purpose', [
      'what is this feedback system',
      'about this app',
      'purpose of the system',
      'explain the system',
      'what can I do here'
    ]);

    this.addTrainingData('faq.how_to_submit', [
      'how to submit feedback',
      'how do I create feedback',
      'submit feedback help',
      'steps to submit'
    ]);

    this.addTrainingData('faq.anonymous', [
      'can I submit anonymous feedback',
      'is my feedback private',
      'can I stay anonymous',
      'anonymous submission'
    ]);

    this.addTrainingData('faq.track_status', [
      'how to track my feedback',
      'check status of my feedback',
      'where is my feedback',
      'how do I know the status'
    ]);

    this.addTrainingData('faq.categories', [
      'what categories can I report',
      'types of feedback',
      'what can I report about',
      'list categories'
    ]);

    // Status Related
    this.addTrainingData('faq.delay', [
      'why is my feedback taking so long',
      'pending feedback',
      'waiting for response',
      'long time no update'
    ]);

    this.addTrainingData('faq.resolved_meaning', [
      'what does resolved mean',
      'feedback is done',
      'completed status'
    ]);

    this.addTrainingData('faq.escalation_process', [
      'what happens when feedback is escalated',
      'escalation meaning',
      'who handles escalated feedback'
    ]);

    // Help & Support
    this.addTrainingData('support.contact', [
      'how can I get help',
      'contact support',
      'reach for support',
      'talk to someone',
      'customer service'
    ]);

    this.addTrainingData('support.login_issue', [
      'cannot login',
      'forgot password',
      'login problems',
      'account access'
    ]);

    // Core Actions
    this.addTrainingData('action.submit', [
      'submit',
      'submit feedback',
      'new feedback',
      'I want to report something',
      'post feedback'
    ]);

    this.addTrainingData('action.status', [
      'status',
      'check status',
      'my feedback',
      'view my submissions'
    ]);

    this.addTrainingData('action.faq', [
      'faq',
      'help',
      'common questions',
      '?'
    ]);

    await this.nlp.train();
    this.isTrained = true;
    console.log('NLP model training completed.');
  }

  /**
   * Helper to add multiple utterances for an intent
   */
  addTrainingData(intent, utterances) {
    utterances.forEach(utterance => {
      this.nlp.addDocument('en', utterance, intent);
    });
  }

  /**
   * Process user message and return best intent
   */
  async process(message) {
    if (!this.isTrained) {
      await this.initialize();
    }
    
    const result = await this.nlp.process('en', message);
    return {
      intent: result.intent,
      score: result.score,
      answer: result.answer,
      entities: result.entities
    };
  }
}

// Singleton instance
const nlpManager = new NLPManagerService();

module.exports = nlpManager;

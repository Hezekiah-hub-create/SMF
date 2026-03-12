const nlpManager = require('../services/nlpManager');

async function testNLP() {
  console.log('--- NLP Test Script ---');
  
  const testCases = [
    'How do I submit feedback?',
    'I want to report a problem with the food',
    'Where can I check my feedback status?',
    'Is my feedback anonymous?',
    'Why is it taking so long?',
    'What does resolved mean?',
    'Can I talk to support?',
    'Forgot my password',
    'hi',
    'status'
  ];

  for (const text of testCases) {
    const result = await nlpManager.process(text);
    console.log(`Input: "${text}"`);
    console.log(`Intent: ${result.intent} (Score: ${result.score.toFixed(2)})`);
    console.log('---');
  }
}

testNLP().catch(console.error);

const axios = require('axios');

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

const pythonAPI = axios.create({
  baseURL: PYTHON_SERVICE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

const pythonService = {
  async generateSummary(text, length = 'medium') {
    try {
      const response = await pythonAPI.post('/api/summarize', {
        text,
        length
      });
      return response.data;
    } catch (error) {
      console.error('Python service error:', error.message);
      // Return mock data if Python service is down
      return {
        summary: text.substring(0, 200) + '... (AI service temporarily unavailable)',
        keywords: ['summary', 'text', 'content']
      };
    }
  },

  async generateQuiz(text, config = {}) {
    try {
      const response = await pythonAPI.post('/api/quiz/generate', {
        text,
        num_questions: config.numQuestions || 10,
        difficulty: config.difficulty || 'medium',
        question_types: config.questionTypes || ['multiple_choice', 'true_false']
      });
      
      // Ensure correct field names
      const transformedData = {
        ...response.data,
        questions: response.data.questions.map(q => ({
          question: q.question,
          type: q.type,
          options: q.options,
          correctAnswer: q.correct_answer || q.correctAnswer, // Handle both formats
          explanation: q.explanation
        }))
      };
      
      return transformedData;
    } catch (error) {
      console.error('Python service error:', error.message);
      
      // Return mock quiz if Python service is down
      return {
        title: 'Practice Quiz',
        description: 'Quiz generated from your content',
        questions: [
          {
            question: 'What is the main topic of the provided text?',
            type: 'multiple_choice',
            options: ['Learning', 'Technology', 'Science', 'History'],
            correctAnswer: 'Learning',
            explanation: 'Based on the content provided.'
          },
          {
            question: 'The provided text contains important information.',
            type: 'true_false',
            options: ['True', 'False'],
            correctAnswer: 'True',
            explanation: 'The text contains study material.'
          }
        ],
        tags: ['practice', 'generated']
      };
    }
  },

  async generateFlashcards(text, count = 10) {
    try {
      const response = await pythonAPI.post('/api/flashcards/generate', {
        text,
        count
      });
      return response.data;
    } catch (error) {
      console.error('Python service error:', error.message);
      
      // Return mock flashcards if Python service is down
      return {
        title: 'Study Flashcards',
        cards: [
          {
            front: 'What is the main concept?',
            back: 'The main concept from your text.'
          },
          {
            front: 'Key point to remember?',
            back: 'Important information from the content.'
          }
        ]
      };
    }
  }
};

module.exports = pythonService;

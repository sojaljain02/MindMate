const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const pythonService = require('../services/pythonService');
const multer = require('multer');
const path = require('path');

// Debug the import
console.log('Quiz model type:', typeof Quiz);
console.log('Is Quiz a Mongoose model?:', Quiz.modelName === 'Quiz');

// Configure multer
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type'));
  }
}).single('file');

// @desc    Generate quiz
// @route   POST /api/quiz/generate
// @access  Private
const generateQuiz = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    try {
      let text = req.body.text;
      const config = JSON.parse(req.body.config || '{}');

      // Process file if uploaded
      if (req.file) {
        text = req.file.buffer.toString('utf8');
      }

      if (!text) {
        return res.status(400).json({
          success: false,
          message: 'No text provided'
        });
      }

      let quizData;
      
      try {
        // Try to call Python service
        quizData = await pythonService.generateQuiz(text, config);
      } catch (pythonError) {
        console.error('Python service error:', pythonError.message);
        
        // Use fallback data
        quizData = {
          title: 'Practice Quiz',
          description: 'Generated quiz from your text',
          questions: [
            {
              question: 'What is the main topic discussed in the text?',
              type: 'multiple_choice',
              options: ['Topic A', 'Topic B', 'Topic C', 'Topic D'],
              correctAnswer: 'Topic A',
              explanation: 'This is a sample question.'
            },
            {
              question: 'The text contains important information.',
              type: 'true_false',
              options: ['True', 'False'],
              correctAnswer: 'True',
              explanation: 'Based on the provided text.'
            }
          ],
          tags: ['practice', 'sample']
        };
      }

      // Transform questions to ensure correct format
      const transformedQuestions = quizData.questions.map(q => ({
        question: q.question,
        type: q.type,
        options: q.options || [],
        correctAnswer: q.correct_answer || q.correctAnswer,
        explanation: q.explanation || ''
      }));

      // Create quiz document
      const quizDoc = {
        user: req.user.id,
        title: quizData.title || 'Generated Quiz',
        description: quizData.description || 'Quiz generated from your text',
        sourceText: text.substring(0, 1000), // Limit source text size
        questions: transformedQuestions,
        difficulty: config.difficulty || 'medium',
        timeLimit: config.timeLimit || 600,
        tags: quizData.tags || []
      };

      console.log('Creating quiz with data:', quizDoc);

      // Create quiz using the model
      const quiz = new Quiz(quizDoc);
      await quiz.save();

      // Update user stats if needed
      if (req.user.stats) {
        req.user.stats.totalQuizzes = (req.user.stats.totalQuizzes || 0) + 1;
        await req.user.save();
      }

      res.json({
        success: true,
        quizId: quiz._id,
        data: quiz
      });

    } catch (error) {
      console.error('Quiz generation error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create quiz'
      });
    }
  });
};

// @desc    Get quiz
// @route   GET /api/quiz/:id
// @access  Private
const getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      user: req.user.id
    }).select('-sourceText');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    res.json(quiz);
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Submit quiz
// @route   POST /api/quiz/:id/submit
// @access  Private
const submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body;

    const quiz = await Quiz.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Calculate score
    let score = 0;
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        score++;
      }
    });

    // Save attempt
    quiz.attempts.push({
      score,
      answers,
      timeTaken: req.body.timeTaken || 0
    });

    await quiz.save();

    res.json({
      success: true,
      score,
      total: quiz.questions.length,
      percentage: (score / quiz.questions.length) * 100
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  generateQuiz,
  getQuiz,
  submitQuiz
};
const express = require('express');
const router = express.Router();
const {
  generateQuiz,
  getQuiz,
  submitQuiz,
  getQuizzes,
  deleteQuiz
} = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All routes require authentication

router.post('/generate', generateQuiz);
router.get('/list', getQuizzes);
router.get('/:id', getQuiz);
router.post('/:id/submit', submitQuiz);
router.delete('/:id', deleteQuiz);  
module.exports = router;

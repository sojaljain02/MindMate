const express = require('express');
const router = express.Router();
const {
  generateSummary,
  getSummaries,
  getSummary,
  deleteSummary
} = require('../controllers/summaryController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All routes require authentication

router.route('/')
  .post(generateSummary);

router.route('/history')
  .get(getSummaries);

router.route('/:id')
  .get(getSummary)
  .delete(deleteSummary);

module.exports = router;

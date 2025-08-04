const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Summary = require('../models/Summary');
const Quiz = require('../models/Quiz');
const FlashcardDeck = require('../models/Flashcard');

router.use(protect);

// @route   GET /api/user/dashboard
// @desc    Get dashboard data
// @access  Private
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user stats
    const user = await User.findById(userId);
    
    // Count user's content
    const summariesCount = await Summary.countDocuments({ user: userId });
    const quizzesCount = await Quiz.countDocuments({ user: userId });
    
    // Count flashcards
    const flashcardDecks = await FlashcardDeck.find({ user: userId });
    const flashcardsCount = flashcardDecks.reduce((total, deck) => total + (deck.cards?.length || 0), 0);
    
    // Get recent activities
    const recentActivities = [];
    
    // Get recent summaries
    const recentSummaries = await Summary.find({ user: userId })
      .sort('-createdAt')
      .limit(3)
      .select('title createdAt');
      
    recentSummaries.forEach(summary => {
      recentActivities.push({
        title: `Created summary: ${summary.title}`,
        time: getTimeAgo(summary.createdAt),
        icon: 'FiFileText',
        color: 'from-blue-500 to-cyan-500',
        createdAt: summary.createdAt
      });
    });
    
    // Get recent quizzes
    const recentQuizzes = await Quiz.find({ user: userId })
      .sort('-createdAt')
      .limit(3)
      .select('title createdAt');
      
    recentQuizzes.forEach(quiz => {
      recentActivities.push({
        title: `Created quiz: ${quiz.title}`,
        time: getTimeAgo(quiz.createdAt),
        icon: 'FiHelpCircle',
        color: 'from-purple-500 to-pink-500',
        createdAt: quiz.createdAt
      });
    });
    
    // Sort activities by date
    recentActivities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Generate chart data for last 7 days
    const chartData = await generateChartData(userId);
    
    res.json({
      stats: {
        summaries: summariesCount,
        quizzes: quizzesCount,
        flashcards: flashcardsCount,
        streak: user.studyStreak || 0
      },
      recentActivity: recentActivities.slice(0, 5),
      chartData
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
});

// Helper function to format time
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  
  return "Just now";
}

// Generate chart data
async function generateChartData(userId) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const data = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const dayStart = new Date(date);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    
    // Count activities for this day
    const summaries = await Summary.countDocuments({
      user: userId,
      createdAt: { $gte: dayStart, $lte: dayEnd }
    });
    
    const quizzes = await Quiz.countDocuments({
      user: userId,
      createdAt: { $gte: dayStart, $lte: dayEnd }
    });
    
    data.push({
      day: days[date.getDay()],
      activities: summaries + quizzes
    });
  }
  
  return data;
}

module.exports = router;

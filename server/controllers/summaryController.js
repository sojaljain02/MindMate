const Summary = require('../models/Summary');
const pythonService = require('../services/pythonService');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const pdfParse = require('pdf-parse');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = 'uploads/summaries';
    await fs.mkdir(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const deleteSummary = async (req, res) => {
  try {
    const summary = await Summary.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!summary) {
      return res.status(404).json({
        success: false,
        message: 'Summary not found'
      });
    }

    await summary.deleteOne();

    res.json({
      success: true,
      message: 'Summary deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
}).single('file');

// @desc    Generate summary
// @route   POST /api/summarize
// @access  Private
const generateSummary = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      let text = req.body.text;
      let title = req.body.title || 'Untitled Summary';

      // Extract text from file if uploaded
      if (req.file) {
        try {
          if (req.file.mimetype === 'application/pdf') {
            const dataBuffer = await fs.readFile(req.file.path);
            const data = await pdfParse(dataBuffer);
            text = data.text;
          } else {
            text = await fs.readFile(req.file.path, 'utf8');
          }
          
          // Clean up uploaded file
          await fs.unlink(req.file.path);
        } catch (error) {
          console.error('File processing error:', error);
          return res.status(400).json({
            success: false,
            message: 'Error processing file'
          });
        }
      }

      if (!text) {
        return res.status(400).json({
          success: false,
          message: 'No text provided'
        });
      }

      const length = req.body.length || 'medium';

      // Call Python service to generate summary
      const summaryData = await pythonService.generateSummary(text, length);

      // Save summary to database
      const summary = await Summary.create({
        user: req.user.id,
        title,
        originalText: text,
        summary: summaryData.summary,
        length,
        wordCount: {
          original: text.split(' ').length,
          summary: summaryData.summary.split(' ').length
        },
        tags: summaryData.keywords || []
      });

      // Update user stats
      req.user.stats.totalSummaries += 1;
      await req.user.save();

      res.json({
        success: true,
        summary: summaryData.summary,
        data: summary
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user's summaries
// @route   GET /api/summarize/history
// @access  Private
const getSummaries = async (req, res) => {
  try {
    const summaries = await Summary.find({ user: req.user.id })
      .sort('-createdAt')
      .limit(20);

    res.json({
      success: true,
      count: summaries.length,
      data: summaries
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single summary
// @route   GET /api/summarize/:id
// @access  Private
const getSummary = async (req, res) => {
  try {
    const summary = await Summary.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!summary) {
      return res.status(404).json({
        success: false,
        message: 'Summary not found'
      });
    }

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  generateSummary,
  getSummaries,
  getSummary,
  deleteSummary
};

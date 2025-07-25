import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiSettings, FiPlay, FiFile, FiX, FiClock, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';

const QuizGenerator = () => {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [quizConfig, setQuizConfig] = useState({
    numQuestions: 10,
    difficulty: 'medium',
    questionTypes: ['multiple_choice', 'true_false']
  });
  const [loading, setLoading] = useState(false);
  const [quizHistory, setQuizHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchQuizHistory();
  }, []);

  const fetchQuizHistory = async () => {
    try {
      const response = await api.get('/quiz/list');
      console.log('Quiz history:', response.data);
      setQuizHistory(response.data.data || []);
    } catch (error) {
      console.error('Failed to load quiz history:', error);
    }
  };

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setText('');
    }
  };

  const handleGenerateQuiz = async () => {
    if (!text && !file) {
      toast.error('Please provide text or upload a file');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      } else {
        formData.append('text', text);
      }
      formData.append('config', JSON.stringify(quizConfig));

      const response = await api.post('/quiz/generate', formData);
      toast.success('Quiz generated successfully!');

      // Refresh quiz history
      fetchQuizHistory();

      navigate(`/quiz/${response.data.quizId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error generating quiz');
    } finally {
      setLoading(false);
    }
  };

  const deleteQuiz = async (quizId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;

    try {
      await api.delete(`/quiz/${quizId}`);
      setQuizHistory(quizHistory.filter(q => q._id !== quizId));
      toast.success('Quiz deleted successfully');
    } catch (error) {
      toast.error('Failed to delete quiz');
    }
  };

  const calculateAverageScore = (quiz) => {
    if (!quiz.attempts || quiz.attempts.length === 0) return 'Not attempted';

    const totalQuestions = quiz.questions?.length || 10; // Use quiz questions length
    const totalScore = quiz.attempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0);
    const avgScore = totalScore / quiz.attempts.length;
    const avgPercentage = (avgScore / totalQuestions) * 100;

    return `${avgPercentage.toFixed(0)}%`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto"
    >
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quiz Generator</h1>
          <p className="text-gray-600 mt-2">Create AI-powered quizzes from any text</p>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="btn-secondary flex items-center"
        >
          <FiClock className="mr-2" />
          Quiz History ({quizHistory.length})
        </button>
      </div>

      {showHistory ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Quizzes</h2>
          {quizHistory.length > 0 ? (
            <div className="space-y-3">
              {quizHistory.map((quiz) => (
                <div
                  key={quiz._id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => navigate(`/quiz/${quiz._id}`)}
                    >
                      <h3 className="font-medium text-gray-900">{quiz.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span>{quiz.questions?.length || 0} questions</span>
                        <span>•</span>
                        <span className="capitalize">{quiz.difficulty}</span>
                        <span>•</span>
                        <span>Attempts: {quiz.attempts?.length || 0}</span>
                        {quiz.attempts?.length > 0 && (
                          <>
                            <span>•</span>
                            <span>Avg Score: {calculateAverageScore(quiz)}</span>
                          </>
                        )}

                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Created: {new Date(quiz.createdAt).toLocaleDateString()} at {new Date(quiz.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigate(`/quiz/${quiz._id}`)}
                        className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        Take Quiz
                      </button>
                      <button
                        onClick={(e) => deleteQuiz(quiz._id, e)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No quizzes created yet</p>
          )}

          <button
            onClick={() => setShowHistory(false)}
            className="mt-6 w-full btn-secondary py-2"
          >
            Back to Generator
          </button>
        </motion.div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FiSettings className="mr-2" />
              Quiz Settings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Questions
                </label>
                <select
                  value={quizConfig.numQuestions}
                  onChange={(e) => setQuizConfig({ ...quizConfig, numQuestions: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                  <option value={15}>15 Questions</option>
                  <option value={20}>20 Questions</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  value={quizConfig.difficulty}
                  onChange={(e) => setQuizConfig({ ...quizConfig, difficulty: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Types
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={quizConfig.questionTypes.includes('multiple_choice')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setQuizConfig({
                            ...quizConfig,
                            questionTypes: [...quizConfig.questionTypes, 'multiple_choice']
                          });
                        } else {
                          setQuizConfig({
                            ...quizConfig,
                            questionTypes: quizConfig.questionTypes.filter(t => t !== 'multiple_choice')
                          });
                        }
                      }}
                      className="rounded text-indigo-600 mr-2"
                    />
                    <span className="text-sm text-gray-700">Multiple Choice</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={quizConfig.questionTypes.includes('true_false')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setQuizConfig({
                            ...quizConfig,
                            questionTypes: [...quizConfig.questionTypes, 'true_false']
                          });
                        } else {
                          setQuizConfig({
                            ...quizConfig,
                            questionTypes: quizConfig.questionTypes.filter(t => t !== 'true_false')
                          });
                        }
                      }}
                      className="rounded text-indigo-600 mr-2"
                    />
                    <span className="text-sm text-gray-700">True/False</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Source Material</h2>

            {!file ? (
              <div className="space-y-4">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste your study material here..."
                  className="w-full h-48 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500"
                />

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">OR</span>
                  </div>
                </div>

                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FiUpload className="w-10 h-10 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PDF, DOC, DOCX, TXT (MAX. 10MB)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.txt"
                  />
                </label>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FiFile className="text-indigo-600" size={24} />
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setFile(null);
                      setText('');
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <FiX size={20} />
                  </button>
                </div>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerateQuiz}
              disabled={loading || (!text && !file) || quizConfig.questionTypes.length === 0}
              className="w-full mt-6 btn-primary py-3 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Generating Quiz...
                </>
              ) : (
                <>
                  <FiPlay className="mr-2" />
                  Generate Quiz
                </>
              )}
            </motion.button>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default QuizGenerator;

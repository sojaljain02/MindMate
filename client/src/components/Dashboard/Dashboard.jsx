import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FiFileText, 
  FiHelpCircle, 
  FiLayers, 
  FiTrendingUp,
  FiClock,
  FiAward
} from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    summaries: 0,
    quizzes: 0,
    flashcards: 0,
    streak: 7
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [chartData, setChartData] = useState([]);

  // Icon mapping to convert string names to actual components
  const iconMap = {
    'FiFileText': FiFileText,
    'FiHelpCircle': FiHelpCircle,
    'FiLayers': FiLayers
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/user/dashboard');
      console.log('Dashboard response:', response.data);
      
      if (response.data) {
        setStats(response.data.stats || {
          summaries: 0,
          quizzes: 0,
          flashcards: 0,
          streak: 0
        });
        
        // Process recent activities to include actual icon components
        const activities = (response.data.recentActivity || []).map(activity => ({
          ...activity,
          IconComponent: iconMap[activity.icon] || FiClock // Use actual component
        }));
        
        setRecentActivity(activities);
        
        setChartData(response.data.chartData || [
          { day: 'Mon', activities: 0 },
          { day: 'Tue', activities: 0 },
          { day: 'Wed', activities: 0 },
          { day: 'Thu', activities: 0 },
          { day: 'Fri', activities: 0 },
          { day: 'Sat', activities: 0 },
          { day: 'Sun', activities: 0 }
        ]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // Set default data if API fails
      setStats({
        summaries: 0,
        quizzes: 0,
        flashcards: 0,
        streak: 0
      });
      
      // Set empty activities with proper icon components
      setRecentActivity([]);
      
      setChartData([
        { day: 'Mon', activities: 0 },
        { day: 'Tue', activities: 0 },
        { day: 'Wed', activities: 0 },
        { day: 'Thu', activities: 0 },
        { day: 'Fri', activities: 0 },
        { day: 'Sat', activities: 0 },
        { day: 'Sun', activities: 0 }
      ]);
    }
  };

  const features = [
    {
      title: 'Text Summarizer',
      description: 'Summarize long texts and documents instantly',
      icon: FiFileText,
      link: '/summarizer',
      color: 'from-blue-500 to-cyan-500',
      stats: stats.summaries || 0
    },
    {
      title: 'Quiz Generator',
      description: 'Create and take AI-powered quizzes',
      icon: FiHelpCircle,
      link: '/quiz',
      color: 'from-purple-500 to-pink-500',
      stats: stats.quizzes || 0
    },
    {
      title: 'Flashcards',
      description: 'Study with smart flashcards',
      icon: FiLayers,
      link: '/flashcards',
      color: 'from-green-500 to-teal-500',
      stats: stats.flashcards || 0
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's your learning overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Study Streak</p>
              <p className="text-2xl font-bold text-gray-900">{stats.streak} days</p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <FiAward className="text-orange-600" size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Summaries</p>
              <p className="text-2xl font-bold text-gray-900">{stats.summaries}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiFileText className="text-blue-600" size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Quizzes Taken</p>
              <p className="text-2xl font-bold text-gray-900">{stats.quizzes}</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiHelpCircle className="text-purple-600" size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Flashcards</p>
              <p className="text-2xl font-bold text-gray-900">{stats.flashcards}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FiLayers className="text-green-600" size={24} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className="card-hover"
          >
            <Link to={feature.link}>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-full">
                <div className={`h-12 w-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                  <feature.icon className="text-white" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Used {feature.stats} times</span>
                  <span className="text-indigo-600 text-sm font-medium">Open →</span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Activity Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Progress</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="activities" 
                stroke="#6366f1" 
                strokeWidth={2}
                dot={{ fill: '#6366f1', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => {
                const IconComponent = activity.IconComponent || FiClock;
                return (
                  <div key={index} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className={`h-10 w-10 rounded-full bg-gradient-to-r ${activity.color || 'from-gray-400 to-gray-500'} flex items-center justify-center`}>
                      <IconComponent className="text-white" size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FiClock size={48} className="mx-auto mb-2 text-gray-300" />
                <p>No recent activity</p>
                <p className="text-xs mt-2">Start creating content to see your activity here</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;

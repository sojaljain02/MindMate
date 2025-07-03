import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (isSignup) {
      if (!name) {
        toast.error('Please enter your name');
        return;
      }
      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
    }

    setIsLoading(true);
    try {
      if (isSignup) {
        await register(name, email, password);
        toast.success('Account created successfully!');
      } else {
        await login(email, password);
        toast.success('Welcome back!');
      }
    } catch (error) {
      toast.error(error.message || `${isSignup ? 'Signup' : 'Login'} failed`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-blue-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full mb-4">
              <span className="text-2xl font-bold text-white">SA</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              {isSignup ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-gray-600 mt-2">
              {isSignup ? 'Start your learning journey' : 'Sign in to your study assistant'}
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignup && (
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field pl-10"
                    placeholder="John Doe"
                  />
                  <FiUser className="absolute left-3 top-3.5 text-gray-400" size={20} />
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="student@example.com"
                />
                <FiMail className="absolute left-3 top-3.5 text-gray-400" size={20} />
              </div>
            </motion.div>

            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                />
                <FiLock className="absolute left-3 top-3.5 text-gray-400" size={20} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </motion.div>

            {isSignup && (
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field pl-10 pr-10"
                    placeholder="••••••••"
                  />
                  <FiLock className="absolute left-3 top-3.5 text-gray-400" size={20} />
                </div>
              </motion.div>
            )}

            {!isSignup && (
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded text-indigo-600" />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <a href="#" className="text-sm text-indigo-600 hover:text-indigo-700">
                  Forgot password?
                </a>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>{isSignup ? 'Create Account' : 'Sign In'}</span>
              )}
            </motion.button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => {
                setIsSignup(!isSignup);
                // Reset form
                setName('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setShowPassword(false);
              }}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              {isSignup ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

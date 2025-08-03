import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import Summarizer from './components/Summarizer/Summarizer';
import QuizGenerator from './components/Quiz/QuizGenerator';
import QuizTaker from './components/Quiz/QuizTaker';
import FlashcardDeck from './components/Flashcards/FlashcardDeck';
import { useAuth } from './hooks/useAuth';
import './App.css';

function App() {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Login />
        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <Router>
      <div className="flex h-screen bg-gray-50">
        <AnimatePresence mode="wait">
          {sidebarOpen && (
            <Sidebar 
              isOpen={sidebarOpen} 
              setIsOpen={setSidebarOpen} 
            />
          )}
        </AnimatePresence>
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            sidebarOpen={sidebarOpen} 
            setSidebarOpen={setSidebarOpen} 
          />
          
          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/summarizer" element={<Summarizer />} />
                <Route path="/quiz" element={<QuizGenerator />} />
                <Route path="/quiz/:id" element={<QuizTaker />} />
                <Route path="/flashcards" element={<FlashcardDeck />} />
              </Routes>
            </AnimatePresence>
          </main>
        </div>
        
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;

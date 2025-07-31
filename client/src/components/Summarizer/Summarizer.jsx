import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiFile, FiX, FiDownload, FiCopy, FiCheck, FiFileText, FiClock, FiEye, FiTrash2 } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import api from '../../services/api';

const Summarizer = () => {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [summaryLength, setSummaryLength] = useState('medium');
  const [copied, setCopied] = useState(false);
  const [summaryHistory, setSummaryHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState(null);

  useEffect(() => {
    fetchSummaryHistory();
  }, []);

  const fetchSummaryHistory = async () => {
    try {
      const response = await api.get('/summarize/history');
      console.log('Summary history:', response.data);
      setSummaryHistory(response.data.data || []);
    } catch (error) {
      console.error('Failed to load summary history:', error);
    }
  };

  const viewSummary = (summaryItem) => {
    setSelectedSummary(summaryItem);
    setSummary(summaryItem.summary);
    setText(summaryItem.originalText);
    setShowHistory(false);
  };

  const deleteSummary = async (summaryId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this summary?')) return;

    try {
      await api.delete(`/summarize/${summaryId}`);
      setSummaryHistory(summaryHistory.filter(s => s._id !== summaryId));
      toast.success('Summary deleted');
    } catch (error) {
      toast.error('Failed to delete summary');
    }
  };

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      if (uploadedFile.size > 10 * 1024 * 1024) {
        toast.error('File size should be less than 10MB');
        return;
      }
      setFile(uploadedFile);
      setText('');
    }
  };

  const handleSummarize = async () => {
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
      formData.append('length', summaryLength);
      formData.append('title', `Summary - ${new Date().toLocaleDateString()}`);

      const response = await api.post('/summarize', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSummary(response.data.summary);
      toast.success('Text summarized successfully!');
      
      // Refresh history
      fetchSummaryHistory();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error summarizing text');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadSummary = () => {
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'summary.txt';
    a.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto"
    >
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Text Summarizer</h1>
          <p className="text-gray-600 mt-2">Summarize long texts and documents with AI</p>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="btn-secondary flex items-center"
        >
          <FiClock className="mr-2" />
          History ({summaryHistory.length})
        </button>
      </div>

      {showHistory ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary History</h2>
          {summaryHistory.length > 0 ? (
            <div className="space-y-3">
              {summaryHistory.map((item) => (
                <div
                  key={item._id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1" onClick={() => viewSummary(item)}>
                      <h3 className="font-medium text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {item.summary.substring(0, 100)}...
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Created: {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => viewSummary(item)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                      >
                        <FiEye size={18} />
                      </button>
                      <button
                        onClick={(e) => deleteSummary(item._id, e)}
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
            <p className="text-center text-gray-500 py-8">No summaries yet</p>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Input Text</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Summary Length
              </label>
              <div className="flex space-x-2">
                {['short', 'medium', 'long'].map((length) => (
                  <button
                    key={length}
                    onClick={() => setSummaryLength(length)}
                    className={`px-4 py-2 rounded-lg capitalize transition-all ${
                      summaryLength === length
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {length}
                  </button>
                ))}
              </div>
            </div>

            {!file ? (
              <div className="space-y-4">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste your text here..."
                  className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
              onClick={handleSummarize}
              disabled={loading || (!text && !file)}
              className="w-full mt-6 btn-primary py-3 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Summarizing...
                </>
              ) : (
                'Generate Summary'
              )}
            </motion.button>

            {selectedSummary && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  Viewing: <strong>{selectedSummary.title}</strong>
                </p>
              </div>
            )}
          </motion.div>

          {/* Output Section */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Summary</h2>
              {summary && (
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={copyToClipboard}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                  >
                    {copied ? <FiCheck size={20} /> : <FiCopy size={20} />}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={downloadSummary}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                  >
                    <FiDownload size={20} />
                  </motion.button>
                </div>
              )}
            </div>

            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-64 flex items-center justify-center"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Processing your text...</p>
                  </div>
                </motion.div>
              ) : summary ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="prose prose-sm max-w-none"
                >
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg">
                    <ReactMarkdown>{summary}</ReactMarkdown>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-64 flex items-center justify-center text-gray-400"
                >
                  <div className="text-center">
                    <FiFileText size={48} className="mx-auto mb-2" />
                    <p>Your summary will appear here</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Summarizer;

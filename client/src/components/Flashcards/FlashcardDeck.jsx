import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiRotateCw, FiChevronLeft, FiChevronRight, FiPlus, FiTrash2, FiEdit2, FiLayers, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';

const FlashcardDeck = () => {
  const [decks, setDecks] = useState([]);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newDeck, setNewDeck] = useState({ title: '', description: '' });
  const [newCard, setNewCard] = useState({ front: '', back: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDecks();
  }, []);

  const fetchDecks = async () => {
    try {
      console.log('Fetching decks...');
      const response = await api.get('/flashcards/decks');
      console.log('Decks response:', response.data);
      
      if (response.data.success) {
        setDecks(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to load flashcard decks:', error);
      toast.error('Failed to load flashcard decks');
    }
  };

  const handleCreateDeck = async () => {
    if (!newDeck.title || newDeck.title.trim() === '') {
      toast.error('Please enter a deck title');
      return;
    }

    setLoading(true);
    
    try {
      console.log('Creating deck with:', newDeck);
      
      const response = await api.post('/flashcards/decks', {
        title: newDeck.title.trim(),
        description: newDeck.description.trim()
      });
      
      console.log('Create response:', response.data);
      
      if (response.data.success) {
        // Add the new deck to the list
        setDecks(prevDecks => [...prevDecks, response.data.data]);
        
        // Reset form and close modal
        setNewDeck({ title: '', description: '' });
        setShowCreateForm(false);
        
        toast.success('Deck created successfully!');
      } else {
        throw new Error(response.data.message || 'Failed to create deck');
      }
    } catch (error) {
      console.error('Create deck error:', error);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('Failed to create deck');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = async () => {
    if (!selectedDeck || !newCard.front || !newCard.back) {
      toast.error('Please fill in both sides of the card');
      return;
    }

    try {
      const response = await api.post(`/flashcards/decks/${selectedDeck._id}/cards`, newCard);
      
      if (response.data.success) {
        // Update the deck in the local state
        const updatedDecks = decks.map(deck => 
          deck._id === selectedDeck._id 
            ? { ...deck, cards: [...(deck.cards || []), response.data.data] }
            : deck
        );
        setDecks(updatedDecks);
        setSelectedDeck(updatedDecks.find(d => d._id === selectedDeck._id));
        setNewCard({ front: '', back: '' });
        toast.success('Card added successfully!');
      }
    } catch (error) {
      console.error('Add card error:', error);
      toast.error('Failed to add card');
    }
  };

  const handleDeleteDeck = async (deckId, e) => {
    e.stopPropagation(); // Prevent deck selection when clicking delete
    
    if (!window.confirm('Are you sure you want to delete this deck?')) return;

    try {
      const response = await api.delete(`/flashcards/decks/${deckId}`);
      
      if (response.data.success) {
        setDecks(decks.filter(deck => deck._id !== deckId));
        if (selectedDeck?._id === deckId) {
          setSelectedDeck(null);
        }
        toast.success('Deck deleted successfully!');
      }
    } catch (error) {
      console.error('Delete deck error:', error);
      toast.error('Failed to delete deck');
    }
  };

  const handleNextCard = () => {
    if (selectedDeck && currentCard < selectedDeck.cards.length - 1) {
      setCurrentCard(currentCard + 1);
      setIsFlipped(false);
    }
  };

  const handlePreviousCard = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
      setIsFlipped(false);
    }
  };

  const cardVariants = {
    front: { rotateY: 0 },
    back: { rotateY: 180 }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto"
    >
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Flashcards</h1>
          <p className="text-gray-600 mt-2">Study with smart flashcards</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center"
        >
          <FiPlus className="mr-2" />
          Create Deck
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deck List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 max-h-[600px] overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Decks</h2>
            {decks.length > 0 ? (
              <div className="space-y-3">
                {decks.map((deck) => (
                  <motion.div
                    key={deck._id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => {
                      setSelectedDeck(deck);
                      setCurrentCard(0);
                      setIsFlipped(false);
                    }}
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                      selectedDeck?._id === deck._id
                        ? 'bg-indigo-50 border-2 border-indigo-500'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{deck.title}</h3>
                        <p className="text-sm text-gray-600">{deck.cards?.length || 0} cards</p>
                      </div>
                      <button
                        onClick={(e) => handleDeleteDeck(deck._id, e)}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No decks yet. Create your first deck!</p>
            )}
          </div>
        </div>

        {/* Flashcard Display */}
        <div className="lg:col-span-2">
          {selectedDeck ? (
            <div className="space-y-6">
              {/* Card Display */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                {selectedDeck.cards?.length > 0 ? (
                  <>
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">{selectedDeck.title}</h3>
                      <span className="text-sm text-gray-600">
                        Card {currentCard + 1} of {selectedDeck.cards.length}
                      </span>
                    </div>

                    <div className="relative h-80 mb-6">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentCard}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="absolute inset-0"
                        >
                          <motion.div
                            animate={isFlipped ? "back" : "front"}
                            variants={cardVariants}
                            transition={{ duration: 0.6 }}
                            onClick={() => setIsFlipped(!isFlipped)}
                            className="w-full h-full cursor-pointer"
                            style={{ transformStyle: 'preserve-3d' }}
                          >
                            {/* Front of card */}
                            <div
                              className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-8 flex items-center justify-center"
                              style={{ 
                                backfaceVisibility: 'hidden',
                                WebkitBackfaceVisibility: 'hidden'
                              }}
                            >
                              <p className="text-xl text-center text-gray-800">
                                {selectedDeck.cards[currentCard].front}
                              </p>
                            </div>

                            {/* Back of card */}
                            <div
                              className="absolute inset-0 bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-8 flex items-center justify-center"
                              style={{ 
                                backfaceVisibility: 'hidden',
                                WebkitBackfaceVisibility: 'hidden',
                                transform: 'rotateY(180deg)'
                              }}
                            >
                              <p className="text-xl text-center text-gray-800">
                                {selectedDeck.cards[currentCard].back}
                              </p>
                            </div>
                          </motion.div>
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        onClick={handlePreviousCard}
                        disabled={currentCard === 0}
                        className={`p-2 rounded-lg transition-all ${
                          currentCard === 0
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        <FiChevronLeft size={24} />
                      </button>

                      <button
                        onClick={() => setIsFlipped(!isFlipped)}
                        className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700"
                      >
                        <FiRotateCw size={20} />
                        <span>Flip Card</span>
                      </button>

                      <button
                        onClick={handleNextCard}
                        disabled={currentCard === selectedDeck.cards.length - 1}
                        className={`p-2 rounded-lg transition-all ${
                          currentCard === selectedDeck.cards.length - 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        <FiChevronRight size={24} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-16">
                    <p className="text-gray-500 mb-4">No cards in this deck yet</p>
                  </div>
                )}
              </div>

              {/* Add Card Form */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Card</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Front Side
                    </label>
                    <textarea
                      value={newCard.front}
                      onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500"
                      rows="3"
                      placeholder="Enter the question or prompt..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Back Side
                    </label>
                    <textarea
                      value={newCard.back}
                      onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500"
                      rows="3"
                      placeholder="Enter the answer..."
                    />
                  </div>
                  <button
                    onClick={handleAddCard}
                    className="w-full btn-primary py-2"
                  >
                    Add Card
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center">
              <FiLayers className="mx-auto text-gray-300 mb-4" size={64} />
              <p className="text-gray-500">Select a deck to start studying</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Deck Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Deck</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deck Title *
                  </label>
                  <input
                    type="text"
                    value={newDeck.title}
                    onChange={(e) => setNewDeck({ ...newDeck, title: e.target.value })}
                    className="w-full input-field"
                    placeholder="e.g., Biology Chapter 5"
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newDeck.description}
                    onChange={(e) => setNewDeck({ ...newDeck, description: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500"
                    rows="3"
                    placeholder="Add a description..."
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleCreateDeck}
                    disabled={loading || !newDeck.title.trim()}
                    className="flex-1 btn-primary py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating...' : 'Create Deck'}
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewDeck({ title: '', description: '' });
                    }}
                    disabled={loading}
                    className="flex-1 btn-secondary py-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FlashcardDeck;

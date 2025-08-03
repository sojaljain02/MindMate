export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  SUMMARIZER: {
    SUMMARIZE: '/summarize',
    HISTORY: '/summarize/history',
  },
  QUIZ: {
    GENERATE: '/quiz/generate',
    GET: '/quiz/:id',
    SUBMIT: '/quiz/:id/submit',
    LIST: '/quiz/list',
  },
  FLASHCARDS: {
    DECKS: '/flashcards/decks',
    DECK: '/flashcards/decks/:id',
    CARDS: '/flashcards/decks/:id/cards',
  },
};

export const QUIZ_DIFFICULTIES = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
};

export const SUMMARY_LENGTHS = {
  SHORT: 'short',
  MEDIUM: 'medium',
  LONG: 'long',
};

export const FILE_TYPES = {
  PDF: '.pdf',
  DOC: '.doc',
  DOCX: '.docx',
  TXT: '.txt',
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

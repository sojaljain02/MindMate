# 🧠 MindMate - AI-Powered Study Assistant

<div align="center">
  <img src="https://img.shields.io/badge/React-18.2.0-blue?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-16+-green?style=for-the-badge&logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/Python-3.8+-yellow?style=for-the-badge&logo=python" alt="Python" />
  <img src="https://img.shields.io/badge/MongoDB-5.0+-green?style=for-the-badge&logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/FastAPI-0.104.1-009688?style=for-the-badge&logo=fastapi" alt="FastAPI" />
</div>

<div align="center">
  <h3>Transform your study experience with AI-powered tools</h3>
  <p>Generate summaries, create quizzes, and build flashcards from any text or document</p>
</div>

---

## 🌟 Overview

MindMate is a comprehensive AI-powered study assistant that helps students learn more effectively. It uses advanced NLP models to transform any text or document into interactive study materials including summaries, quizzes, and flashcards.

## ✨ Features

### 📝 Smart Text Summarizer
- AI-powered text summarization using BART model
- Support for PDF, DOC, DOCX, and TXT files
- Adjustable summary lengths (short, medium, long)
- Keyword extraction
- Summary history tracking

### 🎯 Intelligent Quiz Generator
- Automatic quiz generation from any text
- Multiple choice and true/false questions
- Configurable difficulty levels (easy, medium, hard)
- Detailed explanations for answers
- Quiz attempt history and performance tracking

### 🃏 Smart Flashcard Creator
- AI-generated flashcards from study materials
- Spaced repetition learning system
- Named entity recognition for better cards
- Progress tracking and review scheduling

### 📊 Personal Dashboard
- Track learning progress and study streaks
- View activity history and statistics
- Interactive charts for study patterns
- Quick access to recent materials

## 🏗️ Architecture

MindMate uses a microservices architecture with three main components:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React Client  │────▶│   Node.js API   │────▶│  Python AI      │
│   (Port 3000)   │◀────│   (Port 5000)   │◀────│  (Port 8000)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │    MongoDB      │
                        │   Database      │
                        └─────────────────┘
```
```

## 🚀 Tech Stack

### Frontend (React)
- **React 18** with Hooks
- **React Router v6** for navigation
- **Framer Motion** for animations
- **TailwindCSS** for styling
- **React Hot Toast** for notifications
- **Axios** for API calls

### Backend (Node.js)
- **Express.js** REST API
- **MongoDB** with Mongoose ODM
- **JWT** authentication
- **Multer** for file uploads
- **Express Rate Limit** for API protection
- **Helmet** for security headers

### AI Service (Python)
- **FastAPI** for high-performance API
- **Transformers** (Hugging Face) for NLP models
- **spaCy** for text processing
- **NLTK** for text analysis
- **PyTorch** for model inference

### AI Models Used
- **Summarization**: `facebook/bart-large-cnn`
- **Question Answering**: `deepset/roberta-base-squad2`
- **Named Entity Recognition**: `spaCy en_core_web_sm`

## 📦 Installation

### Prerequisites
- Node.js 16+
- Python 3.8+
- MongoDB 5.0+
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/sojaljain02/MindMate.git
cd MindMate
```

### 2. Setup Backend (Node.js)
```bash
cd server
npm install

# Create .env file
cat > .env << EOL
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mindmate
JWT_SECRET=your_jwt_secret_here
PYTHON_SERVICE_URL=http://localhost:8000
EOL

# Start the server
npm start
```

### 3. Setup Python AI Service
```bash
cd ../python-service
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm

# Create .env file
cat > .env << EOL
PORT=8000
MODEL_CACHE_DIR=./models
EOL

# Start the service
python app.py
```

### 4. Setup Frontend (React)
```bash
cd ../client
npm install

# Create .env file
cat > .env << EOL
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
EOL

# Start the development server
npm start
```

## 🏃‍♂️ Running the Application

1. **Start MongoDB** (if not already running)
   ```bash
   mongod
   ```

2. **Start all services** (in separate terminals):
   ```bash
   # Terminal 1 - Python AI Service
   cd python-service && python app.py

   # Terminal 2 - Node.js Backend
   cd server && npm start

   # Terminal 3 - React Frontend
   cd client && npm start
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Python AI API: http://localhost:8000

## 📁 Project Structure

```
MindMate/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API services
│   │   └── App.js         # Main app component
│   └── package.json
│
├── server/                 # Node.js backend
│   ├── controllers/       # Route controllers
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── services/         # Business logic
│   └── server.js         # Entry point
│
└── python-service/        # Python AI service
    ├── routes/           # FastAPI routes
    ├── services/         # AI processing services
    ├── utils/            # Utility functions
    ├── config.py         # Configuration
    └── app.py            # FastAPI app
```

## 🔧 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Summary Endpoints
- `POST /api/summarize` - Generate summary
- `GET /api/summarize/history` - Get user's summaries
- `GET /api/summarize/:id` - Get specific summary
- `DELETE /api/summarize/:id` - Delete summary

### Quiz Endpoints
- `POST /api/quiz/generate` - Generate quiz
- `GET /api/quiz/list` - Get user's quizzes
- `GET /api/quiz/:id` - Get specific quiz
- `POST /api/quiz/:id/submit` - Submit quiz answers
- `DELETE /api/quiz/:id` - Delete quiz

### Flashcard Endpoints
- `POST /api/flashcards/generate` - Generate flashcards
- `GET /api/flashcards/decks` - Get all decks
- `POST /api/flashcards/decks` - Create new deck
- `GET /api/flashcards/decks/:id` - Get specific deck
- `DELETE /api/flashcards/decks/:id` - Delete deck

## 🔐 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mindmate
JWT_SECRET=your_jwt_secret_here
PYTHON_SERVICE_URL=http://localhost:8000
```

### Python Service (.env)
```env
PORT=8000
MODEL_CACHE_DIR=./models
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

## 🧪 Testing

```bash
# Backend tests
cd server && npm test

# Python service tests
cd python-service && pytest

# Frontend tests
cd client && npm test
```

## 🛠️ Troubleshooting

### Python Service Issues
```bash
# If models fail to download
python -m transformers-cli download facebook/bart-large-cnn

# If spaCy model issues
python -m spacy download en_core_web_sm
```

### MongoDB Connection Issues
```bash
# Check MongoDB status
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Sojal Jain** - *Initial work* - [GitHub](https://github.com/sojaljain02)

## 🙏 Acknowledgments

- Hugging Face for providing pre-trained models
- spaCy team for excellent NLP tools
- The open-source community for amazing libraries
- All contributors who have helped shape MindMate

---

<div align="center">
  <p>Made with ❤️ by the MindMate Team</p>
  <p>
    <a href="https://github.com/sojaljain02/MindMate/issues">Report Bug</a>
    •
    <a href="https://github.com/sojaljain02/MindMate/issues">Request Feature</a>
  </p>
</div>
```

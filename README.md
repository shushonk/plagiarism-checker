# Plagiarism Checker

A full-stack plagiarism detection web application built with React, Node.js, and MongoDB. Uses TF-IDF and shingling algorithms to detect text similarity without relying on external plagiarism APIs.

## 🚀 Features

- **Text Input**: Paste text directly or upload files (.txt, .pdf, .docx)
- **Advanced Algorithms**: TF-IDF similarity and shingling + Jaccard similarity
- **Real-time Analysis**: Fast plagiarism detection with detailed results
- **Visual Results**: Similarity scores, matched documents, and highlighted phrases
- **File Support**: Extract text from PDFs and Word documents
- **Database Storage**: Store submissions and build a comparison corpus
- **Modern UI**: Clean, responsive interface built with React and Tailwind CSS

## 🏗️ Architecture

### Backend (Node.js + Express)
- **Text Processing**: Cleaning, tokenization, stopword removal
- **TF-IDF Service**: Term frequency-inverse document frequency analysis
- **Shingling Service**: N-gram generation and Jaccard similarity
- **Comparison Engine**: Combines multiple algorithms for accurate detection
- **File Handling**: Extract text from various file formats
- **MongoDB Integration**: Store documents and submission history

### Frontend (Vite + React)
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **File Upload**: Drag-and-drop support for multiple file types
- **Real-time Results**: Live plagiarism analysis with visual feedback
- **Interactive Display**: Highlighted matching phrases and detailed statistics

## 📋 Requirements

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🛠️ Installation

### 1. Clone the repository
```bash
git clone https://github.com/shushonk/plagiarism-checker.git
cd plagiarism-checker
```

### 2. Install backend dependencies
```bash
cd backend
npm install
```

### 3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

### 4. Set up environment variables
Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/plagiarism-checker
NODE_ENV=development
```

### 5. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Windows
net start MongoDB

# On Linux
sudo systemctl start mongod
```

## 🚀 Running the Application

### Option 1: Development Mode (Recommended)

1. **Start the backend server**:
```bash
cd backend
npm run dev
```
The server will run on `http://localhost:5000`

2. **Start the frontend development server**:
```bash
cd frontend
npm run dev
```
The frontend will run on `http://localhost:3000`

### Option 2: Production Build

1. **Build the frontend**:
```bash
cd frontend
npm run build
```

2. **Start the backend**:
```bash
cd backend
npm start
```

## 📖 Usage

1. **Open your browser** and navigate to `http://localhost:3000`

2. **Enter text** directly in the text area or upload a file:
   - Supported file types: .txt, .pdf, .docx
   - Maximum file size: 10MB
   - Minimum text length: 50 characters, 10 words

3. **Click "Check Plagiarism"** to analyze the text

4. **View results**:
   - Overall plagiarism score (0-100%)
   - Matched documents with similarity percentages
   - Highlighted phrases in the original text
   - Detailed statistics and processing information

## 🔧 API Endpoints

### Plagiarism Detection
- `POST /api/plagiarism/check` - Check plagiarism with file upload
- `POST /api/plagiarism/check-text` - Check plagiarism with text input

### Document Management
- `GET /api/plagiarism/documents` - Get all documents in corpus
- `POST /api/plagiarism/documents` - Add document to corpus

### Submission History
- `GET /api/plagiarism/submissions` - Get submission history
- `GET /api/plagiarism/submissions/:id` - Get specific submission details

### Statistics
- `GET /api/plagiarism/statistics` - Get application statistics

## 🧠 Algorithm Details

### TF-IDF (Term Frequency-Inverse Document Frequency)
- Calculates term importance in documents
- Identifies relevant keywords and phrases
- Measures similarity based on term distributions

### Shingling (N-gram Analysis)
- Breaks text into overlapping word sequences (shingles)
- Uses Jaccard similarity to compare shingle sets
- Detects exact phrase matches and paraphrasing

### Combined Scoring
- Final score = (0.6 × TF-IDF score) + (0.4 × Shingling score)
- Weighted approach balances semantic and literal similarity
- Provides comprehensive plagiarism detection

## 📊 Database Schema

### Document Model
```javascript
{
  title: String,
  content: String,
  source: ['uploaded', 'previous_submission', 'sample_corpus'],
  metadata: {
    wordCount: Number,
    characterCount: Number,
    fileType: String
  },
  tags: [String],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Submission Model
```javascript
{
  originalText: String,
  cleanedText: String,
  similarityScore: Number,
  matches: [{
    documentId: ObjectId,
    title: String,
    source: String,
    overallSimilarity: Number,
    tfidfSimilarity: Number,
    shingleSimilarity: Number,
    matchedPhrases: [Object],
    overlapCount: Number
  }],
  statistics: {
    wordCount: Number,
    characterCount: Number,
    shingleCount: Number,
    processingTime: Number
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    submissionType: String,
    fileName: String,
    fileType: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

## 🎨 Frontend Components

- **TextInput**: Text input and file upload interface
- **ResultDisplay**: Shows plagiarism scores and matched documents
- **HighlightedText**: Highlights matching phrases in original text
- **App**: Main application component with state management

## 🔧 Configuration

### Environment Variables
- `PORT`: Backend server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `NODE_ENV`: Environment mode (development/production)

### Algorithm Tuning
Adjust weights in `ComparisonService`:
```javascript
this.weightTfidf = 0.6;  // TF-IDF influence
this.weightShingle = 0.4; // Shingling influence
```

### Shingle Size
Modify shingle size in `ShinglingService`:
```javascript
constructor(shingleSize = 3) // Default: 3-word shingles
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**:
   - Ensure MongoDB is running
   - Check connection string in `.env` file
   - Verify MongoDB credentials

2. **File Upload Error**:
   - Check file size limit (10MB)
   - Verify supported file types (.txt, .pdf, .docx)
   - Ensure `uploads/` directory exists

3. **Frontend Proxy Error**:
   - Ensure backend is running on port 5000
   - Check Vite proxy configuration

4. **Memory Issues**:
   - Increase Node.js memory limit: `node --max-old-space-size=4096`
   - Optimize corpus size for large datasets

### Logs and Debugging

- Backend logs: Check console output for detailed error messages
- Frontend logs: Use browser developer tools for network and console errors
- Database logs: Monitor MongoDB logs for connection issues

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## 🙏 Acknowledgments

- Natural library for TF-IDF implementation
- Multer for file upload handling
- PDF-parse and Mammoth for document text extraction
- Lucide React for beautiful icons
- Vite for fast development and building

## 📞 Support

For issues, questions, or contributions, please open an issue on the GitHub repository.

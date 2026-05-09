import React, { useState } from 'react';
import axios from 'axios';
import TextInput from './components/TextInput.jsx';
import ResultDisplay from './components/ResultDisplay.jsx';
import HighlightedText from './components/HighlightedText.jsx';
import { AlertCircle, RefreshCw, BarChart3 } from 'lucide-react';

function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [originalText, setOriginalText] = useState('');

  const handleCheck = async (data) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let response;
      
      if (data.file) {
        // File upload - use FormData correctly
        const formData = new FormData();
        formData.append('file', data.file);
        response = await axios.post('/api/plagiarism/check', formData);
        setOriginalText(''); // We don't have the original text from file upload
      } else {
        // Text input
        response = await axios.post('/api/plagiarism/check-text', { text: data.text });
        setOriginalText(data.text);
      }

      if (response.data.success) {
        setResult(response.data.result);
      } else {
        setError(response.data.error || 'Plagiarism check failed');
      }
    } catch (err) {
      console.error('Error checking plagiarism:', err);
      if (err.response) {
        setError(err.response.data.error || err.response.data.details || 'Server error occurred');
      } else if (err.request) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setOriginalText('');
  };

  const getAllMatchedPhrases = () => {
    if (!result || !result.matches) return [];
    
    const allPhrases = [];
    result.matches.forEach(match => {
      if (match.matchedPhrases) {
        allPhrases.push(...match.matchedPhrases);
      }
    });
    
    return allPhrases;
  };

  return (
    <div>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '3rem', margin: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Plagiarism Checker
        </h1>
        <p style={{ color: '#888', fontSize: '1.2rem', marginTop: '0.5rem' }}>
          Advanced plagiarism detection using TF-IDF and shingling algorithms
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="container" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div className="loading" style={{ width: '48px', height: '48px', borderWidth: '4px' }}></div>
            <h3 style={{ color: '#fff', margin: 0 }}>Analyzing Text...</h3>
            <p style={{ color: '#888', margin: 0 }}>
              Our system is comparing your text against thousands of documents using advanced algorithms
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ textAlign: 'center' }}>
                <BarChart3 size={24} style={{ color: '#6366f1', marginBottom: '0.5rem' }} />
                <div style={{ fontSize: '0.9rem', color: '#888' }}>TF-IDF Analysis</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <RefreshCw size={24} style={{ color: '#6366f1', marginBottom: '0.5rem' }} />
                <div style={{ fontSize: '0.9rem', color: '#888' }}>Shingling</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!loading && !result && (
        <TextInput onCheck={handleCheck} loading={loading} />
      )}

      {/* Results */}
      {result && !loading && (
        <>
          <ResultDisplay result={result} />
          
          {/* Highlighted Text Section */}
          {originalText && getAllMatchedPhrases().length > 0 && (
            <div className="container">
              <HighlightedText 
                originalText={originalText} 
                matchedPhrases={getAllMatchedPhrases()}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="container" style={{ textAlign: 'center' }}>
            <button 
              onClick={handleReset}
              className="btn btn-primary"
              style={{ marginRight: '1rem' }}
            >
              <RefreshCw size={16} style={{ marginRight: '0.5rem' }} />
              Check Another Text
            </button>
          </div>
        </>
      )}

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '3rem', padding: '2rem', borderTop: '1px solid #333' }}>
        <p style={{ color: '#666', margin: 0 }}>
          Powered by TF-IDF and Shingling Algorithms • Built with React & Node.js
        </p>
      </div>
    </div>
  );
}

export default App;

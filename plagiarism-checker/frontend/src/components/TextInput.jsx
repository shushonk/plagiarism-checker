import React, { useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';

const TextInput = ({ onCheck, loading }) => {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onCheck({ text });
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleFileSubmit = (e) => {
    e.preventDefault();
    if (file) {
      onCheck({ file: file });
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  const getScoreColor = (score) => {
    if (score < 30) return 'score-low';
    if (score < 70) return 'score-medium';
    return 'score-high';
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Plagiarism Checker</h1>
        <p>Detect plagiarism using TF-IDF and shingling techniques</p>
      </div>

      {/* Text Input Section */}
      <div className="form-group">
        <label htmlFor="textInput">Enter your text below:</label>
        <form onSubmit={handleTextSubmit}>
          <textarea
            id="textInput"
            className="form-control"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your text here (minimum 50 characters, 10 words)..."
            disabled={loading}
          />
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading || !text.trim()}
            >
              {loading ? <span className="loading"></span> : 'Check Plagiarism'}
            </button>
          </div>
        </form>
      </div>

      {/* File Upload Section */}
      <div className="form-group">
        <label>Or upload a file:</label>
        <form onSubmit={handleFileSubmit}>
          <div 
            className={`file-upload ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              onChange={handleFileChange}
              accept=".txt,.pdf,.docx"
              disabled={loading}
            />
            <div className="file-upload-label">
              <Upload size={24} style={{ marginBottom: '0.5rem' }} />
              <div>
                {file ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <FileText size={16} />
                    <span>{file.name}</span>
                    <button 
                      type="button" 
                      onClick={removeFile}
                      style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div>Click to upload or drag and drop</div>
                    <div style={{ fontSize: '0.9rem', color: '#888', marginTop: '0.25rem' }}>
                      Supported: TXT, PDF, DOCX (Max 10MB)
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          {file && (
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? <span className="loading"></span> : 'Check File'}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Instructions */}
      <div style={{ marginTop: '2rem', textAlign: 'left', backgroundColor: '#2a2a2a', padding: '1rem', borderRadius: '8px' }}>
        <h4 style={{ margin: '0 0 0.5rem 0', color: '#fff' }}>How it works:</h4>
        <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#888' }}>
          <li>Enter text directly or upload a file (TXT, PDF, DOCX)</li>
          <li>Our system analyzes the text using TF-IDF and shingling algorithms</li>
          <li>Compares against a corpus of stored documents</li>
          <li>Returns similarity score and matched content</li>
        </ul>
      </div>
    </div>
  );
};

export default TextInput;

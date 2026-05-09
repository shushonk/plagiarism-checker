import React from 'react';
import { AlertCircle, CheckCircle, FileText, Clock } from 'lucide-react';

const ResultDisplay = ({ result }) => {
  if (!result) return null;

  const { overallScore, matches, statistics } = result;

  const getScoreColor = (score) => {
    if (score < 30) return 'score-low';
    if (score < 70) return 'score-medium';
    return 'score-high';
  };

  const getScoreLabel = (score) => {
    if (score < 30) return 'Low Similarity';
    if (score < 70) return 'Medium Similarity';
    return 'High Similarity';
  };

  const getScoreIcon = (score) => {
    if (score < 30) return <CheckCircle size={24} />;
    if (score < 70) return <AlertCircle size={24} />;
    return <AlertCircle size={24} />;
  };

  return (
    <div className="result-card">
      <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#fff' }}>
        Plagiarism Check Results
      </h2>

      {/* Overall Score Display */}
      <div className="score-display">
        <div className={`score-circle ${getScoreColor(overallScore)}`}>
          {overallScore.toFixed(1)}%
        </div>
        <h3 style={{ margin: '0.5rem 0', color: '#fff' }}>
          {getScoreLabel(overallScore)}
        </h3>
        <div style={{ color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          {getScoreIcon(overallScore)}
          <span>{getScoreIcon(overallScore) === <CheckCircle size={24} /> ? 'Likely Original' : 'Potential Plagiarism Detected'}</span>
        </div>
      </div>

      {/* Statistics */}
      <div className="statistics">
        <div className="stat-card">
          <div className="value">{statistics.inputWordCount}</div>
          <div className="label">Words Analyzed</div>
        </div>
        <div className="stat-card">
          <div className="value">{matches.length}</div>
          <div className="label">Matches Found</div>
        </div>
        <div className="stat-card">
          <div className="value">{statistics.documentCount}</div>
          <div className="label">Documents Compared</div>
        </div>
        <div className="stat-card">
          <div className="value">{statistics.shingleCount}</div>
          <div className="label">Shingles Generated</div>
        </div>
      </div>

      {/* Matches List */}
      {matches.length > 0 && (
        <div>
          <h3 style={{ marginBottom: '1rem', color: '#fff' }}>Matched Documents</h3>
          <div className="matches-list">
            {matches.map((match, index) => (
              <div key={index} className="match-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h4>{match.title}</h4>
                    <div style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      Source: {match.source} • Created: {new Date(match.createdAt).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="similarity">
                        Overall Similarity: {match.overallSimilarity.toFixed(1)}%
                      </span>
                      {match.tfidfSimilarity > 0 && (
                        <span style={{ marginLeft: '1rem', color: '#888' }}>
                          TF-IDF: {match.tfidfSimilarity.toFixed(1)}%
                        </span>
                      )}
                      {match.shingleSimilarity > 0 && (
                        <span style={{ marginLeft: '1rem', color: '#888' }}>
                          Shingling: {match.shingleSimilarity.toFixed(1)}%
                        </span>
                      )}
                    </div>
                    {match.matchedPhrases && match.matchedPhrases.length > 0 && (
                      <div className="phrases">
                        <strong>Matched phrases ({match.matchedPhrases.length}):</strong>
                        <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.5rem' }}>
                          {match.matchedPhrases.slice(0, 5).map((phrase, phraseIndex) => (
                            <li key={phraseIndex} style={{ marginBottom: '0.25rem' }}>
                              "{phrase.phrase}"
                            </li>
                          ))}
                          {match.matchedPhrases.length > 5 && (
                            <li style={{ fontStyle: 'italic', color: '#666' }}>
                              ... and {match.matchedPhrases.length - 5} more
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', marginLeft: '1rem' }}>
                    <div className={`score-circle ${getScoreColor(match.overallSimilarity)}`} 
                         style={{ width: '60px', height: '60px', fontSize: '1.2rem' }}>
                      {match.overallSimilarity.toFixed(0)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Matches Message */}
      {matches.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: '#2a2a2a', borderRadius: '8px' }}>
          <CheckCircle size={48} style={{ color: '#10b981', marginBottom: '1rem' }} />
          <h3 style={{ color: '#fff', margin: '0 0 0.5rem 0' }}>No Matches Found</h3>
          <p style={{ color: '#888', margin: 0 }}>
            Your text appears to be original with no significant matches found in our database.
          </p>
        </div>
      )}

      {/* Processing Info */}
      <div style={{ marginTop: '2rem', textAlign: 'center', color: '#666', fontSize: '0.9rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <Clock size={16} />
          <span>Processing completed in {statistics.processingTime}ms</span>
        </div>
        <div style={{ marginTop: '0.5rem' }}>
          Compared against {statistics.documentCount} documents using TF-IDF and shingling algorithms
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;

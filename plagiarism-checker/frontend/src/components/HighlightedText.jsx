import React from 'react';

const HighlightedText = ({ originalText, matchedPhrases }) => {
  if (!originalText || !matchedPhrases || matchedPhrases.length === 0) {
    return (
      <div className="highlighted-text">
        <p style={{ color: '#888', fontStyle: 'italic' }}>No matching phrases to highlight</p>
      </div>
    );
  }

  const highlightText = (text, phrases) => {
    if (!phrases || phrases.length === 0) return text;

    let highlightedText = text;
    const ranges = [];

    // Find all positions where phrases occur in the text
    phrases.forEach(phraseObj => {
      const phrase = phraseObj.phrase.toLowerCase();
      const textLower = text.toLowerCase();
      let startIndex = textLower.indexOf(phrase);
      
      while (startIndex !== -1) {
        const endIndex = startIndex + phrase.length;
        
        // Check if this range overlaps with existing ranges
        const overlaps = ranges.some(range => 
          (startIndex >= range.start && startIndex < range.end) ||
          (endIndex > range.start && endIndex <= range.end) ||
          (startIndex <= range.start && endIndex >= range.end)
        );

        if (!overlaps) {
          ranges.push({ start: startIndex, end: endIndex });
        }

        startIndex = textLower.indexOf(phrase, startIndex + 1);
      }
    });

    // Sort ranges by start position
    ranges.sort((a, b) => a.start - b.start);

    // Build highlighted text
    let result = [];
    let lastIndex = 0;

    ranges.forEach(range => {
      // Add text before the highlight
      if (range.start > lastIndex) {
        result.push(text.substring(lastIndex, range.start));
      }

      // Add highlighted text
      result.push(
        <span key={range.start} className="highlight">
          {text.substring(range.start, range.end)}
        </span>
      );

      lastIndex = range.end;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      result.push(text.substring(lastIndex));
    }

    return result.length > 0 ? result : text;
  };

  return (
    <div className="highlighted-text">
      <h4 style={{ margin: '0 0 1rem 0', color: '#fff' }}>Highlighted Text</h4>
      <div style={{ lineHeight: '1.6', textAlign: 'left' }}>
        {highlightText(originalText, matchedPhrases)}
      </div>
      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #333' }}>
        <small style={{ color: '#888' }}>
          <span className="highlight" style={{ padding: '2px 6px' }}>Red highlights</span> indicate potentially plagiarized content
        </small>
      </div>
    </div>
  );
};

export default HighlightedText;

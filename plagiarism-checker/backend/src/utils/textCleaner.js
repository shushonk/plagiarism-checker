import { removeStopwords } from 'stopword';

export class TextCleaner {
  static cleanText(text) {
    if (!text) return '';
    
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
  }

  static tokenize(text) {
    if (!text) return [];
    
    const cleanedText = this.cleanText(text);
    return cleanedText.split(' ').filter(word => word.length > 0);
  }

  static removeStopwords(tokens) {
    if (!tokens || tokens.length === 0) return [];
    
    return removeStopwords(tokens);
  }

  static generateShingles(text, shingleSize = 3) {
    if (!text) return [];
    
    const tokens = this.tokenize(text);
    const shingles = [];
    
    for (let i = 0; i <= tokens.length - shingleSize; i++) {
      const shingle = tokens.slice(i, i + shingleSize).join(' ');
      shingles.push(shingle);
    }
    
    return shingles;
  }

  static preprocessText(text) {
    if (!text) return { cleanedText: '', tokens: [], shingles: [] };
    
    const cleanedText = this.cleanText(text);
    const tokens = this.tokenize(cleanedText);
    const tokensWithoutStopwords = this.removeStopwords(tokens);
    const shingles = this.generateShingles(tokensWithoutStopwords.join(' '));
    
    return {
      cleanedText,
      tokens: tokensWithoutStopwords,
      shingles
    };
  }
}

import { TextCleaner } from '../utils/textCleaner.js';

export class TextProcessingService {
  static processText(text) {
    if (!text || typeof text !== 'string') {
      throw new Error('Invalid text input');
    }

    try {
      const processedText = TextCleaner.preprocessText(text);
      
      return {
        originalText: text,
        cleanedText: processedText.cleanedText,
        tokens: processedText.tokens,
        shingles: processedText.shingles,
        wordCount: processedText.tokens.length,
        shingleCount: processedText.shingles.length
      };
    } catch (error) {
      throw new Error(`Text processing failed: ${error.message}`);
    }
  }

  static validateText(text) {
    if (!text || typeof text !== 'string') {
      return { valid: false, error: 'Text is required and must be a string' };
    }

    if (text.trim().length === 0) {
      return { valid: false, error: 'Text cannot be empty' };
    }

    if (text.trim().length < 50) {
      return { valid: false, error: 'Text must be at least 50 characters long' };
    }

    const wordCount = text.trim().split(/\s+/).length;
    if (wordCount < 10) {
      return { valid: false, error: 'Text must contain at least 10 words' };
    }

    return { valid: true };
  }

  static getTextStatistics(text) {
    if (!text || typeof text !== 'string') {
      return {
        characterCount: 0,
        wordCount: 0,
        sentenceCount: 0,
        averageWordLength: 0
      };
    }

    const characterCount = text.length;
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    const sentenceCount = sentences.length;
    const averageWordLength = wordCount > 0 ? words.reduce((sum, word) => sum + word.length, 0) / wordCount : 0;

    return {
      characterCount,
      wordCount,
      sentenceCount,
      averageWordLength: Math.round(averageWordLength * 100) / 100
    };
  }
}

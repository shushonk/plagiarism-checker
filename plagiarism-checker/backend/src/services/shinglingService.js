import { TextCleaner } from '../utils/textCleaner.js';

export class ShinglingService {
  constructor(shingleSize = 3) {
    this.shingleSize = shingleSize;
  }

  generateShingles(text, customShingleSize = null) {
    if (!text || typeof text !== 'string') {
      throw new Error('Invalid text input');
    }

    const size = customShingleSize || this.shingleSize;
    const tokens = TextCleaner.tokenize(text);
    const shingles = new Set();

    for (let i = 0; i <= tokens.length - size; i++) {
      const shingle = tokens.slice(i, i + size).join(' ');
      shingles.add(shingle);
    }

    return Array.from(shingles);
  }

  computeJaccardSimilarity(shingles1, shingles2) {
    if (!Array.isArray(shingles1) || !Array.isArray(shingles2)) {
      throw new Error('Both inputs must be arrays');
    }

    const set1 = new Set(shingles1);
    const set2 = new Set(shingles2);

    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    if (union.size === 0) return 0;

    return intersection.size / union.size;
  }

  findOverlappingShingles(shingles1, shingles2) {
    if (!Array.isArray(shingles1) || !Array.isArray(shingles2)) {
      throw new Error('Both inputs must be arrays');
    }

    const set1 = new Set(shingles1);
    const set2 = new Set(shingles2);

    const overlapping = [...set1].filter(shingle => set2.has(shingle));
    
    return overlapping;
  }

  calculateSimilarity(text1, text2) {
    if (!text1 || !text2 || typeof text1 !== 'string' || typeof text2 !== 'string') {
      throw new Error('Both text inputs must be non-empty strings');
    }

    try {
      const shingles1 = this.generateShingles(text1);
      const shingles2 = this.generateShingles(text2);

      const similarity = this.computeJaccardSimilarity(shingles1, shingles2);
      const overlappingShingles = this.findOverlappingShingles(shingles1, shingles2);

      return {
        similarity: Math.round(similarity * 10000) / 100, // Round to 2 decimal places
        overlappingShingles,
        shingleCount1: shingles1.length,
        shingleCount2: shingles2.length,
        overlapCount: overlappingShingles.length
      };
    } catch (error) {
      throw new Error(`Shingling similarity calculation failed: ${error.message}`);
    }
  }

  compareWithDocuments(inputText, documents) {
    if (!inputText || typeof inputText !== 'string') {
      throw new Error('Invalid input text');
    }

    if (!Array.isArray(documents)) {
      throw new Error('Documents must be an array');
    }

    const inputShingles = this.generateShingles(inputText);
    const results = [];

    documents.forEach(doc => {
      if (doc.content && typeof doc.content === 'string') {
        const docShingles = this.generateShingles(doc.content);
        const similarity = this.computeJaccardSimilarity(inputShingles, docShingles);
        const overlappingShingles = this.findOverlappingShingles(inputShingles, docShingles);

        if (similarity > 0) {
          results.push({
            documentId: doc.id || doc._id,
            title: doc.title || 'Untitled Document',
            similarity: Math.round(similarity * 10000) / 100,
            overlappingShingles,
            shingleCount: docShingles.length,
            overlapCount: overlappingShingles.length
          });
        }
      }
    });

    // Sort by similarity (highest first)
    return results.sort((a, b) => b.similarity - a.similarity);
  }

  getTopMatches(inputText, documents, threshold = 0.1, maxResults = 10) {
    const similarities = this.compareWithDocuments(inputText, documents);
    
    return similarities
      .filter(match => match.similarity >= threshold)
      .slice(0, maxResults);
  }

  findMatchedPhrases(inputText, documentText, overlappingShingles) {
    if (!inputText || !documentText || !Array.isArray(overlappingShingles)) {
      return [];
    }

    const matchedPhrases = [];
    
    overlappingShingles.forEach(shingle => {
      // Find all occurrences of the shingle in both texts
      const inputRegex = new RegExp(this.escapeRegExp(shingle), 'gi');
      const docRegex = new RegExp(this.escapeRegExp(shingle), 'gi');
      
      const inputMatches = [...inputText.matchAll(inputRegex)];
      const docMatches = [...documentText.matchAll(docRegex)];
      
      if (inputMatches.length > 0 && docMatches.length > 0) {
        matchedPhrases.push({
          phrase: shingle,
          inputPositions: inputMatches.map(match => ({
            start: match.index,
            end: match.index + shingle.length
          })),
          documentPositions: docMatches.map(match => ({
            start: match.index,
            end: match.index + shingle.length
          }))
        });
      }
    });

    return matchedPhrases;
  }

  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  setShingleSize(size) {
    if (size < 2 || size > 10) {
      throw new Error('Shingle size must be between 2 and 10');
    }
    this.shingleSize = size;
  }

  getShingleSize() {
    return this.shingleSize;
  }
}

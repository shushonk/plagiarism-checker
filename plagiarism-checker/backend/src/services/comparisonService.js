import { TfIdfService } from './tfidfService.js';
import { ShinglingService } from './shinglingService.js';
import { TextProcessingService } from './textProcessingService.js';

export class ComparisonService {
  constructor() {
    this.tfidfService = new TfIdfService();
    this.shinglingService = new ShinglingService();
    this.weightTfidf = 0.6;
    this.weightShingle = 0.4;
  }

  async initializeCorpus(documents) {
    if (!Array.isArray(documents)) {
      throw new Error('Documents must be an array');
    }

    try {
      // Reset services
      this.tfidfService.reset();

      // Add documents to TF-IDF service
      const processedDocs = documents.map(doc => ({
        id: doc._id?.toString() || doc.id,
        content: doc.content || doc.text || ''
      }));

      this.tfidfService.addDocuments(processedDocs);

      return {
        documentCount: processedDocs.length,
        status: 'initialized'
      };
    } catch (error) {
      throw new Error(`Failed to initialize corpus: ${error.message}`);
    }
  }

  async checkPlagiarism(inputText, documents, options = {}) {
    if (!inputText || typeof inputText !== 'string') {
      throw new Error('Valid input text is required');
    }

    if (!Array.isArray(documents) || documents.length === 0) {
      throw new Error('Documents array is required and cannot be empty');
    }

    try {
      // Validate input text
      const validation = TextProcessingService.validateText(inputText);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Process input text
      const processedInput = TextProcessingService.processText(inputText);

      // Limit documents for performance (max 20 for comparison)
      const limitedDocuments = documents.slice(0, 20);

      // Get TF-IDF matches (with lower threshold for faster results)
      const tfidfMatches = this.tfidfService.getTopMatches(
        inputText, 
        options.tfidfThreshold || 0.05, // Lower threshold
        options.maxTfidfResults || 10    // Limit results
      );

      // Get Shingling matches (limited for performance)
      const shingleMatches = this.shinglingService.getTopMatches(
        inputText, 
        limitedDocuments, 
        options.shingleThreshold || 0.05, // Lower threshold
        options.maxShingleResults || 10   // Limit results
      );

      // Combine results
      const combinedResults = this.combineResults(tfidfMatches, shingleMatches, limitedDocuments);

      // Calculate final plagiarism score
      const finalScore = this.calculateFinalScore(combinedResults);

      // Get detailed matches with highlighted phrases (limited)
      const detailedMatches = await this.getDetailedMatches(inputText, combinedResults, limitedDocuments);

      return {
        overallScore: finalScore,
        matches: detailedMatches,
        statistics: {
          documentCount: limitedDocuments.length,
          tfidfMatches: tfidfMatches.length,
          shingleMatches: shingleMatches.length,
          combinedMatches: combinedResults.length,
          inputWordCount: processedInput.wordCount,
          inputShingleCount: processedInput.shingleCount
        },
        processingTime: Date.now()
      };
    } catch (error) {
      throw new Error(`Plagiarism check failed: ${error.message}`);
    }
  }

  combineResults(tfidfMatches, shingleMatches, documents) {
    const combined = new Map();

    // Process TF-IDF matches
    tfidfMatches.forEach(match => {
      const docId = match.documentId;
      combined.set(docId, {
        documentId: docId,
        tfidfScore: match.similarity,
        shingleScore: 0,
        content: match.content
      });
    });

    // Process Shingling matches
    shingleMatches.forEach(match => {
      const docId = match.documentId;
      if (combined.has(docId)) {
        const existing = combined.get(docId);
        existing.shingleScore = match.similarity;
        existing.overlappingShingles = match.overlappingShingles;
      } else {
        // Find document content
        const doc = documents.find(d => 
          (d._id?.toString() || d.id) === docId
        );
        
        combined.set(docId, {
          documentId: docId,
          tfidfScore: 0,
          shingleScore: match.similarity,
          overlappingShingles: match.overlappingShingles,
          content: doc?.content || doc?.text || ''
        });
      }
    });

    // Calculate combined scores
    const results = Array.from(combined.values()).map(result => {
      const combinedScore = this.calculateCombinedScore(
        result.tfidfScore, 
        result.shingleScore
      );

      return {
        ...result,
        combinedScore
      };
    });

    // Sort by combined score (highest first)
    return results.sort((a, b) => b.combinedScore - a.combinedScore);
  }

  calculateCombinedScore(tfidfScore, shingleScore) {
    return Math.round(
      (this.weightTfidf * tfidfScore + this.weightShingle * shingleScore) * 100
    ) / 100;
  }

  calculateFinalScore(combinedResults) {
    if (combinedResults.length === 0) {
      return 0;
    }

    // Use the highest combined score as the final plagiarism score
    const highestScore = combinedResults[0].combinedScore;
    
    // Apply some scaling to make the score more meaningful
    const scaledScore = Math.min(highestScore * 1.2, 100);
    
    return Math.round(scaledScore * 100) / 100;
  }

  async getDetailedMatches(inputText, combinedResults, documents) {
    const detailedMatches = [];

    for (const result of combinedResults) {
      const doc = documents.find(d => 
        (d._id?.toString() || d.id) === result.documentId
      );

      if (doc && result.combinedScore > 5) { // Only include matches with meaningful scores
        const shingleDetails = this.shinglingService.calculateSimilarity(
          inputText, 
          result.content
        );

        const matchedPhrases = this.shinglingService.findMatchedPhrases(
          inputText,
          result.content,
          shingleDetails.overlappingShingles
        );

        detailedMatches.push({
          documentId: result.documentId,
          title: doc.title || 'Untitled Document',
          source: doc.source || 'unknown',
          overallSimilarity: result.combinedScore,
          tfidfSimilarity: result.tfidfScore,
          shingleSimilarity: result.shingleScore,
          matchedPhrases: matchedPhrases.slice(0, 10), // Limit to top 10 phrases
          overlapCount: shingleDetails.overlapCount,
          createdAt: doc.createdAt
        });
      }
    }

    return detailedMatches;
  }

  setWeights(tfidfWeight, shingleWeight) {
    const total = tfidfWeight + shingleWeight;
    if (Math.abs(total - 1.0) > 0.01) {
      throw new Error('Weights must sum to 1.0');
    }

    this.weightTfidf = tfidfWeight;
    this.weightShingle = shingleWeight;
  }

  getWeights() {
    return {
      tfidf: this.weightTfidf,
      shingle: this.weightShingle
    };
  }

  async addDocumentToCorpus(document) {
    if (!document || !document.content) {
      throw new Error('Document must have content');
    }

    try {
      const docId = document._id?.toString() || document.id;
      this.tfidfService.addDocument(docId, document.content);

      return {
        documentId: docId,
        status: 'added'
      };
    } catch (error) {
      throw new Error(`Failed to add document to corpus: ${error.message}`);
    }
  }

  getCorpusSize() {
    return this.tfidfService.getDocumentCount();
  }
}

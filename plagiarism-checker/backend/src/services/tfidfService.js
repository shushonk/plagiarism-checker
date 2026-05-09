import natural from 'natural';

export class TfIdfService {
  constructor() {
    this.tfidf = new natural.TfIdf();
    this.documents = new Map();
  }

  addDocument(id, text) {
    if (!text || typeof text !== 'string') {
      throw new Error('Invalid document text');
    }
    
    this.tfidf.addDocument(text);
    this.documents.set(id, text);
  }

  addDocuments(documents) {
    if (!Array.isArray(documents)) {
      throw new Error('Documents must be an array');
    }

    documents.forEach(doc => {
      if (doc.id && doc.content) {
        this.addDocument(doc.id, doc.content);
      }
    });
  }

  calculateSimilarity(inputText, topK = 10) {
    if (!inputText || typeof inputText !== 'string') {
      throw new Error('Invalid input text');
    }

    const similarities = [];
    let docIndex = 0;

    this.documents.forEach((docContent, docId) => {
      const similarity = this.getDocumentSimilarity(inputText, docIndex);
      
      if (similarity > 0) {
        similarities.push({
          documentId: docId,
          content: docContent,
          similarity: similarity
        });
      }
      
      docIndex++;
    });

    // Sort by similarity (highest first) and return top K
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  getDocumentSimilarity(inputText, documentIndex) {
    const inputTerms = this.tfidf.listTerms(documentIndex);
    const inputTfIdf = new Map();
    
    // Calculate TF-IDF for input text against the document
    this.tfidf.tfidfs(inputText, (i, measure) => {
      if (i === documentIndex) {
        inputTfIdf.set(documentIndex, measure);
      }
    });

    // Get TF-IDF vectors for both documents
    const docTerms = this.tfidf.listTerms(documentIndex);
    const inputVector = [];
    const docVector = [];

    // Create combined vocabulary
    const allTerms = new Set();
    
    // Extract terms from input text
    const inputTokenizer = new natural.WordTokenizer();
    const inputTokens = inputTokenizer.tokenize(inputText.toLowerCase()) || [];
    inputTokens.forEach(token => allTerms.add(token));
    
    // Extract terms from document
    docTerms.forEach(term => allTerms.add(term.term));

    // Build vectors
    allTerms.forEach(term => {
      // Input vector
      const inputTf = this.calculateTermFrequency(term, inputTokens);
      const inputIdf = this.calculateInverseDocumentFrequency(term);
      inputVector.push(inputTf * inputIdf);

      // Document vector  
      const docTerm = docTerms.find(t => t.term === term);
      docVector.push(docTerm ? docTerm.tfidf : 0);
    });

    // Calculate cosine similarity
    return this.cosineSimilarity(inputVector, docVector);
  }

  calculateTermFrequency(term, tokens) {
    if (!tokens || tokens.length === 0) return 0;
    
    const count = tokens.filter(token => token === term).length;
    return count / tokens.length;
  }

  calculateInverseDocumentFrequency(term) {
    let docCount = 0;
    
    this.documents.forEach(docContent => {
      const tokens = docContent.toLowerCase().split(/\s+/);
      if (tokens.includes(term)) {
        docCount++;
      }
    });

    const totalDocs = this.documents.size;
    if (docCount === 0) return 0;
    
    return Math.log(totalDocs / docCount);
  }

  cosineSimilarity(vectorA, vectorB) {
    if (vectorA.length !== vectorB.length) {
      throw new Error('Vectors must be of same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      normA += vectorA[i] * vectorA[i];
      normB += vectorB[i] * vectorB[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (normA * normB);
  }

  getTopMatches(inputText, threshold = 0.1, maxResults = 10) {
    const similarities = this.calculateSimilarity(inputText, maxResults);
    
    return similarities
      .filter(match => match.similarity >= threshold)
      .map(match => ({
        documentId: match.documentId,
        similarity: Math.round(match.similarity * 10000) / 100, // Round to 2 decimal places
        content: match.content
      }));
  }

  reset() {
    this.tfidf = new natural.TfIdf();
    this.documents.clear();
  }

  getDocumentCount() {
    return this.documents.size;
  }
}

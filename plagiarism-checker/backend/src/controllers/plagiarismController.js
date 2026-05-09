import { ComparisonService } from '../services/comparisonService.js';
import { TextProcessingService } from '../services/textProcessingService.js';
import { FileExtractor } from '../utils/fileExtractor.js';
import { Document } from '../models/Document.js';
import { Submission } from '../models/Submission.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (FileExtractor.isSupported(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Initialize comparison service
const comparisonService = new ComparisonService();

// Initialize corpus with existing documents
const initializeCorpus = async () => {
  try {
    const documents = await Document.findActiveDocuments();
    if (documents.length > 0) {
      await comparisonService.initializeCorpus(documents);
      console.log(`Corpus initialized with ${documents.length} documents`);
    }
  } catch (error) {
    console.error('Failed to initialize corpus:', error);
  }
};

// Initialize corpus on startup
initializeCorpus();

export const checkPlagiarism = async (req, res) => {
  try {
    const startTime = Date.now();
    let text = req.body.text;
    let fileName = null;
    let fileType = null;

    // Handle file upload
    if (req.file) {
      try {
        text = await FileExtractor.extractText(req.file.path, req.file.mimetype);
        fileName = req.file.originalname;
        fileType = req.file.mimetype;
        
        // Clean up uploaded file
        fs.unlinkSync(req.file.path);
      } catch (error) {
        // Clean up file on error
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({
          error: 'File processing failed',
          details: error.message
        });
      }
    }

    // Validate text input
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        error: 'Text is required',
        details: 'Please provide text either directly or by uploading a file'
      });
    }

    // Validate text length
    const validation = TextProcessingService.validateText(text);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Invalid text',
        details: validation.error
      });
    }

    // Get documents from corpus
    const documents = await Document.findActiveDocuments();
    
    if (documents.length === 0) {
      return res.status(400).json({
        error: 'No documents available for comparison',
        details: 'Please add documents to the corpus first'
      });
    }

    // Perform plagiarism check
    const result = await comparisonService.checkPlagiarism(text, documents);
    
    // Create submission record
    const submission = new Submission({
      originalText: text,
      cleanedText: TextProcessingService.processText(text).cleanedText,
      similarityScore: result.overallScore,
      matches: result.matches.map(match => ({
        documentId: match.documentId,
        title: match.title,
        source: match.source,
        overallSimilarity: match.overallSimilarity,
        tfidfSimilarity: match.tfidfSimilarity,
        shingleSimilarity: match.shingleSimilarity,
        matchedPhrases: match.matchedPhrases,
        overlapCount: match.overlapCount
      })),
      statistics: {
        wordCount: result.statistics.inputWordCount,
        shingleCount: result.statistics.inputShingleCount,
        processingTime: Date.now() - startTime
      },
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        submissionType: req.file ? 'file' : 'text',
        fileName,
        fileType
      }
    });

    await submission.save();

    // Add submission to corpus for future comparisons
    if (result.overallScore < 100) { // Don't add 100% plagiarized content
      await comparisonService.addDocumentToCorpus({
        _id: submission._id,
        content: text,
        title: `Submission ${submission._id}`,
        source: 'previous_submission'
      });
    }

    res.json({
      success: true,
      result: {
        overallScore: result.overallScore,
        matches: result.matches,
        statistics: result.statistics,
        submissionId: submission._id
      }
    });

  } catch (error) {
    console.error('Plagiarism check error:', error);
    res.status(500).json({
      error: 'Plagiarism check failed',
      details: error.message
    });
  }
};

export const getSubmissionHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, minScore, maxScore } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    
    if (minScore !== undefined || maxScore !== undefined) {
      query.similarityScore = {};
      if (minScore !== undefined) query.similarityScore.$gte = parseFloat(minScore);
      if (maxScore !== undefined) query.similarityScore.$lte = parseFloat(maxScore);
    }

    const submissions = await Submission.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('originalText similarityScore matches statistics metadata createdAt')
      .lean();

    const total = await Submission.countDocuments(query);

    res.json({
      success: true,
      submissions: submissions.map(sub => ({
        id: sub._id,
        similarityScore: sub.similarityScore,
        matchCount: sub.matches.length,
        wordCount: sub.statistics.wordCount,
        submissionType: sub.metadata.submissionType,
        fileName: sub.metadata.fileName,
        createdAt: sub.createdAt,
        hasHighPlagiarism: sub.similarityScore >= 70
      })),
      pagination: {
        current: parseInt(page),
        pageSize: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get submission history error:', error);
    res.status(500).json({
      error: 'Failed to retrieve submission history',
      details: error.message
    });
  }
};

export const getSubmissionDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await Submission.findById(id)
      .populate('matches.documentId', 'title source createdAt')
      .lean();

    if (!submission) {
      return res.status(404).json({
        error: 'Submission not found',
        details: `No submission found with ID: ${id}`
      });
    }

    res.json({
      success: true,
      submission: {
        id: submission._id,
        originalText: submission.originalText,
        cleanedText: submission.cleanedText,
        similarityScore: submission.similarityScore,
        matches: submission.matches,
        statistics: submission.statistics,
        metadata: submission.metadata,
        createdAt: submission.createdAt
      }
    });

  } catch (error) {
    console.error('Get submission details error:', error);
    res.status(500).json({
      error: 'Failed to retrieve submission details',
      details: error.message
    });
  }
};

export const addDocument = async (req, res) => {
  try {
    const { title, content, source = 'uploaded', tags = [] } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'Title and content are required'
      });
    }

    const validation = TextProcessingService.validateText(content);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Invalid content',
        details: validation.error
      });
    }

    const document = new Document({
      title,
      content,
      source,
      tags,
      metadata: {
        fileType: 'manual'
      }
    });

    await document.save();

    // Add to corpus
    await comparisonService.addDocumentToCorpus(document);

    res.status(201).json({
      success: true,
      document: document.getSummary()
    });

  } catch (error) {
    console.error('Add document error:', error);
    res.status(500).json({
      error: 'Failed to add document',
      details: error.message
    });
  }
};

export const getDocuments = async (req, res) => {
  try {
    const { page = 1, limit = 20, source, search } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };
    
    if (source) {
      query.source = source;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const documents = await Document.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('title source metadata tags createdAt')
      .lean();

    const total = await Document.countDocuments(query);

    res.json({
      success: true,
      documents: documents.map(doc => ({
        id: doc._id,
        title: doc.title,
        source: doc.source,
        wordCount: doc.metadata.wordCount,
        characterCount: doc.metadata.characterCount,
        tags: doc.tags,
        createdAt: doc.createdAt
      })),
      pagination: {
        current: parseInt(page),
        pageSize: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      error: 'Failed to retrieve documents',
      details: error.message
    });
  }
};

export const getStatistics = async (req, res) => {
  try {
    const submissionStats = await Submission.getStatistics();
    const documentCount = await Document.countDocuments({ isActive: true });
    const corpusSize = comparisonService.getCorpusSize();

    res.json({
      success: true,
      statistics: {
        submissions: submissionStats[0] || {
          totalSubmissions: 0,
          averageSimilarity: 0,
          maxSimilarity: 0,
          minSimilarity: 0,
          highPlagiarismCount: 0
        },
        documents: {
          totalActive: documentCount,
          corpusSize
        }
      }
    });

  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      error: 'Failed to retrieve statistics',
      details: error.message
    });
  }
};

export const uploadMiddleware = upload.single('file');

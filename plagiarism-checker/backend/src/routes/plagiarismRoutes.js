import express from 'express';
import {
  checkPlagiarism,
  getSubmissionHistory,
  getSubmissionDetails,
  addDocument,
  getDocuments,
  getStatistics,
  uploadMiddleware
} from '../controllers/plagiarismController.js';

const router = express.Router();

// Main plagiarism check endpoint
router.post('/check', uploadMiddleware, checkPlagiarism);

// Simple text check endpoint (without file upload)
router.post('/check-text', checkPlagiarism);

// Submission history and details
router.get('/submissions', getSubmissionHistory);
router.get('/submissions/:id', getSubmissionDetails);

// Document management
router.post('/documents', addDocument);
router.get('/documents', getDocuments);

// Statistics
router.get('/statistics', getStatistics);

export default router;

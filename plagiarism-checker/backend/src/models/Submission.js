import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  originalText: {
    type: String,
    required: true,
    minlength: 50
  },
  cleanedText: {
    type: String,
    required: true
  },
  similarityScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  matches: [{
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true
    },
    title: {
      type: String,
      required: true
    },
    source: {
      type: String,
      required: true
    },
    overallSimilarity: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    tfidfSimilarity: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    shingleSimilarity: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    matchedPhrases: [{
      phrase: {
        type: String,
        required: true
      },
      inputPositions: [{
        start: Number,
        end: Number
      }],
      documentPositions: [{
        start: Number,
        end: Number
      }]
    }],
    overlapCount: {
      type: Number,
      default: 0
    }
  }],
  statistics: {
    wordCount: {
      type: Number,
      default: 0
    },
    characterCount: {
      type: Number,
      default: 0
    },
    shingleCount: {
      type: Number,
      default: 0
    },
    processingTime: {
      type: Number,
      default: 0
    }
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    submissionType: {
      type: String,
      enum: ['text', 'file'],
      default: 'text'
    },
    fileName: String,
    fileType: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
submissionSchema.index({ similarityScore: -1 });
submissionSchema.index({ createdAt: -1 });
submissionSchema.index({ 'matches.documentId': 1 });
submissionSchema.index({ 'metadata.submissionType': 1 });

// Pre-save middleware to calculate statistics
submissionSchema.pre('save', function(next) {
  if (this.isModified('originalText')) {
    this.statistics.wordCount = this.originalText.split(/\s+/).filter(word => word.length > 0).length;
    this.statistics.characterCount = this.originalText.length;
  }
  next();
});

// Static methods
submissionSchema.statics.findByScoreRange = function(minScore, maxScore) {
  return this.find({
    similarityScore: { $gte: minScore, $lte: maxScore }
  }).sort({ similarityScore: -1 });
};

submissionSchema.statics.findHighPlagiarism = function(threshold = 70) {
  return this.find({
    similarityScore: { $gte: threshold }
  }).sort({ similarityScore: -1 });
};

submissionSchema.statics.getStatistics = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalSubmissions: { $sum: 1 },
        averageSimilarity: { $avg: '$similarityScore' },
        maxSimilarity: { $max: '$similarityScore' },
        minSimilarity: { $min: '$similarityScore' },
        highPlagiarismCount: {
          $sum: { $cond: [{ $gte: ['$similarityScore', 70] }, 1, 0] }
        }
      }
    }
  ]);
};

// Instance methods
submissionSchema.methods.getSummary = function() {
  return {
    id: this._id,
    similarityScore: this.similarityScore,
    matchCount: this.matches.length,
    wordCount: this.statistics.wordCount,
    submissionType: this.metadata.submissionType,
    createdAt: this.createdAt
  };
};

submissionSchema.methods.getTopMatches = function(limit = 5) {
  return this.matches
    .sort((a, b) => b.overallSimilarity - a.overallSimilarity)
    .slice(0, limit)
    .map(match => ({
      documentId: match.documentId,
      title: match.title,
      similarity: match.overallSimilarity,
      phraseCount: match.matchedPhrases.length
    }));
};

submissionSchema.methods.hasHighPlagiarism = function(threshold = 70) {
  return this.similarityScore >= threshold;
};

export const Submission = mongoose.model('Submission', submissionSchema);

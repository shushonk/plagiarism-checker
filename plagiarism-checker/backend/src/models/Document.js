import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  content: {
    type: String,
    required: true,
    minlength: 50
  },
  source: {
    type: String,
    enum: ['uploaded', 'previous_submission', 'sample_corpus'],
    default: 'uploaded'
  },
  metadata: {
    wordCount: {
      type: Number,
      default: 0
    },
    characterCount: {
      type: Number,
      default: 0
    },
    fileType: {
      type: String,
      enum: ['txt', 'pdf', 'docx', 'manual']
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better search performance
documentSchema.index({ title: 'text', content: 'text' });
documentSchema.index({ source: 1 });
documentSchema.index({ isActive: 1 });
documentSchema.index({ createdAt: -1 });

// Pre-save middleware to calculate word and character count
documentSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    this.metadata.wordCount = this.content.split(/\s+/).filter(word => word.length > 0).length;
    this.metadata.characterCount = this.content.length;
  }
  next();
});

// Static methods
documentSchema.statics.findBySource = function(source) {
  return this.find({ source, isActive: true });
};

documentSchema.statics.findActiveDocuments = function() {
  return this.find({ isActive: true }).sort({ createdAt: -1 });
};

documentSchema.statics.searchDocuments = function(query) {
  return this.find({
    $and: [
      { isActive: true },
      {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { content: { $regex: query, $options: 'i' } }
        ]
      }
    ]
  });
};

// Instance methods
documentSchema.methods.toSafeObject = function() {
  const obj = this.toObject();
  // Limit content length for responses
  if (obj.content && obj.content.length > 10000) {
    obj.content = obj.content.substring(0, 10000) + '...';
  }
  return obj;
};

documentSchema.methods.getSummary = function() {
  return {
    id: this._id,
    title: this.title,
    source: this.source,
    wordCount: this.metadata.wordCount,
    characterCount: this.metadata.characterCount,
    createdAt: this.createdAt,
    tags: this.tags
  };
};

export const Document = mongoose.model('Document', documentSchema);

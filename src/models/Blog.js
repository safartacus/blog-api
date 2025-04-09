const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  category: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  author: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  readTime: {
    type: Number,
    required: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  dislikes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true // createdAt ve updatedAt alanlarını otomatik ekler
});

module.exports = mongoose.model('Blog', blogSchema);
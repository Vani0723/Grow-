const mongoose = require('mongoose');

const newsEventSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      default: 'Market Wire',
    },
    url: {
      type: String,
      default: '#',
    },
    publishedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    eventType: {
      type: String,
      enum: [
        'NEWS',
        'EARNINGS',
        'DIVIDEND',
        'RESULT',
        'SPLIT',
        'BONUS',
        'BUYBACK',
        'MANAGEMENT',
        'REGULATORY',
        'OTHER',
      ],
      default: 'NEWS',
    },
    impact: {
      type: String,
      enum: ['HIGH', 'MEDIUM', 'LOW'],
      default: 'MEDIUM',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('NewsEvent', newsEventSchema);

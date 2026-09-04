const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  stocks: [{ symbol: String, name: String }], // stored order
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

watchlistSchema.pre('save', function(next){
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Watchlist', watchlistSchema);

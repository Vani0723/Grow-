const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
  stocks: [{ symbol: String, name: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, {
  bufferCommands: false // Disable buffering so findOne never hangs 10s
});

watchlistSchema.pre('save', function(next){
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Watchlist', watchlistSchema);

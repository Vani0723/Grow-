const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  pinHash: { type: String }, // optional 4‑digit PIN hash
  pinAttempts: { type: Number, default: 0 }, // failed attempts counter
  pinLockUntil: { type: Date }, // lockout timestamp
  lastKnownPrices: { type: Map, of: Number },
  updatedAt: { type: Date, default: Date.now },
  lastVisitedAt: { type: Date },
}, {
  bufferCommands: false // Disable buffering so findOne never hangs 10s
});

userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);

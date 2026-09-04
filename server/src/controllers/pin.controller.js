const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const RefreshToken = require('../models/refreshToken.model');
const { signUnlockToken } = require('../utils/unlockJwt');
const cookie = require('cookie');

// Set a 4‑digit PIN for the authenticated user
async function setPin(req, res, next) {
  try {
    const { pin } = req.body;
    if (!pin || !/^[0-9]{4}$/.test(pin)) {
      return res.status(400).json({ success: false, message: 'PIN must be exactly 4 digits' });
    }
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const pinHash = await bcrypt.hash(pin, 12);
    user.pinHash = pinHash;
    user.pinAttempts = 0;
    user.pinLockUntil = null;
    await user.save();
    return res.json({ success: true, message: 'PIN set successfully' });
  } catch (err) {
    next(err);
  }
}

// Verify PIN and issue unlock token
async function verifyPin(req, res, next) {
  try {
    const { pin } = req.body;
    if (!pin) return res.status(400).json({ success: false, message: 'PIN required' });
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Check lockout
    if (user.pinLockUntil && user.pinLockUntil > new Date()) {
      return res.status(423).json({ success: false, message: 'PIN locked. Try later.' });
    }

    const valid = await bcrypt.compare(pin, user.pinHash || '');
    if (!valid) {
      // Increment attempts
      user.pinAttempts = (user.pinAttempts || 0) + 1;
      // Lock after 5 attempts for 15 mins
      if (user.pinAttempts >= 5) {
        user.pinLockUntil = new Date(Date.now() + 15 * 60 * 1000);
        user.pinAttempts = 0; // reset counter
      }
      await user.save();
      return res.status(401).json({ success: false, message: 'Invalid PIN' });
    }

    // Successful verification – reset attempts and lock
    user.pinAttempts = 0;
    user.pinLockUntil = null;
    await user.save();

    // Issue short‑lived unlock token (httpOnly cookie)
    const unlockToken = signUnlockToken(user._id);
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 10 * 60 * 1000, // 10 minutes
      path: '/',
    };
    res.setHeader('Set-Cookie', cookie.serialize('unlockToken', unlockToken, cookieOptions));
    return res.json({ success: true, message: 'PIN verified' });
  } catch (err) {
    next(err);
  }
}

module.exports = { setPin, verifyPin };

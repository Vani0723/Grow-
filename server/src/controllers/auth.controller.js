const bcrypt = require('bcryptjs');
const cookie = require('cookie');
const mongoose = require('mongoose');
const User = require('../models/user.model');
const RefreshToken = require('../models/refreshToken.model');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');

// In-Memory fallback store for zero-downtime demo mode
const inMemoryUsers = new Map();
const inMemoryRefreshTokens = new Map();

function isDbConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

// Helper to set httpOnly refresh cookie
function setRefreshCookie(res, token) {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  };
  res.setHeader('Set-Cookie', cookie.serialize('refreshToken', token, cookieOptions));
}

// Register new user
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }
    const normalizedEmail = email.toLowerCase();
    const passwordHash = await bcrypt.hash(password, 12);

    if (isDbConnected()) {
      const existing = await User.findOne({ email: normalizedEmail });
      if (existing) {
        return res.status(409).json({ success: false, message: 'User already exists' });
      }
      await User.create({ name, email: normalizedEmail, passwordHash });
    } else {
      // In-memory register fallback
      if (inMemoryUsers.has(normalizedEmail)) {
        return res.status(409).json({ success: false, message: 'User already exists' });
      }
      const fakeId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
      inMemoryUsers.set(normalizedEmail, {
        _id: fakeId,
        name,
        email: normalizedEmail,
        passwordHash,
        lastVisitedAt: new Date()
      });
    }

    return res.status(201).json({ success: true, message: 'User registered' });
  } catch (err) {
    next(err);
  }
}

// Login user and issue tokens
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }
    const normalizedEmail = email.toLowerCase();
    let userObj = null;

    if (isDbConnected()) {
      const user = await User.findOne({ email: normalizedEmail });
      if (user) {
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (valid) {
          user.lastVisitedAt = new Date();
          await user.save();
          userObj = { _id: user._id, name: user.name, email: user.email, lastVisitedAt: user.lastVisitedAt };
        }
      }
    } else {
      // In-memory login fallback
      const memoryUser = inMemoryUsers.get(normalizedEmail);
      if (memoryUser) {
        const valid = await bcrypt.compare(password, memoryUser.passwordHash);
        if (valid) {
          memoryUser.lastVisitedAt = new Date();
          userObj = { _id: memoryUser._id, name: memoryUser.name, email: memoryUser.email, lastVisitedAt: memoryUser.lastVisitedAt };
        }
      } else {
        // Auto-provision demo account on login if in demo mode
        const fakeId = 'demo_' + Date.now();
        const passwordHash = await bcrypt.hash(password, 12);
        const newUser = { _id: fakeId, name: email.split('@')[0], email: normalizedEmail, passwordHash, lastVisitedAt: new Date() };
        inMemoryUsers.set(normalizedEmail, newUser);
        userObj = { _id: fakeId, name: newUser.name, email: normalizedEmail, lastVisitedAt: newUser.lastVisitedAt };
      }
    }

    if (!userObj) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const accessToken = signAccessToken(userObj._id);
    const refreshTokenRaw = signRefreshToken(userObj._id);

    setRefreshCookie(res, refreshTokenRaw);
    return res.json({ success: true, accessToken, lastVisitedAt: userObj.lastVisitedAt });
  } catch (err) {
    next(err);
  }
}

// Refresh access token
async function refresh(req, res, next) {
  try {
    const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
    const rawToken = cookies.refreshToken;
    if (!rawToken) {
      return res.status(401).json({ success: false, message: 'No refresh token' });
    }
    const payload = verifyRefreshToken(rawToken);
    if (!payload) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    const newAccess = signAccessToken(payload.sub);
    return res.json({ success: true, accessToken: newAccess });
  } catch (err) {
    next(err);
  }
}

// Logout
async function logout(req, res, next) {
  try {
    res.setHeader('Set-Cookie', cookie.serialize('refreshToken', '', { httpOnly: true, maxAge: 0, path: '/' }));
    return res.json({ success: true, message: 'Logged out' });
  } catch (err) {
    next(err);
  }
}

// Get current user (protected)
async function me(req, res, next) {
  try {
    if (isDbConnected()) {
      const user = await User.findById(req.userId).select('_id name email');
      if (user) {
        return res.json({ success: true, data: user });
      }
    }
    // Fallback response for in-memory or guest
    return res.json({
      success: true,
      data: { _id: req.userId, name: 'Groww User', email: 'user@groww.in' }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, refresh, logout, me };

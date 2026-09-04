const bcrypt = require('bcryptjs');
const cookie = require('cookie');
const User = require('../models/user.model');
const RefreshToken = require('../models/refreshToken.model');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');

// Helper to set httpOnly refresh cookie
function setRefreshCookie(res, token) {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ success: false, message: 'User already exists' });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email: normalizedEmail, passwordHash });
    // Do not auto‑login after registration; client can call login.
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
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // generic error to avoid enumeration
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    // Update last visited timestamp
    user.lastVisitedAt = new Date();
    await user.save();
    const accessToken = signAccessToken(user._id);
    const refreshTokenRaw = signRefreshToken(user._id);
    // Store hashed refresh token
    const tokenHash = await bcrypt.hash(refreshTokenRaw, 12);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await RefreshToken.create({ userId: user._id, tokenHash, expiresAt });
    setRefreshCookie(res, refreshTokenRaw);
    // Return access token and lastVisitedAt for client toast
    return res.json({ success: true, accessToken, lastVisitedAt: user.lastVisitedAt });
  } catch (err) {
    next(err);
  }
}

// Refresh access token using httpOnly cookie
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
    const stored = await RefreshToken.findOne({ userId: payload.sub });
    if (!stored) {
      return res.status(401).json({ success: false, message: 'Refresh token not found' });
    }
    const match = await bcrypt.compare(rawToken, stored.tokenHash);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Refresh token mismatch' });
    }
    if (stored.revokedAt || stored.expiresAt < new Date()) {
      return res.status(401).json({ success: false, message: 'Refresh token expired or revoked' });
    }
    // Issue new access token (optional rotation of refresh token could be added later)
    const newAccess = signAccessToken(payload.sub);
    return res.json({ success: true, accessToken: newAccess });
  } catch (err) {
    next(err);
  }
}

// Logout – clear cookie and revoke token
async function logout(req, res, next) {
  try {
    const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
    const rawToken = cookies.refreshToken;
    if (rawToken) {
      const payload = verifyRefreshToken(rawToken);
      if (payload) {
        await RefreshToken.updateOne({ userId: payload.sub }, { revokedAt: new Date() });
      }
    }
    // Clear cookie
    res.setHeader('Set-Cookie', cookie.serialize('refreshToken', '', { httpOnly: true, maxAge: 0, path: '/' }));
    return res.json({ success: true, message: 'Logged out' });
  } catch (err) {
    next(err);
  }
}

// Get current user (protected)
async function me(req, res, next) {
  try {
    const user = await User.findById(req.userId).select('_id name email');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, refresh, logout, me };

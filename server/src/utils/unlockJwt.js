const jwt = require('jsonwebtoken');

const UNLOCK_SECRET = process.env.UNLOCK_SECRET || 'unlock-secret-placeholder';
const UNLOCK_EXPIRES = process.env.UNLOCK_EXPIRES || '10m'; // short‑lived token

function signUnlockToken(userId) {
  return jwt.sign({ sub: userId }, UNLOCK_SECRET, { expiresIn: UNLOCK_EXPIRES });
}

function verifyUnlockToken(token) {
  try {
    return jwt.verify(token, UNLOCK_SECRET);
  } catch (err) {
    return null;
  }
}

module.exports = { signUnlockToken, verifyUnlockToken };

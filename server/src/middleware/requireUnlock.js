const { verifyUnlockToken } = require('../utils/unlockJwt');

module.exports = function (req, res, next) {
  const cookies = req.headers.cookie ? require('cookie').parse(req.headers.cookie) : {};
  const token = cookies.unlockToken;
  if (!token) {
    return res.status(401).json({ success: false, message: 'Unlock token required' });
  }
  const payload = verifyUnlockToken(token);
  if (!payload) {
    return res.status(401).json({ success: false, message: 'Invalid or expired unlock token' });
  }
  // token is valid – attach userId if needed
  req.userId = payload.sub;
  next();
};

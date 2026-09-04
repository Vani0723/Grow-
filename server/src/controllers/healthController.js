exports.getHealth = (req, res) => {
  res.json({ success: true, message: 'Smart Market Watchlist API is running' });
};

// middlewares/checkOrigin.js
module.exports = function (req, res, next) {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://192.168.0.114:3000', 
    'https://shabanbuja.info'
  ];

  const origin = req.get('origin') || req.get('referer') || '';

  if (!allowedOrigins.some((allowed) => origin.startsWith(allowed))) {
    return res.status(403).json({ error: 'Access denied: Invalid origin' });
  }

  next();
};

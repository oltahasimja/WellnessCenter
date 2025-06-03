// middleware/apiKeyCheck.js


module.exports = function (req, res, next) {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.INTERNAL_API_KEY) {
    return res.status(403).json({ message: 'Access Denied' });
  }
  next();
};

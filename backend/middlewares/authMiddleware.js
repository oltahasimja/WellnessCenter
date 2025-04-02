const jwt = require('jsonwebtoken');

const isAuthenticated = (req, res, next) => {
  const token = req.cookies['ubtsecured'];

  if (!token) {
    // if (req.path === '/user') {
    //   return res.status(200).json({ user: null });
    // }
    return res.status(401).json({ error: 'Authentication required.' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'supersecret', { ignoreExpiration: false }, (err, user) => {
    if (err) {
      // if (req.path === '/user') {
      //   return res.status(200).json({ user: null });
      // }
      return res.status(403).json({ error: 'Invalid token.' });
    }
    req.user = user;
    next();
  });
};

module.exports = { isAuthenticated };
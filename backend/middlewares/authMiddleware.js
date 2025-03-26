const jwt = require('jsonwebtoken');

const isAuthenticated = (req, res, next) => {
  const token = req.cookies['ubtsecured'];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  console.log("Token received:", token); 

  jwt.verify(token, process.env.JWT_SECRET || 'supersecret', { ignoreExpiration: false }, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token.' });
    }
    req.user = user;
    console.log('Authenticated user:', user);
    next();
  });
};



module.exports = { isAuthenticated };

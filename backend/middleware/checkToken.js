const jwt = require('jsonwebtoken');

module.exports = function checkToken(req, _res, next) {
    req.user = null;
    const auth = req.get('Authorization');
    if (!auth || !auth.toLowerCase().startsWith('bearer ')) return next();
    const token = auth.slice(7);
    jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if (!err) req.user = decoded.user;
        next();
    });
};
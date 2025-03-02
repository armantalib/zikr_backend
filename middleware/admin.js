
module.exports = function (req, res, next) {
  // 401 Unauthorized
  // 403 Forbidden 

  if (req.user.type !== 'admin') return res.status(403).send('Access denied.1111');

  next();
}
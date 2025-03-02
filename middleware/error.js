const logger = require('../startup/logger'); // Adjust the path as needed

module.exports = function (err, req, res, next) {
  logger.error(err.message);

  // error
  // warn
  // info
  // verbose
  // debug 
  // silly

  res.status(500).send({ message: 'Something failed', success: false });
}
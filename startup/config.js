const config = require('config')

module.exports = function () {
  const jwtPrivateKey = config.get('jwtPrivateKey')
  if (!jwtPrivateKey) {
    throw new Error('FATAL ERROR: jwtPrivateKey is not defined.');
  }
}
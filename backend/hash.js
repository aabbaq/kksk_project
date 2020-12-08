const crypto = require('crypto')

function passwordHash (password) {
  const md5 = crypto.createHash('md5')
  md5.update(password)
  const mongoPassword = md5.digest('hex')
  return mongoPassword
}

module.exports = passwordHash

/* jshint esversion: 6 */
const jwt = require('jsonwebtoken')
const secret = 'caonimatoken'
const Token = {
  encrypt: (data) => {
    return jwt.sign({
      id: data.id,
      userrole: data.userrole
    },
    secret,
    { expiresIn: 60 * 60 * 3 })
  },

  decrypt: (token) => {
    try {
      const data = jwt.verify(token, secret)
      return {
        isTokenVerified: true,
        tokenData: data
      }
    } catch (err) {
      return {
        isTokenVerified: false,
        tokenData: err
      }
    }
  }
}

module.exports = Token

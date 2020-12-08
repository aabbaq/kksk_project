/* jshint esversion: 6 */
const jwt = require('jsonwebtoken')
const secret = 'caonimatoken'
const Token = {
  encrypt: (data) => {
    console.log('encrypt_data: ' + data)
    return jwt.sign({ id: data }, secret, { expiresIn: 60 * 60 * 3 })
  },

  decrypt: (token) => {
    try {
      const data = jwt.verify(token, secret)
      return {
        token: true,
        id: data.id
      }
    } catch (err) {
      return {
        token: false,
        data: err
      }
    }
  }
}

module.exports = Token

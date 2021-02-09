const express = require('express')
const router = express.Router()
const db = require('../mongodb.js')
const hash = require('../hash.js')
const Token = require('../webtoken.js')
const Methods = require('../backend-api-methods.js')

router.post('/login', (req, res) => {
  const userInfo = {
    username: req.body.username,
    password: hash(req.body.password)
  }
  const queryResult = db.userLogin(userInfo)
  if (queryResult.isErr) res.status(queryResult.status).send(queryResult.msg)
  else res.status(200).send(Methods.generateInfo(queryResult, Token.encrypt(queryResult)))
})

router.post('/getUserInfo', (req, res) => {
  const userInfoInToken = Token.decrypt(req.headers.authorization.split(' ')[1])
  if (!userInfoInToken.isTokenVerified) res.status(106).send(Methods.generateMsg(106).msg)
  else {
    const queryResult = db.getUserInfo(userInfoInToken.id)
    if (queryResult.isErr) res.status(queryResult.status).send(queryResult.msg)
    else res.status(200).send(Methods.generateInfo(queryResult))
  }
})

router.post('/tokenCheck', (req, res) => {
  const userInfoInToken = Token.decrypt(req.headers.authorization.split(' ')[1])
  userInfoInToken.isTokenVerified ? res.status(200) : res.status(106).send(Methods.generateMsg(106).msg)
})

module.exports = router

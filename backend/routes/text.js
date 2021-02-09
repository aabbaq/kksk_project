const express = require('express')
const router = express.Router()
const db = require('../mongodb.js')
const Token = require('../webtoken.js')
const Methods = require('../backend-api-methods.js')

router.post('/uploadBlog', (req, res) => {
  const userInfoInToken = Token.decrypt(req.headers.authorization.split(' ')[1])
  if (!userInfoInToken.isTokenVerified) res.status(106).send(Methods.generateMsg(106).msg)
  else req.body.blogupdate ? db.updateBlog(req, res) : db.uploadBlog(req, res)
})

router.post('/getBlogTexts', async function (req, res) {
  const queryResult = {}
  if (!req.headers.authorization) queryResult.peekTexts = await db.getBlogTexts({ userrole: 0 })
  else {
    const userInfoInToken = Token.decrypt(req.headers.authorization.split(' ')[1])
    if (!userInfoInToken.isTokenVerified) res.status(106).send(Methods.generateMsg(106).msg)
    else {
      const options = {
        needCardsInfo: req.body.needCardsInfo
      }
      queryResult.peekTexts = await db.getBlogTexts(userInfoInToken, options)
    }
  }
  queryResult.textsCount = queryResult.peekTexts.length
  res.status(200).send(queryResult)
})

router.get('/getOneText', async function (req, res) {
  const queryResult = await db.getOneText(Methods.generateQueryOption(req.query))
  console.log('!!!' + queryResult)
  if (!req.headers.authorization && (!queryResult.hidden || queryResult.secretLevel > 1)) {
    res.status(200).send(queryResult)
  } else {
    const userInfoInToken = Token.decrypt(req.headers.authorization.split(' ')[1])
    if (!userInfoInToken.isTokenVerified) res.status(106).send(Methods.generateMsg(106).msg)
    else {
      Methods.checkOfTextViewing(queryResult, userInfoInToken) ? res.status(200).send(queryResult) : res.status(105).send(Methods.generateMsg(105).msg)
    }
  }
})

router.post('/deleteText', (req, res) => {
  const userInfoInToken = Token.decrypt(req.headers.authorization.split(' ')[1])
  if (!userInfoInToken.isTokenVerified || userInfoInToken.userrole !== 7) res.status(106).send(Methods.generateMsg(106).msg)
  else db.deleteText(req, res)
})

module.exports = router

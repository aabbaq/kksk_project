const express = require('express')
const db = require('./mongodb.js')
const path = require('path')
const rapp = express()
const port = 3000
const bodyParser = require('body-parser')

// let public_url = path.join(__dirname, '..', 'public')
rapp.use(bodyParser.urlencoded({ extended: false }))
rapp.use(bodyParser.json())
rapp.use(express.static(__dirname))

rapp.all('*', function (req, res, next) {
  // 设置header后会先发送一次Options的请求，跳过该请求
  if (req.method.toLowerCase() === 'options') {
    res.status(200)
  }
  res.set('access-control-allow-headers', 'Authorization, Content-Type, Depth, User-Agent, X-File-Size, X-Requested-With, X-Requested-By, If-Modified-Since, X-File-Name, X-File-Type, Cache-Control, Origin')
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Credentials', 'true')
  // 巨坑，Access-Control-Allow-Headers在谷歌浏览器里要设置Content-Type
  res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization')
  res.set('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS')
  res.set('X-Powered-By', ' 3.2.1')
  res.set('Content-Type', 'application/json;charset=utf-8')
  next()
})

// 新版本规定要使用绝对路径
rapp.get('/', (req, res) => {
  const url = path.join(__dirname, '..', 'dist', 'index.html')
  console.log(url)
  // res.set('Content-Type', 'text/html')
  // res.type('html')
  // res.render(url)
  res.sendFile(url)
})

rapp.post('/api/login', (req, res) => {
  // console.log(req.body)
  db.userLogin(req, res)
  // res.send('...') 多余的服务器响应不需要
})

rapp.post('/api/tokenCheck', (req, res) => {
  db.tokenCheck(req, res)
})

rapp.post('/api/upLoadBlog', (req, res) => {
  if (!req.body.blogupdate) {
    db.upLoadBlog(req, res)
  } else {
    db.updateBlog(req, res)
  }
})

rapp.post('/api/getBlogTexts', (req, res) => {
  db.getBlogTexts(req, res)
})

rapp.get('/api/getOneText', (req, res) => {
  db.getOneText(req, res)
})

rapp.post('/api/deleteText', (req, res) => {
  db.deleteText(req, res)
})

rapp.get(/\.jpg$/, (req, res) => {
  res.status(302)
  res.setHeader('location', '//' + req.get('host').replace(':3000', ':8080') + req.path)
  res.send()
})

rapp.get(/\.ttf$/, (req, res) => {
  // res.status(302);
  res.setHeader('location', '//' + req.get('host').replace(':3000', ':8080') + req.path)
  res.send()
})

rapp.get(/\.woff2?$/, (req, res) => {
  // res.status(302);
  res.setHeader('location', '//' + req.get('host').replace(':3000', ':8080') + req.path)
  res.send()
})

rapp.listen(port, () => {
  // const host = server.address().address
  // const port = server.address().port
})
// const server =

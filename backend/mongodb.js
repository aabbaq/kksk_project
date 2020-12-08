const mongoose = require('mongoose')
const hash = require('./hash.js')
const Token = require('./webtoken.js')
const methods = require('./backend-api-methods.js')

const mongodbUrl = 'mongodb://localhost:27017/blog'
const dbConnection = mongoose.connection
const Schema = mongoose.Schema

mongoose.connect(mongodbUrl, { useUnifiedTopology: true, useNewUrlParser: true })
dbConnection.on('error', console.error.bind(console, 'connection failed:'))
dbConnection.once('open', function () {
  console.log('Database connected!')
})

const userInfoSchema = new Schema({
  username: String,
  password: String
})

const blogTextInfoSchema = new Schema({
  author: String,
  date: Date,
  dateInString: String,
  title: String,
  subtitle: String,
  tag: String,
  picture: String,
  content: String,
  htmlContent: String
})

const UserInfo = mongoose.model('user', userInfoSchema)
// mongoDB的表必须带s 模型名为user=>数据库collection名为users
const BlogTextInfo = mongoose.model('text', blogTextInfoSchema)

function userLogin (req, res) {
  console.log('User Information: ' + req.body)
  const hashPassword = hash(req.body.username)
  UserInfo.findOne({
    username: req.body.username,
    password: hashPassword
  }, (err, docs) => {
    if (err) {
      res.send({
        status: 500,
        msg: 'Error'
      })
    } else {
      if (docs === null) {
        res.send({
          status: 400,
          msg: 'Fail'
        })
      } else {
        const token = Token.encrypt(docs.id)
        res.send({
          status: 200,
          msg: 'Success',
          userid: docs.username,
          token: token
        })
      }
    }
  })
}

function tokenCheck (req, res) {
  console.log('User Token: ' + req.body.usertoken)
  const userToken = req.body.usertoken
  const userIdInfo = Token.decrypt(userToken)
  console.log('User id info: ' + userIdInfo)
  UserInfo.findOne({
    // mongo里的id是 “_id ”
    _id: userIdInfo.id
  }, (err, docs) => {
    if (err) {
      res.send({
        status: 500,
        msg: 'Token Another Error'
      })
    } else {
      if (docs === null) {
        res.send({
          status: 514,
          msg: 'User Not Found'
        })
      } else {
        res.send({
          status: 114,
          msg: 'User Token Check Success'
        })
      }
    }
  })
}

function upLoadBlog (req, res) {
  const timeNow = new Date()
  BlogTextInfo.create({
    author: req.body.blogauthor,
    date: timeNow,
    dateInString: methods.dateToString(timeNow, true),
    title: req.body.blogtitle,
    subtitle: req.body.blogsubtitle,
    tag: req.body.blogtag,
    picture: req.body.blogpic,
    content: req.body.blogcontent,
    htmlContent: req.body.blogcontenthtml
  }, function (err) {
    if (err) {
      res.send({
        status: 500,
        msg: 'Error'
      })
    } else {
      res.send({
        status: 200,
        msg: 'Upload Success'
      })
    }
  })
}

function getBlogTexts (req, res) {
  BlogTextInfo.find({}, (err, docs) => {
    if (err) {
      res.send({
        status: 500,
        msg: 'Get Texts Error'
      })
    } else {
      const peekTexts = []
      docs.forEach(function (each, inx, array) {
        const peekText = {
          title: each.title,
          subtitle: each.subtitle,
          id: each._id,
          author: each.author,
          date: methods.dateToString(each.date),
          picture: each.picture
        }
        peekTexts.push(peekText)
      })
      res.send({
        status: 200,
        msg: 'Get Texts Success',
        textsInfo: {
          textsCount: docs.length,
          peekTexts: peekTexts
        }
      })
    }
  })
}

function getOneText (req, res) {
  // console.log(req.query.id)
  BlogTextInfo.find({
    _id: req.query.id
  }, (err, docs) => {
    if (err) {
      res.send({
        status: 500,
        msg: 'Get Texts Error'
      })
    } else {
      res.send({
        status: 200,
        msg: 'Text Get Daze!',
        docs: docs
      })
    }
  })
}

function deleteText (req, res) {
  console.log(req.body.id)
  BlogTextInfo.deleteOne({
    _id: req.body.id
  }, (err) => {
    if (err) {
      res.send({
        status: 500,
        msg: 'Database Delete Error'
      })
    } else {
      res.send({
        status: 200,
        msg: 'Database Delete Daze'
      })
    }
  })
}

module.exports = {
  userLogin: userLogin,
  tokenCheck: tokenCheck,
  upLoadBlog: upLoadBlog,
  getBlogTexts: getBlogTexts,
  getOneText: getOneText,
  deleteText: deleteText
}

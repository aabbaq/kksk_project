const mongoose = require('mongoose')
const hash = require('./hash.js')
const Token = require('./webtoken.js')
const Methods = require('./backend-api-methods.js')

const mongodbUrl = 'mongodb://localhost:27017/blog'
const dbConnection = mongoose.connection
const Schema = mongoose.Schema

mongoose.connect(mongodbUrl, { useUnifiedTopology: true, useNewUrlParser: true })
mongoose.set('useFindAndModify', false)
dbConnection.on('error', console.error.bind(console, 'connection failed:'))
dbConnection.once('open', function () {
  console.log('Database connected!')
})

const userInfoSchema = new Schema({
  username: String,
  nickname: String,
  password: String,
  userrole: Number,
  registerDate: Date,
  registerDateInString: String,
  lastLoginDate: Date,
  lastLoginDateInString: String,
  biography: String
})

const blogTextInfoSchema = new Schema({
  number: Number,
  author: String,
  date: Date,
  dateInString: String,
  lastDate: Date,
  lastDateInString: String,
  title: String,
  subtitle: String,
  tag: String,
  picture: String,
  content: String,
  htmlContent: String,
  secretLevel: Number,
  protected: Boolean,
  protectedPassword: String,
  hidden: Boolean
})

// mongoDB的表必须带s 模型名为user=>数据库collection名为users
const UserInfo = mongoose.model('user', userInfoSchema)
const BlogTextInfo = mongoose.model('text', blogTextInfoSchema)
const NumberOfBlogTexts = BlogTextInfo.countDocuments({})

function userLogin (req, res) {
  const hashPassword = hash(req.body.password)
  UserInfo.findOne({
    username: req.body.username,
    password: hashPassword
  }, (err, docs) => {
    if (err) res.send(Methods.generateMsg(500))
    else {
      if (docs === null) res.send(Methods.generateMsg(102))
      else {
        const token = Token.encrypt(docs.id)
        res.send({
          status: 200,
          msg: 'Login Success',
          username: docs.username,
          userrole: docs.userrole,
          token: token
        })
      }
    }
  })
}

function tokenCheck (req, res) {
  // console.log('User Token: ' + req.body.usertoken)
  const userToken = req.body.usertoken
  const userIdInfo = Token.decrypt(userToken)
  // console.log('User id info: ' + userIdInfo.id)
  UserInfo.findOne({
    // mongo里的id是 “_id ”
    _id: userIdInfo.id
  }, (err, docs) => {
    if (err) res.send(Methods.generateMsg(500))
    else {
      if (docs === null) res.send(Methods.generateMsg(101))
      else {
        res.send({
          status: 200,
          msg: 'User Token Check Success'
        })
      }
    }
  })
}

function getUserInfo (req, res) {
  const userToken = req.body.token
  const userIdInfo = Token.decrypt(userToken)
  UserInfo.findOne({
    _id: userIdInfo.id
  }, (err, docs) => {
    if (err) res.send(Methods.generateMsg(500))
    else {
      if (docs === null) res.send(Methods.generateMsg(101))
      else {
        res.send({
          status: 200,
          userInfo: {
            userrole: docs.userrole,
            nickname: docs.nickname,
            username: docs.username,
            biography: docs.biography
          },
          msg: 'UserInfo GET Daze!'
        })
      }
    }
  })
}

function uploadBlog (req, res) {
  const timeNow = new Date()
  NumberOfBlogTexts.exec((execErr, count) => {
    if (execErr) res.send(Methods.generateMsg(500))
    else {
      BlogTextInfo.create({
        author: req.body.blogauthor,
        number: count + 1,
        date: timeNow,
        lastDate: timeNow,
        dateInString: Methods.dateToString(timeNow, true),
        lastDateInString: Methods.dateToString(timeNow, true),
        title: req.body.blogtitle,
        subtitle: req.body.blogsubtitle,
        tag: req.body.blogtag,
        picture: req.body.blogpic,
        content: req.body.blogcontent,
        htmlContent: req.body.blogcontenthtml,
        secretLevel: req.body.blogsecretlevel,
        protected: req.body.blogprotected,
        protectedPassword: req.body.blogprotectedpassword,
        hidden: req.body.bloghidden
      }, function (err) {
        if (err) res.send(Methods.generateMsg(500))
        else {
          res.send({
            status: 200,
            msg: 'Upload Success'
          })
        }
      })
    }
  })
}

function updateBlog (req, res) {
  const timeNow = new Date()
  BlogTextInfo.findOneAndUpdate({
    _id: req.body.blogid
  }, {
    lastDate: timeNow,
    lastDateInString: Methods.dateToString(timeNow, true),
    title: req.body.blogtitle,
    subtitle: req.body.blogsubtitle,
    tag: req.body.blogtag,
    picture: req.body.blogpic,
    content: req.body.blogcontent,
    htmlContent: req.body.blogcontenthtml,
    secretLevel: req.body.blogsecretlevel,
    protected: req.body.blogprotected,
    protectedPassword: req.body.blogprotectedpassword,
    hidden: req.body.bloghidden
  }, {
    upsert: true
  }, function (err) {
    if (err) res.send(Methods.generateMsg(500))
    else {
      res.send({
        status: 200,
        msg: 'Update Success'
      })
    }
  })
}

function getBlogTexts (req, res) {
  let peekTexts = []
  if (!req.body.isLogin) {
    BlogTextInfo.find({
      hidden: false,
      secretLevel: 1
    }, (err, docs) => {
      if (err) res.send(Methods.generateMsg(500))
      else {
        peekTexts = Methods.getPeekTextsList(docs, req.body.needCardsInfo)
        res.send({
          status: 200,
          msg: 'Guest View',
          textsInfo: {
            textsCount: peekTexts.length,
            peekTexts: peekTexts
          }
        })
      }
    })
  } else {
    const userToken = req.body.userToken
    const userIdInfo = Token.decrypt(userToken)
    if (!userIdInfo.token) res.send(Methods.generateMsg(103))
    else {
      UserInfo.findOne({
        _id: userIdInfo.id,
        userrole: req.body.userRole
      }, (err, docs) => {
        if (err) res.send(Methods.generateMsg(500))
        else {
          if (docs === null) res.send(Methods.generateMsg(104))
          else {
            BlogTextInfo.find({
              $or: [
                { author: req.body.userName },
                { hidden: false, secretLevel: { $lte: req.body.userRole } }
              ]
            }, (err, docs) => {
              if (err) res.send(Methods.generateMsg(500))
              else {
                if (docs === null) res.send(Methods.generateMsg(105))
                else {
                  peekTexts = Methods.getPeekTextsList(docs)
                  res.send({
                    status: 200,
                    msg: 'Login User View',
                    textsInfo: {
                      textsCount: peekTexts.length,
                      peekTexts: peekTexts
                    }
                  })
                }
              }
            })
          }
        }
      })
    }
  }
}

function getBlogTextsV (req, res) {
  let peekTexts = []
  if (!req.body.isLogin) res.send(Methods.generateMsg(701))
  else {
    const userToken = req.body.userToken
    const userIdInfo = Token.decrypt(userToken)
    if (!userIdInfo.token) res.send(Methods.generateMsg(702))
    else {
      UserInfo.findOne({
        _id: userIdInfo.id,
        userrole: req.body.userRole
      }, (err, docs) => {
        if (err) res.send(Methods.generateMsg(703))
        else {
          if (docs === null) res.send(Methods.generateMsg(704))
          else {
            BlogTextInfo.find({}, (err, docs) => {
              if (err) res.send(Methods.generateMsg(501))
              else {
                peekTexts = Methods.getPeekTextsList(docs, req.body.needCardsInfo)
                res.send({
                  status: 200,
                  msg: 'Master Get All Texts',
                  textsInfo: {
                    textsCount: peekTexts.length,
                    peekTexts: peekTexts
                  }
                })
              }
            })
          }
        }
      })
    }
  }
}

function getOneText (req, res) {
  if (req.query.id) {
    BlogTextInfo.find({
      _id: req.query.id
    }, (err, docs) => {
      if (err) res.send(Methods.generateMsg(500))
      else {
        res.send({
          status: 200,
          msg: 'Text Get Daze!',
          docs: docs
        })
      }
    })
  } else if (req.query.title) {
    BlogTextInfo.find({
      title: req.query.title
    }, (err, docs) => {
      if (err) res.send(Methods.generateMsg(500))
      else {
        res.send({
          status: 200,
          msg: 'Text Get Daze!',
          docs: docs
        })
      }
    })
  } else {
    BlogTextInfo.find({
      number: req.query.number
    }, (err, docs) => {
      if (err) res.send(Methods.generateMsg(500))
      else {
        res.send({
          status: 200,
          msg: 'Text Get Daze!',
          docs: docs
        })
      }
    })
  }
}

function deleteText (req, res) {
  console.log(req.body.id)
  BlogTextInfo.deleteOne({
    _id: req.body.id
  }, (err) => {
    if (err) res.send(Methods.generateMsg(500))
    else {
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
  getUserInfo: getUserInfo,
  uploadBlog: uploadBlog,
  getBlogTexts: getBlogTexts,
  getBlogTextsV: getBlogTextsV,
  getOneText: getOneText,
  deleteText: deleteText,
  updateBlog: updateBlog
}

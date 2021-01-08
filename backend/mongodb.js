const mongoose = require('mongoose')
const hash = require('./hash.js')
const Token = require('./webtoken.js')
const methods = require('./backend-api-methods.js')

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
  password: String,
  userrole: Number
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
const getNumberOfDatabase = BlogTextInfo.countDocuments({})

function userLogin (req, res) {
  const hashPassword = hash(req.body.password)
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
          status: 514,
          msg: 'Not Find User'
        })
      } else {
        const token = Token.encrypt(docs.id)
        res.send({
          status: 200,
          msg: 'Success',
          username: docs.username,
          userrole: docs.userrole,
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
  console.log('User id info: ' + userIdInfo.id)
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
  getNumberOfDatabase.exec((execErr, count) => {
    BlogTextInfo.create({
      author: req.body.blogauthor,
      number: count + 1,
      date: timeNow,
      lastDate: timeNow,
      dateInString: methods.dateToString(timeNow, true),
      lastDateInString: methods.dateToString(timeNow, true),
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
      if (err) {
        res.send({
          status: 500,
          msg: 'Upload Error'
        })
      } else {
        res.send({
          status: 200,
          msg: 'Upload Success'
        })
      }
    })
  })
}

function updateBlog (req, res) {
  const timeNow = new Date()
  BlogTextInfo.findOneAndUpdate({
    _id: req.body.blogid
  }, {
    lastDate: timeNow,
    lastDateInString: methods.dateToString(timeNow, true),
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
    if (err) {
      res.send({
        status: 500,
        msg: 'Update Error'
      })
    } else {
      res.send({
        status: 200,
        msg: 'Update Success'
      })
    }
  })
}

function getBlogTexts (req, res) {
  let flag = 0
  let peekTexts = []
  if (!req.body.isLogin) {
    BlogTextInfo.find({
      hidden: false,
      secretLevel: 1
    }, (err, docs) => {
      if (err) {
        flag = 100
      } else {
        peekTexts = methods.getPeekTextsList(docs)
        flag = 200
        console.log('flag: ' + flag + ' guest login!')
        res.send({
          status: flag,
          msg: 'CheckCode: ' + flag,
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
    if (!userIdInfo.token) {
      flag = 101
    } else {
      UserInfo.findOne({
        _id: userIdInfo.id,
        userrole: req.body.userRole
      }, (err, docs) => {
        if (err) {
          flag = 102
          console.log('UserInfo Error: ' + flag)
        } else {
          if (docs === null) {
            flag = 103
            console.log('UserInfo Null: ' + flag)
          } else {
            BlogTextInfo.find({
              $or: [
                { author: req.body.userName },
                { hidden: false, secretLevel: { $lte: req.body.userRole } }
              ]
            }, (err, docs) => {
              if (err) {
                flag = 104
                console.log('BlogTextInfo Error: ' + flag)
              } else {
                if (docs === null) {
                  flag = 105
                  console.log('BlogTextInfo Null: ' + flag)
                } else {
                  peekTexts = methods.getPeekTextsList(docs)
                  flag = 200
                  console.log('flag: ' + flag + ' user login!')
                  res.send({
                    status: flag,
                    msg: 'CheckCode: ' + flag,
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
  if (!req.body.isLogin) {
    res.send({
      status: 999,
      msg: 'Someone Not Login Want To Falsify Imformation Of Master!'
    })
  } else {
    const userToken = req.body.userToken
    const userIdInfo = Token.decrypt(userToken)
    if (!userIdInfo.token) {
      res.send({
        status: 998,
        msg: 'Someone Want To Falsify Imformation Of Master!'
      })
    } else {
      UserInfo.findOne({
        _id: userIdInfo.id,
        userrole: req.body.userRole
      }, (err, docs) => {
        if (err) {
          res.send({
            status: 997,
            msg: 'Someone In Low Level Want To Falsify Imformation Of Master!'
          })
        } else {
          if (docs === null) {
            res.send({
              status: 996,
              msg: 'Someone Not In Database Want To Falsify Imformation Of Master!'
            })
          } else {
            BlogTextInfo.find({}, (err, docs) => {
              if (err) {
                res.send({
                  status: 514,
                  msg: 'Master Get Texts Error'
                })
              } else {
                peekTexts = methods.getPeekTextsList(docs)
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
  } else {
    BlogTextInfo.find({
      title: req.query.title
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
  getBlogTextsV: getBlogTextsV,
  getOneText: getOneText,
  deleteText: deleteText,
  updateBlog: updateBlog
}

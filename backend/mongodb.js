const mongoose = require('mongoose')
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
  biography: String,
  alias: String,
  emoji: String
})

const blogTextInfoSchema = new Schema({
  number: Number,
  author: String,
  owner: String,
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
const DatabaseErr = Methods.generateMsg(500)

function userLogin (userInfo) {
  UserInfo.findOne(userInfo, (err, docs) => {
    if (err) console.log(err)
    return docs || Methods.generateMsg(102)
  })
}

function getUserInfo (userInfo) {
  UserInfo.findOne({
    _id: userInfo.id
  }, (err, docs) => {
    if (err) console.log(err)
    return docs || Methods.generateMsg(101)
  })
}

function uploadBlog (req, res) {
  const timeNow = new Date()
  NumberOfBlogTexts.exec((execErr, count) => {
    if (execErr) res.status(500).send(DatabaseErr.msg)
    else {
      BlogTextInfo.create({
        owner: req.body.owner,
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
        if (err) res.status(500).send(DatabaseErr.msg)
        else res.status(200).send({ msg: 'Upload Success' })
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
    if (err) res.status(500).send(DatabaseErr.msg)
    else res.status(200).send({ msg: 'Update Success' })
  })
}

function getBlogTexts (userInfo, opts) {
  const role = userInfo.userrole
  switch (role) {
    case 0: {
      return BlogTextInfo.find({
        hidden: false,
        secretLevel: 1
      }).then(res => {
        return Promise.resolve(Methods.getPeekTextsList(res))
      })
    }
    case 7: {
      BlogTextInfo.find({}).then(res => {
        return Promise.resolve(Methods.getPeekTextsList(res, opts.needCardsInfo))
      })
      break
    }
    default: {
      BlogTextInfo.find({
        $or: [
          { owner: UserInfo.id },
          { hidden: false, secretLevel: { $lte: role } }
        ]
      }).then(res => {
        return Promise.resolve(Methods.getPeekTextsList(res, opts.needCardsInfo))
      })
    }
  }
}

function getOneText (queryOption) {
  BlogTextInfo.findOne(queryOption).then(res => {
    return Promise.resolve(res)
  })
}

function deleteText (req, res) {
  BlogTextInfo.deleteOne({
    _id: req.body.id
  }, (err) => {
    if (err) res.send(Methods.generateMsg(500))
    else res.status(200).send({ msg: 'Database Delete Daze' })
  })
}

module.exports = {
  userLogin: userLogin,
  getUserInfo: getUserInfo,
  uploadBlog: uploadBlog,
  getBlogTexts: getBlogTexts,
  getOneText: getOneText,
  deleteText: deleteText,
  updateBlog: updateBlog
}

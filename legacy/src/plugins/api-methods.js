import axios from 'axios'

// token检测
function sendTokenToBackend (token, routeName = 'None') {
  return axios.post('http://localhost:3000/api/user/tokenCheck', {
    usertoken: token
  }).then(res => {
    if (res.status === 200) {
      console.log('backend has checked the token: ' + routeName)
      return Promise.resolve(res.status)
    } else {
      console.log('backend network error')
      return Promise.resolve('network error')
    }
  }).catch(err => {
    console.log(err)
    return Promise.reject(err)
  })
}

// 上传文章
function postOfUploadBlogTextToBackend (text, info) {
  return axios.post('http://localhost:3000/api/uploadBlog', {
    blogid: text.id,
    blogtitle: text.title,
    blogsubtitle: text.subtitle,
    blogtag: text.tag,
    blogpic: text.picture,
    blogcontenthtml: info.contentInHtml,
    blogcontent: text.content,
    blogsecretlevel: text.secretLevel,
    blogprotected: text.protectedMode,
    blogprotectedpassword: text.protectedPassword,
    bloghidden: text.hiddenMode,
    blogupdate: info.isUpdate,
    blogauthor: JSON.parse(sessionStorage.getItem('session_user')).name
  }).then(res => {
    if (res.data.status === 200) {
      console.log('UploadBlog Success!')
      return Promise.resolve(res.data.status)
    } else {
      console.log('UploadBlog Error!')
      return Promise.resolve('network error')
    }
  }).catch(err => {
    console.log(err)
    return Promise.reject(err)
  })
}

// 主页面进编辑页(使用ID检索)
function getTextInfoBeforePostPage (vm, textId) {
  axios.get('http://localhost:3000/api/getOneText', {
    params: {
      id: textId
    }
  }).then(res => {
    if (res.data.status === 200) {
      const docs = res.data.docs[0]
      vm.blogTextInfo.id = textId
      vm.blogTextInfo.number = docs.number
      vm.blogTextInfo.content = docs.content
      vm.blogTextInfo.title = docs.title
      vm.blogTextInfo.subtitle = docs.subtitle
      vm.blogTextInfo.picture = docs.picture
      vm.blogTextInfo.tag = docs.tag
      vm.blogTextInfo.secretLevel = docs.secretLevel
      vm.blogTextInfo.protectedMode = docs.protected
      vm.blogTextInfo.protectedMode = docs.protected
      vm.isUpdate = true
      return Promise.resolve(res.data.status)
    } else {
      console.log('getTextInfo Error!')
      return Promise.resolve('getTextInfo error')
    }
  }).catch(err => {
    console.log(err)
    return Promise.reject(err)
  })
}

export {
  sendTokenToBackend,
  postOfUploadBlogTextToBackend,
  getTextInfoBeforePostPage
}

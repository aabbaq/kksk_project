function dateToString (date, needTime = false, connector = '/') {
  const year = date.getFullYear().toString()
  const mounth = (date.getMonth() + 1).toString()
  const day = date.getDate().toString()
  let dateString = year + connector + mounth + connector + day
  if (needTime) {
    const hour = date.getHours().toString()
    const minute = date.getMinutes().toString()
    const second = date.getSeconds().toString()
    dateString += ' ' + hour + ':' + minute + ':' + second
  }
  return dateString
}

function getPeekTextsList (docs, needCardsInfo = false) {
  const peekTexts = []
  docs.forEach(function (each, inx, array) {
    const peekText = {
      title: each.title,
      subtitle: each.subtitle,
      number: each.number,
      id: each._id,
      author: each.author,
      date: dateToString(each.date),
      picture: each.picture
    }
    if (needCardsInfo) {
      peekText.mode = {
        needShow: false,
        protected: each.protected,
        protectedPassword: each.protectedPassword,
        hidden: each.hidden,
        secretLevel: each.secretLevel
      }
    }
    peekTexts.push(peekText)
  })
  return peekTexts
}

function generateUserInfo (docs, token = null) {
  const userInfo = {
    username: docs.username,
    nickname: docs.nickname,
    userrole: docs.userrole,
    biography: docs.biography,
    alias: docs.alias,
    emoji: docs.emoji
  }
  if (token) userInfo.token = token
  return userInfo
}

function generateQueryOption (query) {
  if (query.id) return { _id: query.id }
  if (query.title) return { title: query.title }
  if (query.number) return { number: query.number }
}

function checkOfTextViewing (textInfo, userInfo) {
  if (userInfo.userrole === 7 || textInfo.owner === userInfo.id) return true
  else return !textInfo.hidden ? (userInfo.userrole >= textInfo.secretLevel) : false
}

function generateMsg (checkCode) {
  const Msg = {
    isErr: true,
    status: checkCode
  }
  switch (checkCode) {
    case 500: {
      return { ...Msg, msg: 'Database Error' }
    }
    case 501: {
      return { ...Msg, msg: 'Database Error: No Data Yet' }
    }
    case 502: {
      return { ...Msg, msg: 'Master Database Error' }
    }
    case 101: {
      return { ...Msg, msg: 'User Error: ID Not Found' }
    }
    case 102: {
      return { ...Msg, msg: 'User Error: Name and Password Not Found' }
    }
    case 103: {
      return { ...Msg, msg: 'User Error: No Token User Wants To Get Texts' }
    }
    case 104: {
      return { ...Msg, msg: 'User Error: No Role User Wants To Get Texts' }
    }
    case 105: {
      return { ...Msg, msg: 'User Error: No Texts User In That Level Can View' }
    }
    case 106: {
      return { ...Msg, msg: 'User Error: User Token Error' }
    }
    case 701: {
      return { ...Msg, msg: 'Master Error: Someone Not Login Wants To Falsify Imformation Of Master!' }
    }
    case 702: {
      return { ...Msg, msg: 'Master Error: Someone No Token Wants To Falsify Imformation Of Master!' }
    }
    case 703: {
      return { ...Msg, msg: 'Master Error: Someone In Low Level Wants To Falsify Imformation Of Master!' }
    }
    case 704: {
      return { ...Msg, msg: 'Master Error: Someone Not In Database Wants To Falsify Imformation Of Master!' }
    }
  }
}

module.exports = {
  dateToString: dateToString,
  getPeekTextsList: getPeekTextsList,
  generateMsg: generateMsg,
  generateUserInfo: generateUserInfo,
  generateQueryOption: generateQueryOption,
  checkOfTextViewing: checkOfTextViewing
}

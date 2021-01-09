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

function getPeekTextsList (docs) {
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
    peekTexts.push(peekText)
  })
  return peekTexts
}

function generateMsg (checkCode) {
  switch (checkCode) {
    case 500:
      return {
        status: 500,
        msg: 'Database Error'
      }
    case 501:
      return {
        status: 501,
        msg: 'Master Database Error'
      }
    case 101:
      return {
        status: 101,
        msg: 'User Error: ID Not Found'
      }
    case 102:
      return {
        status: 102,
        msg: 'User Error: Name and Password Not Found'
      }
    case 103:
      return {
        status: 103,
        msg: 'User Error: No Token User Wants To Get Texts'
      }
    case 104:
      return {
        status: 104,
        msg: 'User Error: No Role User Wants To Get Texts'
      }
    case 105:
      return {
        status: 105,
        msg: 'User Error: No Texts User In That Level Can View'
      }
    case 701:
      return {
        status: 701,
        msg: 'Master Error: Someone Not Login Wants To Falsify Imformation Of Master!'
      }
    case 702:
      return {
        status: 702,
        msg: 'Master Error: Someone No Token Wants To Falsify Imformation Of Master!'
      }
    case 703:
      return {
        status: 703,
        msg: 'Master Error: Someone In Low Level Wants To Falsify Imformation Of Master!'
      }
    case 704:
      return {
        status: 704,
        msg: 'Master Error: Someone Not In Database Wants To Falsify Imformation Of Master!'
      }
  }
}

module.exports = {
  dateToString: dateToString,
  getPeekTextsList: getPeekTextsList,
  generateMsg: generateMsg
}

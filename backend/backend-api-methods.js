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

module.exports = {
  dateToString: dateToString
}

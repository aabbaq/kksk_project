import axios from 'axios'

function sendTokenToBackend (token) {
  return axios.post('http://localhost:3000/api/tokenCheck', {
    usertoken: token
  }).then(res => {
    if (res.data.status === 114) {
      console.log('backend has checked the token')
      return Promise.resolve(res.data.status)
    } else {
      console.log('network error')
      return Promise.resolve('network error')
    }
  }).catch((err) => {
    console.log(err)
    return Promise.reject(err)
  })
}

export {
  sendTokenToBackend
}

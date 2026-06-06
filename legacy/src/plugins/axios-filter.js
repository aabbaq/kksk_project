import axios from 'axios'

axios.interceptors.request.use(
  config => {
    var loginToken = sessionStorage.getItem('session_authorization')
    if (loginToken) {
      config.headers.Authorization = 'Bearer ' + loginToken
    }
    return config
  },
  err => {
    return Promise.reject(err)
  }
)
// axios.interceptors.response.use(
//   response => {
//     if (response.data.code === 114514) {
//       console.log('Not Logined')
//     }
//     return Promise.reject(response.data)
//   },
//   err => {
//     return Promise.reject(err)
//   }
// )
export default axios

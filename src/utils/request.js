import axios from 'axios'

// 创建axios实例
const service = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? 'productionApiHost' : process.env.NODE_ENV === 'pre'? 'preApiHost' : 'devApiHost',
  timeout: 15000 // 请求超时时间
})
// request拦截器
service.interceptors.request.use(config => {
  return config
}, error => {
    Message({
        message: "请求超时",
        type: 'error',
        duration: 5 * 1000
    })
})

// respone拦截器
service.interceptors.response.use(
  response => response,
  error => {
    Message({
        message: "请求超时",
        type: 'error',
        duration: 5 * 1000
      })
    return Promise.reject(error);
  }
)
export default service

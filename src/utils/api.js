import wepy from 'wepy'
import 'wepy-async-function'

// const host = 'https://xkx-positions.xinsulv.net/api'
const host = 'http://xkx-reward-offers.test/api'

const request = async (options, showLoading = true) => {
  if (typeof options === 'string') {
    options = {
      url: options
    }
  }
  // 显示加载中
  if (showLoading) {
    wepy.showLoading({ title: '加载中' })
  }

  options.url = host + '/' + options.url
  let response = await wepy.request(options)

  if (showLoading) {
    wepy.hideLoading()
  }

  // 服务器异常后给与提示
  if (response.statusCode === 500) {
    wepy.showModal({
      title: '提示',
      content: '服务器错误，请联系管理员或重试'
    })
  }
  return response
}

// 登录
const login = async (params = {}) => {
  let loginData = await wepy.login()
  params.code = loginData.code

  let authResponse = await request({
    url: 'weapp/authorizations',
    data: params,
    method: 'POST'
  })

  if (authResponse.statusCode === 201) {
    wepy.setStorageSync('access_token', authResponse.data.access_token)
    wepy.setStorageSync('access_token_expired_at', new Date().getTime() + authResponse.data.expires_in * 1000)
  }
  return authResponse
}

// 获取token
const getToken = async (options) => {
  let accessToken = wepy.getStorageSync('access_token')
  let expiredAt = wepy.getStorageSync('access_token_expired_at')

  // 如果token过期了，则调用刷新方法
  if (accessToken && new Date().getTime() > expiredAt) {
    let refreshResponse = await refreshToken(accessToken)
    // 刷新成功
    if (refreshResponse.statusCode === 200) {
      accessToken = refreshResponse.data.access_token
    } else {
      let authResponse = await login()
      if (authResponse.statusCode === 201) {
        accessToken = authResponse.data.access_token
      }
    }
  }
  return accessToken
}

// 刷新token
const refreshToken = async (accessToken) => {
  let refreshResponse = await wepy.request({
    url: host + '/' + 'authorizations/current',
    method: 'PUT',
    header: {
      'Authorization': 'Bearer ' + accessToken
    }
  })
  // 刷新成功
  if (refreshResponse.statusCode === 200) {
    // 存储新的token
    wepy.setStorageSync('access_token', refreshResponse.data.access_token)
    wepy.setStorageSync('access_token_expired_at', new Date().getTime() + refreshResponse.data.expires_in * 1000)
  }
  return refreshResponse
}

// 带身份认证的请求
const authRequest = async (options, showLoading = true) => {
  if (typeof options === 'string') {
    options = {
      url: options
    }
  }
  // 获取Token
  let accessToken = await getToken()

  // 将Token 设置在header中
  let header = options.header || {}
  header.Authorization = 'Bearer ' + accessToken
  options.header = header

  return request(options, showLoading)
}

const uploadFile = async (options = {}) => {
  wepy.showLoading({ title: '上传中' })
  let accessToken = await getToken()
  options.url = host + '/' + options.url
  let header = options.header || {}
  header.Authorization = 'Bearer ' + accessToken
  options.header = header

  let response = await wepy.uploadFile(options)

  wepy.hideLoading()
  return response
}

const uploadImage = async (imagePath, type) => {
  try {
    // 调用上传接口
    let imageResponse = await uploadFile({
      url: 'images',
      method: 'POST',
      name: 'image',
      formData: {
        type: type
      },
      filePath: imagePath
    })
    // 上传成功
    if (imageResponse.statusCode === 201) {
      return imageResponse
    }
  } catch (err) {
    console.log(err)
    wepy.showModal({
      title: '提示',
      content: '服务器错误，请联系管理员'
    })
  }
}

export default {
  host,
  request,
  login,
  getToken,
  authRequest,
  refreshToken,
  uploadFile,
  uploadImage
}

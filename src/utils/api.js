import wepy from 'wepy'

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

export default{
  request,
  login
}

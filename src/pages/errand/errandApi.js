import wepy from 'wepy'
import api from '@/utils/api'
import 'wepy-async-function'

const payErrand = async (errand) => {
    let payResponse = await api.authRequest({
        url: 'errands/' + errand.id + '/pay',
        method: 'PUT'
    })
    if (payResponse.statusCode === 200) {
        let payParams = payResponse.data.payParams
        let errandId = payResponse.data.errandId
        try {
            let payResult = await wepy.requestPayment({
                timeStamp: payParams.timeStamp.toString(),
                signType: payParams.signType,
                nonceStr: payParams.nonceStr,
                package: payParams.package,
                paySign: payParams.paySign,
            })
            console.log(payResult)
            return payResult
        } catch (err) {
            console.log(err)
            return null
        } finally {
            await api.authRequest({
                url: 'errands/' + errandId + '/checkPaymentStatus',
                method: 'PUT',
            })
        }
    } else {
        wepy.showToast({
            title: payResponse.data.message,
            icon: 'none'
        })
    }
}

const takeErrand = async (errand) => {
    let takeResponse = await api.authRequest({
        url: 'errands/' + errand.id + '/take',
        method: 'PUT'
    })
    if (takeResponse.statusCode === 200) {
        wepy.showToast({
            icon: 'success',
            title: '操作成功！'
        })
    } else {
        wepy.showToast({
            title: takeResponse.data.message,
            icon: 'none'
        })
    }
    return takeResponse
}

const doneErrand = async (errand) => {
    let takeResponse = await api.authRequest({
        url: 'errands/' + errand.id + '/done',
        method: 'PUT'
    })
    if (takeResponse.statusCode === 200) {
        wepy.showToast({
            icon: 'success',
            title: '操作成功！'
        })
    } else {
        wepy.showToast({
            title: takeResponse.data.message,
            icon: 'none'
        })
    }
    return doneErrand
}

const cancelErrand = async (errand) => {
    let cancelResponse = await api.authRequest({
        url: 'errands/' + errand.id + '/cancel',
        method: 'PUT'
    })
    if (cancelResponse.statusCode === 200) {
        wepy.showToast({
            icon: 'success',
            title: '操作成功！'
        })
    } else {
        wepy.showToast({
            title: cancelResponse.data.message,
            icon: 'none'
        })
    }
    return cancelResponse
}

export default {
    payErrand,
    takeErrand,
    doneErrand,
    cancelErrand
}

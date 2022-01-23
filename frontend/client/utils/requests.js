import axios from 'axios'

import config from 'utils/config'

const instance = axios.create({
    baseURL: `${config.ServerUrl}/${config.ServerApiRoute}`,
    timeout: config.AxiosTimeout
})

export default {
    get: function(url, params={}) {
        return instance.get(url, { withCredentials: true, params: { ...params }})
    },
    post: function(url, data) {
        return instance.post(url, data, { withCredentials: true })
    },
    delete: function(url, data) {
        return instance.delete(url, { withCredentials: true, data })
    }
}

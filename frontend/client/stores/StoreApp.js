import { observable, action, flow } from 'mobx'

import requests from 'utils/requests'

class StoreApp {
    @observable isCheckingLogin = true
    @observable loggedIn = false
    @observable username = null

    @observable logginWaiting = false
    @observable logginInvalid = false

    errorStatus = null
    errorReason = null

    dungeonList = null
    @observable dungeonListLoading = true

    constructor(router) {
        this.router = router

        this.requests = {
            get: this._get,
            post: this._post,
            delete: this._delete
        }
        
        this.checkLogin()
    }

    login = flow(function* (email, password) {
        this.logginWaiting = true

        try {
            const res = yield requests.post('/auth/login', { email, password })

            this.loggedIn = true
            this.username = res.data.username
            this.logginInvalid = false
        } 
        catch(err) {
            if (err.response.status === 401) {
                this.logginInvalid = true
            }
            else {
                this._handleRequestError(err)
            }
        }

        this.logginWaiting = false
    })

    fetchDungeonList = flow(function* () {
        this.dungeonListLoading = true
        this.dungeonList = null
        
        const res = yield this.requests.get('/plan/list')

        this.dungeonList = res.dungeons.map(entry => ({
            label: entry.name,
            value: entry.id
        }))

        this.dungeonListLoading = false
    })
    
    @action.bound
    logout() {
        this.requests.get('/auth/logout')
            .then(() => {
                this.loggedIn = false

                this.router.history.push('/')
            })
    }

    @action.bound
    checkLogin() {
        this.isCheckingLogin = true

        // Use axios instead of wrappers
        requests.get('/auth/check')
            .then(res => {
                this.loggedIn = res.data.loggedIn
                this.username = res.data.username
                this.isCheckingLogin = false
            })
            .catch(err => {
                console.error(err)
                this.isCheckingLogin = false
            })
    }

    /* Axios wrapper (to allow local redirection on errors) */
    _handleRequestError(err) {
        this.errorStatus = err.response.status

        if (typeof err.response.data === 'object') {
            this.errorReason = err.response.data.reason
        }
        else {
            this.errorReason = err.response.statusText
        }
        
        this.router.history.push('/unknown')

        return null
    }

    _get = async (route, params) => {
        try {
            const res = await requests.get(route, params)
            return res.data
        }
        catch (err) {
            return this._handleRequestError(err)
        }
    }

    _post = async (route, data) => {
        try {
            const res = await requests.post(route, data)
            return res.data
        }
        catch (err) {
            return this._handleRequestError(err)
        }
    }

    _delete = async (route, data) => {
        try {
            const res = await requests.delete(route, data)
            return res.data
        }
        catch (err) {
            return this._handleRequestError(err)
        }
    }
}

export default StoreApp

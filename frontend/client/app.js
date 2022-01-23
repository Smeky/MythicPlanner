import "@babel/polyfill";
import 'styles/main.scss'

import React from 'react'
import ReactDOM from 'react-dom'
import { Router } from 'react-router'
import { Provider } from 'mobx-react'
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router'
import createBrowserHistory from 'history/createBrowserHistory'

import { StoreApp, StorePlan } from 'stores'
import App from './containers/App'

const routerStore = new RouterStore()
const appStore = new StoreApp(routerStore)

const stores = {
    router: routerStore,
    app: appStore,
    plan: new StorePlan(appStore)
}

const history = syncHistoryWithStore(createBrowserHistory(), stores.router)

const render = () => {
    ReactDOM.render(
        <Provider {...stores}>
            <Router history={history}>
                <App />
            </Router>
        </Provider>,
        document.getElementById('app')
    )
}

render()

if (module.hot) {
    module.hot.accept('./containers/App', render)
}
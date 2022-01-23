import React from 'react'
import { Switch, Route } from 'react-router'
import { FocusStyleManager } from "@blueprintjs/core";

import ImageBackground from 'assets/web/background.png'

import { Home, Plan, Unknown } from 'containers'
import { Navbar } from 'components'

FocusStyleManager.onlyShowFocusOnTabs();

export default class App extends React.Component {
    componentDidMount() {
        // Add thee blueprintjs dark theme to the entire app
        document.body.classList.add('bp3-dark')
    }

    render() {
        return (
            <>
            <Navbar />

            <div className='c-main-content' style={{ background: `url(${ImageBackground}) no-repeat` }}>
                <Switch>
                    <Route exact path="/" component={Home} />
                    <Route path="/plan/:planId" component={Plan} />
                    <Route path="/unknown" component={Unknown} />
                </Switch>
            </div>
            </>
        )
    }
}
import React from 'react'
import { inject, observer } from 'mobx-react'

import { Alignment, Navbar, Button, NavbarDivider , Text } from '@blueprintjs/core'
import { Login } from 'components'

@inject('app') @observer
class CustomNavbar extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            login: false
        }
    }

    handleLoginOpen = () => this.setState({ login: true })
    handleLoginClose = () => this.setState({ login: false })

    render() {
        return (
            <>
                <Login 
                    isOpen={this.state.login}
                    onClose={this.handleLoginClose} />
            
                <Navbar className='e-navbar' fixedToTop>
                    <div className='c-content'>
                        <Navbar.Group align={Alignment.LEFT}>
                            <a className='e-homelink' href='/'>Mythic Planner</a>
                        </Navbar.Group>

                        { this.props.app.loggedIn ? (
                            this.renderLoggedIn()
                        ) : (
                            this.renderLoggedOut()
                        )}
                    </div>
                </Navbar>
            </>
        )
    }
    
    renderLoggedIn() {
        return (
            <>
                <Navbar.Group align={Alignment.RIGHT}>
                    <Text>{this.props.app.username}</Text>
                    <NavbarDivider  />
                    <Button minimal text='Logout' onClick={this.props.app.logout} />
                </Navbar.Group>
            </>
        )
    }
    
    renderLoggedOut() {
        return (
            <Navbar.Group align={Alignment.RIGHT}>
                <Button minimal text='Login' onClick={this.handleLoginOpen} />
            </Navbar.Group>
        )
    }
}

export default CustomNavbar

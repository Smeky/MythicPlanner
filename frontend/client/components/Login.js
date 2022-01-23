import React from 'react'
import { inject, observer } from 'mobx-react'

import { Dialog, Classes, Button, FormGroup, InputGroup, Alert } from '@blueprintjs/core'

@inject('app') @observer
class Login extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            email: '',
            password: '',
            emailError: false,
            passwordError: false,
            alert: false
        }
    }
    
    handleConfirm = e => {
        e.preventDefault()

        if (this.state.email === '' || this.state.password === '') {
            return this.setState({
                emailError: this.state.email === '',
                passwordError: this.state.password === ''
            })
        }

        this.props.app.login(this.state.email, this.state.password)
            .then(() => {
                if (!this.props.app.logginInvalid) {
                    this.props.onClose()
                }
                else {
                    this.setState({
                        email: '',
                        password: '',
                        alert: true
                    })
                }
            })
    }

    handleInputChange = name => e => this.setState({ [name]: e.target.value })
    handleShow = () => this.setState({ open: true })
    handleAlertClose = () => this.setState({ alert: false })
    
    render() {
        return (
            <Dialog 
                title='Login' 
                isOpen={this.props.isOpen}
                onClose={this.props.onClose} >

                <form>
                    <div className={Classes.DIALOG_BODY}>
                        <Alert 
                            isOpen={this.state.alert}
                            intent='danger'
                            onClose={this.handleAlertClose} >

                            Login failed, invalid credentials
                        </Alert>

                        <FormGroup
                            label='Email'
                            labelFor='input-email'
                            labelInfo={this.state.emailError ? '(required)' : ''} >

                            <InputGroup
                                id='input-email'
                                placeholder='example@domain.com'
                                value={this.state.email}
                                intent={this.state.emailError ? 'danger' : 'none'}
                                onChange={this.handleInputChange('email')}
                            />

                        </FormGroup>

                        <FormGroup
                            label='Password'
                            labelFor='input-pwd'
                            onSubmit={() => console.log('asdasd')}
                            labelInfo={this.state.passwordError ? '(required)' : ''} >

                            <InputGroup
                                id='input-pwd'
                                type='password'
                                placeholder='*******'
                                value={this.state.password}
                                intent={this.state.passwordError ? 'danger' : 'none'}
                                onChange={this.handleInputChange('password')}
                            />

                        </FormGroup>
                    </div>
                    <div className={Classes.DIALOG_FOOTER}>
                        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                            <Button 
                                text='Cancel'
                                onClick={this.props.onClose} />
                            <Button 
                                text='Confirm'
                                type='submit'
                                intent='primary'
                                onClick={this.handleConfirm} />
                        </div>
                    </div>
                </form>
            </Dialog>
        )
    }
}

export default Login

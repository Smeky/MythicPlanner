import React from 'react'
import { inject, observer } from 'mobx-react'

import { H1, H4, Button } from '@blueprintjs/core'

@inject('app') @observer
class Error extends React.Component {
    handleHomeClick = () => {
        this.props.history.push('/')
    }

    render() {
        return (
            <div className='p-unknown'>
                <H1>{this.props.app.errorStatus} - {this.props.app.errorReason}</H1>
            
                <div>
                    <Button 
                        text='Home'
                        intent='primary'
                        large
                        onClick={this.handleHomeClick} />
                </div>
            </div>
        )
    }
}

export default Error

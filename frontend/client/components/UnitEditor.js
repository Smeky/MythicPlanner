import React from 'react'

import { Dialog, Classes, Button, FormGroup, InputGroup, Switch } from '@blueprintjs/core'

import { stripToImageName } from 'utils/functions'

class UnitEditor extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            name: '',
            value: 0,
            image: '',
            imageManual: false,
            boss: false
        }
    }

    handleOpening = () => {
        if (this.props.unit) {
            this.setState({
                ...this.props.unit
            })
        }
    }

    handleInputChange = name => event => {
        if (name === 'name') {
            this.setState({
                [name]: event.target.value,
                image: !this.state.imageManual ? stripToImageName(event.target.value) : this.state.image,
            })
        }
        else {
            this.setState({
                [name]: event.target.value,
                imageManual: name === 'image' ? (event.target.value === '' ? false : true) : this.state.imageManual
            })
        }
    }

    handleSwitchChange = name => event => {
        this.setState({
            [name]: event.target.checked
        })
    }

    handleConfirm = () => {
        this.props.onConfirm({
            name: this.state.name,
            value: this.state.value,
            image: this.state.image,
            boss: this.state.boss
        })
    }

    render() {
        const imageWarning = this.state.image !== '' && !this.props.sheet.frames.hasOwnProperty(this.state.image)

        return (
            <Dialog 
                title='Unit editor'
                isOpen={this.props.isOpen}
                onClose={this.props.onClose}
                onOpening={this.handleOpening} >

                <div className={Classes.DIALOG_BODY}>
                    <FormGroup
                        label='Name'
                        labelFor='name-input' >

                        <InputGroup 
                            id='name-input' 
                            value={this.state.name} 
                            onChange={this.handleInputChange('name')} />
                    </FormGroup>

                    <FormGroup
                        label='Image'
                        labelFor='image-input'
                        labelInfo={imageWarning ? '(not found)' : ''} >

                        <InputGroup 
                            id='image-input' 
                            value={this.state.image} 
                            intent={imageWarning ? 'warning' : 'none'}
                            onChange={this.handleInputChange('image')} />
                    </FormGroup>

                    <FormGroup
                        label='Value'
                        labelFor='value-input' inline >

                        <InputGroup 
                            id='value-input' 
                            value={this.state.value} 
                            disabled={this.state.boss}
                            onChange={this.handleInputChange('value')} />
                    </FormGroup>

                    <FormGroup
                        label='Boss'
                        labelFor='boss-switch' inline >

                        <Switch 
                            id='boss-switch' 
                            checked={this.state.boss} 
                            onChange={this.handleSwitchChange('boss')} />
                    </FormGroup>
                </div>
                <div className={Classes.DIALOG_FOOTER}>
                    <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                        <Button 
                            text='Cancel'
                            intent='none'
                            onClick={this.props.onClose}
                        />

                        <Button 
                            text='Confirm'
                            intent='primary'
                            onClick={this.handleConfirm}
                        />
                    </div>
                </div>
            </Dialog>
        )
    }
}

export default UnitEditor

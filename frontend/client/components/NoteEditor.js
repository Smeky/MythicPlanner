import React from 'react'

import { Dialog, Classes, EditableText, Button } from '@blueprintjs/core'

class NoteEditor extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            value: ''
        }
    }

    handleOpening = () => this.setState({ value: this.props.value })
    handleConfirm = () => this.props.onConfirm(this.state.value)
    handleChange = value => this.setState({ value })

    render() {
        return (
            <Dialog 
                title='Note'
                isOpen={this.props.isOpen}
                onClose={this.props.onClose}
                onOpening={this.handleOpening} >

                <div className={Classes.DIALOG_BODY}>
                    <EditableText
                        multiline
                        isEditing={true}
                        value={this.state.value}
                        onChange={this.handleChange}
                    />
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

export default NoteEditor

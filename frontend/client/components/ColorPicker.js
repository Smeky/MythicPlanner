import React from 'react'

import { Popover } from '@blueprintjs/core'
import { ChromePicker } from 'react-color'

class ColorPicker extends React.Component {
    constructor(props) {
        super(props)
        
        this.container = React.createRef()
        this.state = {
            open: false,
            color: '#ffffff'
        }
    }

    handleOpen = () => this.setState({ open: true })
    handleClose = () => this.setState({ open: false })

    handleColorChange = color => {
        this.setState({
            color: color.hex
        })

        if (this.props.onChange) {
            this.props.onChange(color.hex)
        }
    }

    render() {
        return (
            <>
                <Popover 
                    isOpen={this.state.open}
                    onClose={this.handleClose}>

                    <div className='e-colorpicker c-preview' onClick={this.handleOpen}>
                        <div className='e-preview' style={{ backgroundColor: this.state.color }} />
                    </div>

                    <ChromePicker 
                        color={this.state.color}
                        onChangeComplete={this.handleColorChange} />
                </Popover>

            </>
        )
    }
}

export default ColorPicker
